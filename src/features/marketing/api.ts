import type { PartnerApplicationValues } from "./schema";

/*
  TODO(backend): записати заявку в Supabase (таблиця на кшталт
  partner_applications) і повідомити команду, замість затримки-заглушки.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitPartnerApplication(
  _values: PartnerApplicationValues
): Promise<void> {
  await delay(300);
}
