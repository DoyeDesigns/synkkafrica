"use client";

import { CloudUpload, Shield, X } from "lucide-react";

import {
  VENDOR_ID_ACCEPT,
  VENDOR_ID_MAX_BYTES,
  type VendorSignupFormState,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";

type VendorSignupIdentityStepProps = {
  form: VendorSignupFormState;
  onChange: (patch: Partial<VendorSignupFormState>) => void;
};

export function VendorSignupIdentityStep({ form, onChange }: VendorSignupIdentityStepProps) {
  const t = useTranslation();

  const handleUpload = (file: File | null) => {
    if (!file || file.size > VENDOR_ID_MAX_BYTES) {
      return;
    }

    if (form.governmentIdPreviewUrl) {
      URL.revokeObjectURL(form.governmentIdPreviewUrl);
    }

    onChange({
      governmentIdPreviewUrl: URL.createObjectURL(file),
      governmentIdFileName: file.name,
    });
  };

  const removeFile = () => {
    if (form.governmentIdPreviewUrl) {
      URL.revokeObjectURL(form.governmentIdPreviewUrl);
    }

    onChange({
      governmentIdPreviewUrl: "",
      governmentIdFileName: "",
    });
  };

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.signup.sections.governmentId")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.signup.sections.governmentIdHint")}
        </p>
      </div>

      {form.governmentIdPreviewUrl ? (
        <div className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
          <div>
            <p className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              {form.governmentIdFileName}
            </p>
            <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
              {t("vendor.signup.idUploaded")}
            </p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="rounded-full p-1.5 text-[#676565] hover:bg-white hover:text-[#C0392B]"
            aria-label={t("vendor.signup.removeId")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D0D0] bg-[#FAFAFA] px-6 py-10 text-center transition-colors hover:border-[#D85A30] hover:bg-[#FFF8F5]">
          <CloudUpload className="h-8 w-8 text-[#676565]" />
          <span className="mt-3 text-sm font-semibold font-satoshi text-[#2F2F2F]">
            {t("vendor.signup.uploadId")}
          </span>
          <span className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.signup.uploadIdHint")}
          </span>
          <span className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.signup.chooseFile")}
          </span>
          <input
            type="file"
            accept={VENDOR_ID_ACCEPT}
            className="sr-only"
            onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
          />
        </label>
      )}

      <div className="rounded-xl border border-[#FFE0B2] bg-[#FFF8F5] px-4 py-3">
        <div className="flex gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#D85A30]" />
          <p className="text-xs font-medium font-satoshi leading-relaxed text-[#676565]">
            {t("vendor.signup.idPrivacyNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
