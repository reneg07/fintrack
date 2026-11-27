import { apiError, apiSuccess } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import { dashboardQuerySchema } from "@/schemas/reports.schema";
import { requireAuthenticatedContext } from "@/services/_auth";
import { getDashboardData } from "@/services/dashboard.service";

export async function GET(request: Request) {
  try {
    await requireAuthenticatedContext();

    const { searchParams } = new URL(request.url);
    const parsed = dashboardQuerySchema.safeParse({
      period: searchParams.get("period") || undefined,
    });

    if (!parsed.success) {
      return apiError(
        "El período solicitado no es válido.",
        400,
        "VALIDATION_ERROR",
        formatZodFieldErrors(parsed.error.issues),
      );
    }

    const payload = await getDashboardData(parsed.data.period);
    return apiSuccess(payload, 200, { period: payload.period });
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible calcular tu resumen financiero.",
    );
  }
}
