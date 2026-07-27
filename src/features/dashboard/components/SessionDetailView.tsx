"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  FlagIcon,
} from "@/features/psychologists/components/icons";
import { formatSlotRange } from "@/features/psychologists/utils/formatSlotRange";
import { useClientSessions } from "../hooks/useClientSessions";
import { SESSION_TYPE_LABELS, type ClientSession } from "../schema";
import { getEffectiveStatus } from "../utils/sessionStatus";
import { AlertIcon, ChevronLeftIcon } from "./icons";

const RESCHEDULE_CANCEL_DEADLINE_HOURS = 24;
const MAX_RESCHEDULE_COUNT = 1;

const STATUS_LABELS: Record<ClientSession["status"], string> = {
  confirmed: "Заплановано",
  pending_payment: "Очікує оплати",
  completed: "Проведений",
  cancelled: "Скасовано",
};

const STATUS_COLOR_CLASSES: Record<ClientSession["status"], string> = {
  confirmed: "text-sage",
  pending_payment: "text-rose",
  completed: "text-ink-muted",
  cancelled: "text-rose",
};

function isFutureSession(session: ClientSession): boolean {
  return (
    new Date(session.startsAt).getTime() > Date.now() &&
    getEffectiveStatus(session) !== "cancelled"
  );
}

function hoursUntilStart(session: ClientSession): number {
  return (new Date(session.startsAt).getTime() - Date.now()) / (60 * 60 * 1000);
}

const INFO_ITEMS = [
  `Ви можете перенести сеанс лише ${MAX_RESCHEDULE_COUNT} раз та не пізніше ніж за ${RESCHEDULE_CANCEL_DEADLINE_HOURS} години до його початку.`,
  `Ви можете скасувати сеанс (і він повернеться на ваш баланс) не пізніше ніж за ${RESCHEDULE_CANCEL_DEADLINE_HOURS} години до його початку.`,
  "Після перенесення сеансу ви не можете повернути гроші за нього.",
];

export function SessionDetailView({ id }: { id: string }) {
  const { data, isLoading } = useClientSessions();

  if (isLoading) {
    return (
      <div className="mx-auto h-96 w-full max-w-lg animate-pulse rounded-card bg-sand" />
    );
  }

  const session = data?.find((s) => s.id === id);
  if (!session) {
    notFound();
  }

  const start = new Date(session.startsAt);
  const isFuture = isFutureSession(session);
  const withinDeadline = hoursUntilStart(session) >= RESCHEDULE_CANCEL_DEADLINE_HOURS;
  const canRescheduleOrCancel = isFuture && withinDeadline;
  const effectiveStatus = getEffectiveStatus(session);
  const StatusIcon =
    effectiveStatus === "cancelled"
      ? CloseIcon
      : effectiveStatus === "pending_payment"
        ? ClockIcon
        : CheckIcon;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/sessions"
          aria-label="Назад"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl text-ink">Ваш сеанс</h1>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-6 text-center">
        <p className="font-display text-xl font-bold text-ink">{session.psychologistName}</p>

        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="flex items-center justify-center gap-2 text-ink">
            <CalendarIcon className="h-4 w-4 shrink-0 text-sage" />
            {start.toLocaleDateString("uk-UA", { weekday: "short", day: "numeric", month: "numeric", year: "numeric" })}
          </div>
          <div className="flex items-center justify-center gap-2 text-ink">
            <ClockIcon className="h-4 w-4 shrink-0 text-sage" />
            {formatSlotRange(start, session.durationMinutes)} (за Києвом)
          </div>
          <div className={`flex items-center justify-center gap-2 font-medium ${STATUS_COLOR_CLASSES[effectiveStatus]}`}>
            <StatusIcon className="h-4 w-4 shrink-0" />
            {STATUS_LABELS[effectiveStatus]}
          </div>
          <div className="flex items-center justify-center gap-2 text-ink">
            <FlagIcon className="h-4 w-4 shrink-0 text-sage" />
            {SESSION_TYPE_LABELS[session.type]}
          </div>
        </div>

        <button
          type="button"
          disabled={!isFuture}
          className="w-full rounded-full bg-sage px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-ink-muted"
        >
          Приєднатись
        </button>

        <div className="w-full border-t border-sand-dark" />

        <div className="flex w-full items-center justify-center gap-6 text-sm font-medium">
          <button
            type="button"
            disabled={!canRescheduleOrCancel}
            className="text-sage transition-colors hover:text-sage/80 disabled:cursor-not-allowed disabled:text-ink-muted/50"
          >
            Перенести
          </button>
          <button
            type="button"
            disabled={!canRescheduleOrCancel}
            className="text-sage transition-colors hover:text-sage/80 disabled:cursor-not-allowed disabled:text-ink-muted/50"
          >
            Скасувати без повернення коштів
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
        {INFO_ITEMS.map((text) => (
          <div
            key={text}
            className="flex items-start gap-3 rounded-card bg-rose/10 p-4 text-sm text-ink"
          >
            <AlertIcon className="h-5 w-5 shrink-0 text-rose" />
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
