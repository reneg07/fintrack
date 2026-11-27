export type AuthErrorContext = "login" | "register" | "callback";

interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

/**
 * Maps Supabase Auth errors to clear, safe Spanish messages without disclosing
 * unnecessary account existence details during sign-in.
 */
export function mapAuthErrorMessage(
  error: AuthErrorLike | null | undefined,
  context: AuthErrorContext,
): string {
  const message = (error?.message ?? "").toLowerCase();
  const code = (error?.code ?? "").toLowerCase();

  if (
    message.includes("supabase no está configurado") ||
    code === "service_unavailable"
  ) {
    return "El servicio de autenticación aún no está configurado en este entorno (.env.local).";
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error?.status === 429 ||
    message.includes("rate limit")
  ) {
    return "Has realizado demasiados intentos en poco tiempo. Espera unos minutos e inténtalo nuevamente.";
  }

  if (context === "login") {
    if (
      code === "email_not_confirmed" ||
      message.includes("email not confirmed")
    ) {
      return "Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.";
    }
    if (
      code === "invalid_credentials" ||
      message.includes("invalid login credentials")
    ) {
      return "Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.";
    }
    return "No fue posible iniciar sesión en este momento. Verifica tus credenciales e inténtalo de nuevo.";
  }

  if (context === "register") {
    if (
      code === "user_already_exists" ||
      code === "email_exists" ||
      message.includes("already registered") ||
      message.includes("already exists")
    ) {
      return "No fue posible completar el registro con este correo. Si ya tienes una cuenta, intenta iniciar sesión.";
    }
    if (
      code === "weak_password" ||
      message.includes("password should be at least")
    ) {
      return "La contraseña no cumple con los requisitos mínimos de seguridad.";
    }
    if (
      code === "email_address_invalid" ||
      message.includes("invalid email")
    ) {
      return "El formato del correo electrónico no es válido.";
    }
    return "No fue posible crear tu cuenta en este momento. Inténtalo nuevamente.";
  }

  return "El enlace de confirmación no es válido o ha expirado. Solicita un nuevo acceso o inicia sesión.";
}
