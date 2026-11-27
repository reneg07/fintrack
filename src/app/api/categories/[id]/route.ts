import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { updateCategorySchema } from "@/schemas/category.schema";
import { formatZodFieldErrors, uuidSchema } from "@/schemas/common.schema";
import {
  deleteCategory,
  updateCategory,
} from "@/services/categories.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  const { id } = await context.params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return apiError(
      "El identificador de la categoría no es válido.",
      400,
      "INVALID_ID",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Cuerpo JSON inválido.", 400, "INVALID_JSON");
  }

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Los datos para actualizar la categoría no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const updated = await updateCategory(parsedId.data, parsed.data);
    return apiSuccess(updated, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible actualizar la categoría.");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  const { id } = await context.params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return apiError(
      "El identificador de la categoría no es válido.",
      400,
      "INVALID_ID",
    );
  }

  try {
    const result = await deleteCategory(parsedId.data);
    return apiSuccess(result, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible eliminar la categoría.");
  }
}
