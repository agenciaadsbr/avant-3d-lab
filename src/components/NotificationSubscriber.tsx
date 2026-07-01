"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationSubscriber() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;
    if (typeof window === "undefined") return;

    const initNotifications = async () => {
      try {
        const { messaging, onMessage } = await import("@/lib/firebase");
        const { getToken } = await import("firebase/messaging");

        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registrado:", registration);

          const permission = Notification.permission;
          if (permission === "default") {
            const result = await Notification.requestPermission();
            if (result !== "granted") return;
          } else if (permission !== "granted") {
            return;
          }

          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
          });

          if (token) {
            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            console.log("Notificações ativadas ✅");
          }
        }

        onMessage(messaging, (payload: any) => {
          const { title, body, icon } = payload.notification || {};
          const data = payload.data || {};

          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification(title || "Access Fit", {
              body,
              icon: icon || "/logo.png",
              badge: "/logo.png",
              tag: "access-fit-notification",
              requireInteraction: false,
            });

            notification.onclick = () => {
              if (data.link) {
                window.location.href = data.link;
              }
              notification.close();
            };
          }
        });
      } catch (err) {
        console.error("Erro ao ativar notificações:", err);
      }
    };

    initNotifications();
  }, [session]);

  return null;
}
