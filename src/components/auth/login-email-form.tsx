"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";

import { useTranslation } from "@/hooks/use-translation";
import { requestOtpAction } from "@/lib/auth/actions";

const inputClass =
  "h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]";
const buttonClass =
  "flex h-12 w-full items-center justify-center rounded-lg bg-[#3A3A3A] text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 disabled:opacity-60";

export function LoginEmailForm() {
  const t = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRequest(formData: FormData) {
    const value = String(formData.get("email") ?? "");
    setError(null);
    startTransition(async () => {
      const res = await requestOtpAction(value);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setEmail(value.trim().toLowerCase());
      setStep("code");
    });
  }

  function handleVerify(formData: FormData) {
    const value = String(formData.get("code") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const res = await signIn("otp", {
        email,
        code: value,
        redirect: false,
      });
      if (res?.error) {
        setError("That code is invalid or expired.");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  if (step === "code") {
    return (
      <form action={handleVerify} className="space-y-4">
        <p className="text-center text-sm font-satoshi text-foreground/70">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>.
        </p>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]"
            strokeWidth={1.75}
          />
          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your 6-digit code"
            className={inputClass}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Verifying…" : "Verify & continue"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-xs font-medium text-foreground/60 hover:text-foreground"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form action={handleRequest} className="space-y-4">
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]"
          strokeWidth={1.75}
        />
        <input
          type="email"
          name="email"
          required
          defaultValue={email}
          placeholder={t("login.emailPlaceholder")}
          className={inputClass}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Sending code…" : t("common.continue")}
      </button>
    </form>
  );
}
