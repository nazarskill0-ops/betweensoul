"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../api";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border-[1.5px] border-sand-dark px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
    >
      Вийти
    </button>
  );
}
