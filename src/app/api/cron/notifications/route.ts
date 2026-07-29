import { NextResponse } from "next/server";

import { processNotificationAutomations } from "@/features/notifications/services/notification-automation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json(
      { message: "Accès interdit." },
      { status: 401 },
    );
  }

  try {
    const result = await processNotificationAutomations();

    return NextResponse.json({
      success: true,
      ...result,
      executedAt: new Date().toISOString(),
    });
  } catch (reason: unknown) {
    console.error("[CRON_NOTIFICATIONS]", reason);

    return NextResponse.json(
      {
        success: false,
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible d’exécuter les notifications automatiques.",
      },
      { status: 500 },
    );
  }
}
