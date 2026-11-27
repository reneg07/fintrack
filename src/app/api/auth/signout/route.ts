import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  if (!isSupabaseConfigured()) {
    return apiError(
      "El servicio de autenticación no está configurado.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return apiError(
        "No se pudo cerrar la sesión correctamente.",
        500,
        "SIGNOUT_FAILED",
      );
    }

    return apiSuccess({ signedOut: true }, 200);
  } catch {
    return apiError(
      "Error interno al cerrar la sesión.",
      500,
      "INTERNAL_ERROR",
    );
  }
}
