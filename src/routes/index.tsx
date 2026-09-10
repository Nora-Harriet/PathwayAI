import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, FileText, GraduationCap, HeartHandshake, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pathway — AI Career Advisor for Final-Year Students" },
      {
        name: "description",
        content:
          "Pathway helps final-year students and recent graduates find fitting career paths, sharpen their CV and draft cover letters with AI.",
      },
      { property: "og:title", content: "Pathway — AI Career Advisor for Final-Year Students" },
      {
        property: "og:description",
        content:
          "AI career matches, CV feedback and cover letters, plus practical tips for entry-level and humanitarian roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Compass,
    title: "Career Advisor",
    body: "Share your skills, studies and interests. Get career paths that fit, with the exact skills to build next.",
  },
  {
    icon: FileText,
    title: "CV & Letters",
    body: "Paste a CV section for specific, encouraging feedback — or draft a motivation letter in one go.",
  },
  {
    icon: GraduationCap,
    title: "Career Tips",
    body: "LinkedIn habits, job-search routines and a short intro to the Big Five personality traits.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">Pathway</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <section className="card-surface mt-4 overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            Built by students, for students
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl leading-tight font-semibold sm:text-5xl">
            Figure out where your degree can actually take you
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Pathway turns your skills, studies and interests into clear career directions — then
            helps you write the CV and letter that get you there.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Get started free</Link>
            </Button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card-surface p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <feature.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </section>

        <section className="card-surface mt-6 grid gap-4 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <HeartHandshake className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Experience you can start building today</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Most entry-level roles still ask for up to a year of experience. Pathway leans on
              humanitarian and NGO volunteering routes as a realistic way to close that gap before
              you graduate.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
