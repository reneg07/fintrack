import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors, uuidSchema } from "@/schemas/common.schema";
import { updateTransactionApiSchema } from "@/schemas/transaction.schema";
import {
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "@/services/transactions.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return apiError(
      "El identificador de la transacción no es válido.",
      400,
      "INVALID_ID",
    );
  }

  try {
    const tx = await getTransactionById(parsedId.data);
    return apiSuccess(tx, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible consultar la transacción.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  const { id } = await context.params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return apiError(
      "El identificador de la transacción no es válido.",
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

  const parsed = updateTransactionApiSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Los datos para actualizar la transacción no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const updated = await updateTransaction(parsedId.data, parsed.data);
    return apiSuccess(updated, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible actualizar la transacción.");
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
      "El identificador de la transacción no es válido.",
      400,
      "INVALID_ID",
    );
  }

  try {
    const result = await deleteTransaction(parsedId.data);
    return apiSuccess(result, 200);
  } catch (error) {
    return handleRouteError(error, "No fue posible eliminar la transacción.");
  }
}
