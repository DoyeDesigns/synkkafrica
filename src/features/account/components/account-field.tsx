import type { ReactNode } from "react";

type AccountFieldProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

export function AccountField({ label, icon, children, action }: AccountFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold font-inter text-foreground">{label}</span>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#676565]">
            {icon}
          </span>
        ) : null}
        {children}
        {action ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{action}</div>
        ) : null}
      </div>
    </label>
  );
}

export const accountInputClassName =
  "h-11 w-full rounded-[10px] border border-[#C9C9C9] bg-white text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]";
