import { parseExcelDate } from '../utils/excel/dateParser';
import { ValidationResult } from './dataValidationService';

export interface DataChunk {
  id: string;
  data: any[];
  metadata: ChunkMetadata;
  processingStrategy: ProcessingStrategy;
  estimatedDifficulty: 'low' | 'medium' | 'high' | 'critical';
  recommendedBatchSize: number;
  recommendedDelay: number;
}

export interface ChunkMetadata {
  startDate?: string;
  endDate?: string;
  recordCount: number;
  dataComplexity: number; // 0-100 scale
  duplicateRisk: number; // 0-100 scale
  constraintViolationRisk: number; // 0-100 scale
  memoryRequirementMB: number;
  estimatedProcessingTimeMs: number;
  uniqueCustomers: number;
  uniqueDocuments: number;
  averageTransactionSize: number;
  hasProblematicPatterns: boolean;
  seasonalFactors: SeasonalFactor[];
}

export interface SeasonalFactor {
  type: 'month_end' | 'quarter_end' | 'year_end' | 'holiday_period' | 'promotion_period' | 'high_volume';
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface ProcessingStrategy {
  approach: 'standard' | 'conservative' | 'aggressive_retry' | 'individual_records';
  batchSizeRange: { min: number; max: number };
  maxRetries: number;
  delayBetweenBatches: number;
  useTransactions: boolean;
  enableCircuitBreaker: boolean;
  priorityLevel: 'low' | 'medium' | 'high';
}

export interface ChunkingOptions {
  strategy: 'date_based' | 'size_based' | 'complexity_based' | 'hybrid';
  maxChunkSize: number;
  maxChunks: number;
  dateField: string;
  prioritizeProblematicData: boolean;
  isolateHighRiskRecords: boolean;
  targetProcessingTime: number; // Target time per chunk in milliseconds
}

class SmartDataChunking {
  private chunkCounter: number = 0;

  // Main chunking method - analyzes data and creates optimal chunks
  async createSmartChunks(
    data: any[], 
    validationResult?: ValidationResult,
    options: Partial<ChunkingOptions> = {}
  ): Promise<DataChunk[]> {
    const defaultOptions: ChunkingOptions = {
      strategy: 'hybrid',
      maxChunkSize: 1000,
      maxChunks: 50,
      dateField: 'posting_date',
      prioritizeProblematicData: true,
      isolateHighRiskRecords: true,
      targetProcessingTime: 30000 // 30 seconds per chunk
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    console.log(`🧩 Creating smart chunks for ${data.length} records using ${finalOptions.strategy} strategy`);

    let chunks: DataChunk[] = [];

    switch (finalOptions.strategy) {
      case 'date_based':
        chunks = await this.createDateBasedChunks(data, validationResult, finalOptions);
        break;
      case 'size_based':
        chunks = await this.createSizeBasedChunks(data, validationResult, finalOptions);
        break;
      case 'complexity_based':
        chunks = await this.createComplexityBasedChunks(data, validationResult, finalOptions);
        break;
      case 'hybrid':
      default:
        chunks = await this.createHybridChunks(data, validationResult, finalOptions);
        break;
    }

    // Sort chunks by priority and difficulty
    chunks = this.optimizeChunkOrder(chunks);

    console.log(`✅ Created ${chunks.length} optimized chunks`);
    console.log(`📊 Chunk difficulty distribution:`, this.getChunkDifficultyDistribution(chunks));

    return chunks;
  }

  // Date-based chunking - ideal for August data with temporal patterns
  private async createDateBasedChunks(
    data: any[], 
    validationResult?: ValidationResult,
    options: ChunkingOptions
  ): Promise<DataChunk[]> {
    console.log('📅 Creating date-based chunks...');

    // Parse and sort data by date
    const dataWithDates = data.map((record, index) => ({
      ...record,
      parsedDate: parseExcelDate(record[options.dateField], options.dateField),
      originalIndex: index
    })).filter(record => record.parsedDate);

    dataWithDates.sort((a, b) => a.parsedDate!.localeCompare(b.parsedDate!));

    if (dataWithDates.length === 0) {
      return this.createSizeBasedChunks(data, validationResult, options);
    }

    const chunks: DataChunk[] = [];
    const startDate = dataWithDates[0].parsedDate!;
    const endDate = dataWithDates[dataWithDates.length - 1].parsedDate!;

    console.log(`📊 Date range: ${startDate} to ${endDate}`);

    // Determine chunking interval based on data density
    const dateRange = new Date(endDate).getTime() - new Date(startDate).getTime();
    const daysRange = dateRange / (1000 * 60 * 60 * 24);
    
    let chunkIntervalDays: number;
    if (daysRange <= 7) {
      chunkIntervalDays = 1; // Daily chunks
    } else if (daysRange <= 31) {
      chunkIntervalDays = 3; // 3-day chunks
    } else if (daysRange <= 93) {
      chunkIntervalDays = 7; // Weekly chunks
    } else {
      chunkIntervalDays = 14; // Bi-weekly chunks
    }

    // Create chunks by date intervals
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const chunkEndDate = new Date(currentDate);
      chunkEndDate.setDate(chunkEndDate.getDate() + chunkIntervalDays);

      const chunkStartStr = this.formatDate(currentDate);
      const chunkEndStr = this.formatDate(chunkEndDate);

      const chunkData = dataWithDates.filter(record => {
        const recordDate = new Date(record.parsedDate!);
        return recordDate >= currentDate && recordDate < chunkEndDate;
      });

      if (chunkData.length > 0) {
        const chunk = await this.createDataChunk(
          chunkData.map(({ parsedDate, originalIndex, ...rest }) => rest),
          {
            startDate: chunkStartStr,
            endDate: chunkEndStr,
            chunkType: 'date_based',
            interval: `${chunkIntervalDays}_days`
          },
          validationResult
        );

        chunks.push(chunk);
      }

      currentDate = new Date(chunkEndDate);
    }

    return chunks;
  }

  // Size-based chunking - traditional approach with smart sizing
  private async createSizeBasedChunks(
    data: any[], 
    validationResult?: ValidationResult,
    options: ChunkingOptions
  ): Promise<DataChunk[]> {
    console.log('📏 Creating size-based chunks...');

    const chunks: DataChunk[] = [];
    const totalRecords = data.length;
    
    // Calculate optimal chunk size based on data complexity
    let chunkSize = Math.min(options.maxChunkSize, Math.max(100, Math.floor(totalRecords / 10)));
    
    if (validationResult) {
      const errorRatio = validationResult.errors.length / totalRecords;
      if (errorRatio > 0.1) {
        chunkSize = Math.floor(chunkSize * 0.5); // Reduce size for error-prone data
      }
    }

    for (let i = 0; i < totalRecords; i += chunkSize) {
      const chunkData = data.slice(i, Math.min(i + chunkSize, totalRecords));
      
      const chunk = await this.createDataChunk(
        chunkData,
        {
          startIndex: i,
          endIndex: Math.min(i + chunkSize - 1, totalRecords - 1),
          chunkType: 'size_based'
        },
        validationResult
      );

      chunks.push(chunk);
    }

    return chunks;
  }

  // Complexity-based chunking - groups similar complexity records
  private async createComplexityBasedChunks(
    data: any[], 
    validationResult?: ValidationResult,
    options: ChunkingOptions
  ): Promise<DataChunk[]> {
    console.log('🧠 Creating complexity-based chunks...');

    // Score each record for complexity
    const scoredData = data.map((record, index) => ({
      record,
      index,
      complexity: this.calculateRecordComplexity(record, validationResult)
    }));

    // Sort by complexity
    scoredData.sort((a, b) => a.complexity - b.complexity);

    // Group into complexity tiers
    const chunks: DataChunk[] = [];
    const tiers = [
      { name: 'simple', threshold: 0.3, maxSize: options.maxChunkSize },
      { name: 'medium', threshold: 0.6, maxSize: Math.floor(options.maxChunkSize * 0.7) },
      { name: 'complex', threshold: 0.8, maxSize: Math.floor(options.maxChunkSize * 0.5) },
      { name: 'critical', threshold: 1.0, maxSize: Math.floor(options.maxChunkSize * 0.3) }
    ];

    let processedRecords = 0;
    for (const tier of tiers) {
      const tierData = scoredData.filter(item => {
        const prevThreshold = tiers[tiers.indexOf(tier) - 1]?.threshold || 0;
        return item.complexity > prevThreshold && item.complexity <= tier.threshold;
      });

      if (tierData.length === 0) continue;

      // Create chunks within this tier
      for (let i = 0; i < tierData.length; i += tier.maxSize) {
        const chunkData = tierData
          .slice(i, Math.min(i + tier.maxSize, tierData.length))
          .map(item => item.record);

        const chunk = await this.createDataChunk(
          chunkData,
          {
            complexityTier: tier.name,
            chunkType: 'complexity_based',
            averageComplexity: tierData
              .slice(i, Math.min(i + tier.maxSize, tierData.length))
              .reduce((sum, item) => sum + item.complexity, 0) / Math.min(tier.maxSize, tierData.length - i)
          },
          validationResult
        );

        chunks.push(chunk);
      }

      processedRecords += tierData.length;
    }

    console.log(`📊 Processed ${processedRecords}/${data.length} records in complexity tiers`);
    return chunks;
  }

  // Hybrid chunking - combines multiple strategies for optimal results
  private async createHybridChunks(
    data: any[], 
    validationResult?: ValidationResult,
    options: ChunkingOptions
  ): Promise<DataChunk[]> {
    console.log('🔄 Creating hybrid chunks...');

    const chunks: DataChunk[] = [];
    
    // Step 1: Isolate high-risk records if requested
    let highRiskData: any[] = [];
    let normalData = [...data];

    if (options.isolateHighRiskRecords && validationResult) {
      const highRiskIndices = new Set(
        validationResult.errors
          .filter(error => error.severity === 'critical' || error.severity === 'high')
          .map(error => error.row - 1)
      );

      highRiskData = data.filter((_, index) => highRiskIndices.has(index));
      normalData = data.filter((_, index) => !highRiskIndices.has(index));

      console.log(`🚨 Isolated ${highRiskData.length} high-risk records`);
    }

    // Step 2: Process normal data with date-based chunking if applicable
    if (normalData.length > 0) {
      const hasGoodDates = normalData.some(record => 
        parseExcelDate(record[options.dateField], options.dateField)
      );

      if (hasGoodDates && normalData.length > 500) {
        // Use date-based chunking for large datasets with good date coverage
        const dateChunks = await this.createDateBasedChunks(normalData, validationResult, {
          ...options,
          maxChunkSize: Math.floor(options.maxChunkSize * 0.8)
        });
        chunks.push(...dateChunks);
      } else {
        // Use complexity-based chunking for smaller or date-poor datasets
        const complexityChunks = await this.createComplexityBasedChunks(normalData, validationResult, options);
        chunks.push(...complexityChunks);
      }
    }

    // Step 3: Process high-risk records separately with conservative approach
    if (highRiskData.length > 0) {
      const highRiskChunks = await this.createSizeBasedChunks(highRiskData, validationResult, {
        ...options,
        maxChunkSize: Math.min(50, Math.floor(options.maxChunkSize * 0.3))
      });

      // Mark these as high-priority, conservative processing
      highRiskChunks.forEach(chunk => {
        chunk.estimatedDifficulty = 'critical';
        chunk.processingStrategy.approach = 'conservative';
        chunk.processingStrategy.priorityLevel = 'high';
        chunk.metadata.hasProblematicPatterns = true;
      });

      chunks.push(...highRiskChunks);
    }

    return chunks;
  }

  // Create individual data chunk with metadata and processing strategy
  private async createDataChunk(
    chunkData: any[], 
    additionalMetadata: any = {},
    validationResult?: ValidationResult
  ): Promise<DataChunk> {
    this.chunkCounter++;
    
    const metadata = await this.calculateChunkMetadata(chunkData, validationResult, additionalMetadata);
    const processingStrategy = this.determineProcessingStrategy(metadata);
    const difficulty = this.assessChunkDifficulty(metadata);

    return {
      id: `chunk_${this.chunkCounter}_${Date.now()}`,
      data: chunkData,
      metadata,
      processingStrategy,
      estimatedDifficulty: difficulty,
      recommendedBatchSize: processingStrategy.batchSizeRange.max,
      recommendedDelay: processingStrategy.delayBetweenBatches
    };
  }

  // Calculate comprehensive metadata for a chunk
  private async calculateChunkMetadata(
    chunkData: any[], 
    validationResult?: ValidationResult,
    additionalMetadata: any = {}
  ): Promise<ChunkMetadata> {
    const recordCount = chunkData.length;
    
    // Calculate data complexity
    const complexity = chunkData.reduce((sum, record) => sum + this.calculateRecordComplexity(record, validationResult), 0) / recordCount;
    const dataComplexity = Math.round(complexity * 100);

    // Calculate duplicate risk
    const documentMap = new Map<string, number>();
    chunkData.forEach(record => {
      const key = `${record.document_no || ''}_${record.item_code || ''}`;
      documentMap.set(key, (documentMap.get(key) || 0) + 1);
    });
    const duplicates = Array.from(documentMap.values()).filter(count => count > 1).length;
    const duplicateRisk = Math.round((duplicates / recordCount) * 100);

    // Calculate constraint violation risk based on validation errors
    let constraintViolationRisk = 0;
    if (validationResult) {
      const constraintErrors = validationResult.errors.filter(error => 
        error.field === 'duplicate_record' || 
        error.error.includes('constraint') ||
        error.error.includes('duplicate')
      ).length;
      constraintViolationRisk = Math.round((constraintErrors / recordCount) * 100);
    }

    // Calculate unique counts
    const uniqueCustomers = new Set(chunkData.map(r => r.customer_code).filter(Boolean)).size;
    const uniqueDocuments = new Set(chunkData.map(r => r.document_no).filter(Boolean)).size;

    // Calculate average transaction size
    const amounts = chunkData.map(r => Number(r.amount) || 0).filter(a => a > 0);
    const averageTransactionSize = amounts.length > 0 ? 
      Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0;

    // Estimate memory requirement
    const avgRecordSize = JSON.stringify(chunkData[0] || {}).length;
    const memoryRequirementMB = Math.round((avgRecordSize * recordCount) / 1024 / 1024 * 1.5);

    // Estimate processing time
    const baseTimePerRecord = 50; // 50ms base
    const complexityMultiplier = 1 + (dataComplexity / 100);
    const duplicateMultiplier = 1 + (duplicateRisk / 100);
    const estimatedProcessingTimeMs = Math.round(recordCount * baseTimePerRecord * complexityMultiplier * duplicateMultiplier);

    // Detect seasonal factors
    const seasonalFactors = this.detectSeasonalFactors(chunkData, additionalMetadata);

    // Check for problematic patterns
    const hasProblematicPatterns = dataComplexity > 70 || duplicateRisk > 20 || constraintViolationRisk > 10;

    return {
      ...additionalMetadata,
      recordCount,
      dataComplexity,
      duplicateRisk,
      constraintViolationRisk,
      memoryRequirementMB,
      estimatedProcessingTimeMs,
      uniqueCustomers,
      uniqueDocuments,
      averageTransactionSize,
      hasProblematicPatterns,
      seasonalFactors
    };
  }

  // Calculate complexity score for individual record
  private calculateRecordComplexity(record: any, validationResult?: ValidationResult): number {
    let complexity = 0.2; // Base complexity

    // Field completeness factor
    const fields = ['customer_code', 'document_no', 'posting_date', 'item_code', 'amount'];
    const completedFields = fields.filter(field => record[field] && record[field] !== '').length;
    complexity += (5 - completedFields) * 0.1; // More missing fields = more complexity

    // Numeric field complexity
    if (record.amount) {
      const amount = Math.abs(Number(record.amount) || 0);
      if (amount > 100000) complexity += 0.1; // Large amounts
      if (amount < 1 && amount > 0) complexity += 0.1; // Very small amounts
    }

    // Date complexity
    if (record.posting_date) {
      const parsedDate = parseExcelDate(record.posting_date, 'posting_date');
      if (!parsedDate) complexity += 0.3; // Unparseable dates
      else {
        const date = new Date(parsedDate);
        const now = new Date();
        const daysDiff = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365 * 5) complexity += 0.1; // Very old dates
        if (date > now) complexity += 0.2; // Future dates
      }
    }

    // String complexity
    if (record.customer_name && typeof record.customer_name === 'string') {
      if (record.customer_name.length > 100) complexity += 0.1; // Very long names
      if (/[^\x00-\x7F]/.test(record.customer_name)) complexity += 0.1; // Non-ASCII characters
    }

    return Math.min(1.0, complexity);
  }

  // Determine optimal processing strategy based on metadata
  private determineProcessingStrategy(metadata: ChunkMetadata): ProcessingStrategy {
    const { dataComplexity, duplicateRisk, constraintViolationRisk, recordCount, hasProblematicPatterns } = metadata;

    // Conservative strategy for problematic data
    if (hasProblematicPatterns || dataComplexity > 80) {
      return {
        approach: 'conservative',
        batchSizeRange: { min: 5, max: Math.min(25, Math.floor(recordCount / 4)) },
        maxRetries: 7,
        delayBetweenBatches: 2000,
        useTransactions: true,
        enableCircuitBreaker: true,
        priorityLevel: 'high'
      };
    }

    // Aggressive retry for constraint issues
    if (duplicateRisk > 30 || constraintViolationRisk > 20) {
      return {
        approach: 'aggressive_retry',
        batchSizeRange: { min: 10, max: Math.min(50, Math.floor(recordCount / 3)) },
        maxRetries: 5,
        delayBetweenBatches: 1000,
        useTransactions: true,
        enableCircuitBreaker: false,
        priorityLevel: 'medium'
      };
    }

    // Individual record processing for critical cases
    if (dataComplexity > 90 || recordCount < 20) {
      return {
        approach: 'individual_records',
        batchSizeRange: { min: 1, max: 5 },
        maxRetries: 10,
        delayBetweenBatches: 500,
        useTransactions: true,
        enableCircuitBreaker: true,
        priorityLevel: 'high'
      };
    }

    // Standard approach for normal data
    return {
      approach: 'standard',
      batchSizeRange: { min: 25, max: Math.min(75, recordCount) },
      maxRetries: 3,
      delayBetweenBatches: 200,
      useTransactions: false,
      enableCircuitBreaker: false,
      priorityLevel: 'low'
    };
  }

  // Assess overall chunk difficulty
  private assessChunkDifficulty(metadata: ChunkMetadata): 'low' | 'medium' | 'high' | 'critical' {
    const { dataComplexity, duplicateRisk, constraintViolationRisk, hasProblematicPatterns } = metadata;

    const riskScore = dataComplexity + duplicateRisk + constraintViolationRisk;

    if (hasProblematicPatterns || riskScore > 150) return 'critical';
    if (riskScore > 100) return 'high';
    if (riskScore > 50) return 'medium';
    return 'low';
  }

  // Detect seasonal factors that might affect processing
  private detectSeasonalFactors(chunkData: any[], additionalMetadata: any): SeasonalFactor[] {
    const factors: SeasonalFactor[] = [];

    // Check if this is end-of-month data (August 31st)
    if (additionalMetadata.endDate && additionalMetadata.endDate.includes('-31')) {
      factors.push({
        type: 'month_end',
        impact: 'high',
        description: 'Month-end data typically has higher transaction volume and complexity'
      });
    }

    // Check for high volume indicators
    if (chunkData.length > 1000) {
      factors.push({
        type: 'high_volume',
        impact: 'medium',
        description: 'High volume chunk may require additional processing time'
      });
    }

    // Check for quarter end (August = Q3 in some fiscal years)
    if (additionalMetadata.startDate?.includes('2024-08') || additionalMetadata.endDate?.includes('2024-08')) {
      factors.push({
        type: 'quarter_end',
        impact: 'medium',
        description: 'August data may include quarter-end adjustments and corrections'
      });
    }

    return factors;
  }

  // Optimize chunk order for processing efficiency
  private optimizeChunkOrder(chunks: DataChunk[]): DataChunk[] {
    return chunks.sort((a, b) => {
      // Process high-priority chunks first
      if (a.processingStrategy.priorityLevel !== b.processingStrategy.priorityLevel) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.processingStrategy.priorityLevel] - priorityOrder[a.processingStrategy.priorityLevel];
      }

      // Then by difficulty (easier first, unless it's critical data)
      if (a.estimatedDifficulty === 'critical' && b.estimatedDifficulty !== 'critical') return -1;
      if (b.estimatedDifficulty === 'critical' && a.estimatedDifficulty !== 'critical') return 1;

      const difficultyOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return difficultyOrder[a.estimatedDifficulty] - difficultyOrder[b.estimatedDifficulty];
    });
  }

  // Get difficulty distribution for reporting
  private getChunkDifficultyDistribution(chunks: DataChunk[]): Record<string, number> {
    const distribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    chunks.forEach(chunk => {
      distribution[chunk.estimatedDifficulty]++;
    });
    return distribution;
  }

  // Utility method to format dates consistently
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Get processing recommendations for all chunks
  getProcessingRecommendations(chunks: DataChunk[]): string[] {
    const recommendations: string[] = [];
    const distribution = this.getChunkDifficultyDistribution(chunks);

    if (distribution.critical > 0) {
      recommendations.push(`Process ${distribution.critical} critical chunks with individual record handling`);
    }

    if (distribution.high > 5) {
      recommendations.push(`High number of difficult chunks (${distribution.high}) - consider additional preprocessing`);
    }

    const totalEstimatedTime = chunks.reduce((sum, chunk) => sum + chunk.metadata.estimatedProcessingTimeMs, 0);
    if (totalEstimatedTime > 600000) { // 10 minutes
      recommendations.push(`Estimated total processing time: ${Math.round(totalEstimatedTime / 60000)} minutes - consider parallel processing`);
    }

    const totalMemory = chunks.reduce((sum, chunk) => sum + chunk.metadata.memoryRequirementMB, 0);
    if (totalMemory > 200) {
      recommendations.push(`High memory requirement (${totalMemory}MB) - process chunks sequentially with memory cleanup`);
    }

    return recommendations;
  }
}

// Export singleton instance
export const smartDataChunking = new SmartDataChunking();

// Utility functions
export const formatChunkSummary = (chunk: DataChunk): string => {
  const { id, data, metadata, estimatedDifficulty } = chunk;
  return `${id}: ${data.length} records, ${estimatedDifficulty} difficulty, ${metadata.dataComplexity}% complexity`;
};

export const getOptimalChunkingStrategy = (
  dataSize: number, 
  hasDateInfo: boolean, 
  errorCount: number
): 'date_based' | 'size_based' | 'complexity_based' | 'hybrid' => {
  if (dataSize < 500) return 'size_based';
  if (errorCount / dataSize > 0.2) return 'complexity_based';
  if (hasDateInfo && dataSize > 1000) return 'date_based';
  return 'hybrid';
};

export default smartDataChunking;