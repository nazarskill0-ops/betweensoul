"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useFieldArray, useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SPECIALIZATIONS, TOPICS } from "@/features/psychologists/schema";
import { updateMyProfile } from "../api";
import { useMyProfile } from "../hooks/useMyProfile";
import {
  profileFormSchema,
  type CertificateFile,
  type ProfileFormValues,
} from "../schema";
import { EyeIcon, FileIcon, PaperclipIcon, PlusIcon, TrashIcon } from "./icons";
import { ProfilePreviewModal } from "./ProfilePreviewModal";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

function ToggleChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm transition-colors ${
        isActive
          ? "border-sage bg-sage-light text-sage"
          : "border-sand-dark text-ink-muted hover:border-sage"
      }`}
    >
      {label}
    </button>
  );
}

function isPdfFile(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

function CertificateChip({
  file,
  onRemove,
}: {
  file: CertificateFile;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border-[1.5px] border-sand-dark">
      {isPdfFile(file.name) ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-sand p-1 text-ink-muted">
          <FileIcon className="h-5 w-5 shrink-0" />
          <span className="w-full truncate text-center text-[9px]">{file.name}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Видалити ${file.name}`}
        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/70 text-white"
      >
        <TrashIcon className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

function EducationList({
  title,
  basePath,
  fields,
  rows,
  onAdd,
  onRemove,
  onAddFiles,
  onRemoveFile,
  register,
}: {
  title: string;
  basePath: "educationHigher" | "educationCourses";
  fields: { id: string }[];
  rows: ProfileFormValues["educationHigher"];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onAddFiles: (index: number, files: FileList) => void;
  onRemoveFile: (index: number, fileIndex: number) => void;
  register: UseFormRegister<ProfileFormValues>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{title}</p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-sm font-medium text-sage transition-colors hover:text-sage/80"
        >
          <PlusIcon className="h-4 w-4" />
          Додати
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-ink-muted">Ще нічого не додано</p>
      )}

      {fields.map((field, index) => {
        const certificateFiles = rows[index]?.certificateFiles ?? [];
        return (
          <div
            key={field.id}
            className="flex flex-col gap-3 rounded-[10px] border border-sand-dark p-3 sm:flex-row sm:items-start"
          >
            <div className="flex flex-1 flex-col gap-2">
              <input
                placeholder="Заклад / курс"
                className={inputClass}
                {...register(`${basePath}.${index}.title` as const)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Спеціальність"
                  className={inputClass}
                  {...register(`${basePath}.${index}.speciality` as const)}
                />
                <input
                  placeholder="Роки, напр. 2018 – 2022"
                  className={inputClass}
                  {...register(`${basePath}.${index}.years` as const)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {certificateFiles.map((file, fileIndex) => (
                  <CertificateChip
                    key={`${file.url}-${fileIndex}`}
                    file={file}
                    onRemove={() => onRemoveFile(index, fileIndex)}
                  />
                ))}
                <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-dashed border-sand-dark text-ink-muted transition-colors hover:border-sage hover:text-sage">
                  <PaperclipIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[9px]">Додати</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        onAddFiles(index, e.target.files);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="Видалити"
              className="self-start text-ink-muted transition-colors hover:text-rose"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ProfileEditForm() {
  const { data } = useMyProfile();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema) });

  useEffect(() => {
    if (!data) return;
    reset(data);
    setAvatarPreview(data.avatarUrl);
  }, [data, reset]);

  const higherFields = useFieldArray({ control, name: "educationHigher" });
  const coursesFields = useFieldArray({ control, name: "educationCourses" });

  const specializations = watch("specializations") ?? [];
  const topics = watch("topics") ?? [];
  const offersCoupleTherapy = watch("offersCoupleTherapy");
  const priceMinor = watch("priceMinor");
  const couplePriceMinor = watch("couplePriceMinor");
  const educationHigherRows = watch("educationHigher") ?? [];
  const educationCoursesRows = watch("educationCourses") ?? [];
  const draftValues = watch();

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["psychologist-dashboard", "my-profile"] }),
  });

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setValue("avatarUrl", url);
  }

  function toggleValue(field: "specializations" | "topics", value: string) {
    const current = field === "specializations" ? specializations : topics;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next, { shouldValidate: true });
  }

  function addCertificateFiles(
    basePath: "educationHigher" | "educationCourses",
    index: number,
    files: FileList
  ) {
    const rows = basePath === "educationHigher" ? educationHigherRows : educationCoursesRows;
    const current = rows[index]?.certificateFiles ?? [];
    const next = [
      ...current,
      ...Array.from(files).map((file) => ({ url: URL.createObjectURL(file), name: file.name })),
    ];
    setValue(`${basePath}.${index}.certificateFiles`, next, { shouldValidate: true });
  }

  function removeCertificateFile(
    basePath: "educationHigher" | "educationCourses",
    index: number,
    fileIndex: number
  ) {
    const rows = basePath === "educationHigher" ? educationHigherRows : educationCoursesRows;
    const current = rows[index]?.certificateFiles ?? [];
    setValue(
      `${basePath}.${index}.certificateFiles`,
      current.filter((_, i) => i !== fileIndex),
      { shouldValidate: true }
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border-[1.5px] border-sand-dark bg-sage-light p-5">
        <p className="text-sm text-ink">
          Перегляньте, як профіль побачать клієнти — разом із ще незбереженими змінами.
        </p>
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
        >
          <EyeIcon className="h-4 w-4 shrink-0" />
          Переглянути профіль як побачать клієнти
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        {avatarPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarPreview}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-full bg-sage-light" />
        )}
        <label className="cursor-pointer rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage">
          Змінити фото
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <label className="mb-1.5 block text-sm font-medium">Про мене</label>
        <textarea rows={5} className={inputClass} {...register("aboutMe")} />
        {errors.aboutMe && <span className={errorClass}>{errors.aboutMe.message}</span>}
      </div>

      <div className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <h2 className="font-display text-lg text-ink">Освіта</h2>
        <EducationList
          title="Вища освіта"
          basePath="educationHigher"
          fields={higherFields.fields}
          rows={educationHigherRows}
          onAdd={() =>
            higherFields.append({ title: "", speciality: "", years: "", certificateFiles: [] })
          }
          onRemove={higherFields.remove}
          onAddFiles={(index, files) => addCertificateFiles("educationHigher", index, files)}
          onRemoveFile={(index, fileIndex) =>
            removeCertificateFile("educationHigher", index, fileIndex)
          }
          register={register}
        />
        <EducationList
          title="Курси"
          basePath="educationCourses"
          fields={coursesFields.fields}
          rows={educationCoursesRows}
          onAdd={() =>
            coursesFields.append({ title: "", speciality: "", years: "", certificateFiles: [] })
          }
          onRemove={coursesFields.remove}
          onAddFiles={(index, files) => addCertificateFiles("educationCourses", index, files)}
          onRemoveFile={(index, fileIndex) =>
            removeCertificateFile("educationCourses", index, fileIndex)
          }
          register={register}
        />
      </div>

      <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <label className="mb-2 block text-sm font-medium">Методи роботи</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <ToggleChip
              key={s}
              label={s}
              isActive={specializations.includes(s)}
              onClick={() => toggleValue("specializations", s)}
            />
          ))}
        </div>
        {errors.specializations && (
          <span className={errorClass}>{errors.specializations.message}</span>
        )}
      </div>

      <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <label className="mb-2 block text-sm font-medium">Теми, з якими працюю</label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <ToggleChip
              key={t}
              label={t}
              isActive={topics.includes(t)}
              onClick={() => toggleValue("topics", t)}
            />
          ))}
        </div>
        {errors.topics && <span className={errorClass}>{errors.topics.message}</span>}
      </div>

      <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <h2 className="font-display text-lg text-ink">Індивідуальна сесія</h2>
        <p className="-mt-2 text-xs text-ink-muted">
          Зміна ціни діє тільки для нових бронювань — уже заброньовані сесії залишаються за
          попередньою ціною.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Ціна, ₴</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={priceMinor ? priceMinor / 100 : ""}
              onChange={(e) =>
                setValue("priceMinor", Math.round(Number(e.target.value) * 100), {
                  shouldValidate: true,
                })
              }
            />
            {errors.priceMinor && <span className={errorClass}>{errors.priceMinor.message}</span>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Тривалість, хв</label>
            <div
              className={`${inputClass} cursor-not-allowed text-ink-muted`}
              aria-disabled="true"
            >
              50 хв
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              Однакова тривалість для всіх психологів, не редагується.
            </p>
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            className="accent-sage"
            {...register("offersCoupleTherapy")}
          />
          Пропоную парну терапію
        </label>

        {offersCoupleTherapy && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ціна парної сесії, ₴</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={couplePriceMinor ? couplePriceMinor / 100 : ""}
                onChange={(e) =>
                  setValue(
                    "couplePriceMinor",
                    e.target.value ? Math.round(Number(e.target.value) * 100) : null,
                    { shouldValidate: true }
                  )
                }
              />
              {errors.couplePriceMinor && (
                <span className={errorClass}>{errors.couplePriceMinor.message}</span>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Тривалість парної сесії, хв
              </label>
              <input
                type="number"
                min={10}
                className={inputClass}
                {...register("coupleSessionDurationMinutes", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              {errors.coupleSessionDurationMinutes && (
                <span className={errorClass}>
                  {errors.coupleSessionDurationMinutes.message}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Профіль збережено</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Зберігаємо..." : "Зберегти профіль"}
      </button>

      {isPreviewOpen && (
        <ProfilePreviewModal draft={draftValues} onClose={() => setIsPreviewOpen(false)} />
      )}
    </form>
  );
}
