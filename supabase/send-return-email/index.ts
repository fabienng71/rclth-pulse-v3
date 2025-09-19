
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";

interface ReturnRequestData {
  id: string;
  customer_code: string;
  return_date: string;
  priority: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  full_name?: string; // Added to support enhanced return requests
  customers: {
    customer_name: string;
    search_name: string | null;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing email request...");
    const requestBody = await req.json();
    const { returnRequest } = requestBody as { returnRequest: ReturnRequestData };
    
    if (!returnRequest || !returnRequest.id) {
      console.error("Invalid request data:", requestBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request data - missing return request information" 
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Initialize Supabase client to fetch logo and return items
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch logo from storage
    let logoUrl = '';
    try {
      const { data } = supabase.storage
        .from('repertoire-assets')
        .getPublicUrl('1744161384762-RCLTH-logo.png');
      logoUrl = data.publicUrl;
    } catch (error) {
      console.log('Logo fetch error:', error);
      // Continue without logo if fetch fails
    }

    // Fetch return request items
    let returnItems: any[] = [];
    try {
      const { data: items, error } = await supabase
        .from('return_request_items')
        .select('*')
        .eq('return_request_id', returnRequest.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      returnItems = items || [];
    } catch (error) {
      console.error('Error fetching return items:', error);
      // Continue with empty items array
    }
    
    console.log(`Preparing email for return request`);
    
    // Format the date for the subject line
    const formattedDate = new Date(returnRequest.return_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Prioritize customer_search_name over customer_name
    const customerDisplayName = returnRequest.customers?.search_name || returnRequest.customers?.customer_name || returnRequest.customer_code;

    // Create the email subject without request ID  
    const creatorName = returnRequest.profiles?.full_name || returnRequest.full_name || 'Unknown';
    const emailSubject = `Return Request - ${customerDisplayName} - ${creatorName} - ${formattedDate}`;
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case 'high':
          return '#ef4444';
        case 'medium':
          return '#f59e0b';
        case 'low':
          return '#10b981';
        default:
          return '#6b7280';
      }
    };

    const getPriorityBadge = (priority: string) => {
      const color = getPriorityColor(priority);
      return `<span style="background-color: ${color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${priority}</span>`;
    };

    // Generate the items table HTML with enhanced styling
    const itemsTableHtml = returnItems.length > 0 
      ? `
        <div style="margin: 24px 0;">
          <h3 style="color: #dc2626; margin-bottom: 16px; font-size: 18px; font-weight: 600;">Items to Return</h3>
          <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Item Code</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Description</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 600; font-size: 14px;">Quantity</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Unit</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Reason</th>
              </tr>
            </thead>
            <tbody>
              ${returnItems.map((item: any, index: number) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-family: 'Monaco', monospace; font-size: 13px; color: #374151; font-weight: 500;">${item.item_code}</td>
                  <td style="padding: 12px 16px; color: #374151; font-size: 14px;">${item.description}</td>
                  <td style="padding: 12px 16px; text-align: center; color: #374151; font-size: 14px; font-weight: 500;">${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(item.quantity)}</td>
                  <td style="padding: 12px 16px; color: #374151; font-size: 14px;">${item.unit || '-'}</td>
                  <td style="padding: 12px 16px; color: #374151; font-size: 14px;">${item.reason}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
      : '<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; color: #6b7280; font-style: italic;">No items in this return request.</div>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Return Request</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Logo -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 40px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 60px; max-width: 200px; margin-bottom: 16px;">` : ''}
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Return Request</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
                Status: ${returnRequest.status.toUpperCase()} • Created on ${formatDate(returnRequest.created_at)}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              
              <!-- Customer and Request Information -->
              <div style="display: flex; margin-bottom: 32px; gap: 32px;">
                <div style="flex: 1; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #2563eb;">
                  <h3 style="color: #2563eb; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Customer Information</h3>
                  <div style="space-y: 8px;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Customer Code:</strong> ${returnRequest.customer_code}</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Customer Name:</strong> ${customerDisplayName}</p>
                  </div>
                </div>
                
                <div style="flex: 1; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #dc2626;">
                  <h3 style="color: #dc2626; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Return Details</h3>
                  <div style="space-y: 8px;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Return Date:</strong> ${formatDate(returnRequest.return_date)}</p>
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Priority:</strong> ${getPriorityBadge(returnRequest.priority)}</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Total Items:</strong> ${returnItems.length}</p>
                  </div>
                </div>
              </div>
              
              <!-- Items Table -->
              ${itemsTableHtml}
              
              <!-- Notes Section -->
              ${returnRequest.notes ? `
                <div style="margin-top: 32px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #f59e0b; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Notes</h3>
                  <p style="white-space: pre-wrap; color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${returnRequest.notes}</p>
                </div>
              ` : ''}
              
              <!-- Created By Section -->
              <div style="margin-top: 32px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #6b7280;">
                <h3 style="color: #6b7280; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Submitted By</h3>
                <p style="margin: 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Name:</strong> ${returnRequest.profiles?.full_name || returnRequest.full_name || 'Unknown'}</p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <h4 style="color: white; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Contact Information</h4>
                <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px;">📧 Email: fabien@repertoire.co.th</p>
                <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px;">📞 Phone: +66 (0) 2-XXX-XXXX</p>
                <p style="color: #d1d5db; margin: 0; font-size: 14px;">🌐 Website: www.repertoire.co.th</p>
              </div>
              <div style="border-top: 1px solid #374151; padding-top: 16px;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Repertoire Co., Ltd. All rights reserved.
                </p>
              </div>
            </div>
            
          </div>
        </body>
      </html>
    `;

    try {
      console.log("Sending email via Resend...");
      const emailResponse = await resend.emails.send({
        from: "Repertoire Returns <onboarding@resend.dev>",
        to: ["fabien@repertoire.co.th"],
        subject: emailSubject,
        html: emailHtml
      });

      console.log("Email sent response:", emailResponse);

      if (emailResponse.error) {
        console.error("Email error details:", emailResponse.error);
        
        if (emailResponse.error.message?.includes('domain is not verified')) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Domain verification error",
            message: "Please verify your domain at https://resend.com/domains or use Resend's default domain (onboarding@resend.dev)",
            details: emailResponse.error
          }), {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: emailResponse.error.message || "Failed to send email",
          details: emailResponse.error
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        status: 'sent',
        message: 'Email sent successfully'
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (emailError) {
      console.error("Error sending email with Resend:", emailError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailError.message || "Failed to send email through Resend",
          errorDetails: JSON.stringify(emailError)
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in send-return-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An error occurred while processing the request",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
};

serve(handler);
