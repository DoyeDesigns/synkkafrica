"use client";

import { SlidersHorizontal } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { useTranslation } from "@/hooks/use-translation";

type MobileFilterToggleProps = {
  children: ReactNode;
};

export function MobileFilterToggle({ children }: MobileFilterToggleProps) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <div className="mb-4 flex justify-start lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-[5px] border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-montserrat text-[#1E1E1E]"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          {t("filters.filter")}
        </button>
      </div>

      <div id={panelId} className={open ? "block" : "hidden lg:block"}>
        {children}
      </div>
    </div>
  );
}
