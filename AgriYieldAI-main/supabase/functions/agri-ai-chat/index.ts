import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are AgriYield AI Assistant — an expert agricultural advisor specializing in Indian farming, crop science, and agronomy.

You help farmers, agronomists, and researchers with:
- Crop selection based on soil and climate conditions
- Fertilizer recommendations (N, P, K, micronutrients)
- Pest and disease identification and management
- Irrigation and water management
- Crop rotation strategies
- Yield optimization techniques
- Indian agricultural schemes and MSP prices
- Seasonal planting calendars (Kharif, Rabi, Zaid)
- Soil health improvement
- Organic farming practices

Context about this platform:
- AgriYield AI uses an XGBoost model (R² 84.38%) trained on 31,037 rows of FAOSTAT + Crop Recommendation data for India
- Supports 15 crops: banana, chickpea, coconut, coffee, cotton, jute, lentil, maize, mango, moth beans, muskmelon, orange, papaya, pigeon peas, watermelon
- Input features: N, P, K (kg/ha), temperature (°C), humidity (%), soil pH, rainfall (mm)

Guidelines:
- Always respond in the language the user writes in (English or Hindi)
- Be practical and specific with recommendations
- Include quantities, doses, and timings when giving advice
- Mention both organic and chemical options where applicable
- Reference Indian government schemes (PM-KISAN, Soil Health Card, etc.) when relevant
- Keep responses concise but complete — use bullet points for lists
- If asked about a specific crop, provide tailored advice for Indian conditions`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ONSPACE_AI_API_KEY");
    const baseUrl = Deno.env.get("ONSPACE_AI_BASE_URL");

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      return new Response(
        JSON.stringify({ error: `AI API error: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
