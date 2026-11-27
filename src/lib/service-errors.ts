import { apiError } from "@/lib/api-response";

export class ServiceError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = "Debes iniciar sesión para realizar esta operación.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class BadRequestError extends ServiceError {
  constructor(
    message: string,
    code = "BAD_REQUEST",
    details?: Record<string, string[]>,
  ) {
    super(message, 400, code, details);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message = "El recurso solicitado no existe o no está disponible.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends ServiceError {
  constructor(
    message: string,
    code = "CONFLICT",
    details?: Record<string, string[]>,
  ) {
    super(message, 409, code, details);
  }
}

export class ServiceUnavailableError extends ServiceError {
  constructor(
    message = "El servicio de datos no está configurado en este entorno.",
  ) {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}

/**
 * Safely converts ServiceError or unknown exceptions into standardized API responses
 * without ever exposing stack traces, PostgreSQL schema details, or internal SQL messages.
 */
export function handleRouteError(error: unknown, fallbackMessage: string) {
  if (error instanceof ServiceError) {
    return apiError(error.message, error.status, error.code, error.details);
  }
  return apiError(fallbackMessage, 500, "INTERNAL_ERROR");
}
