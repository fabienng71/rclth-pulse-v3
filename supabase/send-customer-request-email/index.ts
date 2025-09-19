
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CustomerRequest {
  id: string;
  customer_name: string;
  customer_type_code?: string;
  salesperson_code?: string;
  region?: string;
  customer_group?: string;
}

interface CustomerRequestEmailParams {
  customerRequest: CustomerRequest;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerRequest, recipientEmail }: CustomerRequestEmailParams = await req.json();

    // Format customer request details for email
    const customerDetails = `
      <ul>
        <li><strong>Customer Name:</strong> ${customerRequest.customer_name}</li>
        <li><strong>Customer Type:</strong> ${customerRequest.customer_type_code || 'Not specified'}</li>
        <li><strong>Region:</strong> ${customerRequest.region || 'Not specified'}</li>
        <li><strong>Customer Group:</strong> ${customerRequest.customer_group || 'Not specified'}</li>
      </ul>
    `;

    const emailResponse = await resend.emails.send({
      from: "Customer Management <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New Customer Request: ${customerRequest.customer_name}`,
      html: `
        <h1>New Customer Request</h1>
        <p>A new customer request has been submitted with the following details:</p>
        ${customerDetails}
        <p>Please review this request at your earliest convenience.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-customer-request-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
