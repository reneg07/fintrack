import { apiError, apiSuccess } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import { reportsQuerySchema } from "@/schemas/reports.schema";
import { getReportsData } from "@/services/reports.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = reportsQuerySchema.safeParse({
    period: searchParams.get("period") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });

  if (!parsed.success) {
    return apiError(
      "Los parámetros del reporte no son válidos.",
      400,
      "VALIDATION_ERROR",
      formatZodFieldErrors(parsed.error.issues),
    );
  }

  try {
    const payload = await getReportsData(parsed.data);
    return apiSuccess(payload, 200, {
      period: payload.period,
      count: payload.summary.transactionCount,
    });
  } catch (error) {
    return handleRouteError(error, "No fue posible generar el reporte.");
  }
}
