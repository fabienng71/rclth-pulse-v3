
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { handleFileUpload, handleCogsFileUpload } from '../../services/dataUploadService';
import { useAuthStore } from '../../stores/authStore';

interface FileUploadTabProps {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  isCreditmemo: boolean;
  isCogs?: boolean;
  isAdmin: boolean;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onUploadProgress: (progress: { current: number, total: number }) => void;
  uploadProgress: { current: number, total: number };
  selectedYear?: number;
  selectedMonth?: number;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  title,
  description,
  buttonText,
  buttonColor,
  isCreditmemo,
  isCogs = false,
  isAdmin,
  isUploading,
  setIsUploading,
  onUploadProgress,
  uploadProgress,
  selectedYear,
  selectedMonth
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const [batchSize, setBatchSize] = useState<number>(isCreditmemo ? 30 : 25);
  const [lastUploadResult, setLastUploadResult] = useState<{
    status: 'success' | 'partial' | 'failed';
    successCount: number;
    errorCount: number;
    timestamp: Date;
    batchSize?: number;
  } | null>(null);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the user has the specific email permission
    if (user?.email !== 'fabien@repertoire.co.th') {
      toast.error('You do not have permission to upload data');
      return;
    }

    // Check file extension - only accept Excel files
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setIsUploading(true);
      setLastUploadResult(null);
      
      toast.info(`Processing file: ${file.name} with enhanced validation and transaction verification`);

      // Use the appropriate upload method based on file type
      const result = isCogs ? 
        await handleCogsFileUpload(
          file,
          onUploadProgress,
          batchSize,
          selectedYear,
          selectedMonth
        ) :
        await handleFileUpload(
          file,
          isCreditmemo,
          onUploadProgress,
          batchSize
        );
      
      // Determine upload status
      const status = result.errorCount === 0 ? 'success' : 
                    (result.successCount > 0 ? 'partial' : 'failed');
      
      // Update last upload result
      setLastUploadResult({
        status,
        successCount: result.successCount,
        errorCount: result.errorCount,
        timestamp: new Date(),
        batchSize
      });
      
      if (status === 'success') {
        toast.success(`✅ Successfully uploaded ${result.successCount} records with verified database insertion.`);
      } else if (status === 'partial') {
        toast.warning(`⚠️ Upload completed with issues: ${result.successCount} records added, ${result.errorCount} failed. Check sync logs for details.`);
      } else {
        toast.error(`❌ Upload failed: ${result.errorCount} records failed to process. Check sync logs for detailed error analysis.`);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setLastUploadResult({
        status: 'failed',
        successCount: 0,
        errorCount: 0,
        timestamp: new Date(),
        batchSize
      });
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check sync logs for detailed error analysis.`);
    } finally {
      setIsUploading(false);
      onUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleUploadClick = () => {
    if (user?.email !== 'fabien@repertoire.co.th') {
      toast.error('You do not have permission to upload data');
      return;
    }
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: 'success' | 'partial' | 'failed') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (result: typeof lastUploadResult) => {
    if (!result) return null;
    
    switch (result.status) {
      case 'success':
        return `✓ ${result.successCount} records uploaded successfully`;
      case 'partial':
        return `⚠ ${result.successCount} uploaded, ${result.errorCount} failed`;
      case 'failed':
        return `✗ Upload failed (${result.errorCount} errors)`;
    }
  };

  return (
    <div className="p-4 rounded-md bg-muted">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">
        {description}
      </p>
      
      {/* Enhanced Upload Info */}
      <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
        <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
          ✓ Enhanced Upload System (Fixed Silent Failures)
        </div>
        <div className="text-xs text-green-600 dark:text-green-400">
          • Smart date format detection (MM/DD/YY default for ambiguous dates)
          <br />
          • Transaction verification prevents silent rollbacks
          <br />
          • PostgreSQL timestamp compatibility ensured
        </div>
      </div>
      
      {/* Batch Size Configuration */}
      <div className="mb-3 space-y-2">
        <Label htmlFor="batch-size" className="text-xs font-medium">
          Batch Size (records per batch)
        </Label>
        <Input
          id="batch-size"
          type="number"
          min="1"
          max="100"
          value={batchSize}
          onChange={(e) => setBatchSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          className="h-8 text-xs"
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">
          Smaller batch sizes are more reliable for large imports. Recommended: 10-30 records per batch.
        </p>
      </div>

      
      {/* Last Upload Result */}
      {lastUploadResult && (
        <div className="mb-3 p-2 rounded-md bg-background border">
          <div className="flex items-center gap-2 text-xs mb-1">
            {getStatusIcon(lastUploadResult.status)}
            <span>{getStatusText(lastUploadResult)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock className="h-3 w-3" />
            <span>{lastUploadResult.timestamp.toLocaleString()}</span>
            {lastUploadResult.batchSize && (
              <span>• Size: {lastUploadResult.batchSize}</span>
            )}
          </div>
          
          
          <p className="text-xs text-muted-foreground mt-1">
            Import details logged to sync_log table with enhanced transaction verification.
          </p>
        </div>
      )}
      
      <Button 
        size="sm" 
        variant="default" 
        className={`${buttonColor}`}
        onClick={handleUploadClick}
        disabled={isUploading || user?.email !== 'fabien@repertoire.co.th'}
      >
        {isUploading ? (
          <div className="flex items-center gap-1">
            <Upload className="h-3 w-3 animate-pulse" />
            <span>Processing {uploadProgress.current}/{uploadProgress.total}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            <span>{buttonText}</span>
          </div>
        )}
      </Button>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept=".xlsx,.xls"
        disabled={isUploading}
      />
    </div>
  );
};
