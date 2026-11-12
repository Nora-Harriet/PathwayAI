import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, FileText, GraduationCap, HeartPulse, Target, TrendingUp } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pathway — AI Career Advisor for Final-Year Students" },
      {
        name: "description",
        content:
          "Pathway helps final-year students and recent graduates find fitting career paths, sharpen their CV and draft cover letters with AI.",
      },
      { property: "og:title", content: "Pathway — AI Career Advisor for Final-Year Students" },
      {
        property: "og:description",
        content:
          "AI career matches, CV feedback and cover letters, plus practical tips for entry-level and humanitarian roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Compass, title: "Career Advisor", tone: "lav", body: "Share your skills, studies and interests. Get career paths that fit, with the exact skills to build next." },
  { icon: FileText, title: "CV & Letters", tone: "mint", body: "Paste a CV section for specific, encouraging feedback — or draft a motivation letter in one go." },
  { icon: GraduationCap, title: "Career Tips", tone: "gold", body: "LinkedIn habits, job-search routines and a short intro to the Big Five personality traits." },
  { icon: Target, title: "Goal Setter", tone: "blue", body: "Turn your ambitions into achievable SMART goals. Break them into actionable steps, set deadlines and track your progress as you work towards success." },
  { icon: HeartPulse, title: "Nuri", tone: "rose", body: "A supportive space to talk through stress, school, work and life. Reflect on your feelings, explore your goals and find manageable next steps." },
];

function Mark({ size = "md" }: { size?: "md" | "lg" | "sm" }) {
  return <img src="/favicon.png" alt="" className={`lp-logo lp-logo-${size}`} />;
}

function Landing() {
  return (
    <div className="lp">
      <header className="lp-wrap lp-header">
        <Link to="/" className="lp-brand" aria-label="Pathway home">
          <Mark />
          <span>Pathway</span>
        </Link>
        <Link to="/auth" className="lp-signin">
          Sign in <ArrowRight className="size-4" />
        </Link>
      </header>

      <main className="lp-wrap">
        <section className="lp-hero lp-rise" aria-labelledby="lp-title">
          <div className="lp-hero-copy">
            <p className="lp-pill"><span className="lp-dot" />Built by students, for students</p>
            <h1 id="lp-title" className="lp-h1">
              Figure out where your degree can <span className="lp-grad">actually take you</span>
            </h1>
            <p className="lp-lead">
              Pathway turns your skills, studies and interests into clear career directions — then
              helps you write the CV and letter that get you there.
            </p>
            <Link to="/auth" className="lp-cta">
              Get started free
              <span className="lp-cta-arrow"><ArrowRight className="size-[18px]" /></span>
            </Link>
          </div>

          <div className="lp-hero-art">
            <span className="lp-spark lp-spark-gold" aria-hidden="true">✦</span>
            <span className="lp-spark lp-spark-blue" aria-hidden="true">✦</span>
            <div className="lp-photo">
              <img src="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?auto=format&fit=crop&w=1100&q=85" alt="Three young Black women students talking and working together with a laptop and notebooks" />
            </div>
            <div className="lp-float lp-float-a">
              <span className="lp-float-icon lp-float-icon-lav"><Compass className="size-[19px]" /></span>
              <span><small>Your direction</small><b>Career clarity</b></span>
              <span className="lp-dot" />
            </div>
            <div className="lp-float lp-float-b">
              <span className="lp-float-icon lp-float-icon-mint"><TrendingUp className="size-[19px]" /></span>
              <span><small>Built to help you</small><b>Grow with confidence</b></span>
            </div>
          </div>
        </section>

        <section className="lp-features" aria-labelledby="lp-features-title">
          <p className="lp-eyebrow">Everything in one place</p>
          <h2 id="lp-features-title" className="lp-h2">Build your path, your way.</h2>
          <div className="lp-grid">
            {FEATURES.map((f, i) => (
              <article key={f.title} className={`lp-card lp-card-${f.tone} lp-rise`} style={{ animationDelay: `${i * 80}ms` }}>
                <span className="lp-card-orb" aria-hidden="true" />
                <div className="lp-card-top">
                  <span className="lp-card-icon"><f.icon className="size-[22px]" /></span>
                  <span className="lp-card-num">0{i + 1}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="lp-callout lp-rise">
          <Mark size="lg" />
          <div>
            <p className="lp-eyebrow lp-eyebrow-green">A head start that matters</p>
            <h2>Experience you can start building today</h2>
            <p>
              Most entry-level roles still ask for up to a year of experience. Pathway leans on
              humanitarian and NGO volunteering routes as a realistic way to close that gap before
              you graduate.
            </p>
          </div>
          <svg className="lp-wave" viewBox="0 0 180 70" aria-hidden="true"><path d="M4 66 C40 66 40 6 76 6 S112 66 140 66 S170 20 176 10" fill="none" strokeWidth="6" strokeLinecap="round" /></svg>
        </aside>
      </main>

      <footer className="lp-wrap lp-footer">
        <Link to="/" className="lp-brand lp-brand-sm" aria-label="Pathway home"><Mark size="sm" /><span>Pathway</span></Link>
        <p>Find your direction. Build what comes next.</p>
        <Link to="/auth" className="lp-footer-link">Sign in</Link>
      </footer>
    </div>
  );
}
