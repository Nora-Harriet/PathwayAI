import { createFileRoute } from "@tanstack/react-router";

import {
  ADVISOR_SYSTEM_PROMPT,
  CV_SYSTEM_PROMPT,
  GOAL_SYSTEM_PROMPT,
  LETTER_SYSTEM_PROMPT,
  NEXT_STEP_SYSTEM_PROMPT,
} from "@/lib/prompts";

// Tried in order on Groq; if one is busy, slow or rate-limited, the next is used.
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const TIMEOUT_MS = 20000;

type Kind = "advisor" | "cv" | "letter" | "goal" | "nextStep";

type Body = { kind: Kind; input: Record<string, string> };

function lines(input: Record<string, string>, fields: Array<[string, string]>) {
  return fields
    .map(([key, label]) => [label, String(input[key] ?? "").trim()] as const)
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function buildPrompt(body: Body): { system: string; user: string } {
  const i = body.input;
  if (body.kind === "advisor") {
    return {
      system: ADVISOR_SYSTEM_PROMPT,
      user: `Education: ${i["education"]}\nSkills: ${i["skills"]}\nInterests: ${i["interests"]}`,
    };
  }
  if (body.kind === "goal") {
    return {
      system: GOAL_SYSTEM_PROMPT,
      user: lines(i, [
        ["today", "Today's date"],
        ["title", "Goal"],
        ["careerArea", "Career area"],
        ["situation", "Current situation"],
        ["targetDate", "Target date"],
        ["progressSoFar", "Already done"],
        ["resources", "Skills and resources"],
        ["previousGoal", "Previous SMART goal"],
        ["completedSteps", "Steps already completed"],
      ]),
    };
  }
  if (body.kind === "nextStep") {
    return {
      system: NEXT_STEP_SYSTEM_PROMPT,
      user: lines(i, [
        ["today", "Today's date"],
        ["goal", "SMART goal"],
        ["targetDate", "Target date"],
        ["situation", "Current situation"],
        ["completedSteps", "Completed steps"],
        ["remainingSteps", "Remaining steps"],
      ]),
    };
  }
  if (body.kind === "cv") {
    return { system: CV_SYSTEM_PROMPT, user: String(i["cvText"] ?? "") };
  }
  return {
    system: LETTER_SYSTEM_PROMPT,
    user: `Job title: ${i["jobTitle"]}\nOrganization: ${i["organization"]}\nKey strength or achievement: ${i["strength"]}`,
  };
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GROQ_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "The AI is not configured." }, { status: 500 });
        }

        const body = (await request.json()) as Body;
        if (!body?.kind || !body.input) {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const { system, user } = buildPrompt(body);
        if (user.trim().length < 3 || user.length > 8000) {
          return Response.json({ error: "Please add a bit more detail." }, { status: 400 });
        }

        for (const model of MODELS) {
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
              signal: AbortSignal.timeout(TIMEOUT_MS),
              body: JSON.stringify({
                model,
                reasoning_effort: "low",
                include_reasoning: false,
                temperature: 0.7,
                max_completion_tokens: 2048,
                messages: [
                  { role: "system", content: system },
                  { role: "user", content: user },
                ],
              }),
            });
            if (!res.ok) {
              console.error("Groq error", model, res.status);
              continue;
            }
            const data = (await res.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            const text = data.choices?.[0]?.message?.content?.trim();
            if (text) return Response.json({ text });
          } catch {
            console.error("Groq request failed", model);
          }
        }
        return Response.json(
          { error: "The AI is unavailable right now. Please try again." },
          { status: 502 },
        );
      },
    },
  },
});
