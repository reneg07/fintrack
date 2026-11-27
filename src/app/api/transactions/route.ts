import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import {
  createTransactionApiSchema,
  transactionQuerySchema,
} from "@/schemas/transaction.schema";
import {
  createTransaction,
  listTransactions,
} from "@/services/transactions.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = {
    q: searchParams.get("q") || undefined,
    type: searchParams.get("type") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
  };

  const parsed = transactionQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return apiError(
      "Los filtros de búsqueda de transacciones no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const result = await listTransactions(parsed.data);
    return apiSuccess(result, 200, {
      page: result.pagination.page,
      pageSize: result.pagination.pageSize,
      totalCount: result.pagination.totalCount,
    });
  } catch (error) {
    return handleRouteError(error, "No fue posible consultar las transacciones.");
  }
}

export async function POST(request: Request) {
  if (!isValidSameOrigin(request)) {
    return apiError("Origen de solicitud no permitido.", 403, "FORBIDDEN_ORIGIN");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Cuerpo JSON inválido.", 400, "INVALID_JSON");
  }

  const parsed = createTransactionApiSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Los datos de la transacción no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const created = await createTransaction(parsed.data);
    return apiSuccess(created, 201);
  } catch (error) {
    return handleRouteError(error, "No fue posible registrar la transacción.");
  }
}
