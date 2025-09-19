import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface LeaveNotificationRequest {
  event_type: 'leave_request_submitted' | 'leave_request_approved' | 'leave_request_denied';
  requester_name: string;
  requester_email: string;
  approver_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  reason?: string;
  denial_reason?: string;
  request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing leave notification request...");
    const requestBody = await req.json();
    const { 
      event_type,
      requester_name,
      requester_email,
      approver_name,
      leave_type,
      start_date,
      end_date,
      duration_days,
      reason,
      denial_reason,
      request_id
    } = requestBody as LeaveNotificationRequest;
    
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);
    
    let emailSubject = '';
    let emailHtml = '';
    let recipientEmail = '';
    
    switch (event_type) {
      case 'leave_request_submitted':
        emailSubject = `New Leave Request - ${requester_name}`;
        recipientEmail = 'fabien@repertoire.co.th';
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Leave Request Submitted</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Employee:</strong> ${requester_name}</p>
              <p><strong>Email:</strong> ${requester_email}</p>
              <p><strong>Leave Type:</strong> ${leave_type}</p>
              <p><strong>Duration:</strong> ${duration_days} day(s)</p>
              <p><strong>Start Date:</strong> ${formattedStartDate}</p>
              <p><strong>End Date:</strong> ${formattedEndDate}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <p style="color: #666;">Please review this request in the leave management system.</p>
            <p style="color: #999; font-size: 12px;">Request ID: ${request_id}</p>
          </div>
        `;
        break;
        
      case 'leave_request_approved':
        emailSubject = `Leave Request Approved - ${requester_name}`;
        recipientEmail = requester_email;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Leave Request Approved</h2>
            <p>Hello ${requester_name},</p>
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p>Your leave request has been <strong>approved</strong> by ${approver_name}.</p>
              <p><strong>Leave Type:</strong> ${leave_type}</p>
              <p><strong>Duration:</strong> ${duration_days} day(s)</p>
              <p><strong>Start Date:</strong> ${formattedStartDate}</p>
              <p><strong>End Date:</strong> ${formattedEndDate}</p>
            </div>
            <p>You can now plan your leave accordingly.</p>
            <p style="color: #666;">Best regards,<br>HR Team</p>
          </div>
        `;
        break;
        
      case 'leave_request_denied':
        emailSubject = `Leave Request Denied - ${requester_name}`;
        recipientEmail = requester_email;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Leave Request Denied</h2>
            <p>Hello ${requester_name},</p>
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p>Your leave request has been <strong>denied</strong> by ${approver_name}.</p>
              <p><strong>Leave Type:</strong> ${leave_type}</p>
              <p><strong>Duration:</strong> ${duration_days} day(s)</p>
              <p><strong>Start Date:</strong> ${formattedStartDate}</p>
              <p><strong>End Date:</strong> ${formattedEndDate}</p>
              ${denial_reason ? `<p><strong>Reason:</strong> ${denial_reason}</p>` : ''}
            </div>
            <p>Please contact your manager for more information or to discuss alternative arrangements.</p>
            <p style="color: #666;">Best regards,<br>HR Team</p>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Unknown event type: ${event_type}`);
    }

    try {
      console.log(`Sending ${event_type} email to ${recipientEmail}...`);
      const emailResponse = await resend.emails.send({
        from: "Repertoire Leave System <onboarding@resend.dev>",
        to: [recipientEmail],
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
        message: 'Email sent successfully',
        event_type,
        recipient: recipientEmail
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
    console.error("Error in send-leave-notification function:", error);
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