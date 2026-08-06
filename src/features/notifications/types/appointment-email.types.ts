export type AppointmentEmailKind =
  | "BOOKING_CONFIRMED"
  | "APPOINTMENT_UPDATED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REFUSED"
  | "REMINDER_24H"
  | "REMINDER_2H"
  | "DEPOSIT_PAYMENT_REQUESTED";

export type AppointmentEmailData = {
  kind: AppointmentEmailKind;
  recipientEmail: string;
  recipientName: string;
  appointmentReference: string;
  startsAt: string;
  serviceNames: string[];
  staffName?: string | null;
  manageUrl?: string | null;

  // Uniquement pour DEPOSIT_PAYMENT_REQUESTED : montant de l'acompte
  // demandé, affiché dans le détail et utilisé pour le bouton d'action.
  depositAmountCents?: number | null;

  // Uniquement pour DEPOSIT_PAYMENT_REQUESTED : date limite (ISO) au-delà
  // de laquelle la réservation sera annulée automatiquement si l'acompte
  // n'est pas réglé. Absente pour une réservation en ligne classique (délai
  // trop court pour être communiqué utilement) ; renseignée pour un
  // rendez-vous créé manuellement par l'équipe (délai de 24h).
  paymentDeadline?: string | null;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export type EmailDeliveryResult =
  | {
      status: "sent";
      provider: "resend";
      id: string;
    }
  | {
      status: "skipped";
      reason: "EMAIL_DISABLED" | "MISSING_CONFIGURATION";
    };
