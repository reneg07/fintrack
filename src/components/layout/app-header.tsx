"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, Home, LogIn, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getActiveNavItem } from "@/components/layout/nav-items";
import { DEMO_USER } from "@/lib/demo-data";

export function AppHeader() {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground sm:text-base">
            {activeItem.label}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {activeItem.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <Badge
          variant="outline"
          className="hidden gap-1.5 border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex"
        >
          <Globe className="size-3.5 text-success-text" aria-hidden="true" />
          USD · El Salvador
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-lg border-border bg-card px-2.5 hover:bg-secondary"
              />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-brand-dark text-xs font-semibold text-brand-accent">
                EM
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-left text-xs font-medium text-foreground md:inline">
              {DEMO_USER.fullName}
            </span>
            <ChevronDown
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5 py-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {DEMO_USER.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {DEMO_USER.email}
                  </p>
                  <span className="pt-1 text-[11px] font-medium text-success-text">
                    Perfil de demostración (Fase 02)
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="size-4" aria-hidden="true" />
              Configuración de perfil
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/" />}>
              <Home className="size-4" aria-hidden="true" />
              Ir a la landing pública
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/login" />}>
              <LogIn className="size-4" aria-hidden="true" />
              Pantalla de inicio de sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
