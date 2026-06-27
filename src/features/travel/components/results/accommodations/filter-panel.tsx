import type { ReactNode } from "react";

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
};

export function FilterPanel({ children, className = "" }: FilterPanelProps) {
  return (
    <div
      className={`rounded-xl bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}
