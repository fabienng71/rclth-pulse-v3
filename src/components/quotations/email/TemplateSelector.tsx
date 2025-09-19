import { useState, useEffect } from 'react';
import { FileText, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QuotationWithItems } from '@/types/quotations';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  description?: string;
  variables: string[];
}

interface TemplateSelectorProps {
  quotation: QuotationWithItems;
  selected: EmailTemplate | null;
  onChange: (template: EmailTemplate | null) => void;
  className?: string;
}

// Default email templates
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'professional',
    name: 'Professional Quotation',
    subject: 'Quotation {{quote_number}} from {{company_name}}',
    description: 'Professional template for business quotations',
    variables: ['customer_name', 'quote_number', 'company_name', 'total_amount', 'currency', 'expiry_date'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #8B0000; margin: 0 0 16px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{company_name}}</h1>
              <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Quotation</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
                Quote #{{quote_number}} • {{created_date}}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
                Dear {{customer_name}},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Thank you for your interest in our products and services. Please find attached our detailed quotation for your review.
              </p>
              
              <!-- Quotation Summary -->
              <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #2563eb; margin-bottom: 24px;">
                <h3 style="color: #2563eb; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Quotation Summary</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #374151; font-weight: 500;">Quote Number:</span>
                  <span style="color: #374151; font-weight: 600;">{{quote_number}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #374151; font-weight: 500;">Total Amount:</span>
                  <span style="color: #374151; font-weight: 600; font-size: 18px;">{{currency}}{{total_amount}}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #374151; font-weight: 500;">Valid Until:</span>
                  <span style="color: #374151; font-weight: 600;">{{expiry_date}}</span>
                </div>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                The attached PDF contains detailed information about the products, quantities, and pricing. Please review it carefully and don't hesitate to contact us if you have any questions.
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
                We look forward to working with you and appreciate your business.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Best regards,<br>
                  <strong>{{salesperson_name}}</strong><br>
                  {{company_name}}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <h4 style="color: white; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Contact Information</h4>
                <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px;">📧 Email: info@rcltholdings.com</p>
                <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px;">📞 Phone: +66 (0) 2-XXX-XXXX</p>
                <p style="color: #d1d5db; margin: 0; font-size: 14px;">🌐 Website: www.rcltholdings.com</p>
              </div>
              <div style="border-top: 1px solid #374151; padding-top: 16px;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} RCLT Holdings. All rights reserved.
                </p>
              </div>
            </div>
            
          </div>
        </body>
      </html>
    `
  },
  {
    id: 'follow-up',
    name: 'Follow-up Quotation',
    subject: 'Following up on Quotation {{quote_number}}',
    description: 'Friendly follow-up template for existing quotations',
    variables: ['customer_name', 'quote_number', 'company_name', 'total_amount', 'currency', 'expiry_date'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Follow-up Quotation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #8B0000; margin: 0 0 16px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{company_name}}</h1>
              <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Quotation Follow-up</h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
                Hi {{customer_name}},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                I wanted to follow up on the quotation we sent you recently. I hope you've had a chance to review our proposal.
              </p>
              
              <!-- Quotation Reminder -->
              <div style="background-color: #f0f9f5; padding: 24px; border-radius: 12px; border-left: 4px solid #059669; margin-bottom: 24px;">
                <h3 style="color: #059669; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Quotation Reminder</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #374151; font-weight: 500;">Quote Number:</span>
                  <span style="color: #374151; font-weight: 600;">{{quote_number}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #374151; font-weight: 500;">Total Amount:</span>
                  <span style="color: #374151; font-weight: 600; font-size: 18px;">{{currency}}{{total_amount}}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #374151; font-weight: 500;">Valid Until:</span>
                  <span style="color: #374151; font-weight: 600;">{{expiry_date}}</span>
                </div>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Do you have any questions about our proposal? I'd be happy to discuss any details or make adjustments if needed.
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
                Please let me know if there's anything I can clarify or if you'd like to move forward with this quotation.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Looking forward to hearing from you,<br>
                  <strong>{{salesperson_name}}</strong><br>
                  {{company_name}}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} RCLT Holdings. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `
  },
  {
    id: 'simple',
    name: 'Simple & Clean',
    subject: 'Quotation {{quote_number}} - {{customer_name}}',
    description: 'Minimalist template with clean design',
    variables: ['customer_name', 'quote_number', 'company_name', 'total_amount', 'currency', 'salesperson_name'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #8B0000; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">{{company_name}}</h1>
              <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px auto; width: 100px;">
            </div>
            
            <div style="margin-bottom: 32px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
                Dear {{customer_name}},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Thank you for your inquiry. Please find attached our quotation {{quote_number}} with a total amount of {{currency}}{{total_amount}}.
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                If you have any questions or need clarification on any items, please don't hesitate to contact me.
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 40px;">
                We appreciate your business and look forward to working with you.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="font-size: 16px; color: #374151; margin: 0;">
                Best regards,<br><br>
                <strong>{{salesperson_name}}</strong><br>
                {{company_name}}
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `
  }
];

export const TemplateSelector = ({
  quotation,
  selected,
  onChange,
  className
}: TemplateSelectorProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    // Auto-select first template if none selected
    if (!selected && DEFAULT_TEMPLATES.length > 0) {
      onChange(DEFAULT_TEMPLATES[0]);
    }
  }, [selected, onChange]);

  const handleTemplateChange = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    onChange(template || null);
  };

  const handlePreview = (template: EmailTemplate) => {
    // Process template with sample data
    const sampleVariables = {
      customer_name: quotation.customer_name || quotation.lead_name || 'John Doe',
      quote_number: quotation.quote_number || 'Q-2024-001',
      company_name: 'RCLT Holdings',
      total_amount: quotation.total ? new Intl.NumberFormat('th-TH').format(quotation.total) : '50,000',
      currency: '฿',
      expiry_date: new Date(
        new Date(quotation.created_at).getTime() + 
        (quotation.validity_days || 15) * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      created_date: new Date(quotation.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      salesperson_name: quotation.salesperson_name || 'Sales Team'
    };

    let processedHtml = template.html;
    for (const [key, value] of Object.entries(sampleVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value));
    }

    setPreviewHtml(processedHtml);
    setPreviewTemplate(template);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Email Template</label>
        {selected && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => selected && handlePreview(selected)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Email Template Preview</DialogTitle>
              </DialogHeader>
              <div
                className="border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Select
        value={selected?.id || ''}
        onValueChange={handleTemplateChange}
      >
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <SelectValue placeholder="Choose an email template..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_TEMPLATES.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                {template.description && (
                  <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Template details */}
      {selected && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Subject: </span>
              <span className="text-sm">{selected.subject}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Variables: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selected.variables.map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};