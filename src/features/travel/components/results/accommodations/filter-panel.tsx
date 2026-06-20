import type { ReactNode } from "react";

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
};

export function FilterPanel({ children, className = "" }: FilterPanelProps) {
  return (
    <div
      className={`rounded-xl border border-black/10 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
