import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { getProfile, saveProfile, type EducationEntry } from "@/lib/pathway";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Pathway" },
      { name: "description", content: "Your education, skills, interests and achievements in one place." },
      { property: "og:title", content: "Your profile — Pathway" },
      { property: "og:description", content: "Build and update your Pathway career profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const splitList = (v?: string) =>
  (v ?? "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
const emptyEdu = (): EducationEntry => ({ institution: "", qualification: "", startDate: "", endDate: "" });
const input =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function TagEditor({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
            <input
              aria-label={`Edit ${label} ${item}`}
              defaultValue={item}
              onBlur={(e) => {
                const v = e.target.value.trim();
                const next = [...items];
                if (v) next[i] = v; else next.splice(i, 1);
                onChange(next);
              }}
              className="w-auto min-w-0 bg-transparent outline-none"
              size={Math.max(item.length, 3)}
            />
            <button type="button" aria-label={`Remove ${item}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className={input}
          value={draft}
          placeholder={placeholder}
          aria-label={`Add ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="outline" onClick={add}><Plus className="size-4" /> Add</Button>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const [fullName, setFullName] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [highlights, setHighlights] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isLoading || loaded) return;
    const p = data ?? {};
    setFullName(p.fullName ?? "");
    setEducation(
      p.educationHistory?.length
        ? p.educationHistory
        : p.education
          ? [{ ...emptyEdu(), qualification: p.education }]
          : [emptyEdu()],
    );
    setSkills(splitList(p.skills));
    setInterests(splitList(p.interests));
    setAchievements(p.achievements ?? []);
    setBio(p.bio ?? "");
    setHighlights(p.highlights ?? "");
    setLoaded(true);
  }, [data, isLoading, loaded]);

  const updateEdu = (i: number, key: keyof EducationEntry, value: string) =>
    setEducation((prev) => prev.map((e, j) => (j === i ? { ...e, [key]: value } : e)));

  async function onSave() {
    setSaving(true);
    try {
      const educationHistory = education.filter((e) => e.institution.trim() || e.qualification.trim());
      await saveProfile({
        fullName: fullName.trim(),
        educationHistory,
        // Keep the short summary the Career Advisor already reads.
        education: educationHistory
          .map((e) => [e.qualification, e.institution].filter(Boolean).join(", "))
          .join("; "),
        skills: skills.join(", "),
        interests: interests.join(", "),
        achievements,
        bio: bio.trim(),
        highlights: highlights.trim(),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-sm text-muted-foreground">Loading your profile…</p>;

  return (
    <div className="space-y-4 pb-24">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">Profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Build your profile</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything here is private to your account and helps Pathway give you better guidance.
        </p>
      </div>

      <Section title="Full name">
        <input className={input} aria-label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ama Mensah" />
      </Section>

      <Section title="About you" hint="A short introduction about yourself.">
        <textarea className={`${input} min-h-24`} aria-label="Biography" value={bio} maxLength={1000} onChange={(e) => setBio(e.target.value)} />
      </Section>

      <Section title="Education">
        <div className="space-y-4">
          {education.map((e, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-2">
              <input className={input} aria-label="Institution" placeholder="Institution" value={e.institution} onChange={(ev) => updateEdu(i, "institution", ev.target.value)} />
              <input className={input} aria-label="Qualification or programme" placeholder="Qualification / programme" value={e.qualification} onChange={(ev) => updateEdu(i, "qualification", ev.target.value)} />
              <input className={input} aria-label="Start date" placeholder="Start (e.g. 2021)" value={e.startDate} onChange={(ev) => updateEdu(i, "startDate", ev.target.value)} />
              <div className="flex gap-2">
                <input className={input} aria-label="End date" placeholder="End (e.g. 2025 or Present)" value={e.endDate} onChange={(ev) => updateEdu(i, "endDate", ev.target.value)} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove education" onClick={() => setEducation((p) => p.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setEducation((p) => [...p, emptyEdu()])}>
            <Plus className="size-4" /> Add education
          </Button>
        </div>
      </Section>

      <Section title="Skills">
        <TagEditor label="skill" items={skills} onChange={setSkills} placeholder="e.g. Project coordination" />
      </Section>

      <Section title="Hobbies & interests">
        <TagEditor label="interest" items={interests} onChange={setInterests} placeholder="e.g. Community health" />
      </Section>

      <Section title="Achievements & certifications">
        <TagEditor label="achievement" items={achievements} onChange={setAchievements} placeholder="e.g. First Aid certificate, 2024" />
      </Section>

      <Section title="Experiences, strengths & goals" hint="A short passage highlighting what makes you stand out.">
        <textarea className={`${input} min-h-32`} aria-label="Experiences, strengths and goals" value={highlights} maxLength={2000} onChange={(e) => setHighlights(e.target.value)} />
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={onSave} disabled={saving} className="shadow-lg">
          <Save className="size-4" /> {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
