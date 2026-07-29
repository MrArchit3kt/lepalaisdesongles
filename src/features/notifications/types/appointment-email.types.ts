export type AppointmentEmailKind =
  | "BOOKING_CONFIRMED"
  | "APPOINTMENT_UPDATED"
  | "APPOINTMENT_CANCELLED"
  | "REMINDER_24H"
  | "REMINDER_2H";

export type AppointmentEmailData = {
  kind: AppointmentEmailKind;
  recipientEmail: string;
  recipientName: string;
  appointmentReference: string;
  startsAt: string;
  serviceNames: string[];
  staffName?: string | null;
  manageUrl?: string | null;
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
      reason:
        | "EMAIL_DISABLED"
        | "MISSING_CONFIGURATION";
    };
