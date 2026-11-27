import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import { updateProfileSchema } from "@/schemas/profile.schema";
import { requireAuthenticatedContext } from "@/services/_auth";
import {
  getAuthenticatedProfile,
  updateAuthenticatedProfileName,
} from "@/services/profile.service";

export async function GET() {
  try {
    await requireAuthenticatedContext();
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return apiError(
        "Debes iniciar sesión para consultar tu perfil.",
        401,
        "UNAUTHORIZED",
      );
    }
    return apiSuccess(profile, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible consultar tu perfil.");
  }
}

export async function PATCH(request: Request) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  try {
    await requireAuthenticatedContext();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Cuerpo JSON inválido.", 400, "INVALID_JSON");
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "Los datos proporcionados no son válidos.",
        400,
        "VALIDATION_ERROR",
        formatZodFieldErrors(parsed.error.issues),
      );
    }

    const updated = await updateAuthenticatedProfileName(parsed.data.fullName);
    if (!updated) {
      return apiError(
        "Debes iniciar sesión para actualizar tu perfil.",
        401,
        "UNAUTHORIZED",
      );
    }

    return apiSuccess(updated, 200);
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible actualizar tu perfil en este momento.",
    );
  }
}
