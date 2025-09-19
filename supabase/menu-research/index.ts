import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildGeneralResearchPrompt(query: string) {
  return `
You are a restaurant research assistant. Your task is to find general information about this restaurant and identify where their menu information might be located.

Research Query: ${query}

Please tell me about this restaurant and identify potential sources where their menu information could be found. Look for:
1. Official website
2. Social media accounts (Instagram, Facebook, TikTok, etc.)
3. Food delivery platforms (Grab Food, Foodpanda, UberEats, DoorDash, etc.)
4. Review sites (TripAdvisor, Google Reviews, Zomato, Yelp, etc.)
5. Local business directories
6. Food blogs or news articles that mention them

Provide a comprehensive overview of the restaurant's online presence and specifically mention any platforms or sources where menu information might be available.

If you find limited information, just say "Limited online presence found for this restaurant" and provide what little information you can find.
  `.trim();
}

function buildTargetedMenuSearchPrompt(query: string, generalInfo: string) {
  return `
You are a menu research specialist. Based on the general restaurant information provided below, find specific menu content links.

Original Restaurant Query: ${query}

General Restaurant Information Found:
${generalInfo}

Now, based on this information, find direct links to menu content from the sources mentioned above. For each menu source found, return:
- label: Short description (e.g., "Website Menu Page", "Instagram Menu Post", "Grab Food Menu")
- url: Direct link to the menu content
- type: "pdf", "image", "page", or "social_post"
- source: "website", "instagram", "facebook", "delivery_platform", "review_site", "food_blog"

Focus on finding actual menu content links from the sources identified in the general research above.

Return ONLY structured JSON in this exact format:
{"results":[{"label":"...","url":"...","type":"pdf|image|page|social_post","source":"website|instagram|facebook|delivery_platform|review_site|food_blog"},...]}

If no specific menu links can be found, return: {"results":[]}
  `.trim();
}

const handleIterativeResearch = async (query: string) => {
  console.log("Starting two-step iterative menu research for query:", query);
  const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
  if (!perplexityApiKey) {
    console.error("Missing Perplexity API key.");
    return new Response(JSON.stringify({ error: "Server configuration error: Missing Perplexity API key." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // STEP 1: General Restaurant Research
    console.log("Step 1: Conducting general restaurant research...");
    const generalPrompt = buildGeneralResearchPrompt(query);
    
    const generalResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "You are a helpful restaurant research assistant that finds comprehensive information about restaurants and their online presence." },
          { role: "user", content: generalPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!generalResponse.ok) {
      const errText = await generalResponse.text();
      console.error("Step 1 Perplexity API error:", errText);
      return new Response(JSON.stringify({ error: `Step 1 research failed: ${errText}` }), { 
        status: 502, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const generalData = await generalResponse.json();
    const generalInfo = generalData.choices[0].message.content;
    console.log("Step 1 completed. General info found:", generalInfo.substring(0, 200) + "...");

    // Check if limited online presence
    if (generalInfo.toLowerCase().includes("limited online presence")) {
      console.log("Limited online presence detected, returning early");
      return new Response(JSON.stringify({ 
        step1_general_research: generalInfo,
        step2_targeted_search: "Skipped due to limited online presence",
        results: [],
        debug_info: {
          step1_completed: true,
          step2_completed: false,
          reason: "Limited online presence found"
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 2: Targeted Menu Search
    console.log("Step 2: Conducting targeted menu search...");
    const targetedPrompt = buildTargetedMenuSearchPrompt(query, generalInfo);
    
    const targetedResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "You are a menu research specialist that finds direct links to restaurant menu content and returns only valid structured JSON." },
          { role: "user", content: targetedPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!targetedResponse.ok) {
      const errText = await targetedResponse.text();
      console.error("Step 2 Perplexity API error:", errText);
      return new Response(JSON.stringify({ 
        step1_general_research: generalInfo,
        step2_targeted_search: `Failed: ${errText}`,
        results: [],
        debug_info: {
          step1_completed: true,
          step2_completed: false,
          error: errText
        }
      }), { 
        status: 502, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const targetedData = await targetedResponse.json();
    const targetedText = targetedData.choices[0].message.content;
    console.log("Step 2 raw response:", targetedText);

    // Parse the targeted search results
    let menuResults = null;
    
    // Strategy 1: Try direct JSON parsing
    try {
      menuResults = JSON.parse(targetedText);
      console.log("Successfully parsed JSON directly from Step 2");
    } catch {
      console.log("Direct JSON parsing failed for Step 2, trying extraction methods...");
      
      // Strategy 2: Extract JSON from markdown code blocks
      const codeBlockMatch = targetedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          menuResults = JSON.parse(codeBlockMatch[1]);
          console.log("Successfully parsed JSON from code block in Step 2");
        } catch (e) {
          console.error("Failed to parse JSON from code block in Step 2:", e);
        }
      }
      
      // Strategy 3: Find JSON object in text
      if (!menuResults) {
        const jsonMatch = targetedText.match(/\{[\s\S]*"results"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            menuResults = JSON.parse(jsonMatch[0]);
            console.log("Successfully parsed JSON from pattern match in Step 2");
          } catch (e) {
            console.error("Failed to parse JSON from pattern match in Step 2:", e);
          }
        }
      }
      
      // Strategy 4: Last resort - return empty results
      if (!menuResults) {
        console.warn("All JSON parsing strategies failed for Step 2, returning empty results");
        menuResults = { results: [] };
      }
    }

    // Validate and clean the results
    if (!menuResults || !Array.isArray(menuResults.results)) {
      console.warn("Invalid results structure from Step 2, returning empty array");
      menuResults = { results: [] };
    }

    // Clean and validate each result
    menuResults.results = menuResults.results.filter(result => {
      return result && 
             typeof result.label === 'string' && 
             typeof result.url === 'string' && 
             result.url.startsWith('http') &&
             typeof result.type === 'string' &&
             typeof result.source === 'string';
    });

    console.log(`Two-step research completed. Found ${menuResults.results.length} valid menu results`);
    
    return new Response(JSON.stringify({
      step1_general_research: generalInfo,
      step2_targeted_search: targetedText,
      results: menuResults.results,
      debug_info: {
        step1_completed: true,
        step2_completed: true,
        results_found: menuResults.results.length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error in iterative menu research:", error);
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred during iterative menu research",
      debug_info: {
        step1_completed: false,
        step2_completed: false,
        error: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

const handleResearch = async (query: string) => {
  console.log("Starting comprehensive menu research for query:", query);
  const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
  if (!perplexityApiKey) {
    console.error("Missing Perplexity API key.");
    return new Response(JSON.stringify({ error: "Server configuration error: Missing Perplexity API key." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const prompt = `
You are a research assistant specializing in finding restaurant menus and menu information.
- Your task is to find ANY accessible menu content for the given business.
- Search comprehensively in the following order:
  1. Official website menu sections (pages, PDFs, images)
  2. Social media platforms (Instagram, Facebook) with menu posts or images
  3. Food delivery platforms (Grab Food, Foodpanda, UberEats, etc.)
  4. Review sites (TripAdvisor, Google Reviews, Zomato) with menu photos
  5. Food blogs or news articles with menu information
- ACCEPT ALL TYPES of menu sources: PDFs, images, web pages, social media posts, delivery platform listings
- For each menu found, return:
  - label: Short description of what type of menu/source (e.g., "Website Menu Page", "Instagram Menu Post", "Grab Food Menu", "TripAdvisor Menu Photo")
  - url: Direct link to the menu content
  - type: "pdf", "image", "page", or "social_post"
  - source: "website", "instagram", "facebook", "delivery_platform", "review_site", "food_blog"

If you find multiple types of menu information, return ALL of them.
If you cannot find any menu information at all, return an empty array.

Business Query: ${query}

Return ONLY structured JSON in this exact format:
{"results":[{"label":"...","url":"...","type":"pdf|image|page|social_post","source":"website|instagram|facebook|delivery_platform|review_site|food_blog"},...]}
  `.trim();

  console.log("Built comprehensive menu search prompt for Perplexity.");

  try {
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "You are a helpful assistant that finds menu information and returns only correct structured JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text();
      console.error("Perplexity API error:", errText);
      return new Response(JSON.stringify({ error: `Perplexity API error: ${errText}` }), { 
        status: 502, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const perplexityData = await perplexityRes.json();
    console.log("Received response from Perplexity API");

    let text = "";
    try {
      text = perplexityData.choices[0].message.content;
      console.log("Raw AI response:", text);
    } catch (e) {
      console.error("Could not extract message content from Perplexity response:", e);
      console.log("Full response structure:", JSON.stringify(perplexityData, null, 2));
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enhanced JSON parsing with multiple fallback strategies
    let resultsData = null;
    
    // Strategy 1: Try direct JSON parsing
    try {
      resultsData = JSON.parse(text);
      console.log("Successfully parsed JSON directly");
    } catch {
      console.log("Direct JSON parsing failed, trying extraction methods...");
      
      // Strategy 2: Extract JSON from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          resultsData = JSON.parse(codeBlockMatch[1]);
          console.log("Successfully parsed JSON from code block");
        } catch (e) {
          console.error("Failed to parse JSON from code block:", e);
        }
      }
      
      // Strategy 3: Find JSON object in text
      if (!resultsData) {
        const jsonMatch = text.match(/\{[\s\S]*"results"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            resultsData = JSON.parse(jsonMatch[0]);
            console.log("Successfully parsed JSON from pattern match");
          } catch (e) {
            console.error("Failed to parse JSON from pattern match:", e);
          }
        }
      }
      
      // Strategy 4: Last resort - return empty results
      if (!resultsData) {
        console.warn("All JSON parsing strategies failed, returning empty results");
        resultsData = { results: [] };
      }
    }

    // Validate and clean the results
    if (!resultsData || !Array.isArray(resultsData.results)) {
      console.warn("Invalid results structure, returning empty array");
      resultsData = { results: [] };
    }

    // Clean and validate each result
    resultsData.results = resultsData.results.filter(result => {
      return result && 
             typeof result.label === 'string' && 
             typeof result.url === 'string' && 
             result.url.startsWith('http') &&
             typeof result.type === 'string' &&
             typeof result.source === 'string';
    });

    console.log(`Found ${resultsData.results.length} valid menu results:`, resultsData.results);
    
    return new Response(JSON.stringify(resultsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error in menu research:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred during menu research" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

const handleSave = async (req: Request, lead_id: string, result: any) => {
    console.log(`Saving menu for lead ${lead_id}:`, result);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
    });

    try {
      const fileResponse = await fetch(result.url);
      if (!fileResponse.ok) {
        console.error("Failed to download file from source URL:", result.url);
        throw new Error('Failed to download file from source.');
      }
      const fileBlob = await fileResponse.blob();
      const fileExtension = result.type === 'pdf' ? 'pdf' : (result.url.split('.').pop() || 'jpg').split('?')[0];
      const fileName = `${lead_id}_${new Date().getTime()}.${fileExtension}`;
      const filePath = `${lead_id}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
          .from('menus')
          .upload(filePath, fileBlob, { contentType: fileBlob.type });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      console.log("File uploaded to storage:", filePath);

      const { data: user } = await supabaseClient.auth.getUser();
      const { error: insertError } = await supabaseClient
          .from('menu_research_results')
          .insert({
              lead_id,
              label: result.label,
              url: result.url,
              type: result.type,
              source: result.source,
              storage_path: filePath,
              researched_by: user.user?.id
          });
      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }
      console.log("Menu saved to database.");

      return new Response(JSON.stringify({ success: true, path: filePath }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
      console.error("Error in handleSave:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, query, lead_id, result } = body;

    switch (action) {
      case 'research':
        return await handleResearch(query);
      case 'research_iterative':
        return await handleIterativeResearch(query);
      case 'save':
        return await handleSave(req, lead_id, result);
      default:
        // Fallback for old requests that just sent a query
        return await handleResearch(body.query || "");
    }
  } catch (e) {
    console.error("Main function error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
