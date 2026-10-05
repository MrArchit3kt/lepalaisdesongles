import "server-only";

type SendPasswordResetEmailInput = {
  recipientEmail: string;
  recipientName: string;
  resetUrl: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(input: SendPasswordResetEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(input.recipientName || "Cliente");
  const safeUrl = escapeHtml(input.resetUrl);

  const html = `
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#FFFAFB;font-family:Arial,Helvetica,sans-serif;color:#35242B;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="text-align:center;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#A64D69;margin:0 0 24px;">
        Le Palais des Ongles
      </p>

      <div style="background:#ffffff;border:1px solid #F0DCE3;border-radius:24px;padding:32px;">
        <h1 style="font-size:22px;margin:0 0 16px;color:#35242B;">
          Réinitialisation de mot de passe
        </h1>

        <p style="font-size:14px;line-height:24px;color:#6F5962;margin:0 0 24px;">
          Bonjour ${safeName}, vous avez demandé à réinitialiser le mot de
          passe de votre compte. Ce lien est valable 1 heure et ne peut être
          utilisé qu'une seule fois.
        </p>

        <div style="text-align:center;margin:0 0 24px;">
          <a
            href="${safeUrl}"
            style="display:inline-block;background:#8B405A;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:999px;"
          >
            Choisir un nouveau mot de passe
          </a>
        </div>

        <p style="font-size:12px;line-height:20px;color:#8A767E;margin:0;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement
          cet e-mail : votre mot de passe actuel reste inchangé.
        </p>
      </div>

      <p style="text-align:center;font-size:11px;color:#8A767E;margin:24px 0 0;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre
        navigateur :<br />${safeUrl}
      </p>
    </div>
  </body>
</html>`;

  const text = `Bonjour ${input.recipientName || "Cliente"},

Vous avez demandé à réinitialiser le mot de passe de votre compte Le Palais des Ongles.

Choisissez un nouveau mot de passe via ce lien (valable 1 heure, usage unique) :
${input.resetUrl}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;

  return {
    subject: "Réinitialisation de votre mot de passe",
    html,
    text,
  };
}

/*
 * Même logique défensive que sendAppointmentEmail : silencieux si
 * l'envoi d'e-mails est désactivé ou mal configuré, pour ne jamais
 * faire planter le flux appelant.
 */
export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<void> {
  if (process.env.EMAIL_ENABLED === "false") {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return;
  }

  const rendered = renderEmail(input);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.recipientEmail],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }),
  });

  const payload = (await response.json()) as ResendResponse;

  if (!response.ok || !payload.id) {
    throw new Error(
      payload.message || "Le fournisseur d'e-mails a refusé l'envoi.",
    );
  }
}
