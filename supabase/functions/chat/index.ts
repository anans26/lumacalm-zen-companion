import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for empathetic mental health support
    const systemPrompt = `You are a compassionate mental health support chatbot for Lumacalm AI. Your role is to:

1. Listen empathetically and validate feelings
2. Provide emotional support and coping strategies
3. Never provide medical diagnoses or prescribe treatments
4. Encourage professional help when appropriate
5. Use warm, caring language while maintaining professionalism

Important reminders:
- You are NOT a replacement for professional therapy
- In crisis situations, encourage immediate professional help
- Always be respectful, non-judgmental, and supportive
- Keep responses concise but meaningful (2-3 sentences typically)

If you detect severe distress, suicidal thoughts, or crisis keywords (suicide, kill myself, end it all, etc.), acknowledge their pain and strongly encourage professional help.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm here to listen. Can you tell me more?";
    
    // Check for crisis keywords in the user's message
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const crisisKeywords = [
      "suicide", "kill myself", "end it all", "want to die", "better off dead",
      "hurt myself", "self harm", "no reason to live"
    ];
    
    const isCrisis = crisisKeywords.some(keyword => lastUserMessage.includes(keyword));

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        isCrisis 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
