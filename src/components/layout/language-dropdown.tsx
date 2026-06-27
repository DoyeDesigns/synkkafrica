"use client";

import { Globe } from "lucide-react";
import { useRef, useState } from "react";

import { NavbarDropdownPanel } from "@/components/layout/navbar-dropdown-panel";
import { useClickOutside } from "@/hooks/use-click-outside";
import { LANGUAGES } from "@/lib/preferences/languages";
import { usePreferencesStore } from "@/stores/preferences-store";

export function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Choose language"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="transition-opacity hover:opacity-80"
      >
        <Globe className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open ? (
        <NavbarDropdownPanel className="min-w-[220px] py-3">
          <ul className="space-y-1 px-2">
            {LANGUAGES.map((item) => {
              const isSelected = item.code === language;

              return (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium font-satoshi transition-colors ${
                      isSelected
                        ? "bg-[#E8F4FD] text-foreground"
                        : "text-foreground hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {item.flag}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </NavbarDropdownPanel>
      ) : null}
    </div>
  );
}
