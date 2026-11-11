import { createFileRoute } from "@tanstack/react-router";
import { NuriChat } from "@/components/nuri/NuriChat";
export const Route = createFileRoute("/_authenticated/nuri/$threadId")({
  head: () => ({
    meta: [
      { title: "Your Nuri conversation — Pathway" },
      {
        name: "description",
        content: "Continue your private conversation with Nuri, your Pathway companion.",
      },
      { property: "og:title", content: "Your Nuri conversation — Pathway" },
      { property: "og:description", content: "A private space to talk things through with Nuri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap",
      },
    ],
  }),
  component: ThreadPage,
});
function ThreadPage() {
  const { threadId } = Route.useParams();
  return <NuriChat key={threadId} threadId={threadId} />;
}
