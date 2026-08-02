const CHROMELESS_ROUTE_PREFIXES = [
  "/dashboard",
  "/psychologist-dashboard",
  "/admin",
  "/pidbir",
  "/for-psychologists/apply",
];

/**
 * Маршрути без глобального хрому: кабінети (клієнта, психолога, адмінки) мають
 * власний бічний навбар із лого, підбір — самодостатній флоу, а анкета
 * психолога — сфокусована форма, де меню каталогу лише відволікає. Кожен із
 * них сам малює лого як шлях назад.
 */
export function isChromelessRoute(pathname: string): boolean {
  return CHROMELESS_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
