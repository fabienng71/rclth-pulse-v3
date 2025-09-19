
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StockRow {
  item_code: string;
  description?: string;
  packing?: string;
  uom?: string;
  price_thb?: number;
  adjust?: number;
  quantity: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

async function logSyncError(userId: string | null, errorMessage: string, startTime: number) {
  try {
    console.log('=== ATTEMPTING TO LOG SYNC ERROR ===', { errorMessage, userId })
    
    // Use service role for reliable logging
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    
    const logResult = await serviceClient
      .from('sync_log')
      .insert({
        sync_type: 'stock_sheets',
        status: 'failed',
        records_processed: 0,
        records_updated: 0,
        records_inserted: 0,
        errors: [{ error: errorMessage, error_type: 'early_failure', timestamp: new Date().toISOString() }],
        sync_duration_ms: Date.now() - startTime,
        synced_by: userId
      })
    
    if (logResult.error) {
      console.error('=== DATABASE LOG ERROR ===', logResult.error)
    } else {
      console.log('=== SYNC ERROR LOGGED SUCCESSFULLY ===')
    }
    
    return logResult
  } catch (logError) {
    console.error('=== FAILED TO LOG SYNC ERROR ===', logError)
    return { error: logError }
  }
}

function validateStockRow(row: any[], index: number): ValidationResult {
  const errors: string[] = [];
  
  // Validate item code
  const itemCode = row[0]?.toString().trim();
  if (!itemCode) {
    errors.push('Missing item code');
  } else if (itemCode.length > 50) {
    errors.push('Item code too long (max 50 characters)');
  }
  
  // Validate numeric fields
  const priceThb = parseFloat(row[4]);
  if (row[4] && (isNaN(priceThb) || priceThb < 0)) {
    errors.push('Invalid price value');
  }
  
  const adjust = parseFloat(row[5]);
  if (row[5] && isNaN(adjust)) {
    errors.push('Invalid adjust value');
  }
  
  const stock = parseFloat(row[6]);
  if (row[6] && isNaN(stock)) {
    errors.push('Invalid stock quantity');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  console.log('🚨 SYNC FUNCTION CALLED! Method:', req.method, 'URL:', req.url, 'Time:', new Date().toISOString())
  
  // IMMEDIATE DATABASE LOG - Before any other logic
  try {
    const immediateServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    
    await immediateServiceClient
      .from('sync_log')
      .insert({
        sync_type: 'function_called',
        status: 'success',
        records_processed: 0,
        records_updated: 0,
        records_inserted: 0,
        errors: [{ 
          message: `Function called: ${req.method} ${req.url}`, 
          timestamp: new Date().toISOString()
        }],
        sync_duration_ms: 0,
        synced_by: null
      })
    
    console.log('🚨 IMMEDIATE LOG WRITTEN TO DATABASE')
  } catch (immediateLogError) {
    console.error('🚨 IMMEDIATE LOG FAILED:', immediateLogError)
  }

  if (req.method === 'OPTIONS') {
    console.log('🚨 OPTIONS REQUEST - RETURNING CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  let supabaseClient: any = null
  let user: any = null

  try {
    console.log('=== SYNC START: Initializing sync operation ===')
    
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    console.log('=== SYNC: Supabase client created ===')

    // Verify user is admin
    const { data: { user: authUser } } = await supabaseClient.auth.getUser()
    user = authUser
    if (!user) {
      console.log('=== SYNC ERROR: No authenticated user ===')
      await logSyncError(null, 'Authentication failed: No user found', startTime)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
    console.log('=== SYNC: User authenticated:', user.id, '===')

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log('=== SYNC ERROR: User not admin ===', profile?.role)
      await logSyncError(user.id, 'Authorization failed: User is not admin', startTime)
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }
    console.log('=== SYNC: Admin access verified ===')

    const { sheetId, range = 'Sheet1!A2:G' } = await req.json()
    console.log('=== SYNC: Request params ===', { sheetId: sheetId?.substring(0, 20) + '...', range })
    
    if (!sheetId) {
      console.log('=== SYNC ERROR: No sheet ID provided ===')
      await logSyncError(user.id, 'Sheet ID is required', startTime)
      return new Response('Sheet ID is required', { status: 400, headers: corsHeaders })
    }

    let recordsProcessed = 0
    let recordsUpdated = 0
    let recordsInserted = 0
    const errors: any[] = []
    const warnings: any[] = []
    let validationErrors = 0
    let missingItemErrors = 0
    let duplicateItems = 0

    // Get Google Sheets API key from environment
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY')
    if (!apiKey) {
      console.log('=== SYNC ERROR: Google Sheets API key not configured ===')
      await logSyncError(user.id, 'Google Sheets API key not configured', startTime)
      throw new Error('Google Sheets API key not configured')
    }
    console.log('=== SYNC: API key found ===')

    // Fetch data from Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    console.log('=== SYNC: Fetching from Google Sheets ===')
    const response = await fetch(sheetsUrl)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('=== SYNC ERROR: Google Sheets API error ===', response.status, errorText)
      await logSyncError(user.id, `Google Sheets API error: ${response.status} - ${errorText}`, startTime)
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    const data = await response.json()
    const rows = data.values || []
    console.log('=== SYNC: Data fetched from Google Sheets ===', { rowCount: rows.length })


    // Process rows into batch data
    const stockRows: StockRow[] = []
    const priceUpdates: Array<{ item_code: string; unit_price: number }> = []
    const missingItems: Array<{ item_code: string; description: string; unit_price: number }> = []
    const processedItemCodes = new Set<string>() // Track processed item codes to prevent duplicates
    
    // First, get all existing item codes to validate against
    const { data: existingItems, error: itemsError } = await supabaseClient
      .from('items')
      .select('item_code')
    
    if (itemsError) {
      throw new Error(`Failed to fetch existing items: ${itemsError.message}`)
    }
    
    const existingItemCodes = new Set(existingItems?.map(item => item.item_code) || [])
    
    for (const [index, row] of rows.entries()) {
      try {
        recordsProcessed++
        
        // Expecting format: [Code, Description, Packing, UOM, Price (THB), adjust, stock]
        // Ensure proper UTF-8 encoding for text fields
        const itemCode = row[0]?.toString().trim()
        const description = row[1] ? decodeURIComponent(encodeURIComponent(row[1].toString().trim())) : null
        const packing = row[2] ? decodeURIComponent(encodeURIComponent(row[2].toString().trim())) : null
        const uom = row[3] ? decodeURIComponent(encodeURIComponent(row[3].toString().trim())) : null
        const priceThb = parseFloat(row[4]) || null
        const adjust = parseFloat(row[5]) || 0
        const stock = parseFloat(row[6]) || 0

        // Validate row data
        const validation = validateStockRow(row, index);
        if (!validation.isValid) {
          errors.push({ 
            row: index + 1, 
            item_code: itemCode || 'UNKNOWN',
            errors: validation.errors,
            error_type: 'validation'
          });
          validationErrors++;
          continue;
        }
        
        if (!itemCode) {
          errors.push({ row: index + 1, error: 'Missing item code' });
          continue;
        }

        // Check for duplicate item codes in the current batch
        if (processedItemCodes.has(itemCode)) {
          warnings.push({ 
            row: index + 1, 
            item_code: itemCode, 
            warning: 'Duplicate item code in sync data - using last occurrence' 
          });
          duplicateItems++;
          
          // Remove the previous entry for this item code
          const existingIndex = stockRows.findIndex(item => item.item_code === itemCode);
          if (existingIndex !== -1) {
            stockRows.splice(existingIndex, 1);
          }
          
          // Remove from price updates too
          const priceIndex = priceUpdates.findIndex(item => item.item_code === itemCode);
          if (priceIndex !== -1) {
            priceUpdates.splice(priceIndex, 1);
          }
        }
        
        processedItemCodes.add(itemCode);

        // Check if item exists in items table
        if (!existingItemCodes.has(itemCode)) {
          // Create missing item entry
          if (description && priceThb) {
            // Check for duplicate missing items
            if (missingItems.some(item => item.item_code === itemCode)) {
              warnings.push({ row: index + 1, item_code: itemCode, warning: 'Duplicate item code in sync data' });
              duplicateItems++;
            } else {
              missingItems.push({
                item_code: itemCode,
                description: description,
                unit_price: priceThb
              });
            }
            existingItemCodes.add(itemCode); // Add to set to avoid duplicates
          } else {
            errors.push({ 
              row: index + 1, 
              item_code: itemCode, 
              error: 'Item does not exist in items table and insufficient data to create',
              error_type: 'missing_item'
            });
            missingItemErrors++;
            continue;
          }
        }

        // Add to stock updates
        stockRows.push({
          item_code: itemCode,
          description: description,
          packing: packing,
          uom: uom,
          price_thb: priceThb,
          adjust: adjust,
          quantity: stock
        })
        
        // Add to price updates if price is provided
        if (priceThb && priceThb > 0) {
          priceUpdates.push({
            item_code: itemCode,
            unit_price: priceThb
          })
        }
      } catch (error) {
        errors.push({ row: index + 1, error: error.message })
      }
    }

    // First, create missing items if any
    if (missingItems.length > 0) {
      const { error: insertItemsError } = await supabaseClient
        .from('items')
        .insert(missingItems)
        
      if (insertItemsError) {
        errors.push({ error: `Failed to create missing items: ${insertItemsError.message}` })
      } else {
        recordsInserted += missingItems.length
      }
    }
    
    // Update item prices in items table (source of truth)
    if (priceUpdates.length > 0) {
      const { error: priceUpdateError } = await supabaseClient
        .from('items')
        .upsert(priceUpdates, {
          onConflict: 'item_code',
          ignoreDuplicates: false
        })
        
      if (priceUpdateError) {
        errors.push({ error: `Failed to update item prices: ${priceUpdateError.message}` })
      }
    }

    // Batch upsert stock data
    if (stockRows.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('stock_onhands')
        .upsert(stockRows, {
          onConflict: 'item_code',
          ignoreDuplicates: false
        })
        
      if (upsertError) {
        errors.push({ error: `Stock batch upsert failed: ${upsertError.message}` })
      } else {
        recordsUpdated = stockRows.length - missingItems.length
        recordsInserted += missingItems.length
      }
    }

    const syncDuration = Date.now() - startTime
    const status = errors.length === 0 ? 'success' : (recordsUpdated + recordsInserted > 0 ? 'partial' : 'failed')

    // Log the sync operation using service role for reliability
    console.log('=== LOGGING SYNC OPERATION ===', { status, recordsProcessed, recordsUpdated, recordsInserted, errorCount: errors.length })
    
    try {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )
      
      const logResult = await serviceClient
        .from('sync_log')
        .insert({
          sync_type: 'stock_sheets',
          status: status,
          records_processed: recordsProcessed,
          records_updated: recordsUpdated,
          records_inserted: recordsInserted,
          errors: errors.length > 0 ? errors : null,
          sync_duration_ms: syncDuration,
          synced_by: user.id
        })
      
      if (logResult.error) {
        console.error('=== FAILED TO LOG SYNC OPERATION ===', logResult.error)
      } else {
        console.log('=== SYNC OPERATION LOGGED SUCCESSFULLY ===')
      }
    } catch (logError) {
      console.error('=== ERROR DURING SYNC LOGGING ===', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        records_processed: recordsProcessed,
        records_updated: recordsUpdated,
        records_inserted: recordsInserted,
        missing_items_created: missingItems.length,
        price_updates_applied: priceUpdates.length,
        errors: errors,
        warnings: warnings,
        error_summary: {
          total_errors: errors.length,
          validation_errors: validationErrors,
          missing_item_errors: missingItemErrors,
          duplicate_items: duplicateItems
        },
        sync_duration_ms: syncDuration
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      }
    )

  } catch (error) {
    console.error('=== SYNC ERROR: Main catch block ===', error)
    
    // Log the failed sync operation
    try {
      await logSyncError(user?.id || null, error.message, startTime)
    } catch (logError) {
      console.error('Failed to log sync error:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        status: 'failed',
        records_processed: 0,
        records_updated: 0,
        records_inserted: 0,
        errors: [{ error: error.message, error_type: 'system_error' }],
        sync_duration_ms: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } 
      }
    )
  }
})
