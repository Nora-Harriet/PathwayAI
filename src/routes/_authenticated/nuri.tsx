import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createNuriThread,
  deleteNuriThread,
  nuriOwner,
  watchNuriThreads,
  type NuriThread,
} from "@/lib/nuri-storage";

export const Route = createFileRoute("/_authenticated/nuri")({ component: NuriLayout });
function NuriLayout() {
  const [threads, setThreads] = useState<NuriThread[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(
    () =>
      watchNuriThreads(nuriOwner(), setThreads, () =>
        setError("Your saved chats couldn’t load. Please reload to try again."),
      ),
    [],
  );
  async function newChat() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const threadId = await createNuriThread();
      await navigate({ to: "/nuri/$threadId", params: { threadId } });
    } catch {
      setError("Your new chat couldn’t be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (busy || !window.confirm("Delete this conversation and all its messages?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteNuriThread(id);
      await navigate({ to: "/nuri" });
    } catch {
      setError("This conversation couldn’t be deleted. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="nuri-workspace">
      <div className="nuri-history-bar">
        <details className="nuri-history">
          <summary>
            <History className="size-4" /> Saved chats
          </summary>
          <nav aria-label="Saved Nuri conversations">
            {threads.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No saved conversations yet.</p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className="flex min-w-0 items-center gap-2 border-b border-border p-2"
                >
                  <Link
                    to="/nuri/$threadId"
                    params={{ threadId: thread.id }}
                    activeProps={{ className: "font-semibold text-primary" }}
                    className="min-w-0 flex-1 break-words text-sm"
                    onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
                  >
                    {thread.title}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${thread.title}`}
                    disabled={busy}
                    onClick={() => void remove(thread.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </nav>
        </details>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => void newChat()}>
          <Plus className="size-4" /> New chat
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Outlet />
    </div>
  );
}
