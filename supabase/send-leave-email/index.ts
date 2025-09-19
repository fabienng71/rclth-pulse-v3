
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface LeaveEmailRequest {
  fullName: string;
  recipientEmail?: string;
  startDate: string;
  endDate: string;
  isApproved: boolean;
  submittedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing leave email request...");
    const requestBody = await req.json();
    const { 
      fullName, 
      recipientEmail, 
      startDate, 
      endDate, 
      isApproved,
      submittedBy 
    } = requestBody as LeaveEmailRequest;
    
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Format dates for display
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    // Prepare email content
    const emailSubject = `ANNUAL LEAVE - ${submittedBy}`;
    
    let emailHtml = "";
    if (isApproved) {
      emailHtml = `
        <h1>Leave Request Approved</h1>
        <p>Hello ${fullName},</p>
        <p>Your leave request from ${formattedStartDate} to ${formattedEndDate} has been approved.</p>
        <p>Thank you.</p>
      `;
    } else {
      emailHtml = `
        <h1>Leave Request Rejected</h1>
        <p>Hello ${fullName},</p>
        <p>Your leave request from ${formattedStartDate} to ${formattedEndDate} has been rejected.</p>
        <p>Liaise with your direct manager for more information.</p>
      `;
    }

    // Default recipient email if none provided
    const toEmail = recipientEmail || "fabien@repertoire.co.th";

    try {
      console.log("Sending email via Resend...");
      const emailResponse = await resend.emails.send({
        from: "Repertoire Leave Notifications <onboarding@resend.dev>",
        to: [toEmail],
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
    console.error("Error in send-leave-email function:", error);
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
