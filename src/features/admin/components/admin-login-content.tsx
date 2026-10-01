"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { loginAdmin, type AdminEnrollment } from "@/lib/api/admin-auth";

export function AdminLoginContent() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaTicket, setMfaTicket] = useState("");
  const [enrollment, setEnrollment] = useState<AdminEnrollment | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      setMfaTicket(res.mfaTicket);
      setEnrollment(res.enrollment ?? null);
      setStep("mfa");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("admin", {
      mfaTicket,
      totpCode: totpCode.trim(),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("That code is invalid or expired.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
        Admin sign in
      </h1>

      {step === "password" ? (
        <form onSubmit={handlePassword} className="mt-6 space-y-4">
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
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 pr-10 text-sm font-satoshi outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15"
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
          </label>
          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-[#FDF2F2] px-3 py-2 text-xs font-medium font-satoshi text-[#C0392B]"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#135391] text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-2"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMfa} className="mt-6 space-y-4">
          {enrollment ? (
            <div className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs font-satoshi text-[#676565]">
              <p className="font-semibold text-[#2F2F2F]">
                Set up your authenticator
              </p>
              <p className="mt-1">
                Scan this QR code with your authenticator app, then enter the
                6-digit code.
              </p>
              <div className="mt-3 flex justify-center">
                <div className="rounded-lg border border-[#E5E5E5] bg-white p-3">
                  <QRCodeSVG
                    value={enrollment.otpauthUrl}
                    size={160}
                    marginSize={0}
                    aria-label="Authenticator setup QR code"
                  />
                </div>
              </div>
              <p className="mt-3">
                Can&apos;t scan? Enter this key manually:
              </p>
              <p className="mt-1 break-all font-mono text-[#2F2F2F]">
                {enrollment.secret}
              </p>
            </div>
          ) : null}
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Authenticator code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              pattern="[0-9]{6}"
              title="The 6-digit code from your authenticator app"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi tracking-widest outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15"
              placeholder="123456"
            />
          </label>
          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-[#FDF2F2] px-3 py-2 text-xs font-medium font-satoshi text-[#C0392B]"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#135391] text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-2"
          >
            {loading ? "Verifying…" : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
