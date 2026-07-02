importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Mensagem recebida em background:", payload);

  const notificationTitle = payload.notification.title || "Access Fit";
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/logo.png",
    badge: "/logo.png",
    tag: "access-fit",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data?.link) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.link);
        }
      })
    );
  }
});
