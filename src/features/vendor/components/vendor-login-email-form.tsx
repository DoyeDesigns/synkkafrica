"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { signInWithEmailAsVendorAction } from "@/lib/auth/vendor-actions";

export function VendorLoginEmailForm() {
  const t = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    signInWithEmailAsVendorAction,
    undefined,
  );
  const started = useRef(false);

  // The cookie is set by the server action, but SessionProvider was hydrated
  // as logged-out and will not notice that cookie on a client navigation.
  // Pull the session into context before opening the dashboard, or the
  // vendor queries stay disabled until a manual reload.
  useEffect(() => {
    if (!state?.ok || started.current) return;
    started.current = true;
    void (async () => {
      try {
        const next = await update();
        if (next?.accessToken) {
          router.push("/vendor");
          router.refresh();
          return;
        }
      } catch {
        // Fall through to a full navigation, which remounts with the cookie.
      }
      window.location.assign("/vendor");
    })();
  }, [state?.ok, router, update]);

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
          type={showPassword ? "text" : "password"}
          name="password"
          required
          placeholder="Password"
          className="h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-11 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#004785]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="-mt-1 flex justify-end">
        <Link
          href="/vendor/forgot-password"
          className="text-sm font-semibold font-satoshi text-[#D85A30] transition-opacity hover:opacity-80"
        >
          {t("vendor.login.forgotPassword")}
        </Link>
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
