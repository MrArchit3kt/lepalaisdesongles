import type {
  AppointmentEmailData,
  AppointmentEmailKind,
  RenderedEmail,
} from "../types/appointment-email.types";

const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() ||
  "Le Palais des Ongles";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.NEXTAUTH_URL?.trim() ||
  "https://lepalaisdesongles.fr"
).replace(/\/+$/, "");

const LOGO_URL =
  process.env.EMAIL_LOGO_URL?.trim() ||
  `${SITE_URL}/images/logo.png`;

const SALON_ADDRESS =
  process.env.EMAIL_SALON_ADDRESS?.trim() || null;

const SALON_PHONE =
  process.env.EMAIL_SALON_PHONE?.trim() || null;

const CONTACT_EMAIL =
  process.env.EMAIL_CONTACT_ADDRESS?.trim() || null;

type EmailPresentation = {
  eyebrow: string;
  title: string;
  intro: string;
  badgeLabel: string;
  accentColor: string;
  accentSoftColor: string;
  icon: string;
  closingMessage: string;
};

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(
  value: string,
): string {
  return escapeHtml(value);
}

function normalizeText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized
    ? normalized
    : null;
}

function formatAppointmentDate(
  startsAt: string,
): string {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "La date du rendez-vous est invalide.",
    );
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "Europe/Paris",
    },
  ).format(date);
}

function getPresentation(
  kind: AppointmentEmailKind,
): EmailPresentation {
  switch (kind) {
    case "BOOKING_CONFIRMED":
      return {
        eyebrow:
          "Réservation confirmée",

        title:
          "Votre rendez-vous est confirmé",

        intro:
          "Votre réservation a bien été enregistrée. Nous avons hâte de vous accueillir et de prendre soin de vos ongles.",

        badgeLabel:
          "Rendez-vous confirmé",

        accentColor:
          "#9E536B",

        accentSoftColor:
          "#FBEAF0",

        icon:
          "✓",

        closingMessage:
          "Votre créneau vous est maintenant réservé.",
      };

    case "APPOINTMENT_UPDATED":
      return {
        eyebrow:
          "Rendez-vous mis à jour",

        title:
          "Votre rendez-vous a été modifié",

        intro:
          "Les informations de votre rendez-vous ont été mises à jour. Retrouvez ci-dessous votre nouveau récapitulatif.",

        badgeLabel:
          "Informations modifiées",

        accentColor:
          "#755688",

        accentSoftColor:
          "#F3ECF8",

        icon:
          "✦",

        closingMessage:
          "Pensez à noter ces nouvelles informations dans votre agenda.",
      };

    case "APPOINTMENT_CANCELLED":
      return {
        eyebrow:
          "Annulation",

        title:
          "Votre rendez-vous a été annulé",

        intro:
          "Votre rendez-vous n’est plus programmé. Vous pouvez effectuer une nouvelle réservation depuis votre espace client.",

        badgeLabel:
          "Rendez-vous annulé",

        accentColor:
          "#A45A59",

        accentSoftColor:
          "#FCEDEC",

        icon:
          "×",

        closingMessage:
          "Nous espérons pouvoir vous accueillir prochainement.",
      };

    case "REMINDER_24H":
      return {
        eyebrow:
          "Rappel de rendez-vous",

        title:
          "Votre rendez-vous est prévu demain",

        intro:
          "Petit rappel : votre rendez-vous approche. Vous trouverez toutes les informations utiles ci-dessous.",

        badgeLabel:
          "Dans environ 24 heures",

        accentColor:
          "#A6772C",

        accentSoftColor:
          "#FFF6E4",

        icon:
          "◷",

        closingMessage:
          "Nous avons hâte de vous retrouver demain.",
      };

    case "REMINDER_2H":
      return {
        eyebrow:
          "Votre rendez-vous approche",

        title:
          "Nous vous attendons bientôt",

        intro:
          "Votre rendez-vous commence dans environ deux heures. Voici un dernier rappel des informations importantes.",

        badgeLabel:
          "Dans environ 2 heures",

        accentColor:
          "#A6772C",

        accentSoftColor:
          "#FFF6E4",

        icon:
          "◷",

        closingMessage:
          "À tout à l’heure au salon.",
      };
  }
}

function renderDetailRow(
  label: string,
  value: string,
  isLast = false,
): string {
  return `
    <tr>
      <td
        style="
          padding: 15px 0;
          border-bottom: ${isLast
            ? "0"
            : "1px solid #F0E3E7"};
          vertical-align: top;
        "
      >
        <p
          style="
            margin: 0 0 5px;
            color: #9A8189;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            line-height: 1.4;
            text-transform: uppercase;
          "
        >
          ${escapeHtml(label)}
        </p>

        <p
          style="
            margin: 0;
            color: #35262C;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 600;
            line-height: 1.6;
          "
        >
          ${escapeHtml(value)}
        </p>
      </td>
    </tr>
  `;
}

function renderContactItem(
  label: string,
  value: string,
): string {
  return `
    <p
      style="
        margin: 4px 0;
        color: #7F6B73;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.6;
      "
    >
      <strong style="color: #5A454D;">
        ${escapeHtml(label)} :
      </strong>

      ${escapeHtml(value)}
    </p>
  `;
}

export function renderAppointmentEmail(
  data: AppointmentEmailData,
): RenderedEmail {
  const presentation =
    getPresentation(
      data.kind,
    );

  const recipientName =
    normalizeText(
      data.recipientName,
    ) || "Cliente";

  const appointmentReference =
    normalizeText(
      data.appointmentReference,
    ) || "Non renseignée";

  const appointmentDate =
    formatAppointmentDate(
      data.startsAt,
    );

  const services =
    data.serviceNames
      .map(
        (service) =>
          service.trim(),
      )
      .filter(Boolean);

  const serviceLabel =
    services.length > 0
      ? services.join(", ")
      : "Prestation";

  const staffName =
    normalizeText(
      data.staffName,
    );

  const manageUrl =
    normalizeText(
      data.manageUrl,
    );

  const detailRows = [
    {
      label:
        "Référence",

      value:
        appointmentReference,
    },
    {
      label:
        "Date et heure",

      value:
        appointmentDate,
    },
    {
      label:
        services.length > 1
          ? "Prestations"
          : "Prestation",

      value:
        serviceLabel,
    },
    staffName
      ? {
          label:
            "Professionnelle",

          value:
            staffName,
        }
      : null,
  ].filter(
    (
      detail,
    ): detail is {
      label: string;
      value: string;
    } =>
      detail !== null,
  );

  const detailsHtml =
    detailRows
      .map(
        (
          detail,
          index,
        ) =>
          renderDetailRow(
            detail.label,
            detail.value,
            index ===
              detailRows.length - 1,
          ),
      )
      .join("");

  const contactItems = [
    SALON_ADDRESS
      ? renderContactItem(
          "Adresse",
          SALON_ADDRESS,
        )
      : "",

    SALON_PHONE
      ? renderContactItem(
          "Téléphone",
          SALON_PHONE,
        )
      : "",

    CONTACT_EMAIL
      ? renderContactItem(
          "Email",
          CONTACT_EMAIL,
        )
      : "",
  ].join("");

  const actionHtml =
    manageUrl
      ? `
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="margin: 28px 0 8px;"
        >
          <tr>
            <td align="center">
              <a
                href="${escapeAttribute(
                  manageUrl,
                )}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  min-width: 220px;
                  padding: 15px 24px;
                  border-radius: 999px;
                  background: ${presentation.accentColor};
                  color: #FFFFFF;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 14px;
                  font-weight: 700;
                  letter-spacing: 0.01em;
                  line-height: 1.3;
                  text-align: center;
                  text-decoration: none;
                  box-shadow: 0 12px 28px rgba(91, 50, 65, 0.18);
                "
              >
                Gérer mon rendez-vous
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  const plainTextLines = [
    presentation.title,
    "",
    `Bonjour ${recipientName},`,
    "",
    presentation.intro,
    "",
    `Référence : ${appointmentReference}`,
    `Date et heure : ${appointmentDate}`,
    `${
      services.length > 1
        ? "Prestations"
        : "Prestation"
    } : ${serviceLabel}`,
    staffName
      ? `Professionnelle : ${staffName}`
      : null,
    "",
    presentation.closingMessage,
    manageUrl
      ? `Gérer mon rendez-vous : ${manageUrl}`
      : null,
    SALON_ADDRESS
      ? `Adresse : ${SALON_ADDRESS}`
      : null,
    SALON_PHONE
      ? `Téléphone : ${SALON_PHONE}`
      : null,
    CONTACT_EMAIL
      ? `Email : ${CONTACT_EMAIL}`
      : null,
    "",
    SITE_NAME,
    SITE_URL,
  ]
    .filter(
      (
        line,
      ): line is string =>
        Boolean(line),
    )
    .join("\n");

  const html = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >

    <meta
      name="color-scheme"
      content="light"
    >

    <meta
      name="supported-color-schemes"
      content="light"
    >

    <title>
      ${escapeHtml(
        presentation.title,
      )}
    </title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #F7F1F3;
      color: #35262C;
      -webkit-text-size-adjust: 100%;
    "
  >
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
      "
    >
      ${escapeHtml(
        presentation.intro,
      )}
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width: 100%;
        background-color: #F7F1F3;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding: 32px 12px;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width: 100%;
              max-width: 640px;
            "
          >
            <tr>
              <td
                align="center"
                style="
                  padding: 0 16px 22px;
                "
              >
                <a
                  href="${escapeAttribute(
                    SITE_URL,
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    text-decoration: none;
                  "
                >
                  <img
                    src="${escapeAttribute(
                      LOGO_URL,
                    )}"
                    width="130"
                    alt="${escapeAttribute(
                      SITE_NAME,
                    )}"
                    style="
                      display: block;
                      width: 130px;
                      max-width: 100%;
                      height: auto;
                      border: 0;
                      outline: none;
                      text-decoration: none;
                    "
                  >
                </a>
              </td>
            </tr>

            <tr>
              <td
                style="
                  overflow: hidden;
                  border: 1px solid #E7D7DC;
                  border-radius: 28px;
                  background-color: #FFFFFF;
                  box-shadow: 0 18px 50px rgba(74, 43, 54, 0.10);
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 34px 32px 30px;
                        background-color: ${presentation.accentSoftColor};
                        background-image:
                          radial-gradient(
                            circle at top right,
                            rgba(255, 255, 255, 0.95),
                            transparent 36%
                          ),
                          linear-gradient(
                            135deg,
                            ${presentation.accentSoftColor},
                            #FFFFFF
                          );
                      "
                    >
                      <div
                        style="
                          display: inline-block;
                          width: 48px;
                          height: 48px;
                          margin-bottom: 18px;
                          border-radius: 50%;
                          background-color: ${presentation.accentColor};
                          color: #FFFFFF;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 26px;
                          font-weight: 700;
                          line-height: 48px;
                          text-align: center;
                        "
                      >
                        ${escapeHtml(
                          presentation.icon,
                        )}
                      </div>

                      <p
                        style="
                          margin: 0 0 9px;
                          color: ${presentation.accentColor};
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          font-weight: 800;
                          letter-spacing: 0.18em;
                          line-height: 1.4;
                          text-transform: uppercase;
                        "
                      >
                        ${escapeHtml(
                          presentation.eyebrow,
                        )}
                      </p>

                      <h1
                        style="
                          margin: 0;
                          color: #35262C;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 30px;
                          font-weight: 500;
                          letter-spacing: -0.02em;
                          line-height: 1.2;
                        "
                      >
                        ${escapeHtml(
                          presentation.title,
                        )}
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 34px 34px 10px;
                      "
                    >
                      <p
                        style="
                          margin: 0 0 12px;
                          color: #35262C;
                          font-family: Georgia, 'Times New Roman', serif;
                          font-size: 21px;
                          line-height: 1.4;
                        "
                      >
                        Bonjour ${escapeHtml(
                          recipientName,
                        )},
                      </p>

                      <p
                        style="
                          margin: 0;
                          color: #76626A;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 15px;
                          line-height: 1.75;
                        "
                      >
                        ${escapeHtml(
                          presentation.intro,
                        )}
                      </p>

                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="
                          margin-top: 24px;
                        "
                      >
                        <tr>
                          <td>
                            <span
                              style="
                                display: inline-block;
                                padding: 8px 13px;
                                border: 1px solid ${presentation.accentColor}33;
                                border-radius: 999px;
                                background-color: ${presentation.accentSoftColor};
                                color: ${presentation.accentColor};
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 11px;
                                font-weight: 800;
                                letter-spacing: 0.04em;
                                line-height: 1.3;
                              "
                            >
                              ${escapeHtml(
                                presentation.badgeLabel,
                              )}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 18px 34px 10px;
                      "
                    >
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="
                          padding: 5px 22px;
                          border: 1px solid #EEDFE4;
                          border-radius: 20px;
                          background-color: #FFF9FB;
                        "
                      >
                        ${detailsHtml}
                      </table>

                      ${actionHtml}

                      <p
                        style="
                          margin: 24px 0 0;
                          color: #76626A;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 14px;
                          line-height: 1.7;
                          text-align: center;
                        "
                      >
                        ${escapeHtml(
                          presentation.closingMessage,
                        )}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 28px 34px 34px;
                      "
                    >
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                      >
                        <tr>
                          <td
                            style="
                              padding: 22px;
                              border-radius: 18px;
                              background-color: #F8F3F5;
                              text-align: center;
                            "
                          >
                            <p
                              style="
                                margin: 0 0 7px;
                                color: #4C3940;
                                font-family: Georgia, 'Times New Roman', serif;
                                font-size: 17px;
                                font-weight: 600;
                                line-height: 1.4;
                              "
                            >
                              ${escapeHtml(
                                SITE_NAME,
                              )}
                            </p>

                            ${contactItems}

                            <p
                              style="
                                margin: 10px 0 0;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 12px;
                                line-height: 1.5;
                              "
                            >
                              <a
                                href="${escapeAttribute(
                                  SITE_URL,
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                                style="
                                  color: ${presentation.accentColor};
                                  font-weight: 700;
                                  text-decoration: none;
                                "
                              >
                                Visiter notre site
                              </a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  padding: 22px 20px 0;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #A08D94;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  Cet email concerne votre rendez-vous auprès de
                  ${escapeHtml(
                    SITE_NAME,
                  )}.
                </p>

                <p
                  style="
                    margin: 6px 0 0;
                    color: #B09FA5;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  Merci de ne pas répondre directement à cet email
                  si l’adresse d’expédition n’accepte pas les réponses.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject:
      presentation.title,

    text:
      plainTextLines,

    html,
  };
}
