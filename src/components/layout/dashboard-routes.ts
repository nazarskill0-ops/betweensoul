const DASHBOARD_ROUTE_PREFIXES = ["/dashboard", "/psychologist-dashboard"];

/**
 * Кабінети (клієнта й психолога) мають власний бічний навбар із лого —
 * глобальні AppHeader/AppFooter там не рендеряться.
 */
export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
