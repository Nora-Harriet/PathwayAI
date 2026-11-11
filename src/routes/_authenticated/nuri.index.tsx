import { createFileRoute } from "@tanstack/react-router";
import mascot from "@/assets/nuri-heart.png";
export const Route = createFileRoute("/_authenticated/nuri/")({
  head: () => ({
    meta: [
      { title: "Nuri saved chats — Pathway" },
      {
        name: "description",
        content: "Return to your private Nuri conversations or start a new chat.",
      },
      { property: "og:title", content: "Nuri saved chats — Pathway" },
      {
        property: "og:description",
        content: "Your Pathway companion and private saved conversations.",
      },
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
  component: () => (
    <section className="nuri-page">
      <header className="nuri-header">
        <img
          className="nuri-mascot"
          src={mascot}
          alt="Nuri, a smiling heart"
          width={88}
          height={88}
        />
        <h1>Chat with Nuri</h1>
      </header>
      <p className="mx-auto max-w-lg text-center text-sm leading-relaxed">
        Hi there! 👋 I’m Nuri, your Pathway companion. How can I help you today?
      </p>
    </section>
  ),
});
