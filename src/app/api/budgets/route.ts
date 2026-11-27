import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import {
  budgetQuerySchema,
  createBudgetApiSchema,
} from "@/schemas/budget.schema";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import {
  createBudget,
  listBudgetsForMonth,
} from "@/services/budgets.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = budgetQuerySchema.safeParse({
    month: searchParams.get("month") || undefined,
  });

  if (!parsed.success) {
    return apiError(
      "El mes proporcionado no es válido (usa el formato AAAA-MM).",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const payload = await listBudgetsForMonth(parsed.data.month);
    return apiSuccess(payload, 200, {
      month: payload.month,
      count: payload.items.length,
    });
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible consultar tus presupuestos.",
    );
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

  const parsed = createBudgetApiSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Los datos del presupuesto no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const created = await createBudget(parsed.data);
    return apiSuccess(created, 201);
  } catch (error) {
    return handleRouteError(error, "No fue posible crear el presupuesto.");
  }
}
