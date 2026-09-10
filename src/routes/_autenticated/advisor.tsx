import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  generateCareerMatch,
  getDashboard,
  saveProfile,
  type CareerResult,
} from "@/lib/pathway";
import { careerResultToText } from "@/lib/documents";
import { DownloadButtons } from "@/components/DownloadButtons";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export const Route = createFileRoute("/_autenticated/advisor")({
  head: () => ({
    meta: [
      { title: "Career Advisor — Pathway" },
      {
        name: "description",
        content:
          "Enter your skills, education and interests and get AI-matched career paths with the skills to build for each.",
      },
      { property: "og:title", content: "Career Advisor — Pathway" },
      {
        property: "og:description",
        content: "AI career paths matched to your studies, skills and interests.",
      },
    ],
  }),
  component: Advisor,
});

const VOLUNTEER_ROUTES = [
  {
    name: "Plan International Ghana",
    body: "Community projects in child rights, education and youth advocacy — strong for social-development careers.",
    url: "https://plan-international.org/ghana/",
  },
  {
    name: "Ghana Red Cross Society",
    body: "Field volunteering in first aid, disaster response and community health.",
    url: "https://www.ifrc.org/national-societies-directory/ghana-red-cross-society",
  },
  {
    name: "UN Volunteers (online)",
    body: "Remote assignments in research, translation, design and comms — doable alongside study.",
    url: "https://www.unv.org/become-volunteer/volunteer-online",
  },
];

function Advisor() {
  const queryClient = useQueryClient();
  const { data: dashboard } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState<CareerResult | null>(null);

  useEffect(() => {
    if (!dashboard) return;
    setSkills((prev) => prev || (dashboard.profile?.skills ?? ""));
    setEducation((prev) => prev || (dashboard.profile?.education ?? ""));
    setInterests((prev) => prev || (dashboard.profile?.interests ?? ""));
    setResult((prev) => prev ?? dashboard.latestMatch);
  }, [dashboard]);

  const mutation = useMutation({
    mutationFn: async () => {
      await saveProfile({ education, skills, interests });
      return generateCareerMatch({ education, skills, interests });
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Your career matches are ready.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not generate matches.");
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Career Advisor"
        title="Find the paths that fit you"
        description="Tell Pathway what you've studied, what you can do and what you enjoy. You'll get career directions with the skills to build next."
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <section className="card-surface min-w-0 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Your details</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="education">Education background</Label>
              <Textarea
                id="education"
                required
                rows={3}
                maxLength={1000}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="BSc Development Studies, final year, University of Ghana"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                required
                rows={4}
                maxLength={2000}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Data analysis in Excel, report writing, community facilitation, basic Python"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interests">Interests</Label>
              <Textarea
                id="interests"
                required
                rows={3}
                maxLength={1000}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Girls' education, monitoring and evaluation, working in the field"
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Matching…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Get my career matches
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your details are saved to your account, so you don't have to retype them next time.
            </p>
          </form>
        </section>

        <div className="min-w-0 space-y-4">
          <section className="card-surface min-w-0 overflow-hidden p-5 sm:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-lg font-semibold">Recommended paths</h2>
              {result ? (
                <div className="flex shrink-0 items-center gap-1">
                  <DownloadButtons
                    title="Pathway career matches"
                    text={careerResultToText(result)}
                  />
                </div>
              ) : null}
            </div>

            {mutation.isPending ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Reading your profile and matching career paths…
              </p>
            ) : result ? (
              <>
                {result.summary ? (
                  <p className="mt-2 text-sm break-words text-muted-foreground">{result.summary}</p>
                ) : null}
                <div className="mt-4 space-y-3">
                  {result.careers.map((career) => (
                    <article
                      key={career.title}
                      className="min-w-0 rounded-xl border border-border bg-muted/40 p-4"
                    >
                      <h3 className="text-base font-semibold break-words">{career.title}</h3>
                      <p className="mt-1.5 text-sm break-words text-muted-foreground">
                        {career.fit}
                      </p>
                      {career.skillsToBuild.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {career.skillsToBuild.map((skill) => (
                            <span
                              key={skill}
                              className="max-w-full rounded-full bg-accent px-3 py-1 text-xs font-medium break-words text-accent-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {career.firstStep ? (
                        <p className="mt-3 text-sm">
                          <span className="font-medium">First step: </span>
                          <span className="text-muted-foreground">{career.firstStep}</span>
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Fill in the form and your matches will appear here.
              </p>
            )}
          </section>

          <section className="card-surface min-w-0 overflow-hidden p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <HeartHandshake className="size-5" />
              </span>
              <h2 className="min-w-0 text-lg font-semibold break-words">
                Building the experience they ask for
              </h2>
            </div>
            <p className="mt-3 text-sm break-words text-muted-foreground">
              Most entry-level adverts still ask for up to a year of experience. Volunteering is the
              most realistic way for students to meet that bar — humanitarian and NGO work in
              particular gives you documented, referee-backed experience.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VOLUNTEER_ROUTES.map((route) => (
                <a
                  key={route.name}
                  href={route.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-accent/60"
                >
                  <h3 className="text-sm font-semibold break-words">{route.name}</h3>
                  <p className="mt-1 text-xs break-words text-muted-foreground">{route.body}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
