
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { format } from "npm:date-fns@3.3.1";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing email request for sample...");
    const requestBody = await req.json();
    const { sampleRequest } = requestBody as { sampleRequest: any };
    
    if (!sampleRequest) {
      console.error("Invalid request data:", requestBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request data - missing sample request information" 
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
    
    // Format the date
    const formattedDate = format(new Date(sampleRequest.created_at), 'yyyy-MM-dd');
    
    // Prioritize customer_search_name over customer_name
    const customerDisplayName = sampleRequest.customer_search_name || sampleRequest.customer_name || 'Unknown Customer';
    
    // Create email subject without request ID
    const emailSubject = `Sample Request - ${customerDisplayName} - ${sampleRequest.created_by_name || 'Unknown'} - ${formattedDate}`;
    
    console.log(`Preparing email for sample request`);
    
    const formatDate = (dateString: string | undefined | null) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatCurrency = (value: number | undefined | null) => {
      if (value === undefined || value === null) return '฿0';
      return `฿${new Intl.NumberFormat('th-TH', {
        maximumFractionDigits: 0
      }).format(value)}`;
    };

    // Generate the items table HTML with enhanced styling
    const itemsTableHtml = sampleRequest.sample_request_items?.length > 0 
      ? `
        <div style="margin: 24px 0;">
          <h3 style="color: #2563eb; margin-bottom: 16px; font-size: 18px; font-weight: 600;">Sample Items</h3>
          <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Item Code</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Description</th>
                <th style="padding: 12px 16px; text-align: center; font-weight: 600; font-size: 14px;">Quantity</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 600; font-size: 14px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${sampleRequest.sample_request_items.map((item: any, index: number) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-family: 'Monaco', monospace; font-size: 13px; color: #374151; font-weight: 500;">${item.item_code}</td>
                  <td style="padding: 12px 16px; color: #374151; font-size: 14px;">${item.description}</td>
                  <td style="padding: 12px 16px; text-align: center; color: #374151; font-size: 14px; font-weight: 500;">${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(item.quantity)}</td>
                  <td style="padding: 12px 16px; text-align: right; color: #374151; font-size: 14px; font-weight: 500;">${item.price ? formatCurrency(item.price) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
      : '<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; color: #6b7280; font-style: italic;">No items in this sample request.</div>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sample Request</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Company Name -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #8B0000; margin: 0 0 16px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">REPERTOIRE CULINAIRE</h1>
              <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Sample Request</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
                Created on ${formatDate(sampleRequest.created_at)}
                ${sampleRequest.created_by_name ? ` by ${sampleRequest.created_by_name}` : ''}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              
              <!-- Customer and Request Information -->
              <div style="display: flex; margin-bottom: 32px; gap: 32px;">
                <div style="flex: 1; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #2563eb;">
                  <h3 style="color: #2563eb; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Customer Information</h3>
                  <div style="space-y: 8px;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Customer Code:</strong> ${sampleRequest.customer_code}</p>
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Customer Name:</strong> ${customerDisplayName}</p>
                    ${sampleRequest.salesperson_code ? `<p style="margin: 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Salesperson:</strong> ${sampleRequest.salesperson_code}</p>` : ''}
                  </div>
                </div>
                
                <div style="flex: 1; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #059669;">
                  <h3 style="color: #059669; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Request Details</h3>
                  <div style="space-y: 8px;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Follow-up Date:</strong> ${sampleRequest.follow_up_date ? formatDate(sampleRequest.follow_up_date) : 'None'}</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong style="color: #1f2937;">Total Items:</strong> ${sampleRequest.sample_request_items?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <!-- Items Table -->
              ${itemsTableHtml}
              
              <!-- Notes Section -->
              ${sampleRequest.notes ? `
                <div style="margin-top: 32px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #f59e0b; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Notes</h3>
                  <p style="white-space: pre-wrap; color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${sampleRequest.notes}</p>
                </div>
              ` : ''}
              
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
        from: "Repertoire Samples <onboarding@resend.dev>",
        to: ["fabien@repertoire.co.th"],
        subject: emailSubject,
        html: emailHtml
      });

      console.log("Email sent response:", emailResponse);

      if (emailResponse.error) {
        console.error("Email error details:", emailResponse.error);
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
    console.error("Error in send-sample-email function:", error);
    
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
