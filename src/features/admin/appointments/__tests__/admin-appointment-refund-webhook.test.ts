import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appointmentFindFirst: vi.fn(),
  appointmentUpdate: vi.fn(),
  appointmentHistoryCreate: vi.fn(),
  auditLogCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      findFirst: mocks.appointmentFindFirst,
    },
    auditLog: {
      create: mocks.auditLogCreate,
    },
    $transaction: mocks.transaction,
  },
}));

/*
 * @/lib/paypal construit son client au chargement du module et
 * exige les identifiants PayPal dès l'import — même sans appel
 * réseau. recordPayPalRefundFromWebhook n'utilise que
 * getPayPalBaseUrl (jamais appelée dans ces scénarios), donc un
 * stub suffit.
 */
vi.mock("@/lib/paypal", () => ({
  getPayPalBaseUrl: () => "https://api-m.sandbox.paypal.com",
}));

import { recordPayPalRefundFromWebhook } from "@/features/admin/appointments/services/admin-appointment-refund.service";

type MockAppointment = {
  id: string;
  reference: string;
  clientId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  depositCents: number;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  paypalRefundId: string | null;
  paypalRefundRequestId: string | null;
  refundReason: string | null;
};

function makeAppointment(
  overrides: Partial<MockAppointment> = {},
): MockAppointment {
  return {
    id: "appt-1",
    reference: "RDV-001",
    clientId: "client-1",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentMethod: "PAYPAL",
    depositCents: 3_500,
    paypalOrderId: "ORDER-1",
    paypalCaptureId: "CAPTURE-1",
    paypalRefundId: null,
    paypalRefundRequestId: null,
    refundReason: null,
    ...overrides,
  };
}

type TransactionSnapshot = {
  paymentStatus: string;
  paypalRefundId: string | null;
  paypalRefundStatus: string | null;
  refundedAt: Date | null;
};

function mockTransactionOnce(snapshot: TransactionSnapshot) {
  mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
    callback({
      appointment: {
        findUnique: vi.fn().mockResolvedValue(snapshot),
        update: mocks.appointmentUpdate,
      },
      appointmentHistory: {
        create: mocks.appointmentHistoryCreate,
      },
      auditLog: {
        create: mocks.auditLogCreate,
      },
    }),
  );
}

describe("recordPayPalRefundFromWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockTransactionOnce({
      paymentStatus: "PAID",
      paypalRefundId: null,
      paypalRefundStatus: null,
      refundedAt: null,
    });
  });

  it("ignore un événement sans identifiant de capture ou de remboursement", async () => {
    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "",
      refund: {},
    });

    expect(result).toEqual({
      handled: false,
      reason: "MISSING_REFUND_ID",
    });

    expect(mocks.appointmentFindFirst).not.toHaveBeenCalled();
  });

  it("ignore un remboursement sans rendez-vous associé", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(null);

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-1",
        status: "COMPLETED",
        amount: { value: "35.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({
      handled: false,
      reason: "APPOINTMENT_NOT_FOUND",
    });
  });

  it("refuse un rendez-vous qui n'a pas été réglé via PayPal", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(
      makeAppointment({ paymentMethod: "CARD" }),
    );

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-1",
        status: "COMPLETED",
        amount: { value: "35.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({
      handled: false,
      reason: "NOT_PAYPAL_PAYMENT",
    });

    expect(mocks.appointmentUpdate).not.toHaveBeenCalled();
  });

  it("signale un conflit sans jamais écraser un remboursement déjà enregistré", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(
      makeAppointment({ paypalRefundId: "REFUND-OLD" }),
    );

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-NEW",
        status: "COMPLETED",
        amount: { value: "35.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({
      handled: false,
      reason: "REFUND_CONFLICT",
    });

    expect(mocks.appointmentUpdate).not.toHaveBeenCalled();

    expect(mocks.auditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "PAYPAL_WEBHOOK_REFUND_CONFLICT",
        }),
      }),
    );
  });

  it("rejette un montant remboursé qui ne correspond pas à l'acompte encaissé", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(
      makeAppointment({ depositCents: 3_500 }),
    );

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-1",
        status: "COMPLETED",
        amount: { value: "10.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({
      handled: false,
      reason: "AMOUNT_MISMATCH",
    });

    expect(mocks.appointmentUpdate).not.toHaveBeenCalled();

    expect(mocks.auditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "PAYPAL_WEBHOOK_REFUND_AMOUNT_MISMATCH",
        }),
      }),
    );
  });

  it("synchronise un remboursement complété initié depuis PayPal", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(makeAppointment());

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-1",
        status: "COMPLETED",
        amount: { value: "35.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({ handled: true });

    expect(mocks.appointmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: "REFUNDED",
          paypalRefundId: "REFUND-1",
          paypalRefundStatus: "COMPLETED",
          // Aucun acteur administrateur : le remboursement vient de PayPal.
          refundedById: null,
        }),
      }),
    );

    expect(mocks.appointmentHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: null,
          action: "PAYPAL_REFUND_COMPLETED",
        }),
      }),
    );
  });

  it("est idempotent pour un événement déjà synchronisé", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(
      makeAppointment({ paypalRefundId: "REFUND-1" }),
    );

    mockTransactionOnce({
      paymentStatus: "REFUNDED",
      paypalRefundId: "REFUND-1",
      paypalRefundStatus: "COMPLETED",
      refundedAt: new Date("2026-08-01T10:00:00.000Z"),
    });

    const result = await recordPayPalRefundFromWebhook({
      paypalCaptureId: "CAPTURE-1",

      refund: {
        id: "REFUND-1",
        status: "COMPLETED",
        amount: { value: "35.00", currency_code: "EUR" },
      },
    });

    expect(result).toEqual({ handled: true });

    // Rien à réécrire : PayPal peut renvoyer le même événement plusieurs fois.
    expect(mocks.appointmentUpdate).not.toHaveBeenCalled();
  });
});
