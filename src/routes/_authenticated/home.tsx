import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  FileText,
  Lightbulb,
  MessageCircleMore,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

import { HeroCarousel } from "@/components/home/HeroCarousel";

import { getDashboard } from "@/lib/pathway";

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

const TIPS = [
  "Numbers beat adjectives. 'Trained 25 volunteers' says more than 'excellent trainer'.",
  "Volunteering with an NGO counts as real experience — list it like any other role.",
  "Send a short thank-you note within 24 hours of an interview.",
  "Keep a brag list: every win, number and compliment goes in it as it happens.",
  "Rewrite your CV summary for each role using words from the advert itself.",
  "One thoughtful LinkedIn comment a week beats a hundred cold applications.",
];

type Tone = "sky" | "lavender" | "mint" | "violet" | "pink" | "peach";

const ACTIONS: {
  label: string;
  description: string;
  to: "/profile" | "/advisor" | "/cv-and-letters" | "/nuri" | "/career-tips" | "/goal-setter";
  icon: typeof Compass;
  tone: Tone;
  badge?: boolean;
}[] = [
  { label: "Build Your Profile", description: "Show who you are and what you offer.", to: "/profile", icon: User, tone: "sky" },
  { label: "Career Advisor", description: "Discover career paths that fit you.", to: "/advisor", icon: Compass, tone: "lavender" },
  { label: "CV & Letters", description: "Build stronger applications.", to: "/cv-and-letters", icon: FileText, tone: "mint" },
  { label: "Nuri", description: "Chat, reflect and get guidance.", to: "/nuri", icon: MessageCircleMore, tone: "violet", badge: true },
  { label: "Career Tips", description: "Learn, prepare and grow.", to: "/career-tips", icon: Lightbulb, tone: "pink" },
  { label: "Goal Setter", description: "Turn ambitions into action.", to: "/goal-setter", icon: Target, tone: "peach" },
];

function ActionCard({ action, wide = false }: { action: (typeof ACTIONS)[number]; wide?: boolean }) {
  return (
    <Link to={action.to} className={`home-card home-card-${action.tone} ${wide ? "items-center" : ""}`}>
      <span className="home-card-spark" aria-hidden="true" />
      <span className="home-card-icon">
        <action.icon className="size-7 sm:size-8" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1 pr-8">
        <span className="flex items-center gap-1.5 text-lg font-bold">
          {action.label}
          {action.badge && <BadgeCheck className="home-card-badge size-5" />}
        </span>
        <span className="mt-1 block text-sm opacity-80">{action.description}</span>
      </span>
      <span className="home-card-arrow" aria-hidden="true">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const tip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);
  const recentItems = [...(data?.matches ?? []), ...(data?.reviews ?? []), ...(data?.letters ?? [])]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  return (
    <div className="relative left-1/2 -my-6 min-h-[calc(100vh-64px)] w-screen -translate-x-1/2 overflow-hidden bg-[#F3ECFA] lg:-my-10 lg:min-h-screen lg:w-[calc(100vw-16rem)]">
      {/* Full content-area background image */}
      <img
        src="/hero-home.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Soft readability overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#F3ECFA]/25" />

      {/* Side fades */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24"
        style={{
          background:
            "linear-gradient(to right, #F3ECFA 0%, rgba(243,236,250,0.45) 35%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{
          background:
            "linear-gradient(to left, #F3ECFA 0%, rgba(243,236,250,0.45) 35%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative px-4 py-6 pb-10 sm:px-6 lg:py-10">
        <HeroCarousel />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            {data?.profile?.fullName ? `Welcome back, ${data.profile.fullName}!` : "Welcome to Pathway!"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let's take the next step in your career journey.
          </p>
        </div>

        <section className="mt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.slice(0, 4).map((action) => (
              <ActionCard key={action.label} action={action} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard action={ACTIONS[4]!} />
            <ActionCard action={ACTIONS[5]!} />
          <div className="home-card home-card-lavender sm:col-span-2 lg:col-span-1">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Recent activity</span>
              {isLoading ? (
                <span className="mt-1 block text-xs opacity-80">Loading…</span>
              ) : recentItems.length === 0 ? (
                <span className="mt-1 block text-xs opacity-80">Nothing saved yet. Start with the Career Advisor.</span>
              ) : (
                recentItems.map((item) => (
                  <span key={item.id} className="mt-1 block truncate text-xs opacity-80">
                    {item.label} · {item.createdAt.toLocaleDateString()}
                  </span>
                ))
              )}
            </span>
          </div>
          </div>
        </section>

        <section className="home-tip mt-4">
          <TrendingUp className="size-10 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
          <div className="relative z-10 min-w-0 max-w-xl">
            <h2 className="text-lg font-bold">Tip of the Day</h2>
            <p className="mt-1 text-sm opacity-80">{tip}</p>
          </div>
          <svg className="home-tip-skyline" viewBox="0 0 400 100" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
            <path d="M0 100 Q20 80 40 92 Q60 70 80 90 L100 100Z M110 100V60h30v40Z M150 100V45h40v55Z M200 100V30h12l18-18 18 18h12v70Z M270 100V55h35v45Z M315 100V40h45v60Z M370 100 Q385 70 400 85V100Z" />
          </svg>
        </section>
      </div>
    </div>
  );
}
