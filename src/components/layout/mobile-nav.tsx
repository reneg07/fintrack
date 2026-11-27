"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SidebarNavList } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Abrir menú lateral"
              className="size-10 border-border bg-card"
            />
          }
        >
          <Menu className="size-5" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[272px] border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-white [&>button]:hover:bg-white/10"
        >
          <SheetHeader className="border-b border-sidebar-border px-5 py-4 text-left">
            <SheetTitle>
              <BrandLogo variant="dark" showTagline />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navegación principal de FinTrack
            </SheetDescription>
          </SheetHeader>

          <SidebarNavList onNavigate={() => setOpen(false)} />

          <div className="mt-auto border-t border-sidebar-border p-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-emerald-100/85 hover:text-white"
            >
              Volver a la página pública
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
