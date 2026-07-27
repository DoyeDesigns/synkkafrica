"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";

export type HeroPillSelectOption = {
  value: string;
  label: string;
};

type HeroFieldProps = {
  icon?: ReactNode;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "date" | "search";
  min?: string;
};

export function HeroField({
  icon,
  placeholder,
  className = "",
  value,
  onChange,
  type = "text",
  min,
}: HeroFieldProps) {
  const isControlled = value !== undefined && onChange !== undefined;
  const showPlaceholder = isControlled && type === "date" && !value;

  if (isControlled) {
    return (
      <label
        className={`relative flex min-h-12 flex-1 items-center gap-2 rounded-xl bg-[#0000003D] px-4 text-sm text-white/90 ${className}`}
      >
        {icon}
        {showPlaceholder ? (
          <span className="pointer-events-none absolute left-10 truncate text-white/70">
            {placeholder}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          min={min}
          placeholder={type === "date" ? undefined : placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full min-w-0 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/70 ${
            type === "date" ? "scheme-dark" : ""
          }`}
        />
      </label>
    );
  }

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
  options?: HeroPillSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

export function HeroPillSelect({
  label,
  icon,
  className = "",
  options,
  value,
  onChange,
}: HeroPillSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options?.find((option) => option.value === value)?.label ?? label;

  useClickOutside(containerRef, () => setOpen(false), open);

  if (options && value !== undefined && onChange) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex w-full items-center justify-between gap-2 rounded-[25px] border border-[#EDE2E2] px-4 py-2 text-sm text-white"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{selectedLabel}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open ? (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-60 min-w-full overflow-y-auto rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi transition-colors ${
                      isSelected
                        ? "bg-[#E8F4FD] text-[#2F2F2F]"
                        : "text-[#2F2F2F] hover:bg-zinc-50"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }

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
