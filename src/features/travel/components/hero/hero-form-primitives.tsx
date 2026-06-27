import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type HeroFieldProps = {
  icon?: ReactNode;
  placeholder: string;
  className?: string;
};

export function HeroField({ icon, placeholder, className = "" }: HeroFieldProps) {
  return (
    <div
      className={`flex min-h-12 flex-1 items-center gap-2 rounded-xl bg-[#0000003D] px-4 text-sm text-white/90 ${className}`}
    >
      {icon}
      <span className="truncate">{placeholder}</span>
    </div>
  );
}

type HeroPillSelectProps = {
  label: string;
  icon?: ReactNode;
  className?: string;
};

export function HeroPillSelect({
  label,
  icon,
  className = "",
}: HeroPillSelectProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-between gap-2 rounded-[25px] border border-[#EDE2E2] px-4 py-2 text-sm text-white ${className}`}
    >
      <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
      </div>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

type HeroRadioOptionProps = {
  label: string;
  selected?: boolean;
};

export function HeroRadioOption({ label, selected = false }: HeroRadioOptionProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white ${
        selected ? "border-white bg-white/10" : "border-white/40"
      }`}
    >
      <span
        className={`h-3.5 w-3.5 rounded-full border border-white ${
          selected ? "bg-white" : "bg-transparent"
        }`}
      />
      {label}
    </button>
  );
}

type HeroSearchButtonProps = {
  label: string;
  variant?: "coral" | "blue";
  className?: string;
};

export function HeroSearchButton({
  label,
  variant = "blue",
  className = "",
}: HeroSearchButtonProps) {
  if (variant === "coral") {
    return (
      <button
        type="submit"
        className={`rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#e45d25] ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="submit"
      className={`rounded-xl bg-[#1e5a8a] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white ${className}`}
    >
      {label}
    </button>
  );
}

export function HeroFormRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
      {children}
    </div>
  );
}

export function HeroInputShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[25px] border-[1.5px] border-white/70 p-2 lg:flex-row lg:items-center bg-[#B4B4B4]/34">
      {children}
    </div>
  );
}
