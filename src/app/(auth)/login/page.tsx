import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { sanitizeNextPath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta personal de FinTrack.",
};

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const rawError = Array.isArray(params.error) ? params.error[0] : params.error;

  const nextPath = sanitizeNextPath(rawNext, "/dashboard");
  const initialError = rawError
    ? mapAuthErrorMessage({ code: rawError }, "callback")
    : null;

  return <LoginForm nextPath={nextPath} initialError={initialError} />;
}
