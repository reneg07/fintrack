import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Perfil de usuario y preferencias de FinTrack.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
