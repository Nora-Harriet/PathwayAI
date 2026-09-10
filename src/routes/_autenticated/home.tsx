import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Compass, FileText, Lightbulb, PenLine, Sparkles } from "lucide-react";

import { getDashboard } from "@/lib/pathway";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_autenticated/home")({
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
];

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const tip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title={data?.profile?.fullName ? `Hello, ${data.profile.fullName}` : "Your progress"}
        description="A quick overview of how far you've got with Pathway, and what's worth doing next."
      />

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold">What you can do here</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump straight into any of the tools below.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
