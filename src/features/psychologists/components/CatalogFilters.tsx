"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TOPICS, SPECIALIZATIONS, LANGUAGES, GENDERS, CLIENT_CATEGORIES } from "../schema";

const PRICE_THRESHOLD_MINOR = 170000; // 1700 грн

/*
  Панель фильтров каталога. Каждый выбор пишется прямо в URL через
  router.replace — состояния в useState нет, источник правды один.
*/
export function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getArrayParam = (key: string): string[] => {
    const raw = searchParams.get(key);
    if (!raw) return [];
    return raw.split(",").filter(Boolean);
  };

  const setArrayParam = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleArrayValue = (key: string, value: string) => {
    const current = getArrayParam(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setArrayParam(key, next);
  };

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setPriceRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("priceMax");
    params.delete("priceMin");
    if (range === "under") {
      params.set("priceMax", String(PRICE_THRESHOLD_MINOR));
    } else if (range === "over") {
      params.set("priceMin", String(PRICE_THRESHOLD_MINOR));
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    const service = searchParams.get("service");
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "service"
  );

  const selectedTopics = getArrayParam("topics");
  const selectedSpecializations = getArrayParam("specializations");
  const selectedLanguages = getArrayParam("languages");
  const selectedClientCategories = getArrayParam("clientCategories");
  const selectedGender = searchParams.get("gender") ?? "";
  const priceRangeValue =
    searchParams.get("priceMax") === String(PRICE_THRESHOLD_MINOR)
      ? "under"
      : searchParams.get("priceMin") === String(PRICE_THRESHOLD_MINOR)
        ? "over"
        : "";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-4">
      <FilterDropdown
        label="Тема"
        mode="multi"
        options={TOPICS.map((topic) => ({ value: topic, label: topic }))}
        selectedValues={selectedTopics}
        onToggle={(value) => toggleArrayValue("topics", value)}
        onClear={() => setArrayParam("topics", [])}
      />

      <FilterDropdown
        label="Метод"
        mode="multi"
        options={SPECIALIZATIONS.map((spec) => ({ value: spec, label: spec }))}
        selectedValues={selectedSpecializations}
        onToggle={(value) => toggleArrayValue("specializations", value)}
        onClear={() => setArrayParam("specializations", [])}
      />

      <FilterDropdown
        label="Мова"
        mode="multi"
        options={LANGUAGES.map((lang) => ({ value: lang.value, label: lang.label }))}
        selectedValues={selectedLanguages}
        onToggle={(value) => toggleArrayValue("languages", value)}
        onClear={() => setArrayParam("languages", [])}
      />

      <FilterDropdown
        label="Особливі запити"
        mode="multi"
        options={CLIENT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        selectedValues={selectedClientCategories}
        onToggle={(value) => toggleArrayValue("clientCategories", value)}
        onClear={() => setArrayParam("clientCategories", [])}
      />

      <FilterDropdown
        label="Стать"
        mode="single"
        options={[
          { value: "", label: "Неважливо" },
          ...GENDERS.map((g) => ({ value: g.value, label: g.label })),
        ]}
        selectedValues={[selectedGender]}
        onToggle={(value) => setParam("gender", value)}
        onClear={() => setParam("gender", "")}
      />

      <FilterDropdown
        label="Ціна"
        mode="single"
        options={[
          { value: "", label: "Всі ціни" },
          { value: "under", label: "До 1700 грн" },
          { value: "over", label: "Більше 1700 грн" },
        ]}
        selectedValues={[priceRangeValue]}
        onToggle={setPriceRange}
        onClear={() => setPriceRange("")}
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-rose transition-colors hover:text-rose/80"
        >
          <RefreshIcon className="h-4 w-4" />
          Скинути фільтри
        </button>
      )}
    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterDropdown({
  label,
  mode,
  options,
  selectedValues,
  onToggle,
  onClear,
}: {
  label: string;
  mode: "multi" | "single";
  options: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const activeValue = mode === "single" ? selectedValues[0] : undefined;
  const hasSelection =
    mode === "multi" ? selectedValues.length > 0 : Boolean(activeValue);
  const buttonText = hasSelection
    ? mode === "multi"
      ? `${label} (${selectedValues.length})`
      : `${label}: ${options.find((o) => o.value === activeValue)?.label}`
    : label;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-fit items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-sm whitespace-nowrap transition-colors focus:border-sage focus:text-sage focus:outline-none ${
          hasSelection
            ? "border-sage bg-sage-light text-ink"
            : "border-sand-dark bg-white text-ink hover:border-sage"
        }`}
      >
        {buttonText}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-10 mt-2 w-72 max-w-[90vw] rounded-card border-[1.5px] border-sand-dark bg-white p-3 shadow-lg sm:w-80">
          <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-sage-light"
              >
                <input
                  type={mode === "multi" ? "checkbox" : "radio"}
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  className="h-4 w-4 shrink-0 rounded border-sand-dark accent-sage"
                />
                {option.label}
              </label>
            ))}
          </div>

          <div className="mt-3 border-t border-sand-dark pt-3">
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-rose transition-colors hover:text-rose/80"
            >
              Очистити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
