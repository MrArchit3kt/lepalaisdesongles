export type CreateAppointmentImageInput = {
  /*
   * Seule la clé UploadThing est acceptée.
   * L’URL et les métadonnées sont récupérées
   * depuis le registre serveur SecurityUpload.
   */
  key: string;
};

export type CreateAppointmentServiceOptionInput = {
  serviceId: string;
  quantity: number;
};

export type CreateAppointmentInput = {
  serviceIds: string[];

  /**
   * Quantités applicables aux prestations vendues
   * à l’unité, par exemple Nail Art ou Décoration.
   *
   * Une prestation absente de cette liste utilise
   * automatiquement une quantité de 1.
   */
  serviceOptions?: CreateAppointmentServiceOptionInput[];

  staffId: string;
  workstationId: string;
  startsAt: string;
  endsAt: string;

  clientComment?: string | null;

  images?: CreateAppointmentImageInput[];
};

export type CreateAppointmentResult = {
  reference: string;
  appointmentId: string;

  status: "PENDING" | "CONFIRMED";

  /*
   * "PAID" n'est produit que par la création manuelle admin, lorsque
   * l'acompte a déjà été encaissé hors-ligne (voir
   * `admin-create-appointment.service.ts`) — le tunnel de réservation
   * public ne renvoie jamais cette valeur à la création.
   */
  paymentStatus: "PENDING" | "NOT_REQUIRED" | "PAID";

  /**
   * Montant encaissé lors de la réservation :
   *
   * - paiement intégral si le total est
   *   inférieur ou égal à 35 € ;
   *
   * - acompte fixe de 35 € si le total est
   *   supérieur à 35 €.
   */
  depositCents: number;

  requiresPayment: boolean;

  confirmationUrl: string;
};
