import { useOnlineStatus } from "@/hooks/use-online-status";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Info,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sprout,
  Square,
  Target,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import { NURI_ACTIONS, parseNuriReply } from "@/lib/nuri";
import mascot from "@/assets/nuri-heart.png";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  nuriOwner,
  saveNuriMessage,
  watchNuriMessages,
  type NuriMessage,
} from "@/lib/nuri-storage";
type Msg = NuriMessage;
const WELCOME = "Hi there! 👋 I’m Nuri — your Pathway companion. How can I help you today?";
const STARTERS = [
  { text: "I’m feeling stressed", icon: Sprout },
  { text: "Help me with my goals", icon: Target },
  { text: "Career advice", icon: BriefcaseBusiness },
  { text: "Help with my CV", icon: FileText },
  { text: "Just want to talk", icon: MessageCircle },
];

export function NuriChat({ threadId }: { threadId: string }) {
  const online = useOnlineStatus();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState("");
  const pendingSave = useRef<(() => Promise<void>) | null>(null);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const stop = watchNuriMessages(
      nuriOwner(),
      threadId,
      (saved) => {
        if (!busyRef.current && !pendingSave.current) setMessages(saved);
        setReady(true);
      },
      () => {
        setError("This conversation couldn’t load. Please reload to try again.");
      },
    );
    return () => {
      mounted.current = false;
      stop();
      abortRef.current?.abort();
    };
  }, [threadId]);
  useEffect(() => {
    if (ready && !streaming) inputRef.current?.focus({ preventScroll: true });
  }, [ready, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(history: Msg[]) {
    if (busyRef.current || !ready || pendingSave.current) return;
    busyRef.current = true;
    const owner = nuriOwner();
    const assistantId = crypto.randomUUID();
    setError(null);
    setStreaming(true);
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    const controller = new AbortController();
    abortRef.current = controller;
    let got = "";
    let interrupted = false;
    try {
      const userMessage = history.at(-1);
      if (!userMessage) return;
      const persistUser = () =>
        saveNuriMessage(
          owner,
          threadId,
          userMessage,
          history.length - 1,
          history.length === 1 ? userMessage.content : undefined,
        );
      try {
        await persistUser();
      } catch {
        pendingSave.current = persistUser;
        throw new Error("Your message couldn’t be saved. Retry saving before continuing.");
      }
      if (controller.signal.aborted) return;
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/nuri", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Nuri is unavailable right now. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += decoder.decode(value, { stream: true });
        const current = got;
        setMessages((prev) => {
          const next = prev.slice();
          next[next.length - 1] = { id: assistantId, role: "assistant", content: current };
          return next;
        });
      }
      if (!got.trim()) throw new Error("Nuri didn't reply that time. Please try again.");
    } catch (err) {
      interrupted = true;
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (!got.trim()) setMessages(history);
      if (!aborted) {
        setError(
          err instanceof TypeError
            ? "Connection problem — check your internet and try again."
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
        );
      }
    } finally {
      if (got.trim()) {
        const persistReply = () =>
          saveNuriMessage(
            owner,
            threadId,
            { id: assistantId, role: "assistant", content: got, interrupted },
            history.length,
          );
        try {
          await persistReply();
        } catch {
          pendingSave.current = persistReply;
          if (mounted.current)
            setSaveError("Nuri’s reply couldn’t be saved. Keep this chat open and retry saving.");
        }
      } else if (pendingSave.current && mounted.current)
        setSaveError("Your message couldn’t be saved. Keep this chat open and retry saving.");
      busyRef.current = false;
      abortRef.current = null;
      if (mounted.current) setStreaming(false);
    }
  }

  function onSubmit() {
    const text = input.trim();
    if (!text || busyRef.current || !ready || pendingSave.current) return;
    setInput("");
    void send([...messages, { id: crypto.randomUUID(), role: "user", content: text }]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  function retry() {
    if (messages.at(-1)?.role === "user") void send(messages);
  }

  const last = messages.at(-1);
  const waitingFirstToken = streaming && last?.role === "assistant" && last.content === "";

  return (
    <section className="nuri-page" aria-label="Chat with Nuri">
      <Conversation className="nuri-conversation" initial={false} resize="instant">
        <ConversationContent className="nuri-transcript">
          <header className="nuri-header">
            <img
              src={mascot}
              alt="Nuri, a smiling lavender and pink heart"
              className="nuri-mascot"
              width={88}
              height={88}
            />
            <h1>Chat with Nuri</h1>
          </header>
          {!ready ? <p role="status">Loading conversation…</p> : null}
          {saveError ? (
            <div role="alert" className="text-sm text-destructive">
              {saveError}{" "}
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const save = pendingSave.current;
                  if (!save || busyRef.current) return;
                  busyRef.current = true;
                  try {
                    await save();
                    pendingSave.current = null;
                    setSaveError("");
                    setError(null);
                  } catch {
                    setSaveError("Still unable to save. Please check your connection and retry.");
                  } finally {
                    busyRef.current = false;
                  }
                }}
              >
                Retry saving
              </Button>
            </div>
          ) : null}
          <Bubble role="assistant" content={WELCOME} />
          {messages.length === 0 ? (
            <div className="nuri-starters" aria-label="Conversation starters">
              {STARTERS.map(({ text, icon: Icon }) => (
                <Button
                  key={text}
                  type="button"
                  variant="outline"
                  className="nuri-starter"
                  onClick={() => {
                    setInput(text);
                    inputRef.current?.focus();
                  }}
                >
                  <Icon aria-hidden className="size-5" />
                  <span>{text}</span>
                  <ArrowRight aria-hidden className="ml-auto size-4" />
                </Button>
              ))}
            </div>
          ) : null}
          {messages.map((m, i) =>
            m.role === "assistant" && m.content === "" ? null : (
              <Bubble
                key={m.id}
                role={m.role}
                content={m.content}
                showActions={!(streaming && i === messages.length - 1)}
              />
            ),
          )}
          {waitingFirstToken ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden /> Nuri is
              typing…
            </div>
          ) : null}
          {error ? (
            <div
              className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <span className="min-w-0 flex-1 break-words">{error}</span>
              {last?.role === "user" ? (
                <Button size="sm" variant="outline" onClick={retry}>
                  <RotateCcw className="size-4" /> Try again
                </Button>
              ) : null}
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton aria-label="Scroll to latest message" />
      </Conversation>
      <div className="nuri-composer-area">
        <PromptInput onSubmit={() => onSubmit()} maxFiles={0} className="nuri-composer">
          <PromptInputTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            aria-label="Message Nuri"
            rows={2}
            maxLength={4000}
            disabled={!ready || !!saveError || !online}
            className="nuri-textarea"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={streaming ? "streaming" : "ready"}
              onStop={() => abortRef.current?.abort()}
              disabled={!streaming && (!input.trim() || !ready || !!saveError || !online)}
              aria-label={streaming ? "Stop" : "Send"}
              className="nuri-send"
            >
              {streaming ? <Square className="size-4" /> : <Send className="size-5" />}
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        <details className="nuri-info">
          <summary>
            <ShieldCheck className="size-4" aria-hidden /> Safety & privacy{" "}
            <Info className="size-3.5" aria-hidden />
          </summary>
          <p>
            Nuri isn’t a therapist. Conversations are saved privately to your Pathway account. You
            can delete them from Saved chats. If you’re in crisis or feel unsafe, contact local
            emergency services or someone you trust right away.
          </p>
        </details>
      </div>
    </section>
  );
}

function Bubble({
  role,
  content,
  showActions = true,
}: {
  role: Msg["role"];
  content: string;
  showActions?: boolean;
}) {
  const { text, actions } =
    role === "assistant" ? parseNuriReply(content) : { text: content, actions: [] };
  return (
    <Message from={role} className="nuri-message">
      {role === "assistant" ? (
        <img src={mascot} alt="Nuri" width={36} height={36} className="nuri-avatar" />
      ) : null}
      <div className="min-w-0">
        <MessageContent className={role === "user" ? "nuri-user" : "nuri-assistant"}>
          {role === "assistant" ? (
            <MessageResponse className="nuri-response">{text}</MessageResponse>
          ) : (
            <span className="whitespace-pre-wrap break-words">{text}</span>
          )}
        </MessageContent>
        {showActions && actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((key) => (
              <Button key={key} asChild size="sm" variant="outline">
                <Link to={NURI_ACTIONS[key].to}>
                  {NURI_ACTIONS[key].label} <ArrowRight className="size-4" />
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Message>
  );
}
