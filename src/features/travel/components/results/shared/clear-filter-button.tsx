"use client";

import { X } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

type ClearFilterButtonProps = {
  onClick: () => void;
  className?: string;
  variant?: "hero" | "sidebar";
};

export function ClearFilterButton({
  onClick,
  className = "",
  variant = "hero",
}: ClearFilterButtonProps) {
  const t = useTranslation();
  const isSidebar = variant === "sidebar";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full mx-auto max-w-[213px] items-center justify-center gap-2.5 rounded-xl border border-[#C9C9C9]/26 bg-transparent px-4 py-3 text-sm font-medium font-satoshi backdrop-blur-md transition-opacity hover:opacity-90 ${
        isSidebar ? "text-foreground" : "text-white"
      } ${className}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          isSidebar ? "border-[#676565]" : "border-white"
        }`}
      >
        <X
          className={`h-3 w-3 ${isSidebar ? "text-[#676565]" : "text-white"}`}
          strokeWidth={2.5}
        />
      </span>
      {t("hero.clearFilter")}
    </button>
  );
}
