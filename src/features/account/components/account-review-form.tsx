"use client";

import { ImagePlus, Star, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { SubmitReviewInput } from "@/features/account/data/account-reviews";
import { useTranslation } from "@/hooks/use-translation";

const MAX_PHOTOS = 3;

type AccountReviewFormProps = {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  onSubmit: (input: SubmitReviewInput) => void;
  onCancel?: () => void;
};

export function AccountReviewForm({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  onCancel,
}: AccountReviewFormProps) {
  const t = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const remaining = MAX_PHOTOS - photos.length;
    const selected = files.slice(0, remaining);

    const encoded = await Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );

    setPhotos((current) => [...current, ...encoded].slice(0, MAX_PHOTOS));
    event.target.value = "";
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      return;
    }

    onSubmit({ rating, text: text.trim(), photos });
    setText("");
    setRating(5);
    setPhotos([]);
  };

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] p-5">
      <div>
        <h2 className="text-base font-bold font-montserrat text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm font-satoshi text-foreground/70">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold font-satoshi text-foreground">
          {t("account.reviews.ratingLabel")}
        </p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const active = value <= rating;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded p-0.5"
                aria-label={`${value} stars`}
              >
                <Star
                  className={`h-6 w-6 ${
                    active ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold font-satoshi text-foreground">
          {t("account.reviews.commentLabel")}
        </span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder={t("account.reviews.commentPlaceholder")}
          className="mt-2 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
        />
      </label>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold font-satoshi text-foreground">
            {t("account.reviews.photosLabel")}
          </p>
          <span className="text-xs font-medium font-satoshi text-foreground/60">
            {t("account.reviews.photosCount", { count: photos.length, max: MAX_PHOTOS })}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <div
              key={`${photo.slice(0, 24)}-${index}`}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#E5E5E5] bg-white"
            >
              <Image src={photo} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() =>
                  setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
                }
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                aria-label={t("account.reviews.removePhoto")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#D0D0D0] bg-white text-[#676565] transition-colors hover:border-[#D85A30] hover:text-[#D85A30]"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-medium font-satoshi">
                {t("account.reviews.addPhoto")}
              </span>
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium font-satoshi text-foreground"
          >
            {t("common.cancel")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-[#D85A30] px-4 py-2 text-sm font-bold font-montserrat text-white"
        >
          {submitLabel ?? t("account.reviews.submit")}
        </button>
      </div>
    </div>
  );
}
