import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Compass, FileText, Lightbulb, PenLine, Sparkles, Target } from "lucide-react";

import { getDashboard } from "@/lib/pathway";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Your progress — Pathway" },
      {
        name: "description",
        content:
          "Track your Pathway progress: profile, career matches, CV feedback and cover letters, all saved to your account.",
      },
      { property: "og:title", content: "Your progress — Pathway" },
      {
        property: "og:description",
        content: "A simple dashboard of everything you've built in Pathway so far.",
      },
    ],
  }),
  component: HomePage,
});

const HERO_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Crect width='1200' height='400' fill='%23E8DDF5'/%3E%3Ccircle cx='900' cy='120' r='80' fill='%23F3ECFA' opacity='0.6'/%3E%3Crect x='200' y='220' width='300' height='120' rx='20' fill='%23F3ECFA' opacity='0.5'/%3E%3Cpath d='M580 160 L600 120 L620 160 L660 180 L620 200 L600 240 L580 200 L540 180 Z' fill='white' opacity='0.8'/%3E%3Ctext x='600' y='360' font-family='sans-serif' font-size='20' fill='%239C7BB8' text-anchor='middle'%3EHero image placeholder%3C/text%3E%3C/svg%3E";

const TIPS = [
  "Numbers beat adjectives. 'Trained 25 volunteers' says more than 'excellent trainer'.",
  "Volunteering with an NGO counts as real experience — list it like any other role.",
  "Send a short thank-you note within 24 hours of an interview.",
  "Keep a brag list: every win, number and compliment goes in it as it happens.",
  "Rewrite your CV summary for each role using words from the advert itself.",
  "One thoughtful LinkedIn comment a week beats a hundred cold applications.",
];

const ACTIONS = [
  {
    label: "Build your profile",
    description: "Save your education, skills and interests once and reuse them everywhere.",
    to: "/advisor" as const,
    icon: PenLine,
  },
  {
    label: "Get a career match",
    description: "AI-matched career paths with the skills to build for each one.",
    to: "/advisor" as const,
    icon: Compass,
  },
  {
    label: "Review your CV",
    description: "Upload or paste your CV and get specific, honest feedback.",
    to: "/cv-and-letters" as const,
    icon: FileText,
  },
  {
    label: "Draft a cover letter",
    description: "A first draft for any role, ready to personalise and download.",
    to: "/cv-and-letters" as const,
    icon: Sparkles,
  },
  {
    label: "Set a goal",
    description: "Set a target and track your progress.",
    to: "/goal-setter" as const,
    icon: Target,
  },
];

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const tip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-[#F3ECFA]">
        <div className="relative">
          <img
            src={HERO_PLACEHOLDER}
            alt="Hero placeholder"
            className="h-48 w-full object-cover sm:h-64 lg:h-80"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#F3ECFA]" />
        </div>
      </section>

      <div className="mt-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">Home</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          {data?.profile?.fullName ? `Hello, ${data.profile.fullName}` : "Your progress"}
        </h1>
        <p className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          Your next step, mapped
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One place to find your fit, sharpen your CV, and take the next step with confidence.
        </p>
      </div>

      <section className="card-surface mt-6 p-6">
        <h2 className="text-lg font-semibold">What you can do here</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump straight into any of the tools below.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-accent/60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <action.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{action.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="card-surface p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : (data?.matches.length ?? 0) +
              (data?.reviews.length ?? 0) +
              (data?.letters.length ?? 0) ===
            0 ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                Nothing saved yet. Start with a career match — it takes about a minute.
              </p>
              <Button asChild className="mt-4">
                <Link to="/advisor">Get my career match</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...(data?.matches ?? []), ...(data?.reviews ?? []), ...(data?.letters ?? [])]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((item) => (
                  <li key={item.id} className="rounded-xl border border-border bg-muted/40 p-4">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.createdAt.toLocaleDateString()}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="card-surface p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Lightbulb className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Tip of the day</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tip}</p>
        </section>
      </div>
    </>
  );
}
