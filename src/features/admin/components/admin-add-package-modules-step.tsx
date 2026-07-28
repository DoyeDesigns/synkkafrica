"use client";

import {
  BedDouble,
  Car,
  ChevronDown,
  GripVertical,
  Info,
  MapPin,
  Plane,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  createPackageModule,
  getPackageCatalogByType,
  PACKAGE_MODULE_TYPE_LABEL_KEYS,
  PACKAGE_MODULE_TYPE_STYLES,
  type AddPackageFormState,
  type PackageCatalogItem,
  type PackageModule,
  type PackageModuleType,
} from "@/features/admin/data/admin-add-package";
import { useTranslation } from "@/hooks/use-translation";

const MODULE_TYPES: Array<{
  type: PackageModuleType;
  icon: typeof Plane;
}> = [
  { type: "flight", icon: Plane },
  { type: "accommodation", icon: BedDouble },
  { type: "car", icon: Car },
  { type: "experience", icon: MapPin },
];

type PackageModulesStepProps = {
  form: AddPackageFormState;
  onChange: (patch: Partial<AddPackageFormState>) => void;
};

export function PackageModulesStep({ form, onChange }: PackageModulesStepProps) {
  const t = useTranslation();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [openPanels, setOpenPanels] = useState<PackageModuleType[]>(["flight"]);
  const [searchQueries, setSearchQueries] = useState<Record<PackageModuleType, string>>({
    flight: "",
    accommodation: "",
    car: "",
    experience: "",
  });

  const addModule = (item: PackageCatalogItem) => {
    const alreadyAdded = form.modules.some(
      (module) => module.type === item.type && module.sourceId === item.id,
    );

    if (alreadyAdded) {
      return;
    }

    onChange({ modules: [...form.modules, createPackageModule(item)] });
  };

  const removeModule = (id: string) => {
    onChange({ modules: form.modules.filter((module) => module.id !== id) });
  };

  const reorderModules = (fromId: string, toId: string) => {
    if (fromId === toId) {
      return;
    }

    const fromIndex = form.modules.findIndex((module) => module.id === fromId);
    const toIndex = form.modules.findIndex((module) => module.id === toId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const next = [...form.modules];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved!);
    onChange({ modules: next });
  };

  const togglePanel = (type: PackageModuleType) => {
    setOpenPanels((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  const updateSearch = (type: PackageModuleType, query: string) => {
    setSearchQueries((current) => ({ ...current, [type]: query }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.packages.modules.selectHeading")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("admin.packages.modules.selectHint")}
        </p>
      </div>

      <div className="space-y-3">
        {MODULE_TYPES.map(({ type, icon: Icon }) => (
          <ModuleTypeAccordion
            key={type}
            type={type}
            icon={Icon}
            isOpen={openPanels.includes(type)}
            searchQuery={searchQueries[type]}
            selectedModules={form.modules}
            onToggle={() => togglePanel(type)}
            onSearchChange={(query) => updateSearch(type, query)}
            onAdd={addModule}
          />
        ))}
      </div>

      <div className="rounded-lg bg-[#EBF5FB] px-4 py-3 text-sm font-medium font-satoshi text-[#1565C0]">
        <div className="flex gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("admin.packages.modules.reorderHint")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.packages.modules.addedHeading")}
          </h3>
          <span className="text-xs font-semibold font-satoshi text-[#676565]">
            {form.modules.length} {t("admin.packages.modules.countLabel")}
          </span>
        </div>

        {form.modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D0D0D0] bg-[#FAFAFA] px-6 py-10 text-center">
            <p className="text-sm font-semibold font-satoshi text-[#676565]">
              {t("admin.packages.modules.empty")}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {form.modules.map((module, index) => (
              <ModuleListItem
                key={module.id}
                module={module}
                index={index}
                isDragging={draggingId === module.id}
                onRemove={() => removeModule(module.id)}
                onDragStart={() => setDraggingId(module.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingId) {
                    reorderModules(draggingId, module.id);
                  }
                  setDraggingId(null);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ModuleTypeAccordion({
  type,
  icon: Icon,
  isOpen,
  searchQuery,
  selectedModules,
  onToggle,
  onSearchChange,
  onAdd,
}: {
  type: PackageModuleType;
  icon: typeof Plane;
  isOpen: boolean;
  searchQuery: string;
  selectedModules: PackageModule[];
  onToggle: () => void;
  onSearchChange: (query: string) => void;
  onAdd: (item: PackageCatalogItem) => void;
}) {
  const t = useTranslation();
  const items = getPackageCatalogByType(type);
  const styles = PACKAGE_MODULE_TYPE_STYLES[type];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.subtitle.toLowerCase().includes(normalizedQuery),
      )
    : items;
  const addedCount = selectedModules.filter((module) => module.type === type).length;

  return (
    <div className={`overflow-hidden rounded-xl border bg-white ${styles.border}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FAFAFA] ${styles.border} ${isOpen ? "border-b" : ""}`}
      >
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.badge}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t(PACKAGE_MODULE_TYPE_LABEL_KEYS[type])}
          </span>
          <span className="mt-0.5 block text-xs font-medium font-satoshi text-[#676565]">
            {items.length} {t("admin.packages.modules.availableLabel")}
            {addedCount > 0
              ? ` · ${addedCount} ${t("admin.packages.modules.added").toLowerCase()}`
              : ""}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#676565] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="space-y-3 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("admin.packages.modules.searchPlaceholder")}
              className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] pl-9 pr-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus:bg-white"
            />
          </div>

          {filteredItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
              {t("admin.packages.modules.noResults")}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isAdded = selectedModules.some(
                  (module) => module.type === item.type && module.sourceId === item.id,
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-3"
                  >
                    <p className="text-sm font-semibold font-satoshi text-[#2F2F2F]">{item.title}</p>
                    <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                      {item.subtitle}
                    </p>
                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => onAdd(item)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold font-satoshi text-[#135391] transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-[#676565] disabled:no-underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isAdded ? t("admin.packages.modules.added") : t("admin.packages.modules.add")}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ModuleListItem({
  module,
  index,
  isDragging,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  module: PackageModule;
  index: number;
  isDragging: boolean;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: () => void;
}) {
  const t = useTranslation();
  const styles = PACKAGE_MODULE_TYPE_STYLES[module.type];

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex items-center gap-3 rounded-xl border border-[#EEEEEE] bg-white p-3 shadow-sm transition-opacity ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-[#676565] active:cursor-grabbing"
        aria-label={t("admin.packages.modules.dragHandle")}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
        <Image
          src={module.image}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-satoshi uppercase ${styles.badge}`}>
            {t(PACKAGE_MODULE_TYPE_LABEL_KEYS[module.type])}
          </span>
          <span className="text-xs font-medium font-satoshi text-[#676565]">#{index + 1}</span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {module.title}
        </p>
        <p className="truncate text-xs font-medium font-satoshi text-[#676565]">
          {module.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-2 text-[#676565] transition-colors hover:bg-[#FFF5F5] hover:text-[#C0392B]"
        aria-label={t("admin.packages.modules.remove")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
