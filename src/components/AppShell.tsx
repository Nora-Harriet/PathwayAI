import { OfflineBanner } from "@/components/OfflineBanner";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Compass,
  FileText,
  GraduationCap,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  Target,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut as firebaseSignOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/advisor", label: "Career Advisor", icon: Compass },
  { to: "/cv-and-letters", label: "CV & Letters", icon: FileText },
  { to: "/nuri", label: "Nuri", icon: HeartHandshake },
  { to: "/goal-setter", label: "Goal Setter", icon: Target },
  { to: "/career-tips", label: "Career Tips", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ email, children }: { email: string | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut(auth);
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-card text-primary shadow-md font-semibold"
                : "text-sidebar-foreground hover:bg-muted",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link to="/home" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
      <img src="/favicon.png" alt="Pathway logo" className="size-9 shrink-0 object-contain" />
      <span className="min-w-0">
        <span className="block truncate font-display text-lg leading-none font-semibold">
          Pathway
        </span>
        <span className="block truncate text-[11px] tracking-wide text-muted-foreground uppercase">
          AI Career Advisor
        </span>
      </span>
    </Link>
  );

  const dream = (
    <div className="sidebar-dream" aria-hidden="true">
      <p>Dream Bigger<br /><span>Grow Further</span></p>
      <svg className="dream-line" viewBox="0 0 120 14"><path d="M4 10Q60 0 116 6" /></svg>
      <svg className="dream-art" viewBox="0 0 200 130" preserveAspectRatio="xMidYMax slice">
        <path className="star" d="M150 18l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" />
        <path className="star s2" d="M40 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" />
        <path className="star s2" d="M178 50l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" />
        <circle className="dot" cx="100" cy="22" r="1.2" /><circle className="dot" cx="20" cy="55" r="1" />
        <path className="m0" d="M0 130V80l40-25 30 15 40-35 45 30 45-15v80Z" />
        <path className="m1" d="M0 130V95l55-45 25 20 30-40 50 55 40 15v30Z" />
        <path className="m1s" d="M110 30l-12 40 20-10 10 15z" />
        <path className="m2" d="M0 130v-20l45-30 40 25 45-20 70 35v10Z" />
        <path className="road" d="M95 130C70 118 140 108 112 98S92 86 104 78" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        {brand}
        <div className="mt-8 flex-1">{nav}</div>
        {dream}
        <div className="rounded-xl bg-muted p-3">
          <p className="truncate text-xs text-muted-foreground">{email ?? "Signed in"}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        {brand}
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-sidebar px-4 py-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              {brand}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="mt-8 flex-1">{nav}</div>
            <div className="shrink-0">{dream}</div>
            <div className="shrink-0 rounded-xl bg-muted p-3">
              <p className="truncate text-xs text-muted-foreground">{email ?? "Signed in"}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="size-4" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="overflow-x-hidden lg:pl-64">
        <OfflineBanner />
        <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
