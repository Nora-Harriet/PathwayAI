import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_autenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (current) => {
      if (!current) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setUser(current);
      setReady(true);
    });
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <AppShell email={user?.email ?? null}>
      <Outlet />
    </AppShell>
  );
}
