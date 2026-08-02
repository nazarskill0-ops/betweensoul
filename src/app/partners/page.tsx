import { redirect } from "next/navigation";

/*
  Лендінг для психологів переїхав на /for-psychologists. Старий шлях лишаємо
  редиректом — на нього можуть вести зовнішні посилання й розсилки.
*/
export default function PartnersPage() {
  redirect("/for-psychologists");
}
