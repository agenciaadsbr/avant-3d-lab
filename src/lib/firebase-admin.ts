import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// Envia uma notificação push para um usuário. Silenciosamente não faz nada
// se o Firebase Admin não estiver configurado ou o usuário não tiver token salvo.
export async function sendPushToUser(userId: string, title: string, body: string) {
  const app = getAdminApp();
  if (!app) {
    console.warn("[push] FIREBASE_ADMIN_* não configurado — notificação não enviada");
    return;
  }

  const tokenRecord = await prisma.notificationToken.findUnique({ where: { userId } });
  if (!tokenRecord) return;

  try {
    await getMessaging(app).send({
      token: tokenRecord.token,
      notification: { title, body },
    });
  } catch (err) {
    console.error("[push] Falha ao enviar notificação:", err);
  }
}
