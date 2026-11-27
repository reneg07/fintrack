import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { handleRouteError } from "@/lib/service-errors";
import { formatZodFieldErrors } from "@/schemas/common.schema";
import { exportQuerySchema } from "@/schemas/reports.schema";
import { requireAuthenticatedContext } from "@/services/_auth";
import { exportTransactionsCsv } from "@/services/reports.service";

export async function GET(request: Request) {
  try {
    await requireAuthenticatedContext();

    const { searchParams } = new URL(request.url);
    const parsed = exportQuerySchema.safeParse({
      period: searchParams.get("period") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      type: searchParams.get("type") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      q: searchParams.get("q") || undefined,
    });

    if (!parsed.success) {
      return apiError(
        "Los parámetros para exportar CSV no son válidos.",
        400,
        "VALIDATION_ERROR",
        formatZodFieldErrors(parsed.error.issues),
      );
    }

    const { csvContent, filename } = await exportTransactionsCsv(parsed.data);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, private, max-age=0",
        Vary: "Cookie",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible exportar las transacciones a CSV.",
    );
  }
}
