"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/features/auth/api";
import { LogOutIcon } from "./icons";

export function SettingsSignOutButton() {
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
      className="flex w-fit items-center gap-2 rounded-full border-[1.5px] border-rose px-6 py-2.5 text-sm font-medium text-rose transition-colors hover:bg-rose hover:text-white"
    >
      <LogOutIcon className="h-4 w-4 shrink-0" />
      Вийти з профілю
    </button>
  );
}
