export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
