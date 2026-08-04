"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";

import { loginAdmin, type AdminEnrollment } from "@/lib/api/admin-auth";

export function AdminLoginContent() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
            />
          </label>
          {error ? (
            <p className="text-xs font-medium font-satoshi text-[#C0392B]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#135391] text-sm font-bold font-satoshi text-white disabled:opacity-60"
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
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi tracking-widest outline-none focus:border-[#135391]"
              placeholder="123456"
            />
          </label>
          {error ? (
            <p className="text-xs font-medium font-satoshi text-[#C0392B]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[#135391] text-sm font-bold font-satoshi text-white disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
