"use client";

import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  getPasswordChecks,
  isOtpComplete,
  VENDOR_PHONE_COUNTRY_CODES,
  type VendorSignupFormState,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type VendorSignupSecurityStepProps = {
  form: VendorSignupFormState;
  onChange: (patch: Partial<VendorSignupFormState>) => void;
};

export function VendorSignupSecurityStep({ form, onChange }: VendorSignupSecurityStepProps) {
  const t = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const passwordChecks = getPasswordChecks(form.password);

  const handlePhoneChange = (patch: Pick<VendorSignupFormState, "phoneCountryCode" | "phoneNumber">) => {
    onChange({
      ...patch,
      otpSent: false,
      otpVerified: false,
      otpDigits: ["", "", "", "", "", ""],
    });
    setResendSeconds(0);
  };

  const canSendOtp = form.phoneNumber.trim().length > 0;

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const handleSendOtp = () => {
    onChange({
      otpSent: true,
      otpVerified: false,
      otpDigits: ["", "", "", "", "", ""],
    });
    setResendSeconds(45);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...form.otpDigits];
    nextDigits[index] = digit;

    onChange({
      otpDigits: nextDigits,
      otpVerified: false,
    });

    if (digit && index < nextDigits.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    if (isOtpComplete(nextDigits)) {
      onChange({
        otpDigits: nextDigits,
        otpVerified: true,
      });
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !form.otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <SectionHeading
          title={t("vendor.signup.sections.phoneVerification")}
          hint={t("vendor.signup.sections.phoneVerificationHint")}
        />

        <FormField label={t("vendor.signup.fields.phoneNumber")} required>
          <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white focus-within:border-[#135391]">
            <div className="relative border-r border-[#E5E5E5]">
              <select
                value={form.phoneCountryCode}
                onChange={(event) =>
                  handlePhoneChange({
                    phoneCountryCode: event.target.value,
                    phoneNumber: form.phoneNumber,
                  })
                }
                className="h-11 appearance-none bg-[#F8F8F8] pl-3 pr-8 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
              >
                {VENDOR_PHONE_COUNTRY_CODES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#676565]" />
            </div>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(event) =>
                handlePhoneChange({
                  phoneCountryCode: form.phoneCountryCode,
                  phoneNumber: event.target.value,
                })
              }
              placeholder={t("vendor.signup.placeholders.phoneNumber")}
              className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
            />
          </div>
        </FormField>

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={!canSendOtp || (resendSeconds > 0 && form.otpSent)}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {form.otpSent ? t("vendor.signup.resendOtp") : t("vendor.signup.sendOtp")}
        </button>

        {form.otpSent ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              {t("vendor.signup.enterOtp")}
            </p>
            <div className="flex flex-wrap gap-2">
              {form.otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  className="h-12 w-12 rounded-lg border border-[#E5E5E5] bg-white text-center text-lg font-bold font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
                />
              ))}
            </div>
            {resendSeconds > 0 ? (
              <p className="text-xs font-medium font-satoshi text-[#676565]">
                {t("vendor.signup.resendIn", {
                  seconds: String(resendSeconds).padStart(2, "0"),
                })}
              </p>
            ) : null}
            {form.otpVerified ? (
              <p className="text-sm font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.signup.otpVerified")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-5 border-t border-[#EEEEEE] pt-6">
        <SectionHeading
          title={t("vendor.signup.sections.accountSecurity")}
          hint={t("vendor.signup.sections.accountSecurityHint")}
        />

        <FormField label={t("vendor.signup.fields.password")} required>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => onChange({ password: event.target.value })}
              placeholder={t("vendor.signup.placeholders.password")}
              className={`${inputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#676565]"
              aria-label={t("vendor.signup.togglePasswordVisibility")}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ul className="mt-2 space-y-1">
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
        </FormField>

        <FormField label={t("vendor.signup.fields.confirmPassword")} required>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) => onChange({ confirmPassword: event.target.value })}
              placeholder={t("vendor.signup.placeholders.confirmPassword")}
              className={`${inputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#676565]"
              aria-label={t("vendor.signup.togglePasswordVisibility")}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.confirmPassword && form.password !== form.confirmPassword ? (
            <p className="text-xs font-medium font-satoshi text-[#C0392B]">
              {t("vendor.signup.passwordMismatch")}
            </p>
          ) : null}
        </FormField>
      </section>
    </div>
  );
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs font-medium font-satoshi">
      <Check className={`h-3.5 w-3.5 ${met ? "text-[#2E7D32]" : "text-[#CFCFCF]"}`} />
      <span className={met ? "text-[#2E7D32]" : "text-[#676565]"}>{label}</span>
    </li>
  );
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">{title}</h3>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{hint}</p>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
