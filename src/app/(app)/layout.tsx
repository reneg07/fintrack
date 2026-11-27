import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getAuthenticatedProfile } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Authoritative server-side verification (defense in depth alongside src/proxy.ts)
  const user = await getAuthenticatedProfile();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
