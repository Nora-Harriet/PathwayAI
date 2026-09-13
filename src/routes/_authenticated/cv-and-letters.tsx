import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Copy, FileText, Loader2, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";

import { draftLetter, getDashboard, reviewCv } from "@/lib/pathway";
import { extractTextFromFile } from "@/lib/documents";
import { DownloadButtons } from "@/components/DownloadButtons";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export const Route = createFileRoute("/_autenticated/cv-and-letters")({
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
  const [jobTitle, setJobTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [strength, setStrength] = useState("");
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

  const letterMutation = useMutation({
    mutationFn: () => draftLetter({ jobTitle, organization, strength }),
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
                  <Label htmlFor="jobTitle">Job title</Label>
                  <Input
                    id="jobTitle"
                    required
                    maxLength={120}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Programme Assistant"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="organization">Organisation</Label>
                  <Input
                    id="organization"
                    required
                    maxLength={120}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Plan International Ghana"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="strength">One strength or achievement</Label>
                  <Textarea
                    id="strength"
                    required
                    rows={4}
                    maxLength={600}
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="Led a 6-person student team that ran a literacy drive for 120 pupils"
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
