import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type Smart = {
  goal: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
};

export type Step = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  resources: string;
  done: boolean;
};

export type GoalInput = {
  title: string;
  careerArea: string;
  situation: string;
  targetDate: string;
  progressSoFar: string;
  resources: string;
};

export type Goal = GoalInput & {
  id: string;
  smart: Smart;
  steps: Step[];
  createdAt: Date;
  completedAt: Date | null;
};

function uid(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("You need to be signed in.");
  return user.uid;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

async function askAI(kind: "goal" | "nextStep", input: Record<string, string>) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, input }),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || !data.text) throw new Error(data.error ?? "Something went wrong.");
  return data.text;
}

function parseJson(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const raw = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned) as
    | Record<string, unknown>
    | null;
  if (!raw || typeof raw !== "object") {
    throw new Error("The AI response could not be read. Please try again.");
  }
  return raw;
}

/** Keep only sane, real dates; anything odd becomes an empty string. */
function safeDate(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const parsed = new Date(`${text}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  if (year < 2020 || year > 2100) return "";
  return text;
}

function str(value: unknown, fallback = ""): string {
  const text = String(value ?? "").trim();
  return text.length ? text.slice(0, 600) : fallback;
}

function parsePlan(text: string, keepDone: Step[] = []): { smart: Smart; steps: Step[] } {
  const raw = parseJson(text);
  const smartRaw = (raw["smart"] ?? {}) as Record<string, unknown>;
  const smart: Smart = {
    goal: str(smartRaw["goal"]),
    specific: str(smartRaw["specific"]),
    measurable: str(smartRaw["measurable"]),
    achievable: str(smartRaw["achievable"]),
    relevant: str(smartRaw["relevant"]),
    timeBound: str(smartRaw["timeBound"]),
  };
  if (!smart.goal) throw new Error("The AI response could not be read. Please try again.");

  const stepsRaw = Array.isArray(raw["steps"]) ? (raw["steps"] as unknown[]) : [];
  const steps: Step[] = stepsRaw.slice(0, 7).map((item, index) => {
    const s = (item ?? {}) as Record<string, unknown>;
    const title = str(s["title"], `Step ${index + 1}`);
    const previous = keepDone.find(
      (kept) => kept.title.toLowerCase() === title.toLowerCase() && kept.done,
    );
    return {
      id: `${index + 1}`,
      title,
      description: str(s["description"]),
      deadline: safeDate(s["deadline"]),
      resources: str(s["resources"]),
      done: Boolean(previous),
    };
  });
  if (steps.length < 1) throw new Error("The AI response could not be read. Please try again.");
  return { smart, steps };
}

function planPrompt(input: GoalInput) {
  return {
    today: new Date().toISOString().slice(0, 10),
    title: input.title,
    careerArea: input.careerArea,
    situation: input.situation,
    targetDate: input.targetDate,
    progressSoFar: input.progressSoFar,
    resources: input.resources,
  };
}

export async function listGoals(): Promise<Goal[]> {
  const snap = await getDocs(
    query(collection(db, "users", uid(), "goals"), orderBy("createdAt", "desc"), limit(20)),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const completedAt = data["completedAt"];
    return {
      id: d.id,
      title: String(data["title"] ?? ""),
      careerArea: String(data["careerArea"] ?? ""),
      situation: String(data["situation"] ?? ""),
      targetDate: String(data["targetDate"] ?? ""),
      progressSoFar: String(data["progressSoFar"] ?? ""),
      resources: String(data["resources"] ?? ""),
      smart: (data["smart"] as Smart) ?? {
        goal: "",
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        timeBound: "",
      },
      steps: Array.isArray(data["steps"]) ? (data["steps"] as Step[]) : [],
      createdAt: toDate(data["createdAt"]),
      completedAt: completedAt instanceof Timestamp ? completedAt.toDate() : null,
    };
  });
}

export async function createGoal(input: GoalInput): Promise<void> {
  const { smart, steps } = parsePlan(await askAI("goal", planPrompt(input)));
  await addDoc(collection(db, "users", uid(), "goals"), {
    ...input,
    smart,
    steps,
    completedAt: null,
    createdAt: serverTimestamp(),
  });
}

export async function adjustGoal(goal: Goal, input: GoalInput): Promise<void> {
  const { smart, steps } = parsePlan(
    await askAI("goal", {
      ...planPrompt(input),
      previousGoal: goal.smart.goal,
      completedSteps: goal.steps
        .filter((s) => s.done)
        .map((s) => s.title)
        .join("; "),
    }),
    goal.steps,
  );
  await updateDoc(doc(db, "users", uid(), "goals", goal.id), {
    ...input,
    smart,
    steps,
    completedAt: steps.every((s) => s.done) ? serverTimestamp() : null,
  });
}

export async function saveSteps(goal: Goal, steps: Step[]): Promise<void> {
  const allDone = steps.length > 0 && steps.every((s) => s.done);
  await updateDoc(doc(db, "users", uid(), "goals", goal.id), {
    steps,
    completedAt: allDone ? (goal.completedAt ? Timestamp.fromDate(goal.completedAt) : serverTimestamp()) : null,
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid(), "goals", goalId));
}

export async function askNextStep(goal: Goal): Promise<string> {
  const text = await askAI("nextStep", {
    today: new Date().toISOString().slice(0, 10),
    goal: goal.smart.goal || goal.title,
    targetDate: goal.targetDate,
    situation: goal.situation,
    completedSteps: goal.steps
      .filter((s) => s.done)
      .map((s) => s.title)
      .join("; "),
    remainingSteps: goal.steps
      .filter((s) => !s.done)
      .map((s) => `${s.title} (by ${s.deadline || "no date"})`)
      .join("; "),
  });
  return text.trim();
}
