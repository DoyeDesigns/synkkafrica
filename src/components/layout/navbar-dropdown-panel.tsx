import type { ReactNode } from "react";

type NavbarDropdownPanelProps = {
  children: ReactNode;
  className?: string;
};

export function NavbarDropdownPanel({
  children,
  className = "",
}: NavbarDropdownPanelProps) {
  return (
    <div
      className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[240px] overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white py-2 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
