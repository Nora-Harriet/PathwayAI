import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Compass,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut as firebaseSignOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/advisor", label: "Career Advisor", icon: Compass },
  { to: "/goal-setter", label: "Goal Setter", icon: Target },
  { to: "/cv-and-letters", label: "CV & Letters", icon: FileText },
  { to: "/career-tips", label: "Career Tips", icon: GraduationCap },
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
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        {brand}
        <div className="mt-8 flex-1">{nav}</div>
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
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar px-4 py-6">
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
            <div className="rounded-xl bg-muted p-3">
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
        <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
