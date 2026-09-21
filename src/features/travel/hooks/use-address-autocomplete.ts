"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  suggestAddresses,
  type AddressSuggestScope,
  type PlaceSuggestion,
} from "@/lib/api/places";

export type AddressAutocompleteOptions = AddressSuggestScope & {
  enabled?: boolean;
  formatCommit?: (place: PlaceSuggestion) => string;
};

export function useAddressAutocomplete(
  value: string,
  onChange: (value: string) => void,
  options?: AddressAutocompleteOptions,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [text, setText] = useState(value);
  const [debounced, setDebounced] = useState(value.trim());
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(text.trim()), 250);
    return () => window.clearTimeout(id);
  }, [text]);

  const city = options?.city?.trim() ?? "";
  const state = options?.state?.trim() ?? "";
  const country = options?.country?.trim() ?? "";
  const countryCode = options?.countryCode?.trim() ?? "";
  const lookupEnabled = options?.enabled !== false;

  const { data: suggestions = [] } = useQuery({
    queryKey: [
      "address-places",
      debounced,
      city,
      state,
      country,
      countryCode,
    ],
    queryFn: ({ signal }) =>
      suggestAddresses(debounced, signal, {
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        countryCode: countryCode || undefined,
      }),
    enabled: lookupEnabled && open && debounced.length >= 3,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const showDropdown = open && suggestions.length > 0;

  useEffect(() => {
    if (!showDropdown) return;
    const measure = () => {
      const el = containerRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const resolveCommit = (place: PlaceSuggestion) =>
    options?.formatCommit?.(place) ?? place.label;

  const commit = (place: PlaceSuggestion | string) => {
    const label = typeof place === "string" ? place : resolveCommit(place);
    setText(label);
    onChange(label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleChange = (next: string) => {
    setText(next);
    onChange(next);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!showDropdown) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      commit(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return {
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
  };
}
