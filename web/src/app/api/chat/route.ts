export const dynamic = "force-dynamic";

type ChatRole = "system" | "user" | "assistant";

type ChatRequestBody = {
  input?: string;
  messages?: { role: ChatRole; content: string }[];
};

type OpenAIChatMessage = {
  role: ChatRole;
  content: string;
};

const DEFAULT_SYSTEM_PROMPT = `
You are ProFit AI, a certified personal trainer and nutrition coach.
Offer practical, evidence-based advice about workouts, nutrition, recovery,
and habit building. Tailor suggestions to the user's context, ask clarifying
questions when needed, and keep answers concise but actionable. Avoid medical
diagnoses and recommend consulting health professionals when appropriate.
`.trim();

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_API_URL =
  process.env.OPENAI_API_URL?.replace(/\/$/, "") ||
  "https://api.openai.com/v1/chat/completions";

const buildMessageHistory = (
  messages: ChatRequestBody["messages"],
  fallbackUserInput: string
): OpenAIChatMessage[] => {
  const history: OpenAIChatMessage[] = [];

  const hasSystem = messages?.some((msg) => msg.role === "system");
  if (!hasSystem) {
    history.push({ role: "system", content: DEFAULT_SYSTEM_PROMPT });
  }

  if (messages?.length) {
    messages.forEach((message) => {
      if (
        message?.content &&
        ["system", "user", "assistant"].includes(message.role)
      ) {
        history.push({
          role: message.role,
          content: message.content,
        });
      }
    });
  } else if (fallbackUserInput) {
    history.push({ role: "user", content: fallbackUserInput });
  }

  if (history.length === 1 && history[0].role === "system") {
    history.push({ role: "user", content: fallbackUserInput });
  }

  return history;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { input, messages } = body || {};

    const lastUserMessage =
      messages?.findLast((m) => m.role === "user")?.content || input || "";

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY environment variable.");
      return new Response(
        JSON.stringify({
          error:
            "AI service is not configured. Please set OPENAI_API_KEY on the server.",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const conversation = buildMessageHistory(messages, lastUserMessage);

    const openAiResponse = await fetch(`${OPENAI_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        messages: conversation,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!openAiResponse.ok) {
      const errorPayload = await openAiResponse
        .json()
        .catch(() => ({ error: openAiResponse.statusText }));
      console.error("OpenAI API error:", errorPayload);
      return new Response(
        JSON.stringify({
          error: "Failed to generate AI response.",
          details: errorPayload?.error || `HTTP ${openAiResponse.status}`,
        }),
        {
          status: 502,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const openAiData = await openAiResponse.json();
    const content =
      openAiData?.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response right now. Please try again.";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: String(error?.message || error),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
