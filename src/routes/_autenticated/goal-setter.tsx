import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Circle, Compass, Info, Loader2, PartyPopper, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  adjustGoal,
  askNextStep,
  createGoal,
  deleteGoal,
  listGoals,
  saveSteps,
  type Goal,
  type GoalInput,
} from "@/lib/goals";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_autenticated/goal-setter")({
  head: () => ({
    meta: [
      { title: "Goal Setter — Pathway" },
      {
        name: "description",
        content:
          "Turn a career ambition into a SMART goal with a step-by-step action plan you can tick off and track.",
      },
      { property: "og:title", content: "Goal Setter — Pathway" },
      {
        property: "og:description",
        content: "SMART career goals and action plans for students and early-career professionals.",
      },
    ],
  }),
  component: GoalSetter,
});

const EMPTY: GoalInput = {
  title: "",
  careerArea: "",
  situation: "",
  targetDate: "",
  progressSoFar: "",
  resources: "",
};

const SMART_EXPLAINER = [
  ["Specific", "Clearly define what you want to achieve."],
  ["Measurable", "Decide how you will measure progress."],
  ["Achievable", "Make sure the goal is realistic."],
  ["Relevant", "Make sure it supports your career direction."],
  ["Time-bound", "Give yourself a deadline."],
] as const;

function formatDate(value: string) {
  if (!value) return "No date";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function GoalForm({
  value,
  onChange,
  onSubmit,
  pending,
  submitLabel,
  onCancel,
}: {
  value: GoalInput;
  onChange: (next: GoalInput) => void;
  onSubmit: () => void;
  pending: boolean;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const set = (patch: Partial<GoalInput>) => onChange({ ...value, ...patch });
  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="goal-title">Goal title</Label>
        <Input
          id="goal-title"
          required
          maxLength={120}
          value={value.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Become a Data Analyst"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-area">Career area (optional)</Label>
        <Input
          id="goal-area"
          maxLength={80}
          value={value.careerArea}
          onChange={(e) => set({ careerArea: e.target.value })}
          placeholder="Technology, HR, Finance, Marketing, Healthcare…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-situation">Current situation</Label>
        <Textarea
          id="goal-situation"
          required
          rows={3}
          maxLength={1000}
          value={value.situation}
          onChange={(e) => set({ situation: e.target.value })}
          placeholder="I am a final-year student with basic Excel skills."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-date">Target date</Label>
        <Input
          id="goal-date"
          type="date"
          required
          value={value.targetDate}
          onChange={(e) => set({ targetDate: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-progress">What have you already done? (optional)</Label>
        <Textarea
          id="goal-progress"
          rows={2}
          maxLength={1000}
          value={value.progressSoFar}
          onChange={(e) => set({ progressSoFar: e.target.value })}
          placeholder="I completed an introductory Excel course."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-resources">Skills or resources you have (optional)</Label>
        <Textarea
          id="goal-resources"
          rows={2}
          maxLength={1000}
          value={value.resources}
          onChange={(e) => set({ resources: e.target.value })}
          placeholder="Excel, report writing, a laptop and 6 free hours a week"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Working…
            </>
          ) : (
            <>
              <Target className="size-4" /> {submitLabel}
            </>
          )}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<GoalInput>({
    title: goal.title,
    careerArea: goal.careerArea,
    situation: goal.situation,
    targetDate: goal.targetDate,
    progressSoFar: goal.progressSoFar,
    resources: goal.resources,
  });
  const [nextStep, setNextStep] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["goals"] });

  const toggle = useMutation({
    mutationFn: (stepId: string) =>
      saveSteps(
        goal,
        goal.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
      ),
    onSuccess: refresh,
    onError: () => toast.error("Could not save that change."),
  });

  const adjust = useMutation({
    mutationFn: () => adjustGoal(goal, draft),
    onSuccess: () => {
      setEditing(false);
      refresh();
      toast.success("Your goal has been updated.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not update the goal."),
  });

  const next = useMutation({
    mutationFn: () => askNextStep(goal),
    onSuccess: setNextStep,
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not get a suggestion."),
  });

  const remove = useMutation({
    mutationFn: () => deleteGoal(goal.id),
    onSuccess: () => {
      refresh();
      toast.success("Goal deleted.");
    },
    onError: () => toast.error("Could not delete that goal."),
  });

  const total = goal.steps.length;
  const done = goal.steps.filter((s) => s.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  const smartRows = [
    ["Specific", goal.smart.specific],
    ["Measurable", goal.smart.measurable],
    ["Achievable", goal.smart.achievable],
    ["Relevant", goal.smart.relevant],
    ["Time-bound", goal.smart.timeBound],
  ] as const;

  return (
    <section className="card-surface min-w-0 p-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            Career goal
          </p>
          <h2 className="mt-1 text-lg font-semibold break-words">{goal.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground break-words">
            {goal.careerArea ? `${goal.careerArea} · ` : ""}Target {formatDate(goal.targetDate)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete goal"
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {complete ? (
        <div className="mt-4 rounded-xl border border-border bg-accent/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <PartyPopper className="size-4 shrink-0" /> Goal completed 🎉
          </p>
          <p className="mt-2 text-sm break-words text-muted-foreground">
            You finished all {total} steps of “{goal.title}”
            {goal.completedAt ? ` on ${goal.completedAt.toLocaleDateString()}` : ""}.
          </p>
        </div>
      ) : null}

      {goal.smart.goal ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
          <h3 className="text-sm font-semibold">SMART goal</h3>
          <p className="mt-1.5 text-sm break-words text-muted-foreground">{goal.smart.goal}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {smartRows
              .filter(([, body]) => body)
              .map(([label, body]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs font-semibold">{label}</dt>
                  <dd className="text-xs break-words text-muted-foreground">{body}</dd>
                </div>
              ))}
          </dl>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Progress</h3>
          <p className="text-xs text-muted-foreground">
            {done} of {total} steps completed · {percent}%
          </p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {goal.steps.map((step) => (
          <li key={step.id} className="min-w-0">
            <button
              type="button"
              onClick={() => toggle.mutate(step.id)}
              disabled={toggle.isPending}
              className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-left transition-colors hover:bg-accent/60"
            >
              {step.done ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0">
                <span
                  className={
                    step.done
                      ? "block text-sm font-medium break-words text-muted-foreground line-through"
                      : "block text-sm font-medium break-words"
                  }
                >
                  {step.title}
                </span>
                {step.description ? (
                  <span className="mt-1 block text-xs break-words text-muted-foreground">
                    {step.description}
                  </span>
                ) : null}
                <span className="mt-1 block text-xs break-words text-muted-foreground">
                  Deadline: {formatDate(step.deadline)}
                  {step.resources ? ` · ${step.resources}` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {nextStep ? (
        <p className="mt-4 rounded-xl border border-border bg-accent/50 p-4 text-sm break-words text-accent-foreground">
          {nextStep}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => next.mutate()} disabled={next.isPending}>
          {next.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </>
          ) : (
            <>
              <Compass className="size-4" /> What&apos;s my next step?
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={() => setEditing((v) => !v)}>
          {editing ? "Close" : "Adjust my goal"}
        </Button>
      </div>

      {editing ? (
        <div className="mt-2 border-t border-border pt-2">
          <GoalForm
            value={draft}
            onChange={setDraft}
            onSubmit={() => adjust.mutate()}
            pending={adjust.isPending}
            submitLabel="Update my goal"
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
    </section>
  );
}

function GoalSetter() {
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useQuery({ queryKey: ["goals"], queryFn: listGoals });
  const [form, setForm] = useState<GoalInput>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const create = useMutation({
    mutationFn: () => createGoal(form),
    onSuccess: () => {
      setForm(EMPTY);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Your SMART goal and action plan are ready.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create the goal."),
  });

  const hasGoals = (goals?.length ?? 0) > 0;
  const formOpen = showForm || !hasGoals;

  return (
    <>
      <PageHeader
        eyebrow="Goal Setter"
        title="Turn an ambition into a plan"
        description="Tell Pathway what you want to achieve. You'll get one clear SMART goal and a short list of steps you can tick off as you go."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section className="card-surface min-w-0 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Create a goal</h2>
              {hasGoals ? (
                <Button variant="ghost" size="sm" onClick={() => setShowForm((v) => !v)}>
                  <Plus className="size-4" /> {formOpen ? "Hide" : "New goal"}
                </Button>
              ) : null}
            </div>
            {formOpen ? (
              <GoalForm
                value={form}
                onChange={setForm}
                onSubmit={() => create.mutate()}
                pending={create.isPending}
                submitLabel="Create My Goal"
              />
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Ready for the next one? Tap “New goal”.
              </p>
            )}
          </section>

          <section className="card-surface min-w-0 p-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Info className="size-5" />
              </span>
              <h2 className="min-w-0 text-lg font-semibold break-words">What is a SMART goal?</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {SMART_EXPLAINER.map(([label, body]) => (
                <li key={label} className="min-w-0 text-sm break-words text-muted-foreground">
                  <span className="font-medium text-foreground">{label}</span> — {body}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="min-w-0 space-y-4">
          {create.isPending ? (
            <section className="card-surface min-w-0 p-6">
              <p className="text-sm text-muted-foreground">
                Writing your SMART goal and action plan…
              </p>
            </section>
          ) : null}
          {isLoading ? (
            <section className="card-surface min-w-0 p-6">
              <p className="text-sm text-muted-foreground">Loading your goals…</p>
            </section>
          ) : hasGoals ? (
            goals?.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          ) : (
            <section className="card-surface min-w-0 p-6">
              <p className="text-sm text-muted-foreground">
                Your goal and its steps will appear here once you create one.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
