
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const { imageUrl } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting business information from Instagram screenshots. Extract the following fields and return them in JSON format:
              - company_name: The business name
              - contact_name: The person's name
              - phone: Phone number if available
              - email: Email if available
              - industry: The business industry/type
              - instagram_handle: The Instagram handle
              - website: Website URL if available
              - notes: Any descriptive text about the business
              Return null for any fields not found.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract business details from this Instagram screenshot and return as JSON' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      if (data.error.code === 'insufficient_quota') {
        throw new Error("OpenAI API quota exceeded");
      }
      throw new Error(data.error.message || "OpenAI API error");
    }

    // Parse the response and map to our lead fields
    const extracted = JSON.parse(data.choices[0].message.content);
    
    return new Response(JSON.stringify({
      customer_name: extracted.company_name,
      contact_name: extracted.contact_name,
      email: extracted.email,
      phone: extracted.phone,
      industry: extracted.industry,
      instagram_handle: extracted.instagram_handle,
      website: extracted.website,
      notes: extracted.notes,
      status: "New",
      screenshot_url: imageUrl // Store the uploaded screenshot URL
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in instagram-ocr function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.message.includes("quota exceeded") 
          ? "The OpenAI API quota has been exceeded. Please check your billing settings."
          : "Could not process the image. Please try again or fill the form manually."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
