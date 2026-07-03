# 🔔 Implementação de Notificações Push

## Status Atual
✅ **Responsividade Mobile:** 100% melhorada
- Header ajustado para mobile
- HomeClient com grids responsivos
- ProductCard otimizado
- Conta responsiva
- Footer mobile-friendly

## Próximos Passos: Notificações Push

### 1. **Integração Firebase Cloud Messaging (FCM)**

**Instalação:**
```bash
npm install firebase-admin firebase
```

**Arquivo: `src/lib/firebase.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, onMessage };
```

### 2. **Componente de Inscrição em Push Notifications**

**Arquivo: `src/components/NotificationSubscriber.tsx`**
```typescript
"use client";

import { useEffect } from "react";
import { messaging, onMessage } from "@/lib/firebase";

export default function NotificationSubscriber() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      (async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await messaging.getToken({ serviceWorkerRegistration: registration });
            // Enviar token para backend
            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
          }
        } catch (err) {
          console.error("Erro ao ativar notificações:", err);
        }
      })();
    }

    // Listener para notificações em foreground
    onMessage(messaging, (payload) => {
      const { title, body, icon } = payload.notification || {};
      new Notification(title || "Access Fit", { body, icon });
    });
  }, []);

  return null;
}
```

### 3. **Service Worker**

**Arquivo: `public/sw.js`**
```javascript
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: data.notification.icon,
  });
});
```

### 4. **API para Inscrever Usuário**

**Arquivo: `src/app/api/notifications/subscribe/route.ts`**
```typescript
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { token } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Salvar token no banco de dados
  await prisma.notificationToken.upsert({
    where: { userId: user.id },
    update: { token },
    create: { userId: user.id, token },
  });

  return NextResponse.json({ success: true });
}
```

### 5. **Schema Prisma Update**

```prisma
model NotificationToken {
  id    String  @id @default(cuid())
  userId String  @unique
  token  String  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 6. **API para Enviar Notificações**

**Cupom de Aniversário:**
```typescript
// src/app/api/usuario/cupom-aniversario/route.ts - adicionar ao final:

async function enviarNotificacaoCupom(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notifications: true },
  });

  if (!user?.notifications?.token) return;

  await admin.messaging().send({
    token: user.notifications.token,
    notification: {
      title: "🎂 Seu cupom de aniversário chegou!",
      body: "15% de desconto exclusivo esperando você",
    },
    data: { link: "/conta" },
  });
}
```

**Status de Pedido:**
```typescript
// src/app/api/admin/pedidos/[id]/route.ts - ao atualizar status:

async function enviarNotificacaoPedido(orderId: string, status: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { include: { notifications: true } } },
  });

  if (!order?.user.notifications?.token) return;

  const mensagens: Record<string, string> = {
    confirmed: "✅ Seu pedido foi confirmado!",
    shipped: "🚚 Seu pedido saiu para entrega",
    delivered: "📦 Sua encomenda chegou!",
  };

  await admin.messaging().send({
    token: order.user.notifications.token,
    notification: {
      title: "Access Fit - Atualização de Pedido",
      body: mensagens[status] || `Pedido ${status}`,
    },
    data: { link: `/conta/pedidos/${orderId}` },
  });
}
```

### 7. **Variáveis de Ambiente**

**`.env.local`:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=seu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

FIREBASE_ADMIN_SDK_KEY=sua_chave_admin_json
```

### 8. **Adicionar ao Layout**

```typescript
// src/app/layout.tsx
import NotificationSubscriber from "@/components/NotificationSubscriber";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>
          <NotificationSubscriber />
          {/* resto do layout */}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Testes

### Teste Local:
1. Ativar notificações no navegador
2. Ir para `/conta`
3. Verificar se token foi salvo
4. Criar novo pedido e acompanhar status

### Teste em Produção:
1. Deploy do código
2. Acessar site em mobile
3. Aceitar notificações
4. Testar cupom de aniversário e pedidos

## Status de Implementação

- [ ] Instalar Firebase
- [ ] Criar `firebase.ts`
- [ ] Criar `NotificationSubscriber.tsx`
- [ ] Criar `public/sw.js`
- [ ] Criar `/api/notifications/subscribe`
- [ ] Atualizar schema Prisma
- [ ] Integrar com cupom de aniversário
- [ ] Integrar com status de pedidos
- [ ] Adicionar ao layout
- [ ] Testar notificações
- [ ] Deploy em produção

## Próximas Features Mobile

### After Notifications:
1. 📲 **PWA (Progressive Web App)**
   - Add to Home Screen
   - Offline mode
   - Icon adaptável

2. 🎨 **Design Melhorias**
   - Dark mode option
   - Gestos deslizar para mobile
   - Animações smooth

3. ⚡ **Performance**
   - Image optimization
   - Code splitting
   - Cache strategy

4. 🔍 **SEO Mobile**
   - Mobile-first indexing
   - Core Web Vitals otimizados
   - Structured data

## Referências

- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Push Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
