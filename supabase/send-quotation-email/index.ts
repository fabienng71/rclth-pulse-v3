import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";

// SMTP configuration for Gmail
const SMTP_CONFIG = {
  hostname: "smtp.gmail.com",
  port: 587,
  username: Deno.env.get("GMAIL_EMAIL"),
  password: Deno.env.get("GMAIL_APP_PASSWORD"),
};

interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html: string;
}

interface QuotationEmailRequest {
  quotation: any;
  recipients: EmailRecipient[];
  template: EmailTemplate;
  pdfBuffer?: string;
  senderName?: string;
}

// Simple SMTP client implementation
class GmailSMTPClient {
  private connection: Deno.TcpConn | null = null;
  private tlsConnection: Deno.TlsConn | null = null;

  async connect(): Promise<void> {
    try {
      console.log("Connecting to Gmail SMTP...");
      
      // Connect to Gmail SMTP
      this.connection = await Deno.connect({
        hostname: SMTP_CONFIG.hostname,
        port: SMTP_CONFIG.port,
      });

      // Read server greeting
      await this.readResponse("220");
      
      // Send EHLO
      await this.sendCommand("EHLO localhost");
      await this.readResponse("250");
      
      // Start TLS
      await this.sendCommand("STARTTLS");
      await this.readResponse("220");
      
      // Upgrade to TLS
      this.tlsConnection = await Deno.startTls(this.connection, {
        hostname: SMTP_CONFIG.hostname,
      });
      
      // EHLO again after TLS
      await this.sendCommand("EHLO localhost");
      await this.readResponse("250");
      
      // Authenticate
      await this.sendCommand("AUTH LOGIN");
      await this.readResponse("334");
      
      // Send username (base64 encoded)
      const usernameB64 = btoa(SMTP_CONFIG.username!);
      await this.sendCommand(usernameB64);
      await this.readResponse("334");
      
      // Send password (base64 encoded)
      const passwordB64 = btoa(SMTP_CONFIG.password!);
      await this.sendCommand(passwordB64);
      await this.readResponse("235");
      
      console.log("Gmail SMTP authentication successful");
    } catch (error) {
      console.error("SMTP connection error:", error);
      // Clean up any partial connections
      if (this.tlsConnection) {
        try { this.tlsConnection.close(); } catch (closeError) { console.warn('Failed to close TLS connection:', closeError); }
      }
      if (this.connection) {
        try { this.connection.close(); } catch (closeError) { console.warn('Failed to close connection:', closeError); }
      }
      throw new Error(`Failed to connect to Gmail SMTP: ${error.message}`);
    }
  }

  private async sendCommand(command: string): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(command + "\r\n");
    
    // Use TLS connection if available, otherwise use regular connection
    if (this.tlsConnection) {
      await this.tlsConnection.write(data);
    } else if (this.connection) {
      await this.connection.write(data);
    } else {
      throw new Error("Not connected to SMTP server");
    }
  }

  private async readResponse(expectedCode: string): Promise<string> {
    const buffer = new Uint8Array(1024);
    let bytesRead: number | null;
    
    // Use TLS connection if available, otherwise use regular connection
    if (this.tlsConnection) {
      bytesRead = await this.tlsConnection.read(buffer);
    } else if (this.connection) {
      bytesRead = await this.connection.read(buffer);
    } else {
      throw new Error("Not connected to SMTP server");
    }
    
    if (!bytesRead) {
      throw new Error("No response from SMTP server");
    }

    const decoder = new TextDecoder();
    const response = decoder.decode(buffer.subarray(0, bytesRead));
    
    console.log("SMTP Response:", response.trim());
    
    if (!response.startsWith(expectedCode)) {
      throw new Error(`SMTP Error: ${response.trim()}`);
    }
    
    return response;
  }

  async sendEmail(
    from: string,
    fromName: string,
    recipients: EmailRecipient[],
    subject: string,
    htmlBody: string,
    pdfBuffer?: string,
    pdfFilename?: string
  ): Promise<void> {
    try {
      // MAIL FROM
      await this.sendCommand(`MAIL FROM:<${from}>`);
      await this.readResponse("250");

      // RCPT TO for each recipient
      for (const recipient of recipients) {
        await this.sendCommand(`RCPT TO:<${recipient.email}>`);
        await this.readResponse("250");
      }

      // DATA
      await this.sendCommand("DATA");
      await this.readResponse("354");

      // Email headers and body
      const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const recipientList = recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(", ");
      
      let emailContent = [
        `From: ${fromName} <${from}>`,
        `To: ${recipientList}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: quoted-printable`,
        ``,
        htmlBody,
        ``
      ];

      // Add PDF attachment if provided
      if (pdfBuffer && pdfFilename) {
        emailContent = emailContent.concat([
          `--${boundary}`,
          `Content-Type: application/pdf; name="${pdfFilename}"`,
          `Content-Transfer-Encoding: base64`,
          `Content-Disposition: attachment; filename="${pdfFilename}"`,
          ``,
          pdfBuffer,
          ``
        ]);
      }

      emailContent.push(`--${boundary}--`);
      emailContent.push(``);

      // Send email content
      const emailBody = emailContent.join("\r\n");
      const encoder = new TextEncoder();
      await this.tlsConnection!.write(encoder.encode(emailBody));

      // End data
      await this.sendCommand(".");
      await this.readResponse("250");

      console.log(`Email sent successfully to ${recipients.length} recipient(s)`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async quit(): Promise<void> {
    try {
      if (this.tlsConnection) {
        try {
          await this.sendCommand("QUIT");
          await this.readResponse("221");
        } catch (quitError) {
          console.log("QUIT command failed (non-critical):", quitError.message);
        }
        this.tlsConnection.close();
        this.tlsConnection = null;
      }
      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }
    } catch (error) {
      console.error("Error closing SMTP connection:", error);
    }
  }
}

// Process template variables
function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  }
  
  return processed;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== EDGE FUNCTION STARTED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing quotation email request...");
    
    // Log environment variables (without showing actual values)
    console.log("Environment check:", {
      hasGmailEmail: !!Deno.env.get("GMAIL_EMAIL"),
      hasGmailPassword: !!Deno.env.get("GMAIL_APP_PASSWORD"),
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    });
    
    console.log("Parsing request body...");
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
    
    const {
      quotation,
      recipients,
      template,
      pdfBuffer,
      senderName = "RCLT Holdings"
    }: QuotationEmailRequest = requestData;

    // Validate required fields
    if (!quotation || !recipients?.length || !template) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: quotation, recipients, or template"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Validate Gmail configuration
    if (!SMTP_CONFIG.username || !SMTP_CONFIG.password) {
      console.error("Gmail SMTP config missing:", { 
        hasEmail: !!SMTP_CONFIG.username, 
        hasPassword: !!SMTP_CONFIG.password 
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gmail SMTP configuration missing. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("Gmail SMTP config validated, email:", SMTP_CONFIG.username);

    // Prepare template variables
    const templateVariables = {
      customer_name: quotation.customer_name || quotation.lead_name || 'Valued Customer',
      quote_number: quotation.quote_number || 'Draft',
      company_name: 'RCLT Holdings',
      total_amount: quotation.total ? new Intl.NumberFormat('th-TH').format(quotation.total) : '0',
      currency: '฿',
      validity_days: quotation.validity_days || 15,
      created_date: new Date(quotation.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      expiry_date: new Date(
        new Date(quotation.created_at).getTime() + 
        (quotation.validity_days || 15) * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      salesperson_name: quotation.salesperson_name || 'Sales Team',
      notes: quotation.notes || ''
    };

    // Process template
    const processedSubject = processTemplate(template.subject, templateVariables);
    const processedHtml = processTemplate(template.html, templateVariables);

    // Initialize SMTP client
    const smtpClient = new GmailSMTPClient();
    
    try {
      console.log("Attempting SMTP connection...");
      await smtpClient.connect();
      console.log("SMTP connection successful, sending email...");
      
      // Send email
      await smtpClient.sendEmail(
        SMTP_CONFIG.username!,
        senderName,
        recipients,
        processedSubject,
        processedHtml,
        pdfBuffer,
        `Quotation-${quotation.quote_number || 'Draft'}.pdf`
      );
      
      console.log("Email sent successfully, closing connection...");
      await smtpClient.quit();

      // Log email to database (optional)
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseClient
          .from('quotation_emails')
          .insert({
            quotation_id: quotation.id,
            template_id: template.id || null,
            recipient_emails: recipients.map(r => r.email),
            subject: processedSubject,
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: {
              template_name: template.name,
              recipient_count: recipients.length,
              has_pdf_attachment: !!pdfBuffer
            }
          });
      } catch (logError) {
        console.error("Failed to log email to database:", logError);
        // Don't fail the whole request if logging fails
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Email sent successfully to ${recipients.length} recipient(s)`,
          recipients: recipients.length,
          subject: processedSubject
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );

    } catch (smtpError) {
      console.error("SMTP Error details:", {
        message: smtpError.message,
        stack: smtpError.stack,
        name: smtpError.name
      });
      
      // Try to close connection if it exists
      try {
        await smtpClient.quit();
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }
      
      // Rethrow the original error with more context
      throw new Error(`SMTP Error: ${smtpError.message}`);
    }

  } catch (error) {
    console.error("=== FUNCTION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);

    // Return detailed error information
    const errorResponse = {
      success: false,
      error: error.message || "Failed to send email",
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    };

    console.log("Returning error response:", errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);