import type { TranslationKey } from "@/lib/preferences/translations";

export type VendorSignupStepId = "business" | "security" | "identity";

export const VENDOR_SIGNUP_STEPS: VendorSignupStepId[] = [
  "business",
  "security",
  "identity",
];

export const VENDOR_SIGNUP_STEP_LABEL_KEYS: Record<VendorSignupStepId, TranslationKey> = {
  business: "vendor.signup.steps.business",
  security: "vendor.signup.steps.security",
  identity: "vendor.signup.steps.identity",
};

export const VENDOR_BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company (LLC)",
  "Corporation",
  "Other",
] as const;

export const VENDOR_PHONE_COUNTRY_CODES = [
  { value: "+234", label: "🇳🇬 +234" },
  { value: "+233", label: "🇬🇭 +233" },
  { value: "+254", label: "🇰🇪 +254" },
  { value: "+27", label: "🇿🇦 +27" },
] as const;

export const VENDOR_ID_ACCEPT = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";
export const VENDOR_ID_MAX_BYTES = 5 * 1024 * 1024;

export type VendorSignupFormState = {
  businessName: string;
  businessType: string;
  cacRegistrationNumber: string;
  businessAddress: string;
  ownerFullName: string;
  ownerEmail: string;
  phoneCountryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  otpDigits: string[];
  otpSent: boolean;
  // Short-lived token returned by the backend verify-otp; carried to the final
  // signup submit as proof the email was verified. Its presence IS "verified".
  signupToken: string;
  governmentIdFileName: string;
  governmentIdPreviewUrl: string;
  // Storage reference (objectPath) once the government ID uploads, submitted
  // on signup so the backend links the stored file.
  governmentIdObjectPath: string;
  agreedToTerms: boolean;
};

export const EMPTY_VENDOR_SIGNUP_FORM: VendorSignupFormState = {
  businessName: "",
  businessType: "",
  cacRegistrationNumber: "",
  businessAddress: "",
  ownerFullName: "",
  ownerEmail: "",
  phoneCountryCode: "+234",
  phoneNumber: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
  otpDigits: ["", "", "", "", "", ""],
  otpSent: false,
  signupToken: "",
  governmentIdFileName: "",
  governmentIdPreviewUrl: "",
  governmentIdObjectPath: "",
  agreedToTerms: false,
};

export function getNextVendorSignupStep(step: VendorSignupStepId): VendorSignupStepId | null {
  const index = VENDOR_SIGNUP_STEPS.indexOf(step);
  return index < VENDOR_SIGNUP_STEPS.length - 1 ? VENDOR_SIGNUP_STEPS[index + 1]! : null;
}

export function getPreviousVendorSignupStep(step: VendorSignupStepId): VendorSignupStepId | null {
  const index = VENDOR_SIGNUP_STEPS.indexOf(step);
  return index > 0 ? VENDOR_SIGNUP_STEPS[index - 1]! : null;
}

export function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };
}

export function isPasswordValid(password: string) {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.hasNumber && checks.hasUppercase;
}

export function isOtpComplete(digits: string[]) {
  return digits.every((digit) => /^\d$/.test(digit));
}

export function getVendorSignupBusinessMissingFields(
  form: VendorSignupFormState,
): TranslationKey[] {
  const missing: TranslationKey[] = [];

  if (!form.businessName.trim()) missing.push("vendor.signup.fields.businessName");
  if (!form.businessType.trim()) missing.push("vendor.signup.fields.businessType");
  if (!form.cacRegistrationNumber.trim()) {
    missing.push("vendor.signup.fields.cacRegistrationNumber");
  }
  if (!form.businessAddress.trim()) missing.push("vendor.signup.fields.businessAddress");
  if (!form.ownerFullName.trim()) missing.push("vendor.signup.fields.ownerFullName");
  if (!form.ownerEmail.trim()) missing.push("vendor.signup.fields.ownerEmail");
  if (!form.phoneNumber.trim()) missing.push("vendor.signup.fields.phoneNumber");
  if (!form.dateOfBirth.trim()) missing.push("vendor.signup.fields.dateOfBirth");

  return missing;
}

export function isVendorSignupStepValid(step: VendorSignupStepId, form: VendorSignupFormState) {
  switch (step) {
    case "business":
      return getVendorSignupBusinessMissingFields(form).length === 0;
    case "security":
      return (
        Boolean(form.signupToken) &&
        isPasswordValid(form.password) &&
        form.password === form.confirmPassword
      );
    case "identity":
      // Require the upload to have completed (objectPath present), not just a
      // local preview — otherwise the ID would submit without a stored file.
      return Boolean(form.governmentIdObjectPath) && form.agreedToTerms;
  }
}
