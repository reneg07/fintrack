import { apiError, apiSuccess, isValidSameOrigin } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { createCategorySchema } from "@/schemas/category.schema";
import {
  formatZodFieldErrors,
  transactionTypeSchema,
} from "@/schemas/common.schema";
import {
  createCategory,
  listCategoriesWithUsage,
} from "@/services/categories.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type");

  let typeFilter: "income" | "expense" | undefined;
  if (rawType !== null && rawType !== "" && rawType !== "all") {
    const parsedType = transactionTypeSchema.safeParse(rawType);
    if (!parsedType.success) {
      return apiError(
        "El parámetro 'type' debe ser 'income' o 'expense'.",
        400,
        "VALIDATION_ERROR",
      );
    }
    typeFilter = parsedType.data;
  }

  try {
    const categories = await listCategoriesWithUsage({ type: typeFilter });
    return apiSuccess(categories, 200, { count: categories.length });
  } catch (error) {
    return handleRouteError(error, "No fue posible consultar tus categorías.");
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

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Los datos de la categoría no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const created = await createCategory(parsed.data);
    return apiSuccess(created, 201);
  } catch (error) {
    return handleRouteError(error, "No fue posible crear la categoría.");
  }
}
