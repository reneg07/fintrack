"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Globe, Home, Loader2, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
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
import type { UserProfile } from "@/types/domain";

function getUserInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface AppHeaderProps {
  user: UserProfile;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const activeItem = getActiveNavItem(pathname);
  const initials = getUserInitials(user.fullName);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) {
        toast.error("No se pudo cerrar la sesión. Inténtalo nuevamente.");
        return;
      }
      toast.success("Sesión cerrada correctamente");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Error de red al cerrar la sesión.");
    } finally {
      setSigningOut(false);
    }
  }

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
          {user.currency} · El Salvador
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
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[150px] truncate text-left text-xs font-medium text-foreground md:inline">
              {user.fullName}
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
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
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
              Página pública
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              {signingOut ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
