export function AccountPlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold font-montserrat text-foreground">{title}</h1>
      <p className="mt-2 text-sm font-satoshi text-foreground/70">
        This section is coming soon.
      </p>
    </section>
  );
}
