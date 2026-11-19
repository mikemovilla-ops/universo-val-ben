import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/auth";

// Envío por Gmail SMTP (contraseña de aplicación, ver README). Sin
// credenciales (p.ej. en local) no se envía nada, pero no rompe la acción
// que lo dispara — el email es un aviso, nunca debe bloquear nada.
const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

// Los títulos y notas de las recetas son texto libre: se escapan antes de
// meterlos en el HTML del correo.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Une y limpia destinatarios (sin repetidos, sin mayúsculas). Fuera de
// producción solo les llega a los admins, para no mandar correos a la
// familia mientras se prueba en local o en una preview de Vercel.
export function destinatariosFinales(
  familia: string[],
  admins: string[],
  enProduccion: boolean
): string[] {
  const lista = enProduccion ? [...familia, ...admins] : admins;
  return [...new Set(lista.map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

async function emailsDeRol(rol: "PADRE" | "HIJO"): Promise<string[]> {
  const personas = await prisma.persona.findMany({
    where: { rol, avisosEmail: true },
    select: { email: true, emailAvisos: true },
  });
  return personas.map((p) => p.emailAvisos || p.email).filter((e): e is string => !!e);
}

const enProduccion = () => process.env.VERCEL_ENV === "production";
const urlApp = () => process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// En local (fuera de Vercel) no se manda ningún email, ni siquiera a los
// admins: solo se apunta en la consola lo que se habría enviado.
const enLocal = () => !process.env.VERCEL;

async function enviar(destinatarios: string[], asunto: string, texto: string, html: string) {
  if (enLocal()) {
    console.log(`[email desactivado en local] "${asunto}" → ${destinatarios.join(", ") || "(nadie)"}`);
    return;
  }
  if (!transporter || destinatarios.length === 0) return;
  try {
    await transporter.sendMail({
      from: `"Universo Val-Ben" <${process.env.GMAIL_USER}>`,
      bcc: destinatarios,
      subject: asunto,
      text: texto,
      html,
    });
  } catch (e) {
    console.error(`No se pudo enviar el aviso "${asunto}":`, e);
  }
}

// Alguien ha pedido una receta → a los padres y al admin.
export async function avisarRecetaPedida(receta: {
  id: string;
  titulo: string;
  nota: string | null;
  pedidaPor: string;
}) {
  const dest = destinatariosFinales(await emailsDeRol("PADRE"), ADMIN_EMAILS, enProduccion());
  const enlace = `${urlApp()}/recetas/${receta.id}`;
  const t = escapeHtml(receta.titulo);
  const q = escapeHtml(receta.pedidaPor);
  await enviar(
    dest,
    `🍲 ${receta.pedidaPor} os pide una receta: ${receta.titulo}`,
    `${receta.pedidaPor} ha pedido la receta "${receta.titulo}".${receta.nota ? `\n\nNota: ${receta.nota}` : ""}\n\nCuando podáis, entrad en ${enlace} y pulsad "Empezar a escribirla".`,
    `<p><strong>${q}</strong> ha pedido la receta <strong>${t}</strong>.</p>${
      receta.nota ? `<p><em>${escapeHtml(receta.nota)}</em></p>` : ""
    }<p>Cuando podáis, <a href="${enlace}">entrad aquí</a> y pulsad <strong>"Empezar a escribirla"</strong>.</p>`
  );
}

// Una receta está terminada → a los hijos y al admin.
export async function avisarRecetaLista(receta: { id: string; titulo: string; redactor: string }) {
  const dest = destinatariosFinales(await emailsDeRol("HIJO"), ADMIN_EMAILS, enProduccion());
  const enlace = `${urlApp()}/recetas/${receta.id}`;
  await enviar(
    dest,
    `✅ Receta lista: ${receta.titulo}`,
    `${receta.redactor} ha terminado de escribir la receta "${receta.titulo}".\n\nYa la tienes en ${enlace}`,
    `<p><strong>${escapeHtml(receta.redactor)}</strong> ha terminado de escribir la receta <strong>${escapeHtml(
      receta.titulo
    )}</strong>.</p><p><a href="${enlace}">Ver la receta</a></p>`
  );
}
