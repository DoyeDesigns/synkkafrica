"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import {
  requestAdminPasswordReset,
  resetAdminPassword,
} from "@/lib/api/admin-auth";
import { ApiError } from "@/lib/api/backend";

const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 12;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const inputClassName =
  "mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15";

const primaryButtonClassName =
  "h-11 w-full rounded-lg bg-[#135391] text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-2";

// Nest's ValidationPipe returns `message` as a string or an array of strings.
function backendMessage(err: ApiError): string {
  const body = err.body;
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(" ");
    if (typeof message === "string") return message;
  }
  return err.message;
}

export function AdminForgotPasswordContent() {
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
      router.push("/admin/login?reset=success");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [done, router]);

  const sendCode = async () => {
    if (sending) return;
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setSending(true);
    try {
      await requestAdminPasswordReset(trimmed);
      setStep("reset");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      window.setTimeout(() => codeRef.current?.focus(), 0);
    } catch {
      setError("Could not send a code. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendCode();
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetAdminPassword({
        email: email.trim().toLowerCase(),
        code,
        newPassword: password,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("That code is invalid or expired.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError(backendMessage(err));
      } else {
        setError("Could not reset your password. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const changeEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
    setResendSeconds(0);
  };

  const errorBox = error ? (
    <p
      role="alert"
      className="rounded-lg bg-[#FDF2F2] px-3 py-2 text-xs font-medium font-satoshi text-[#C0392B]"
    >
      {error}
    </p>
  ) : null;

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
        Reset admin password
      </h1>

      {done ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-[#E7F6EC] bg-[#E7F6EC] px-4 py-3 text-sm font-medium font-satoshi text-[#2E7D32]"
        >
          Password updated. Redirecting you to sign in — you&apos;ll still need
          your authenticator code.
        </p>
      ) : step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4" noValidate>
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            Enter your admin email and we&apos;ll send you a 6-digit code to set
            a new password. Your authenticator app stays the same — you&apos;ll
            still need its code to sign in.
          </p>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={Boolean(error)}
              className={inputClassName}
            />
          </label>
          {errorBox}
          <button
            type="submit"
            disabled={sending}
            className={primaryButtonClassName}
          >
            {sending ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="mt-6 space-y-4" noValidate>
          <p
            role="status"
            className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-xs font-medium font-satoshi text-[#676565]"
          >
            If an account exists for that email, we&apos;ve sent a 6-digit
            code.
          </p>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Email code
            </span>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              title="The 6-digit code from your email"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              className={`${inputClassName} tracking-widest`}
              placeholder="123456"
            />
          </label>
          <div className="-mt-2 flex items-center justify-between gap-2 text-xs font-medium font-satoshi">
            <button
              type="button"
              onClick={changeEmail}
              className="rounded text-[#676565] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
            >
              Use a different email
            </button>
            {resendSeconds > 0 ? (
              <span className="text-[#9A9A9A]">
                Resend code in {resendSeconds}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={sending}
                className="rounded font-semibold text-[#135391] hover:underline disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
              >
                {sending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              New password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-describedby="reset-password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                className={`${inputClassName} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#9E9E9E] hover:text-[#135391] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
            <span
              id="reset-password-hint"
              className={`mt-1 block text-xs font-medium font-satoshi ${
                password && password.length < MIN_PASSWORD_LENGTH
                  ? "text-[#9A7200]"
                  : "text-[#9A9A9A]"
              }`}
            >
              At least {MIN_PASSWORD_LENGTH} characters
              {password ? ` (${password.length}/${MIN_PASSWORD_LENGTH})` : ""}
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Confirm new password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(confirm) && confirm !== password}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              className={inputClassName}
            />
            {confirm && confirm !== password ? (
              <span className="mt-1 block text-xs font-medium font-satoshi text-[#C0392B]">
                Passwords don&apos;t match yet.
              </span>
            ) : null}
          </label>
          {errorBox}
          <button
            type="submit"
            disabled={submitting}
            className={primaryButtonClassName}
          >
            {submitting ? "Updating password…" : "Reset password"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center">
        <Link
          href="/admin/login"
          className="rounded text-xs font-semibold font-satoshi text-[#135391] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
