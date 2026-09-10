import { createFileRoute } from "@tanstack/react-router";

import {
  ADVISOR_SYSTEM_PROMPT,
  CV_SYSTEM_PROMPT,
  GOAL_SYSTEM_PROMPT,
  LETTER_SYSTEM_PROMPT,
  NEXT_STEP_SYSTEM_PROMPT,
} from "@/lib/prompts";

const MODEL = "gemini-3.6-flash";

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
        const apiKey = process.env["GEMINI_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Gemini API key is not configured." }, { status: 500 });
        }

        const body = (await request.json()) as Body;
        if (!body?.kind || !body.input) {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const { system, user } = buildPrompt(body);
        if (user.trim().length < 3 || user.length > 8000) {
          return Response.json({ error: "Please add a bit more detail." }, { status: 400 });
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: "user", parts: [{ text: user }] }],
            }),
          },
        );

        if (!res.ok) {
          const detail = await res.text();
          console.error("Gemini error", res.status, detail);
          return Response.json(
            { error: "The AI is unavailable right now. Please try again." },
            { status: 502 },
          );
        }

        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim();
        if (!text) {
          return Response.json({ error: "The AI returned an empty response." }, { status: 502 });
        }
        return Response.json({ text });
      },
    },
  },
});
