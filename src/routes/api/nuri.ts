import { createFileRoute } from "@tanstack/react-router";

import { NURI_SYSTEM_PROMPT } from "@/lib/nuri";

const MODEL = "openai/gpt-oss-20b";
// Publishable Firebase web key, used only to verify the caller's ID token.
const FIREBASE_WEB_KEY = "AIzaSyA4JHO9O20qmCnD6-XeRvwYZm4G1wnxEns";
const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

async function verifyFirebaseUser(request: Request): Promise<boolean> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { users?: unknown[] };
  return Array.isArray(data.users) && data.users.length > 0;
}

function json(error: string, status: number) {
  return Response.json({ error }, { status });
}

export const Route = createFileRoute("/api/nuri")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GROQ_API_KEY"];
        if (!apiKey) return json("Nuri isn't configured yet.", 500);

        if (!(await verifyFirebaseUser(request))) {
          return json("Please sign in again to chat with Nuri.", 401);
        }

        const body = (await request.json().catch(() => null)) as {
          messages?: ChatMessage[];
        } | null;
        const messages = (body?.messages ?? [])
          .filter(
            (m) =>
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.trim().length > 0,
          )
          .slice(-MAX_MESSAGES)
          .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
        if (messages.length === 0 || messages[messages.length - 1]!.role !== "user") {
          return json("Please type a message first.", 400);
        }

        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          signal: request.signal,
          body: JSON.stringify({
            model: MODEL,
            stream: true,
            reasoning_effort: "low",
            include_reasoning: false,
            temperature: 0.7,
            max_completion_tokens: 1024,
            messages: [{ role: "system", content: NURI_SYSTEM_PROMPT }, ...messages],
          }),
        }).catch(() => null);

        if (!upstream)
          return json("Couldn't reach Nuri. Check your connection and try again.", 502);
        if (upstream.status === 429) {
          return json(
            "Nuri is getting a lot of messages right now. Please wait a moment and try again.",
            429,
          );
        }
        if (!upstream.ok || !upstream.body) {
          console.error("Groq error", upstream.status);
          return json("Nuri is unavailable right now. Please try again shortly.", 502);
        }

        // Convert Groq's SSE into a plain text stream of content deltas.
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            // Keep reading until at least one delta is enqueued; returning from
            // pull without enqueuing would stall the stream.
            for (;;) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                return;
              }
              let sent = false;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(payload) as {
                    choices?: Array<{ delta?: { content?: string } }>;
                  };
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                    sent = true;
                  }
                } catch {
                  // ignore malformed keep-alive chunks
                }
              }
              if (sent) return;
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
