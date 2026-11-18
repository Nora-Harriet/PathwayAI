import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Copy, FileText, Loader2, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";

import { draftLetter, getDashboard, reviewCv } from "@/lib/pathway";
import { extractTextFromFile } from "@/lib/documents";
import { DownloadButtons } from "@/components/DownloadButtons";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/cv-and-letters")({
  head: () => ({
    meta: [
      { title: "CV & Letters — Pathway" },
      {
        name: "description",
        content:
          "Get specific AI feedback on a section of your CV, or draft a cover letter for a role in seconds.",
      },
      { property: "og:title", content: "CV & Letters — Pathway" },
      {
        property: "og:description",
        content: "AI CV feedback and cover letter drafting for students and recent graduates.",
      },
    ],
  }),
  component: CvAndLetters,
});

function CvAndLetters() {
  const queryClient = useQueryClient();
  const { data: dashboard } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cvText, setCvText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyHook, setCompanyHook] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text) throw new Error("We couldn't read any text from that file.");
      setCvText(text.slice(0, 6000));
      toast.success(`Loaded ${file.name}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const reviewMutation = useMutation({
    mutationFn: () => reviewCv(cvText),
    onSuccess: (data) => {
      setFeedback(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not review your CV."),
  });

  useEffect(() => {
    if (!dashboard?.profile) return;
    const p = dashboard.profile;
    const parts: string[] = [];
    if (p.education) parts.push(`Education: ${p.education}`);
    if (p.skills) parts.push(`Skills: ${p.skills}`);
    if (p.achievements && p.achievements.length > 0) {
      parts.push(`Key Achievements:\n- ${p.achievements.join("\n- ")}`);
    } else if (p.highlights) {
      parts.push(`Highlights: ${p.highlights}`);
    } else if (p.bio) {
      parts.push(`Bio: ${p.bio}`);
    }
    const autoSummary = parts.join("\n\n");
    if (autoSummary) {
      setExperienceSummary((prev) => prev || autoSummary);
    }
  }, [dashboard]);

  const letterMutation = useMutation({
    mutationFn: () =>
      draftLetter({
        jobDescription,
        companyHook,
        experienceSummary,
        fullName: dashboard?.profile?.fullName || "",
        jobTitle: jobDescription.slice(0, 60),
        organization: companyHook.slice(0, 60),
        strength: experienceSummary.slice(0, 100),
      }),
    onSuccess: (data) => {
      setLetter(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not draft your letter."),
  });

  const shownFeedback = feedback ?? dashboard?.latestFeedback ?? null;
  const shownLetter = letter ?? dashboard?.latestLetter ?? null;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to your clipboard.");
  }

  return (
    <>
      <PageHeader
        eyebrow="CV & Letters"
        title="Sharpen how you present yourself"
        description="Two tools: honest feedback on a CV section, and a first draft of a cover or motivation letter you can personalise."
      />

      <Tabs defaultValue="cv">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="cv" className="flex-1 sm:flex-none">
            <FileText className="size-4" /> CV feedback
          </TabsTrigger>
          <TabsTrigger value="letter" className="flex-1 sm:flex-none">
            <PenLine className="size-4" /> Cover letter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cv" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <section className="card-surface p-6">
              <h2 className="text-lg font-semibold">Upload or paste your CV</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Attach an existing CV (PDF, Word .docx or .txt) and we'll pull the text in for you.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Reading file…
                  </>
                ) : (
                  <>
                    <Upload className="size-4" /> Attach CV file
                  </>
                )}
              </Button>
              <form
                className="mt-4 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  reviewMutation.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="cvText">Your text</Label>
                  <Textarea
                    id="cvText"
                    required
                    rows={12}
                    minLength={20}
                    maxLength={6000}
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste your work experience, education or skills section here…"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={reviewMutation.isPending}>
                  {reviewMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Reviewing…
                    </>
                  ) : (
                    "Get feedback"
                  )}
                </Button>
              </form>
            </section>

            <section className="card-surface p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-lg font-semibold">Feedback</h2>
                {shownFeedback ? (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copy(shownFeedback)}>
                      <Copy className="size-4" /> Copy
                    </Button>
                    <DownloadButtons title="Pathway CV feedback" text={shownFeedback} />
                  </div>
                ) : null}
              </div>

              <div className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {reviewMutation.isPending
                  ? "Reading your CV section…"
                  : (shownFeedback ??
                    "Your feedback will appear here — specific, short and encouraging.")}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="letter" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <section className="card-surface p-6">
              <h2 className="text-lg font-semibold">Letter details</h2>
              <form
                className="mt-4 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  letterMutation.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jobDescription">Job description & requirements</Label>
                    <span className="text-xs text-muted-foreground font-normal">ATS matching</span>
                  </div>
                  <Textarea
                    id="jobDescription"
                    required
                    rows={5}
                    maxLength={3000}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job ad, title, key responsibilities, and requirements here…"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyHook">Why this company / What excites you</Label>
                  <Textarea
                    id="companyHook"
                    required
                    rows={3}
                    maxLength={600}
                    value={companyHook}
                    onChange={(e) => setCompanyHook(e.target.value)}
                    placeholder="e.g. Plan International Ghana — I admire their community-led literacy drive in rural districts and their youth empowerment focus…"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="experienceSummary">Your resume / Experience & achievements</Label>
                    {dashboard?.profile ? (
                      <span className="text-xs text-primary font-medium">Auto-loaded from Profile</span>
                    ) : null}
                  </div>
                  <Textarea
                    id="experienceSummary"
                    required
                    rows={5}
                    maxLength={2500}
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Paste your top skills, degree, background, or 1–2 key achievements here…"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={letterMutation.isPending}>
                  {letterMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Drafting…
                    </>
                  ) : (
                    "Draft my letter"
                  )}
                </Button>
              </form>
            </section>

            <section className="card-surface p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-lg font-semibold">Your draft</h2>
                {shownLetter ? (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copy(shownLetter)}>
                      <Copy className="size-4" /> Copy
                    </Button>
                    <DownloadButtons title="Pathway cover letter" text={shownLetter} />
                  </div>
                ) : null}
              </div>

              <div className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {letterMutation.isPending
                  ? "Writing your letter…"
                  : (shownLetter ??
                    "Your letter will appear here, ready to personalise before you send it.")}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
