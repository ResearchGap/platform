export function PageHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <header className="flex max-w-3xl flex-col gap-3">
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
    </header>
  );
}
