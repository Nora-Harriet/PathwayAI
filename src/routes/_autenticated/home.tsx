function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const tip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);

  return (
    <main
      className="relative min-h-screen bg-[#F3ECFA] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero-home.png')" }}
    >
      {/* Soft lavender veil over the entire background image */}
      <div className="pointer-events-none absolute inset-0 bg-[#F3ECFA]/45" />

      {/* Page content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* HOME + greeting */}
        <div className="pt-8 sm:pt-10">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            Home
          </p>

          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {data?.profile?.fullName
              ? `Hello, ${data.profile.fullName}`
              : "Your progress"}
          </h1>

          <p className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Your next step, mapped
          </p>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            One place to find your fit, sharpen your CV, and take the next
            step with confidence.
          </p>
        </div>

        {/* WHAT YOU CAN DO */}
        <section className="card-surface mt-6 p-6">
          <h2 className="text-lg font-semibold">What you can do here</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight into any of the tools below.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-accent/60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <action.icon className="size-4" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {action.label}
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* RECENT ACTIVITY + TIP */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="card-surface p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">Recent activity</h2>

            {isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Loading…
              </p>
            ) : (data?.matches.length ?? 0) +
                (data?.reviews.length ?? 0) +
                (data?.letters.length ?? 0) ===
              0 ? (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Nothing saved yet. Start with a career match — it takes
                  about a minute.
                </p>

                <Button asChild className="mt-4">
                  <Link to="/advisor">Get my career match</Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {[
                  ...(data?.matches ?? []),
                  ...(data?.reviews ?? []),
                  ...(data?.letters ?? []),
                ]
                  .sort(
                    (a, b) =>
                      b.createdAt.getTime() - a.createdAt.getTime()
                  )
                  .map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border bg-muted/40 p-4"
                    >
                      <p className="truncate text-sm font-medium">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.createdAt.toLocaleDateString()}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="card-surface p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Lightbulb className="size-5" />
            </span>

            <h2 className="mt-4 text-lg font-semibold">
              Tip of the day
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {tip}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}