import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";

import campus from "@/assets/slide-campus.jpg";
import office from "@/assets/slide-office.jpg";
import graduation from "@/assets/slide-graduation.jpg";

const SLIDES = [
  { src: campus, alt: "Students walking together on campus" },
  { src: office, alt: "Young professionals working together around a laptop" },
  { src: graduation, alt: "Graduates celebrating outdoors" },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((n: number) => setIndex((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative h-64 overflow-hidden rounded-3xl shadow-lg sm:h-80 lg:h-96"
      aria-roledescription="carousel"
      aria-label="Pathway highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 40) return;
        go(end < start ? index + 1 : index - 1);
      }}
    >
      {SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={i === index ? s.alt : ""}
          aria-hidden={i !== index}
          width={1600}
          height={768}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-transparent" />

      <div className="relative flex h-full max-w-xl flex-col justify-center gap-2 p-5 text-primary-foreground sm:gap-3 sm:p-8">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur">
          <Star className="size-3.5" /> Your Career Companion
        </span>
        <h1 className="font-display text-2xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
          Your future. Your path. Your possibilities!
        </h1>
        <p className="hidden text-sm opacity-90 sm:block">
          AI-powered career guidance to help you explore, prepare and grow.
        </p>
        <Link
          to="/advisor"
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
        >
          Explore Pathway <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="absolute right-4 bottom-4 flex gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow hover:bg-card"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow hover:bg-card"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-card" : "w-2 bg-card/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
