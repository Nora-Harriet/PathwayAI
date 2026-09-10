import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Flag,
  FolderGit,
  GraduationCap,
  HeartHandshake,
  Linkedin,
  Mail,
  MessageCircle,
  RefreshCcw,
  Rocket,
  ScanLine,
  Search,
  Star,
  Target,
  UserRound,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_autenticated/career-tips")({
  head: () => ({
    meta: [
      { title: "Career Tips — Pathway" },
      {
        name: "description",
        content:
          "Practical career tips for students: LinkedIn, CV writing, interviews, networking, soft skills, goal-setting and more.",
      },
      { property: "og:title", content: "Career Tips — Pathway" },
      {
        property: "og:description",
        content: "Practical professional-development advice for final-year students.",
      },
    ],
  }),
  component: CareerTips,
});

const LINKEDIN = [
  "Use a clear headshot and a headline that says what you do, not just 'Student at …'.",
  "Write an About section in the first person: what you study, what you're good at, what you're looking for.",
  "List coursework projects, volunteering and student leadership as experience — they count.",
  "Follow the organisations you want to work for and comment thoughtfully on their posts.",
  "Ask two lecturers or supervisors for a short recommendation before you graduate.",
];

const HABITS = [
  "Tailor your CV for every application: mirror the words used in the job advert.",
  "Keep a running 'brag list' of achievements, numbers and praise — it makes CV writing painless.",
  "Apply to fewer roles, better. Five tailored applications beat fifty generic ones.",
  "Follow up politely a week after an interview; a short thank-you note is remembered.",
  "Track applications in one simple sheet: role, organisation, date, status, next action.",
];

const EXPERIENCE = [
  "Treat internships, volunteering, school projects and freelance work as real experience — they demonstrate what you can do.",
  "Take on projects that let you practise skills related to the career you want.",
  "Keep a record of what you contributed to each project and the results you achieved.",
  "Don't wait for your first job to start building your experience.",
  "When possible, choose experiences that give you something concrete to show on your CV.",
];

const CV_LITTLE_EXPERIENCE = [
  "Put your education, relevant coursework, projects, volunteering and leadership experience to work for you.",
  "Focus on what you did and achieved, not just the position you held.",
  "Use specific examples instead of saying you're simply 'hardworking' or 'a good communicator.'",
  "Keep your CV clear, easy to read and focused on the role you're applying for.",
  "You don't need years of work experience to create a strong first CV.",
];

const TAILOR_CV = [
  "Read the job description carefully before changing your CV.",
  "Highlight skills and experiences that match what the employer is looking for.",
  "Use relevant keywords from the job description naturally in your CV.",
  "Put your most relevant experience where the employer is likely to notice it first.",
  "Never claim to have a skill you don't actually have just because it appears in the job description.",
];

const JOB_DESCRIPTION = [
  "Read the responsibilities to understand what you would actually be doing in the role.",
  "Separate required qualifications from skills that are simply preferred.",
  "Look for repeated skills or keywords — they often show what the employer values most.",
  "Check whether your education and experience meet the basic requirements before applying.",
  "Use the job description as a guide when preparing your CV and interview answers.",
];

const NETWORKING = [
  "Start with people you already know — lecturers, supervisors, classmates, alumni and professionals.",
  "Ask questions and show genuine interest instead of immediately asking someone for a job.",
  "Introduce yourself clearly and briefly explain what career you're interested in.",
  "Stay in touch with people you meet professionally.",
  "Good networking is about building relationships, not collecting contacts.",
];

const TELL_ME_ABOUT_YOURSELF = [
  "Start with what you're currently studying or doing.",
  "Mention relevant skills, experiences or achievements that show what you can offer.",
  "Connect your background to the position you're applying for.",
  "Keep your answer focused on your professional journey rather than your entire life story.",
  "Practise your answer, but don't memorise it word for word.",
];

const SOFT_SKILLS = [
  "Don't just write 'excellent communication skills' — show where you've used them.",
  "Use school projects, volunteering, internships and leadership roles as examples.",
  "Explain how you solved problems, worked with others or handled responsibility.",
  "When possible, describe the result of your actions.",
  "Remember: show, don't just tell.",
];

const START_BEFORE_GRADUATE = [
  "Don't wait until your final semester to think about your career.",
  "Use your time in school to build skills, experience and professional connections.",
  "Explore internships, volunteering, certifications and relevant projects early.",
  "Start building your CV and LinkedIn profile before you need them.",
  "Small steps taken during school can make the transition into work much easier.",
];

const REJECTION = [
  "Don't treat one rejection as a judgement of your entire ability.",
  "Review the application and identify anything you could improve.",
  "Ask for feedback when it is appropriate and possible.",
  "Keep applying instead of waiting for one opportunity to work out.",
  "Use each application and interview as practice for the next one.",
];

const PORTFOLIO = [
  "This one is especially useful for students in IT, design, marketing, writing, media and other project-based careers.",
  "Keep examples of your best academic, personal, volunteer or freelance projects.",
  "Briefly explain the problem, your role, the skills you used and the result.",
  "Update your portfolio as you gain new experience.",
  "Choose quality over quantity — a few strong projects are better than many unfinished ones.",
  "Link your portfolio to your CV and LinkedIn profile when appropriate.",
];

const COMMUNICATION = [
  "Use a clear subject line when sending professional emails.",
  "Start with an appropriate greeting and address the person respectfully.",
  "Keep your message brief, clear and easy to understand.",
  "Check your spelling and attachments before sending.",
  "Give people reasonable time to respond before following up.",
];

const STAR_METHOD = [
  "Use the STAR method when answering questions about your past experiences.",
  "S — Situation: Briefly explain the situation or challenge you faced.",
  "T — Task: Describe what you were responsible for.",
  "A — Action: Explain the specific steps you took.",
  "R — Result: End with what happened and what you learned or achieved.",
  "Use examples from school projects, internships, volunteering or work — you don't need years of experience.",
];

const SMART_GOALS = [
  "Make your career goals Specific — clearly define what you want to achieve.",
  "Make them Measurable — decide how you'll know you've made progress.",
  "Make them Achievable — set a goal that challenges you without being unrealistic.",
  "Make them Relevant — connect your goal to the career you want.",
  "Make them Time-bound — give yourself a clear deadline.",
  "Break bigger career goals into smaller actions you can work on regularly.",
];

const BIG_FIVE = [
  { trait: "Openness", body: "Curiosity and comfort with new ideas — often suits research and creative roles." },
  { trait: "Conscientiousness", body: "Organisation and follow-through — strong for operations, finance and project work." },
  { trait: "Extraversion", body: "Energy from people — fits community work, sales, advocacy and fieldwork." },
  { trait: "Agreeableness", body: "Cooperation and empathy — valuable in social work, health and humanitarian roles." },
  { trait: "Neuroticism", body: "Sensitivity to stress — useful to know so you can choose the pace that suits you." },
];

function TipCard({ icon: Icon, title, tips }: { icon: React.ElementType; title: string; tips: string[] }) {
  return (
    <section className="card-surface min-w-0 p-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <h2 className="min-w-0 text-lg font-semibold break-words">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {tips.map((tip) => (
          <li key={tip} className="flex min-w-0 gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CareerTips() {
  return (
    <>
      <PageHeader
        eyebrow="Career Tips"
        title="Practical habits that make the difference"
        description="No AI here — just the professional-development basics worth getting right while you finish your studies."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TipCard icon={Linkedin} title="Your LinkedIn profile" tips={LINKEDIN} />
        <TipCard icon={Search} title="Job-search habits" tips={HABITS} />
        <TipCard icon={GraduationCap} title="Getting experience without a job" tips={EXPERIENCE} />
        <TipCard icon={FileText} title="Building a CV with little experience" tips={CV_LITTLE_EXPERIENCE} />
        <TipCard icon={Target} title="Tailor your CV to the job" tips={TAILOR_CV} />
        <TipCard icon={ScanLine} title="Understanding a job description" tips={JOB_DESCRIPTION} />
        <TipCard icon={Users} title="Networking without feeling awkward" tips={NETWORKING} />
        <TipCard icon={MessageCircle} title='Answering "Tell me about yourself"' tips={TELL_ME_ABOUT_YOURSELF} />
        <TipCard icon={HeartHandshake} title="Showing your soft skills" tips={SOFT_SKILLS} />
        <TipCard icon={Rocket} title="Start before you graduate" tips={START_BEFORE_GRADUATE} />
        <TipCard icon={RefreshCcw} title="Handling job rejection" tips={REJECTION} />
        <TipCard icon={FolderGit} title="Building a professional portfolio" tips={PORTFOLIO} />
        <TipCard icon={Mail} title="Professional communication" tips={COMMUNICATION} />
        <TipCard icon={Star} title="Using the STAR method in interviews" tips={STAR_METHOD} />
        <TipCard icon={Flag} title="Setting SMART career goals" tips={SMART_GOALS} />
      </div>

      <section className="card-surface mt-4 min-w-0 p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <UserRound className="size-5" />
          </span>
          <h2 className="min-w-0 text-lg font-semibold break-words">Know yourself: the Big Five</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          The Big Five is the most widely used model of personality in psychology. It won't pick a
          career for you, but knowing where you sit makes it much easier to judge whether a role
          will suit the way you actually work.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BIG_FIVE.map((item) => (
            <div key={item.trait} className="min-w-0 rounded-xl border border-border bg-muted/50 p-4">
              <h3 className="text-sm font-semibold">{item.trait}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
        <a
          href="https://bigfive-test.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Take a free Big Five test <ExternalLink className="size-4" />
        </a>
      </section>
    </>
  );
}
