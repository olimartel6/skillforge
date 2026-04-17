// Supabase Edge Function: chat-ai-coach
// Claude Haiku-powered coach that analyzes missed questions and chats with the user.
// Rate-limiting (1/week for free users) is enforced client-side via AsyncStorage.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = "claude-haiku-4-5-20251001";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MissedQ {
  skillName: string;
  moduleName: string;
  prompt: string;
  correctAnswer: string;
  explanation?: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Body {
  messages: Msg[];
  missed: MissedQ[];
  skillName?: string;
  xp?: number;
  streak?: number;
  level?: number;
}

function buildSystemPrompt(b: Body): string {
  const missedSummary = (b.missed ?? [])
    .slice(0, 25)
    .map(
      (m, i) =>
        `${i + 1}. [${m.skillName} > ${m.moduleName}] Q: "${m.prompt}" — Correct: "${m.correctAnswer}"${
          m.explanation ? ` — Why: ${m.explanation}` : ""
        }`,
    )
    .join("\n");

  return `You are Skilly Coach, a sharp, friendly AI tutor inside the Skilly learning app.
Your job: analyze what the user struggles with (from their missed questions), give a tight diagnosis of weak spots, and build a personalized improvement plan.

Tone: motivating, concrete, zero fluff. Short paragraphs. Use bullet lists and emojis sparingly (max 2-3 per response).

User stats:
- Current skill: ${b.skillName ?? "unknown"}
- Level: ${b.level ?? 1}
- XP: ${b.xp ?? 0}
- Streak: ${b.streak ?? 0} days

Missed questions (${b.missed?.length ?? 0} total):
${missedSummary || "None yet — the user has not missed any questions."}

Guidelines:
- On the first message, start with a 2-sentence diagnosis of weak spots + a 3-step plan.
- If no missed questions, ask the user what they want to improve.
- Never invent facts about the user's progress beyond what is in the stats.
- Keep responses under 200 words unless asked to go deeper.
- When suggesting lessons, reference the module names from the missed questions list above.
- Respond in the same language as the user's last message (English, French, or Spanish).`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "missing ANTHROPIC_API_KEY" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const system = buildSystemPrompt(body);
  const messages = body.messages.slice(-12).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system,
        messages,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: "claude_error", details: text }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply =
      Array.isArray(data?.content) && data.content[0]?.type === "text"
        ? data.content[0].text
        : "";

    return new Response(JSON.stringify({ reply, model: MODEL }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "fetch_failed", details: String(e) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
