import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateProfileSchema } from "@/schemas/profile.schema";
import {
  getAuthenticatedProfile,
  updateAuthenticatedProfileName,
} from "@/services/profile.service";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return apiError(
      "El servicio de autenticación no está configurado.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return apiError(
        "Debes iniciar sesión para consultar tu perfil.",
        401,
        "UNAUTHORIZED",
      );
    }

    return apiSuccess(profile, 200);
  } catch {
    return apiError(
      "No fue posible consultar tu perfil.",
      500,
      "INTERNAL_ERROR",
    );
  }
}

export async function PATCH(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Cuerpo JSON inválido.", 400, "INVALID_JSON");
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return apiError(
      "Los datos proporcionados no son válidos.",
      400,
      "VALIDATION_ERROR",
      fieldErrors,
    );
  }

  try {
    const updated = await updateAuthenticatedProfileName(parsed.data.fullName);
    if (!updated) {
      return apiError(
        "Debes iniciar sesión para actualizar tu perfil.",
        401,
        "UNAUTHORIZED",
      );
    }

    return apiSuccess(updated, 200);
  } catch {
    return apiError(
      "No fue posible actualizar tu perfil en este momento.",
      500,
      "INTERNAL_ERROR",
    );
  }
}
