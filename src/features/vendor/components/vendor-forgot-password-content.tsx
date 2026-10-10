"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";

import { PasswordRule } from "@/features/vendor/components/vendor-signup-security-step";
import {
  getPasswordChecks,
  isPasswordValid,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";
import {
  requestVendorPasswordResetAction,
  resetVendorPasswordAction,
  type VendorPasswordResetResult,
} from "@/lib/auth/vendor-actions";
import type { TranslationKey } from "@/i18n/types";

const RESEND_COOLDOWN_SECONDS = 60;

const inputClassName =
  "h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]";

const iconClassName =
  "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]";

const ERROR_KEYS: Record<
  Extract<VendorPasswordResetResult, { ok: false }>["error"],
  TranslationKey
> = {
  invalidEmail: "vendor.forgotPassword.invalidEmail",
  sendFailed: "vendor.forgotPassword.sendFailed",
  invalidCode: "vendor.forgotPassword.invalidCode",
  validation: "vendor.forgotPassword.passwordRequirements",
  resetFailed: "vendor.forgotPassword.resetFailed",
};

export function VendorForgotPasswordContent() {
  const t = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  const passwordChecks = getPasswordChecks(password);
  const mismatch = Boolean(confirm) && confirm !== password;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setResendSeconds((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => {
      router.push("/vendor/login?reset=success");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [done, router]);

  const errorText = (res: Extract<VendorPasswordResetResult, { ok: false }>) =>
    res.error === "validation" && res.message
      ? res.message
      : t(ERROR_KEYS[res.error]);

  const sendCode = async () => {
    if (sending) return;
    setError(null);
    setSending(true);
    const res = await requestVendorPasswordResetAction(email);
    setSending(false);
    if (!res.ok) {
      setError(errorText(res));
      return;
    }
    setStep("reset");
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
    window.setTimeout(() => codeRef.current?.focus(), 0);
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendCode();
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError(t("vendor.forgotPassword.enterCode"));
      return;
    }
    if (!isPasswordValid(password)) {
      setError(t("vendor.forgotPassword.passwordRequirements"));
      return;
    }
    if (password !== confirm) {
      setError(t("vendor.signup.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    const res = await resetVendorPasswordAction({
      email,
      code,
      newPassword: password,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(errorText(res));
      return;
    }
    setDone(true);
  };

  const changeEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
    setResendSeconds(0);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[557px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/synkafrica-logo.svg"
            alt="SynkAfrica"
            width={88}
            height={88}
            priority
            className="h-[88px] w-[88px]"
          />

          <h1 className="mt-6 text-xl font-bold font-satoshi text-foreground">
            {t("vendor.forgotPassword.title")}
          </h1>

          <p className="mt-3 max-w-[557px] text-base font-medium font-satoshi leading-relaxed text-foreground/80">
            {t("vendor.forgotPassword.intro")}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {done ? (
            <p
              role="status"
              className="rounded-lg bg-[#E7F6EC] px-4 py-3 text-sm font-medium font-satoshi text-[#2E7D32]"
            >
              {t("vendor.forgotPassword.success")}
            </p>
          ) : step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
              <div className="relative">
                <Mail className={iconClassName} strokeWidth={1.75} />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("vendor.forgotPassword.emailPlaceholder")}
                  aria-label={t("vendor.forgotPassword.emailPlaceholder")}
                  aria-invalid={Boolean(error)}
                  className={inputClassName}
                />
              </div>

              {error ? <ErrorMessage>{error}</ErrorMessage> : null}

              <button
                type="submit"
                disabled={sending}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#3A3A3A] text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending
                  ? t("vendor.forgotPassword.sending")
                  : t("vendor.forgotPassword.sendCode")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
              <p
                role="status"
                className="rounded-lg bg-[#F5F8FC] px-4 py-3 text-sm font-medium font-satoshi text-[#004785]"
              >
                {t("vendor.forgotPassword.codeSent")}
              </p>

              <div className="relative">
                <KeyRound className={iconClassName} strokeWidth={1.75} />
                <input
                  ref={codeRef}
                  type="text"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder={t("vendor.forgotPassword.codeLabel")}
                  aria-label={t("vendor.forgotPassword.codeLabel")}
                  className={`${inputClassName} tracking-widest`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium font-satoshi">
                <button
                  type="button"
                  onClick={changeEmail}
                  className="text-[#676565] underline-offset-2 hover:underline"
                >
                  {t("vendor.forgotPassword.changeEmail")}
                </button>
                {resendSeconds > 0 ? (
                  <span className="text-[#676565]">
                    {t("vendor.forgotPassword.resendIn", {
                      seconds: String(resendSeconds).padStart(2, "0"),
                    })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void sendCode()}
                    disabled={sending}
                    className="font-bold text-[#D85A30] transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    {sending
                      ? t("vendor.forgotPassword.sending")
                      : t("vendor.forgotPassword.resend")}
                  </button>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className={iconClassName} strokeWidth={1.75} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("vendor.forgotPassword.newPasswordPlaceholder")}
                    aria-label={t("vendor.forgotPassword.newPassword")}
                    aria-describedby="vendor-reset-password-rules"
                    className={`${inputClassName} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#004785]"
                    aria-label={t("vendor.signup.togglePasswordVisibility")}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                <ul id="vendor-reset-password-rules" className="mt-2 space-y-1">
                  <PasswordRule
                    met={passwordChecks.minLength}
                    label={t("vendor.signup.passwordRules.minLength")}
                  />
                  <PasswordRule
                    met={passwordChecks.hasNumber}
                    label={t("vendor.signup.passwordRules.hasNumber")}
                  />
                  <PasswordRule
                    met={passwordChecks.hasUppercase}
                    label={t("vendor.signup.passwordRules.hasUppercase")}
                  />
                </ul>
              </div>

              <div>
                <div className="relative">
                  <Lock className={iconClassName} strokeWidth={1.75} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder={t(
                      "vendor.forgotPassword.confirmPasswordPlaceholder",
                    )}
                    aria-label={t("vendor.forgotPassword.confirmPassword")}
                    aria-invalid={mismatch}
                    className={inputClassName}
                  />
                </div>
                {mismatch ? (
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#C0392B]">
                    {t("vendor.signup.passwordMismatch")}
                  </p>
                ) : null}
              </div>

              {error ? <ErrorMessage>{error}</ErrorMessage> : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#3A3A3A] text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting
                  ? t("vendor.forgotPassword.submitting")
                  : t("vendor.forgotPassword.submit")}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/vendor/login"
            className="text-sm font-bold font-satoshi text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("vendor.forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
    >
      {children}
    </p>
  );
}
