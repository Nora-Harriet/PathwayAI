import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type CareerResult = {
  summary: string;
  careers: Array<{
    title: string;
    fit: string;
    skillsToBuild: string[];
    firstStep: string;
  }>;
};

export type Profile = {
  fullName?: string;
  education?: string;
  skills?: string;
  interests?: string;
};

export type Activity = {
  id: string;
  createdAt: Date;
  label: string;
  data: Record<string, unknown>;
};

export type Dashboard = {
  profile: Profile | null;
  matches: Activity[];
  reviews: Activity[];
  letters: Activity[];
  latestMatch: CareerResult | null;
  latestFeedback: string | null;
  latestLetter: string | null;
};

function uid(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("You need to be signed in.");
  return user.uid;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

async function recent(name: string, label: (d: Record<string, unknown>) => string) {
  const snap = await getDocs(
    query(
      collection(db, "users", uid(), name),
      orderBy("createdAt", "desc"),
      limit(5),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, createdAt: toDate(data["createdAt"]), label: label(data), data };
  });
}

export async function getDashboard(): Promise<Dashboard> {
  const profileSnap = await getDoc(doc(db, "users", uid()));
  const [matches, reviews, letters] = await Promise.all([
    recent("matches", () => "Career match generated"),
    recent("reviews", () => "CV feedback received"),
    recent(
      "letters",
      (d) => `Letter for ${String(d["jobTitle"] ?? "a role")} at ${String(d["organization"] ?? "")}`,
    ),
  ]);

  return {
    profile: (profileSnap.data() as Profile | undefined) ?? null,
    matches,
    reviews,
    letters,
    latestMatch: (matches[0]?.data["result"] as CareerResult | undefined) ?? null,
    latestFeedback: (reviews[0]?.data["feedback"] as string | undefined) ?? null,
    latestLetter: (letters[0]?.data["letter"] as string | undefined) ?? null,
  };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await setDoc(doc(db, "users", uid()), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

async function askAI(kind: "advisor" | "cv" | "letter", input: Record<string, string>) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, input }),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || !data.text) throw new Error(data.error ?? "Something went wrong.");
  return data.text;
}

function parseCareerResult(text: string): CareerResult {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const raw = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned) as
    | Partial<CareerResult>
    | null;
  if (!raw || !Array.isArray(raw.careers)) {
    throw new Error("The AI response could not be read. Please try again.");
  }
  return {
    summary: typeof raw.summary === "string" ? raw.summary : "",
    careers: raw.careers.slice(0, 5).map((career) => ({
      title: String(career?.title ?? "Career path"),
      fit: String(career?.fit ?? ""),
      skillsToBuild: Array.isArray(career?.skillsToBuild)
        ? career.skillsToBuild.map(String).slice(0, 8)
        : [],
      firstStep: String(career?.firstStep ?? ""),
    })),
  };
}

export async function generateCareerMatch(input: {
  education: string;
  skills: string;
  interests: string;
}): Promise<CareerResult> {
  const result = parseCareerResult(await askAI("advisor", input));
  await addDoc(collection(db, "users", uid(), "matches"), {
    ...input,
    result,
    createdAt: serverTimestamp(),
  });
  return result;
}

export async function reviewCv(cvText: string): Promise<string> {
  const feedback = await askAI("cv", { cvText });
  await addDoc(collection(db, "users", uid(), "reviews"), {
    cvText,
    feedback,
    createdAt: serverTimestamp(),
  });
  return feedback;
}

export async function draftLetter(input: {
  jobTitle: string;
  organization: string;
  strength: string;
}): Promise<string> {
  const letter = await askAI("letter", input);
  await addDoc(collection(db, "users", uid(), "letters"), {
    ...input,
    letter,
    createdAt: serverTimestamp(),
  });
  return letter;
}
