import type { ReactNode } from "react";

type SavedSectionHeaderProps = {
  title: string;
  count: number;
};

export function SavedSectionHeader({ title, count }: SavedSectionHeaderProps) {
  return (
    <h2 className="text-base font-bold font-montserrat text-foreground">
      {title}{" "}
      <span className="text-[#D85A30]">({count})</span>
    </h2>
  );
}

type SavedSectionProps = {
  title: string;
  count: number;
  children: ReactNode;
};

export function SavedSection({ title, count, children }: SavedSectionProps) {
  return (
    <section className="min-w-0 space-y-4">
      <SavedSectionHeader title={title} count={count} />
      {children}
    </section>
  );
}
