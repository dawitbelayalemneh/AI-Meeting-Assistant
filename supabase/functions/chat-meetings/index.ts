import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: corsHeaders });
    }

    // Fetch user's meetings for context
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select("title, date, status, description, notes, ai_summary, ai_key_points, ai_decisions, ai_action_items, participants, agenda, duration_minutes")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50);

    if (meetingsError) {
      console.error("Failed to fetch meetings:", meetingsError);
      return new Response(JSON.stringify({ error: "Failed to fetch meeting data" }), { status: 500, headers: corsHeaders });
    }

    // Build context from meetings
    const meetingContext = (meetings || []).map((m: any) => {
      const parts = [`## ${m.title} (${m.status}) — ${m.date}`];
      if (m.description) parts.push(`Description: ${m.description}`);
      if (m.duration_minutes) parts.push(`Duration: ${m.duration_minutes} min`);
      if (m.participants?.length) parts.push(`Participants: ${JSON.stringify(m.participants)}`);
      if (m.agenda?.length) parts.push(`Agenda: ${JSON.stringify(m.agenda)}`);
      if (m.notes) parts.push(`Notes: ${m.notes}`);
      if (m.ai_summary) parts.push(`AI Summary: ${m.ai_summary}`);
      if (m.ai_key_points?.length) parts.push(`Key Points: ${JSON.stringify(m.ai_key_points)}`);
      if (m.ai_decisions?.length) parts.push(`Decisions: ${JSON.stringify(m.ai_decisions)}`);
      if (m.ai_action_items?.length) parts.push(`Action Items: ${JSON.stringify(m.ai_action_items)}`);
      return parts.join("\n");
    }).join("\n\n---\n\n");

    const systemPrompt = `You are a concise, actionable AI assistant for a meeting management app. You have access to the user's meeting data below. Answer questions about past meetings, action items, decisions, and summaries. Be direct and specific — cite meeting titles and dates when relevant. If the user asks about something not in the data, say so.

# User's Meeting Data
${meetingContext || "No meetings found."}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: corsHeaders });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-meetings error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
