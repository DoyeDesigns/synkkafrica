"use client";

import { MapPin } from "lucide-react";
import { createPortal } from "react-dom";

import { useAddressAutocomplete } from "@/features/travel/hooks/use-address-autocomplete";

type HeroAddressFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  listboxId?: string;
  className?: string;
};

export function HeroAddressField({
  placeholder,
  value,
  onChange,
  listboxId = "hero-address-listbox",
  className = "",
}: HeroAddressFieldProps) {
  const {
    containerRef,
    dropdownRef,
    text,
    suggestions,
    showDropdown,
    activeIndex,
    rect,
    setOpen,
    setActiveIndex,
    commit,
    handleChange,
    handleKeyDown,
  } = useAddressAutocomplete(value, onChange);

  const menu =
    showDropdown && rect && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              width: rect.width,
              zIndex: 60,
            }}
            className="max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {suggestions.map((place, index) => (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(place.label);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                    index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#676565]" />
                  <span className="truncate font-medium text-[#2F2F2F]">
                    {place.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={`relative min-w-0 flex-1 ${className}`}>
      <label className="flex min-h-12 items-center gap-2 rounded-xl bg-[#0000003D] px-4 text-sm text-white/90">
        <MapPin className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={text}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="w-full min-w-0 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/70"
        />
      </label>
      {menu}
    </div>
  );
}
