const DASHBOARD_ROUTE_PREFIXES = ["/dashboard", "/psychologist-dashboard", "/admin"];

/**
 * Кабінети (клієнта, психолога й адмінки) мають власний бічний навбар із лого —
 * глобальні AppHeader/AppFooter там не рендеряться.
 */
export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
