"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { APP_NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

interface SidebarNavListProps {
  onNavigate?: () => void;
}

export function SidebarNavList({ onNavigate }: SidebarNavListProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación de la aplicación" className="flex-1 space-y-1 px-3 py-4">
      <ul className="space-y-1">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-emerald-100/75 hover:bg-white/6 hover:text-white",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-accent"
                  />
                )}
                <Icon
                  className={cn(
                    "size-4.5 shrink-0 transition-colors",
                    isActive
                      ? "text-brand-accent"
                      : "text-emerald-200/70 group-hover:text-emerald-100",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside
      aria-label="Barra lateral de navegación"
      className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link
          href="/dashboard"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sidebar-ring"
        >
          <BrandLogo variant="dark" showTagline />
        </Link>
      </div>

      <SidebarNavList />

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Vista preliminar · Fase 02
          </p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-100/75">
            Datos ficticios para validación visual. Acceso protegido real en
            Fase 03.
          </p>
          <Link
            href="/"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-white underline-offset-4 hover:underline"
          >
            Ir a la landing pública
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
