"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type {
  AccommodationRoomType,
  AddListingFormState,
} from "@/features/vendor/data/vendor-add-listing";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const textareaClassName =
  "min-h-[96px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type AccommodationPricingStepProps = {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
};

type RoomTypeDraft = {
  name: string;
  description: string;
  maxGuests: string;
  pricePerNight: string;
};

const EMPTY_DRAFT: RoomTypeDraft = {
  name: "",
  description: "",
  maxGuests: "",
  pricePerNight: "",
};

export function AccommodationPricingStep({ form, onChange }: AccommodationPricingStepProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoomTypeDraft>(EMPTY_DRAFT);

  const openAddModal = () => {
    setEditingRoomId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  };

  const openEditModal = (room: AccommodationRoomType) => {
    setEditingRoomId(room.id);
    setDraft({
      name: room.name,
      description: room.description,
      maxGuests: room.maxGuests,
      pricePerNight: room.pricePerNight,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRoomId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleSaveRoom = () => {
    if (
      !draft.name.trim() ||
      !draft.description.trim() ||
      !draft.maxGuests.trim() ||
      !draft.pricePerNight.trim()
    ) {
      return;
    }

    const payload: AccommodationRoomType = {
      id: editingRoomId ?? crypto.randomUUID(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      maxGuests: draft.maxGuests.trim(),
      pricePerNight: draft.pricePerNight.trim(),
    };

    if (editingRoomId) {
      onChange({
        roomTypes: form.roomTypes.map((room) => (room.id === editingRoomId ? payload : room)),
      });
    } else {
      onChange({ roomTypes: [...form.roomTypes, payload] });
    }

    closeModal();
  };

  const handleDeleteRoom = (roomId: string) => {
    onChange({ roomTypes: form.roomTypes.filter((room) => room.id !== roomId) });
  };

  const canSave =
    draft.name.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    draft.maxGuests.trim().length > 0 &&
    draft.pricePerNight.trim().length > 0;

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              {t("vendor.addListing.roomTypesPricing")}
            </h3>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {t("vendor.addListing.roomTypesPricingHint")}
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D85A30] bg-white px-4 text-sm font-bold font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF8F5]"
          >
            <Plus className="h-4 w-4" />
            {t("vendor.addListing.addRoomType")}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-sm font-medium font-satoshi">
              <thead>
                <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                  <th className="px-4 py-3 font-bold text-[#2F2F2F]">
                    {t("vendor.addListing.roomType")}
                  </th>
                  <th className="px-4 py-3 font-bold text-[#2F2F2F]">
                    {t("vendor.addListing.roomDescription")}
                  </th>
                  <th className="px-4 py-3 font-bold text-[#2F2F2F]">
                    {t("vendor.addListing.roomMaxGuests")}
                  </th>
                  <th className="px-4 py-3 font-bold text-[#2F2F2F]">
                    {t("vendor.addListing.roomPricePerNight")}
                  </th>
                  <th className="px-4 py-3 font-bold text-[#2F2F2F]">
                    {t("vendor.addListing.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.roomTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <ClipboardList
                        className="mx-auto h-8 w-8 text-[#CFCFCF]"
                        strokeWidth={1.5}
                      />
                      <p className="mt-3 text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {t("vendor.addListing.roomTypesEmptyTitle")}
                      </p>
                      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                        {t("vendor.addListing.roomTypesEmptyHint")}
                      </p>
                    </td>
                  </tr>
                ) : (
                  form.roomTypes.map((room) => (
                    <tr key={room.id} className="border-b border-[#F0F0F0] last:border-b-0">
                      <td className="px-4 py-4 font-semibold text-[#2F2F2F]">{room.name}</td>
                      <td className="max-w-[220px] px-4 py-4 text-[#676565]">
                        <p className="line-clamp-2">{room.description}</p>
                      </td>
                      <td className="px-4 py-4 text-[#676565]">{room.maxGuests}</td>
                      <td className="px-4 py-4 font-semibold text-[#2F2F2F]">
                        {formatPrice("NGN", Number(room.pricePerNight))}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            className="text-xs font-bold font-satoshi text-[#135391] hover:underline"
                          >
                            {t("vendor.addListing.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(room.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold font-satoshi text-[#C0392B] hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("vendor.addListing.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <AddRoomTypeModal
          draft={draft}
          isEditing={Boolean(editingRoomId)}
          canSave={canSave}
          onChange={setDraft}
          onClose={closeModal}
          onSave={handleSaveRoom}
        />
      ) : null}
    </>
  );
}

function AddRoomTypeModal({
  draft,
  isEditing,
  canSave,
  onChange,
  onClose,
  onSave,
}: {
  draft: RoomTypeDraft;
  isEditing: boolean;
  canSave: boolean;
  onChange: (draft: RoomTypeDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-room-type-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3
          id="add-room-type-title"
          className="text-xl font-bold font-satoshi text-[#2F2F2F]"
        >
          {isEditing
            ? t("vendor.addListing.editRoomTypeModalTitle")
            : t("vendor.addListing.addRoomTypeModalTitle")}
        </h3>

        <div className="mt-6 space-y-4">
          <ModalField label={t("vendor.addListing.roomType")} required>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
              placeholder={t("vendor.addListing.roomTypePlaceholder")}
              className={inputClassName}
            />
          </ModalField>

          <ModalField label={t("vendor.addListing.roomDescription")} required>
            <textarea
              value={draft.description}
              onChange={(event) => onChange({ ...draft, description: event.target.value })}
              placeholder={t("vendor.addListing.roomDescriptionPlaceholder")}
              className={textareaClassName}
            />
          </ModalField>

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label={t("vendor.addListing.roomMaxGuests")} required>
              <input
                type="number"
                min={1}
                value={draft.maxGuests}
                onChange={(event) => onChange({ ...draft, maxGuests: event.target.value })}
                placeholder={t("vendor.addListing.roomMaxGuestsPlaceholder")}
                className={inputClassName}
              />
            </ModalField>

            <ModalField label={t("vendor.addListing.roomPricePerNight")} required>
              <input
                type="number"
                min={0}
                value={draft.pricePerNight}
                onChange={(event) => onChange({ ...draft, pricePerNight: event.target.value })}
                placeholder="NGN"
                className={inputClassName}
              />
            </ModalField>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("vendor.addListing.cancel")}
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={onSave}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? t("vendor.addListing.saveRoomType") : t("vendor.addListing.addRoomType")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
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
