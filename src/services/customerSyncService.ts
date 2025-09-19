
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

/**
 * Manually triggers the synchronization of customer data from customers table to salesdata
 * This is useful when you need to force an update after direct database changes
 * 
 * @param customerCode The customer code to synchronize
 * @returns Promise with success status and message
 */
export const syncCustomerData = async (customerCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the customer data first
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('customer_code, customer_name, search_name, customer_type_code, salesperson_code')
      .eq('customer_code', customerCode)
      .single();
    
    if (fetchError) {
      console.error('Error fetching customer data:', fetchError);
      return { success: false, message: `Error fetching customer: ${fetchError.message}` };
    }
    
    if (!customer) {
      return { success: false, message: `Customer with code ${customerCode} not found` };
    }
    
    // Manually update the salesdata table with the customer data
    const { error: updateError } = await supabase
      .from('salesdata')
      .update({
        customer_name: customer.customer_name,
        search_name: customer.search_name,
        customer_type_code: customer.customer_type_code,
        salesperson_code: customer.salesperson_code
      })
      .eq('customer_code', customerCode);
    
    if (updateError) {
      console.error('Error updating salesdata:', updateError);
      return { success: false, message: `Error updating data: ${updateError.message}` };
    }
    
    console.log(`Successfully synchronized customer: ${customerCode}`);
    return { 
      success: true, 
      message: `Successfully synchronized customer: ${customerCode}` 
    };
  } catch (err: any) {
    console.error('Error in customer sync operation:', err);
    return { 
      success: false, 
      message: `Sync operation failed: ${err.message}` 
    };
  }
};

/**
 * Triggers a synchronization for all customers or a list of customer codes
 * 
 * @param customerCodes Optional array of customer codes to synchronize, if not provided all customers will be synced
 * @returns Promise with success status and message
 */
export const syncAllCustomers = async (customerCodes?: string[]): Promise<{ success: boolean; message: string }> => {
  try {
    if (customerCodes && customerCodes.length > 0) {
      // Sync only specific customers
      for (const code of customerCodes) {
        await syncCustomerData(code);
      }
      return { 
        success: true, 
        message: `Successfully synchronized ${customerCodes.length} customers` 
      };
    } else {
      // Get all customer codes first
      const { data: customers, error: fetchError } = await supabase
        .from('customers')
        .select('customer_code');
      
      if (fetchError) {
        return { success: false, message: `Error fetching customers: ${fetchError.message}` };
      }
      
      // Sync all customers
      const codes = customers.map(c => c.customer_code);
      let syncedCount = 0;
      
      // Process in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);
        
        // Process each customer in the batch
        for (const code of batch) {
          const result = await syncCustomerData(code);
          if (result.success) syncedCount++;
        }
        
        // Small pause between batches
        if (i + batchSize < codes.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return { 
        success: true, 
        message: `Successfully synchronized ${syncedCount} out of ${codes.length} customers` 
      };
    }
  } catch (err: any) {
    console.error('Error in bulk customer sync operation:', err);
    return { 
      success: false, 
      message: `Bulk sync operation failed: ${err.message}` 
    };
  }
};
