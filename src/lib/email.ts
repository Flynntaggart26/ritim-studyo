import { Resend } from "resend";
import { site } from "./site";
import { formatDateTr, formatMin, STATUS_LABELS } from "./utils";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.EMAIL_FROM ?? "Ritim Stüdyo <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeSubject(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f]/g, " ").trim();
}

/**
 * E-posta gönderir. RESEND_API_KEY tanımlı değilse (geliştirme modu)
 * e-postayı göndermek yerine sunucu konsoluna yazar.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`\n📧 [E-POSTA - geliştirme modu]\n   Kime: ${to}\n   Konu: ${subject}\n`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[E-POSTA] Gönderilemedi:", err);
  }
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f2ebdf;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fbf6ec;border:1px solid #e4d9c8;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#84927b,#596f5b);padding:24px 28px;">
        <div style="font-size:22px;font-weight:800;color:#fff9ee;letter-spacing:1px;">${site.name.toUpperCase()}</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#372f27;">${title}</h1>
        ${body}
      </div>
      <div style="padding:20px 28px;border-top:1px solid #e4d9c8;color:#827563;font-size:12px;">
        ${site.name} • ${site.address} • ${site.phone}
      </div>
    </div>
  </div>
</body>
</html>`;
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;color:#827563;font-size:14px;width:110px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#372f27;font-size:14px;font-weight:600;">${escapeHtml(value)}</td></tr>`;

export interface BookingMailData {
  teacherName: string;
  lessonTitle: string;
  date: string;
  startMin: number;
  endMin: number;
  studentName: string;
  studentPhone?: string | null;
  notes?: string | null;
  manageToken: string;
}

export function teacherNewBookingEmail(d: BookingMailData): { subject: string; html: string } {
  const manageUrl = `${APP_URL}/panel/randevular`;
  return {
    subject: safeSubject(`Yeni Randevu Talebi — ${d.studentName} (${formatDateTr(d.date)})`),
    html: layout(
      "Yeni Randevu Talebi",
      `<p style="color:#5a5045;font-size:14px;line-height:1.6;">Merhaba <b>${escapeHtml(d.teacherName)}</b>, yeni bir ders randevusu aldın:</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         ${row("Öğrenci", d.studentName)}
         ${row("Telefon", d.studentPhone ?? "—")}
         ${row("Ders", d.lessonTitle)}
         ${row("Tarih", formatDateTr(d.date))}
         ${row("Saat", `${formatMin(d.startMin)} – ${formatMin(d.endMin)}`)}
         ${d.notes ? row("Not", d.notes) : ""}
       </table>
       <a href="${manageUrl}" style="display:inline-block;background:#596f5b;color:#fff9ee;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">Panelden Görüntüle</a>`
    ),
  };
}

export function studentBookingCreatedEmail(d: BookingMailData & { to: string }): { subject: string; html: string } {
  const manageUrl = `${APP_URL}/randevu/${d.manageToken}`;
  return {
    subject: safeSubject(`Randevunuz Alındı — ${formatDateTr(d.date)} ${formatMin(d.startMin)}`),
    html: layout(
      "Randevunuz Alındı",
      `<p style="color:#5a5045;font-size:14px;line-height:1.6;">Merhaba <b>${escapeHtml(d.studentName)}</b>, randevu talebiniz başarıyla oluşturuldu. Hocanız onayladığında size bilgi vereceğiz.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         ${row("Hoca", d.teacherName)}
         ${row("Ders", d.lessonTitle)}
         ${row("Tarih", formatDateTr(d.date))}
         ${row("Saat", `${formatMin(d.startMin)} – ${formatMin(d.endMin)}`)}
       </table>
       <a href="${manageUrl}" style="display:inline-block;background:#596f5b;color:#fff9ee;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">Randevumu Yönet</a>
       <p style="color:#827563;font-size:12px;margin-top:16px;">Randevunuzu görüntülemek veya iptal etmek için bu bağlantıyı saklayın.</p>`
    ),
  };
}

export function studentBookingStatusEmail(d: BookingMailData & { status: string }): { subject: string; html: string } {
  const label = STATUS_LABELS[d.status] ?? d.status;
  return {
    subject: safeSubject(`Randevu Durumu: ${label} — ${formatDateTr(d.date)} ${formatMin(d.startMin)}`),
    html: layout(
      `Randevunuz ${label}`,
      `<p style="color:#5a5045;font-size:14px;line-height:1.6;">Merhaba <b>${escapeHtml(d.studentName)}</b>, aşağıdaki randevunuzun durumu güncellendi:</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         ${row("Hoca", d.teacherName)}
         ${row("Ders", d.lessonTitle)}
         ${row("Tarih", formatDateTr(d.date))}
         ${row("Saat", `${formatMin(d.startMin)} – ${formatMin(d.endMin)}`)}
         ${row("Durum", label)}
       </table>`
    ),
  };
}

export function studentBookingRescheduledEmail(
  d: BookingMailData & { previousDate: string; previousStartMin: number; previousEndMin: number }
): { subject: string; html: string } {
  return {
    subject: safeSubject(`Ders saatiniz güncellendi — ${formatDateTr(d.date)} ${formatMin(d.startMin)}`),
    html: layout(
      "Ders saatiniz güncellendi",
      `<p style="color:#5a5045;font-size:14px;line-height:1.6;">Merhaba <b>${escapeHtml(d.studentName)}</b>, hocanız ders saatinizi güncelledi:</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         ${row("Hoca", d.teacherName)}
         ${row("Ders", d.lessonTitle)}
         ${row("Önceki saat", `${formatDateTr(d.previousDate)} ${formatMin(d.previousStartMin)}–${formatMin(d.previousEndMin)}`)}
         ${row("Yeni saat", `${formatDateTr(d.date)} ${formatMin(d.startMin)}–${formatMin(d.endMin)}`)}
       </table>
       <p style="color:#827563;font-size:12px;margin-top:16px;">Randevunuzun detaylarını mevcut randevu yönetim bağlantısından görüntüleyebilirsiniz.</p>`
    ),
  };
}

export function teacherBookingCancelledEmail(d: BookingMailData): { subject: string; html: string } {
  return {
    subject: safeSubject(`Randevu İptal Edildi — ${d.studentName} (${formatDateTr(d.date)})`),
    html: layout(
      "Randevu İptal Edildi",
      `<p style="color:#5a5045;font-size:14px;line-height:1.6;">Merhaba <b>${escapeHtml(d.teacherName)}</b>, aşağıdaki randevu öğrenci tarafından iptal edildi:</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         ${row("Öğrenci", d.studentName)}
         ${row("Ders", d.lessonTitle)}
         ${row("Tarih", formatDateTr(d.date))}
         ${row("Saat", `${formatMin(d.startMin)} – ${formatMin(d.endMin)}`)}
       </table>`
    ),
  };
}
