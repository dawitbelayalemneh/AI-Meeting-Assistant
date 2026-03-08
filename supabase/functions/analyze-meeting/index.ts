import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { meetingId, notes, title, agenda } = await req.json();
    if (!meetingId || !notes) {
      return new Response(JSON.stringify({ error: "Missing meetingId or notes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const agendaContext = Array.isArray(agenda) && agenda.length > 0
      ? `\n\nAgenda:\n${agenda.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}`
      : "";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a professional meeting assistant. Analyze meeting notes thoroughly and extract a comprehensive summary, key discussion points, decisions made, and actionable items with owners where possible.",
          },
          {
            role: "user",
            content: `Meeting: "${title}"${agendaContext}\n\nNotes:\n${notes}\n\nAnalyze these notes and extract the summary, key points, decisions, and action items.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_meeting",
              description: "Return comprehensive meeting analysis",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A concise 2-4 sentence executive summary of the meeting",
                  },
                  key_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key discussion points and topics covered in the meeting",
                  },
                  decisions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important decisions that were made during the meeting",
                  },
                  action_items: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable tasks with responsible person if mentioned",
                  },
                },
                required: ["summary", "key_points", "decisions", "action_items"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_meeting" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysis = { summary: "", key_points: [] as string[], decisions: [] as string[], action_items: [] as string[] };

    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await adminClient
      .from("meetings")
      .update({
        ai_summary: analysis.summary,
        ai_key_points: analysis.key_points,
        ai_decisions: analysis.decisions,
        ai_action_items: analysis.action_items,
      })
      .eq("id", meetingId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, ...analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meeting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
