"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { signInWithEmailAsVendorAction } from "@/lib/auth/vendor-actions";

export function VendorLoginEmailForm() {
  const t = useTranslation();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    signInWithEmailAsVendorAction,
    undefined,
  );

  // On success the vendor session cookie is set; navigate into the dashboard.
  useEffect(() => {
    if (state?.ok) {
      router.push("/vendor");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]"
          strokeWidth={1.75}
        />
        <input
          type="email"
          name="email"
          required
          placeholder={t("vendor.login.emailPlaceholder")}
          className="h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]"
        />
      </div>

      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]"
          strokeWidth={1.75}
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]"
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#3A3A3A] text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("common.loading") : t("common.continue")}
      </button>
    </form>
  );
}
