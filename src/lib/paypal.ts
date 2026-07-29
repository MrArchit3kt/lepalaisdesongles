import "server-only";

import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";

type PayPalEnvironment = "sandbox" | "live";

function requireEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `La variable d'environnement ${name} est manquante.`,
    );
  }

  return value;
}

function getPayPalEnvironmentName(): PayPalEnvironment {
  const environment =
    process.env.PAYPAL_ENVIRONMENT
      ?.trim()
      .toLowerCase();

  if (
    environment !== "sandbox" &&
    environment !== "live"
  ) {
    throw new Error(
      'PAYPAL_ENVIRONMENT doit être égal à "sandbox" ou "live".',
    );
  }

  return environment;
}

function getPayPalSdkEnvironment():
  | Environment.Production
  | Environment.Sandbox {
  return getPayPalEnvironmentName() === "live"
    ? Environment.Production
    : Environment.Sandbox;
}

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId:
      requireEnvironmentVariable(
        "PAYPAL_CLIENT_ID",
      ),

    oAuthClientSecret:
      requireEnvironmentVariable(
        "PAYPAL_CLIENT_SECRET",
      ),
  },

  environment: getPayPalSdkEnvironment(),

  logging: {
    logLevel:
      process.env.NODE_ENV === "development"
        ? LogLevel.Info
        : LogLevel.Error,
  },
});

export const paypalOrdersController =
  new OrdersController(paypalClient);

export function getPayPalWebhookId(): string {
  return requireEnvironmentVariable(
    "PAYPAL_WEBHOOK_ID",
  );
}

export function isPayPalLive(): boolean {
  return (
    getPayPalEnvironmentName() === "live"
  );
}

export function getPayPalBaseUrl(): string {
  return isPayPalLive()
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}