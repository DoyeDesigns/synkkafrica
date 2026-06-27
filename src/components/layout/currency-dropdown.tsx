"use client";

import { useMemo, useRef, useState } from "react";

import { NavbarDropdownPanel } from "@/components/layout/navbar-dropdown-panel";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import { CURRENCIES } from "@/lib/preferences/currencies";
import type { CurrencyCode } from "@/lib/preferences/types";
import { usePreferencesStore } from "@/stores/preferences-store";

export function CurrencyDropdown() {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const currency = usePreferencesStore((state) => state.currency);
  const setCurrency = usePreferencesStore((state) => state.setCurrency);

  useClickOutside(containerRef, () => setOpen(false), open);

  const filteredCurrencies = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return CURRENCIES;

    return CURRENCIES.filter(
      (item) =>
        item.code.toLowerCase().includes(normalized) ||
        item.name.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="transition-opacity hover:opacity-80"
      >
        {currency} | {t("nav.chooseCurrency")}
      </button>

      {open ? (
        <NavbarDropdownPanel className="min-w-[280px] p-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("nav.searchCurrency")}
            className="h-10 w-full rounded-lg border border-[#D9D9D9] px-3 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]"
          />

          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto">
            {filteredCurrencies.map((item) => {
              const isSelected = item.code === currency;

              return (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency(item.code as CurrencyCode);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-satoshi transition-colors ${
                      isSelected
                        ? "bg-[#E8F4FD] text-foreground"
                        : "text-foreground hover:bg-zinc-50"
                    }`}
                  >
                    <span className="font-bold">{item.code}</span>
                    <span className="font-medium">{item.name}</span>
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
