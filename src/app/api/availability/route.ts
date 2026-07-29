import { NextResponse } from "next/server";

import {
  AvailabilityValidationError,
  getAvailability,
} from "@/features/booking/services/availability.service";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                              SÉCURITÉ ROUTE                                */
/* -------------------------------------------------------------------------- */

const MAX_QUERY_LENGTH = 4_096;

const MAX_SERVICE_PARAMETERS = 10;

const AVAILABILITY_MAX_REQUESTS = 120;

const AVAILABILITY_WINDOW_MS = 15 * 60 * 1000;

const AVAILABILITY_BLOCK_MS = 15 * 60 * 1000;

function noStoreHeaders(
  additionalHeaders?: Record<string, string>,
): HeadersInit {
  return {
    "Cache-Control": "private, no-store, max-age=0",

    Pragma: "no-cache",

    ...additionalHeaders,
  };
}

function jsonResponse(
  body: unknown,
  status = 200,
  additionalHeaders?: Record<string, string>,
) {
  return NextResponse.json(body, {
    status,

    headers: noStoreHeaders(additionalHeaders),
  });
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  try {
    if (request.url.length > MAX_QUERY_LENGTH) {
      return jsonResponse(
        {
          message: "La requête de disponibilité est trop volumineuse.",

          code: "AVAILABILITY_QUERY_TOO_LARGE",
        },
        414,
      );
    }

    const ipAddress = getClientIpAddress(request.headers);

    const rateLimit = await consumeSecurityRateLimit({
      action: "AVAILABILITY_LOOKUP_IP",

      subject: ipAddress,

      maxAttempts: AVAILABILITY_MAX_REQUESTS,

      windowMs: AVAILABILITY_WINDOW_MS,

      blockMs: AVAILABILITY_BLOCK_MS,
    });

    if (!rateLimit.allowed) {
      return jsonResponse(
        {
          message:
            "Trop de recherches de disponibilités ont été effectuées. Réessayez plus tard.",

          code: "AVAILABILITY_RATE_LIMITED",

          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        429,
        {
          "Retry-After": String(Math.max(rateLimit.retryAfterSeconds, 1)),
        },
      );
    }

    const { searchParams } = new URL(request.url);

    const staffId = searchParams.get("staffId")?.trim() ?? "";

    const date = searchParams.get("date")?.trim() ?? "";

    const rawServiceParameters = searchParams.getAll("serviceId");

    if (rawServiceParameters.length > MAX_SERVICE_PARAMETERS) {
      return jsonResponse(
        {
          message: `Vous ne pouvez pas sélectionner plus de ${MAX_SERVICE_PARAMETERS} prestations.`,

          code: "TOO_MANY_SERVICES",
        },
        400,
      );
    }

    const serviceIds = rawServiceParameters
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    const serviceOptions: Array<{
      serviceId: string;
      quantity: number;
    }> = [];

    const rawServiceOptions = searchParams.get("serviceOptions");

    if (rawServiceOptions) {
      let parsed: unknown;

      try {
        parsed = JSON.parse(rawServiceOptions) as unknown;
      } catch {
        return jsonResponse(
          {
            message: "Les quantités de prestations sont invalides.",
            code: "INVALID_SERVICE_OPTIONS",
          },
          400,
        );
      }

      if (!Array.isArray(parsed)) {
        return jsonResponse(
          {
            message: "Les quantités de prestations sont invalides.",
            code: "INVALID_SERVICE_OPTIONS",
          },
          400,
        );
      }

      for (const value of parsed) {
        if (
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value)
        ) {
          return jsonResponse(
            {
              message: "Une quantité de prestation est invalide.",
              code: "INVALID_SERVICE_OPTION",
            },
            400,
          );
        }

        const option = value as Record<string, unknown>;
        const serviceId =
          typeof option.serviceId === "string" ? option.serviceId.trim() : "";
        const quantity = option.quantity;

        if (
          !serviceId ||
          typeof quantity !== "number" ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 50
        ) {
          return jsonResponse(
            {
              message: "Une quantité de prestation est invalide.",
              code: "INVALID_SERVICE_OPTION",
            },
            400,
          );
        }

        serviceOptions.push({ serviceId, quantity });
      }
    }

    const availability = await getAvailability({
      staffId,
      serviceIds,
      serviceOptions,
      date,
    });

    return jsonResponse(availability);
  } catch (error: unknown) {
    if (error instanceof AvailabilityValidationError) {
      return jsonResponse(
        {
          message: error.message,

          code: "AVAILABILITY_VALIDATION_ERROR",
        },
        400,
      );
    }

    console.error("[GET_AVAILABILITY_ERROR]", error);

    return jsonResponse(
      {
        message: "Impossible de calculer les disponibilités pour le moment.",

        code: "AVAILABILITY_INTERNAL_ERROR",
      },
      500,
    );
  }
}
