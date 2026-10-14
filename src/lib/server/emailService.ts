import nodemailer from "nodemailer";

export interface CareerEmailPayload {
  recipientEmail: string;
  applicantName: string;
  positionTitle: string;
  registrationCode: string;
}

export interface EmailSendResult {
  success: boolean;
  status: "SENT" | "UNCONFIGURED" | "FAILED";
  messageId?: string;
  error?: string;
}

/**
 * Mengecek apakah konfigurasi SMTP server tersedia di environment variables.
 * Kredensial dibaca dari variable server-side rahasia (bukan NEXT_PUBLIC_*).
 */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Membuat template HTML email yang sederhana, profesional, responsif,
 * dan sesuai identitas visual Zhou Consulting (Warna Navy #0B1533).
 */
function buildCareerEmailHtml(payload: CareerEmailPayload): string {
  const { applicantName, positionTitle, registrationCode } = payload;
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Penerimaan Lamaran — Zhou Consulting</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #0B1533;
      padding: 28px 32px;
      text-align: left;
    }
    .header-brand {
      color: #ffffff;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .header-sub {
      color: #94a3b8;
      font-size: 11px;
      margin-top: 4px;
      font-weight: 500;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 15px;
      font-weight: 700;
      color: #0B1533;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .lead-text {
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .card-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .card-row {
      margin-bottom: 12px;
    }
    .card-row:last-child {
      margin-bottom: 0;
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 14px;
      font-weight: 700;
      color: #0B1533;
    }
    .code-badge {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 15px;
      font-weight: 700;
      color: #0B1533;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 6px 14px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .paragraph {
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 16px;
    }
    .notice-box {
      background-color: #f1f5f9;
      border-left: 3px solid #0B1533;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 11.5px;
      line-height: 1.5;
      color: #475569;
      margin-top: 24px;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 32px;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="header-brand">ZHOU CONSULTING</h1>
        <div class="header-sub">Divisi People &amp; Culture — Rekrutmen Profesional</div>
      </div>
      <div class="content">
        <p class="greeting">Halo, ${applicantName},</p>
        <p class="lead-text">
          Terima kasih telah melamar di Zhou Consulting. Berkas lamaran Anda telah berhasil kami terima dan disimpan di dalam sistem seleksi talenta kami.
        </p>

        <div class="card-box">
          <div class="card-row">
            <div class="card-label">Posisi yang Dilamar</div>
            <div class="card-value">${positionTitle}</div>
          </div>
          <div class="card-row" style="margin-top: 14px;">
            <div class="card-label">Nomor Registrasi Kandidat</div>
            <div>
              <span class="code-badge">${registrationCode}</span>
            </div>
          </div>
        </div>

        <p class="paragraph">
          Tim People &amp; Culture kami akan meninjau kualifikasi dan berkas yang Anda kirimkan. Kandidat yang memenuhi kualifikasi akan dihubungi oleh tim rekrutmen kami melalui alamat email resmi atau WhatsApp untuk proses seleksi selanjutnya.
        </p>

        <div class="notice-box">
          <strong>Catatan:</strong> Email ini merupakan konfirmasi penerimaan berkas dan bukan merupakan jaminan penerimaan kerja. Seluruh proses rekrutmen di Zhou Consulting diselenggarakan secara profesional tanpa dipungut biaya apapun.
        </div>

        <p class="paragraph" style="margin-bottom: 0;">
          Salam hangat,<br>
          <strong style="color: #0B1533;">Tim People &amp; Culture</strong><br>
          Zhou Consulting
        </p>
      </div>
      <div class="footer">
        &copy; ${currentYear} PT Zhou Cipta Konsultindo. Gedung Menara Sudirman, Jakarta Selatan.<br>
        Email ini dikirimkan secara otomatis dari sistem rekrutmen resmi Zhou Consulting.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Membuat versi teks biasa (Plain Text) sebagai fallback yang terstruktur rapi.
 */
function buildCareerEmailPlainText(payload: CareerEmailPayload): string {
  const { applicantName, positionTitle, registrationCode } = payload;
  const currentYear = new Date().getFullYear();

  return `KONFIRMASI PENERIMAAN LAMARAN — ZHOU CONSULTING

Halo, ${applicantName},

Terima kasih telah melamar di Zhou Consulting. Berkas lamaran Anda telah berhasil kami terima dan disimpan di dalam sistem seleksi talenta kami.

Rincian Lamaran:
- Posisi yang Dilamar      : ${positionTitle}
- Nomor Registrasi Kandidat : ${registrationCode}

Tim People & Culture kami akan meninjau kualifikasi dan berkas yang Anda kirimkan. Kandidat yang memenuhi kualifikasi akan dihubungi oleh tim rekrutmen kami melalui alamat email resmi atau WhatsApp resmi untuk proses seleksi selanjutnya.

Catatan:
Email ini merupakan konfirmasi penerimaan berkas dan bukan merupakan jaminan penerimaan kerja. Seluruh proses rekrutmen di Zhou Consulting diselenggarakan secara profesional tanpa dipungut biaya apapun.

Salam hangat,
Tim People & Culture
Zhou Consulting
Menara Sudirman, Jakarta Selatan
https://zhouconsulting.co.id

(c) ${currentYear} PT Zhou Cipta Konsultindo.`;
}

/**
 * Mengirimkan email konfirmasi penerimaan lamaran kerja kepada pelamar.
 * Dipanggil secara aman dari server-side setelah lamaran berhasil disimpan.
 */
export async function sendCareerApplicationConfirmationEmail(
  payload: CareerEmailPayload
): Promise<EmailSendResult> {
  const { recipientEmail, registrationCode } = payload;

  // 1. Periksa ketersediaan kredensial SMTP
  if (!isSmtpConfigured()) {
    console.info(
      `[Career Email] SMTP credentials not configured in environment variables. Email notification skipped for applicant: ${recipientEmail} (Registration Code: ${registrationCode}).`
    );
    return {
      success: false,
      status: "UNCONFIGURED",
      error: "SMTP credentials not configured in server environment variables",
    };
  }

  try {
    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER!;
    const pass = process.env.SMTP_PASS!;
    const sender =
      process.env.SMTP_FROM ||
      `"Zhou Consulting People & Culture" <${user}>`;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: sender,
      to: recipientEmail,
      subject: "Konfirmasi Penerimaan Lamaran — Zhou Consulting",
      text: buildCareerEmailPlainText(payload),
      html: buildCareerEmailHtml(payload),
    });

    console.info(
      `[Career Email] Successfully sent confirmation email to ${recipientEmail} (Registration Code: ${registrationCode}, MessageId: ${info.messageId})`
    );

    return {
      success: true,
      status: "SENT",
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[Career Email Error] Failed to send confirmation email to ${recipientEmail} (Registration Code: ${registrationCode}):`,
      errorMsg
    );
    return {
      success: false,
      status: "FAILED",
      error: errorMsg,
    };
  }
}
