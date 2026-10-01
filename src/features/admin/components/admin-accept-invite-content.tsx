"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { acceptAdminInvite } from "@/lib/api/admin-auth";

export function AdminAcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("This invite link is missing its token.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await acceptAdminInvite(token, password);
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch {
      setError("This invite is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
        Accept your admin invite
      </h1>

      {done ? (
        <p className="mt-6 rounded-lg border border-[#E7F6EC] bg-[#E7F6EC] px-4 py-3 text-sm font-medium font-satoshi text-[#2E7D32]">
          Account created. Redirecting you to sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            Set a password to finish setting up your admin account. You&apos;ll
            enrol two-factor authentication the first time you sign in.
          </p>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                aria-describedby="invite-password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
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
            <span
              id="invite-password-hint"
              className={`mt-1 block text-xs font-medium font-satoshi ${
                password && password.length < 12
                  ? "text-[#9A7200]"
                  : "text-[#9A9A9A]"
              }`}
            >
              At least 12 characters
              {password ? ` (${password.length}/12)` : ""}
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              Confirm password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(confirm) && confirm !== password}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={12}
              className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15"
            />
            {confirm && confirm !== password ? (
              <span className="mt-1 block text-xs font-medium font-satoshi text-[#C0392B]">
                Passwords don&apos;t match yet.
              </span>
            ) : null}
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
}
