import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  Settings,
  Tags,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Resumen",
    description: "Balance, flujo de efectivo y actividad reciente",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Transacciones",
    description: "Registro, búsqueda y filtros de ingresos y gastos",
    icon: ArrowLeftRight,
  },
  {
    href: "/categories",
    label: "Categorías",
    description: "Organización de ingresos y gastos con colores e iconos",
    icon: Tags,
  },
  {
    href: "/budgets",
    label: "Presupuestos",
    description: "Control mensual de límites y alertas por categoría",
    icon: Target,
  },
  {
    href: "/reports",
    label: "Reportes",
    description: "Comparaciones mensuales, tendencias y exportación CSV",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Configuración",
    description: "Perfil personal, preferencias y gestión de sesión",
    icon: Settings,
  },
] as const;

export function getActiveNavItem(pathname: string): AppNavItem {
  return (
    APP_NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? APP_NAV_ITEMS[0]
  );
}
