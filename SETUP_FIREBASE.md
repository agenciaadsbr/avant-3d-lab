# 🔥 Setup Firebase para Notificações Push

## ✅ O que já foi implementado

- ✅ Componente `NotificationSubscriber.tsx`
- ✅ Service Worker `public/sw.js`
- ✅ API `/api/notifications/subscribe`
- ✅ Schema Prisma (NotificationToken)
- ✅ Integração com cupom de aniversário
- ✅ Adicionado ao layout

## 🚀 Próximos Passos (Você fazer!)

### 1️⃣ Criar Projeto Firebase

1. Ir para https://console.firebase.google.com/
2. Clicar em "Criar Projeto"
3. Nome: `access-fit`
4. Aceitar termos
5. Google Analytics: Opcional
6. Criar projeto

### 2️⃣ Configurar Web App

1. No Firebase Console, clicar em "Projeto → Configurações"
2. Clicar em "Seus apps"
3. Clicar em "</>" (Web)
4. Alias: `access-fit-web`
5. Copiar a configuração exibida

### 3️⃣ Ativar Cloud Messaging

1. Firebase Console → Seu Projeto
2. Esquerda: "Grow" → "Cloud Messaging"
3. Clicar em "Começar"
4. Na aba "Web push certificates":
   - Clicar em "Gerar par de chaves"
   - Copiar o "Chave pública"

### 4️⃣ Configurar `.env.local`

Adicionar ao seu `.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=seu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Firebase Admin (para enviar notificações do backend)
FIREBASE_ADMIN_UID=sua_uid_admin
FIREBASE_ADMIN_PRIVATE_KEY=sua_chave_privada
FIREBASE_ADMIN_CLIENT_EMAIL=seu_email_admin
```

### 5️⃣ Atualizar Service Worker

Abrir `public/sw.js` e substituir:

```javascript
firebase.initializeApp({
  apiKey: "AIzaSyC...", // ← Substitua com seu valor
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
});
```

Com seus valores reais do Firebase.

### 6️⃣ Criar Admin SDK Key (Opcional - para enviar do backend)

1. Firebase Console → Configurações do Projeto
2. Aba "Contas de Serviço"
3. "Gerar nova chave privada"
4. Salvar JSON
5. Copiar valores para `.env.local`

### 7️⃣ Testar Notificações

**No navegador:**
```javascript
// DevTools Console
Notification.requestPermission().then(permission => {
  console.log("Permissão:", permission);
});
```

**Você deve ver:**
- Prompt pedindo permissão
- Permissão concedida → "granted"
- Token salvo no banco de dados

## 📱 Como Funciona

```
Usuário acessa site
    ↓
NotificationSubscriber solicita permissão
    ↓
User aceita
    ↓
Service Worker registrado
    ↓
Token gerado e enviado para /api/notifications/subscribe
    ↓
Token salvo em NotificationToken (DB)
    ↓
Quando cupom de aniversário é gerado
    ↓
Notificação enviada para o token salvo
    ↓
User recebe notificação 🔔
```

## 🧪 Teste Manual

### 1. Ativar Notificações no Site

```bash
1. Abrir http://localhost:3000
2. Aceitar notificações
3. Checar se token foi salvo em:
   - DevTools → Application → IndexedDB → firebase
   - Ou database na tabela NotificationToken
```

### 2. Gerar Cupom de Aniversário

```bash
1. Usar seed data com usuário em mês de aniversário
2. Acessar /conta
3. Verificar se cupom foi gerado
4. Observar console.log de notificação
```

### 3. Enviar Notificação Manual (via Admin SDK)

Criar arquivo `scripts/send-notification.js`:

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

messaging.send({
  token: "seu_token_aqui",
  notification: {
    title: "🎂 Seu cupom de aniversário chegou!",
    body: "15% de desconto exclusivo esperando você",
  },
  data: {
    link: "/conta",
  },
});
```

## 🚨 Troubleshooting

### "Service Worker não registra"
- Verificar se `public/sw.js` existe
- Verificar console de erros
- Verificar se variáveis de ambiente estão corretas

### "Token não salva no banco"
- Verificar se usuário está logado
- Verificar se Prisma foi atualizado (`npx prisma db push`)
- Verificar API `/api/notifications/subscribe`

### "Notificação não aparece"
- Verificar se browser permite notificações
- Verificar se token existe no banco
- Verificar console para erros

## 📚 Documentação

- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Web Push: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

## ✅ Checklist Implementação

- [ ] Criar projeto Firebase
- [ ] Configurar Web App
- [ ] Copiar credenciais
- [ ] Atualizar `.env.local`
- [ ] Atualizar `public/sw.js`
- [ ] Testar no navegador
- [ ] Verificar token no DB
- [ ] Testar cupom de aniversário
- [ ] Deploy em staging
- [ ] Deploy em produção

## 💡 Próximos Passos

Após Firebase estar funcionando:

1. Integrar Firebase Admin SDK para enviar notificações
2. Adicionar notificações de status de pedido
3. Adicionar notificações de promoção
4. PWA features (Add to Home Screen)
5. Dark mode suporte

---

**Precisa de ajuda?** Verifique o console do DevTools e cole o erro aqui! 🐛
