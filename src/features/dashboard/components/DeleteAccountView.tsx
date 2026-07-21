"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { deleteClientAccount } from "../api";

export function DeleteAccountView() {
  const [confirmed, setConfirmed] = useState(false);
  const mutation = useMutation({ mutationFn: deleteClientAccount });

  if (mutation.isSuccess) {
    return (
      <p className="text-sm font-medium text-ink">
        Запит на видалення профілю прийнято. Ми надішлемо підтвердження на вашу пошту.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Видалення профілю незворотнє: буде втрачено доступ до історії сесій, улюблених
        психологів та особистих даних.
      </p>

      <label className="flex items-start gap-2.5 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-rose"
        />
        Я розумію, що це рішення незворотнє
      </label>

      <button
        type="button"
        disabled={!confirmed || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="w-fit rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Видаляємо..." : "Видалити профіль назавжди"}
      </button>
    </div>
  );
}
