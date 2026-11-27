import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";
import { getAuthenticatedProfile } from "@/services/profile.service";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Perfil de usuario y gestión de sesión en FinTrack.",
};

export default async function SettingsPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect("/login");
  }

  return <SettingsView profile={profile} />;
}
