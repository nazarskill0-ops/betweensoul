const CHROMELESS_ROUTE_PREFIXES = [
  "/dashboard",
  "/psychologist-dashboard",
  "/admin",
  "/pidbir",
];

/**
 * Маршрути без глобального хрому: кабінети (клієнта, психолога, адмінки) мають
 * власний бічний навбар із лого, а підбір — самодостатній флоу, де хедер із
 * меню каталогу лише відволікає. Обидва самі малюють лого як шлях назад.
 */
export function isChromelessRoute(pathname: string): boolean {
  return CHROMELESS_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
