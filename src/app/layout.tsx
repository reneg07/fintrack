import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FinTrack — Tus finanzas, bajo control",
    template: "%s | FinTrack",
  },
  description:
    "Aplicación web de gestión de finanzas personales para registrar, organizar y analizar ingresos, gastos, categorías y presupuestos mensuales en USD.",
  applicationName: "FinTrack",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "presupuestos mensuales",
    "FinTrack",
  ],
};

export const viewport: Viewport = {
  themeColor: "#10251F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <TooltipProvider delay={200}>
          {children}
          <Toaster theme="light" richColors position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
