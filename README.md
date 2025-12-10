# LGPD Guardian SaaS

Plataforma de conformidade LGPD multilocatário com IA.

## Configuração do Projeto Google AI (Gemini)

**Projeto Vinculado:** `api_lgpd_guardian` (ID: `607274394750`)

### 1. Desenvolvimento Local

A chave de API já foi configurada no arquivo `.env`. Basta rodar:

```bash
npm install
npm run dev
```

### 2. Deploy na Vercel

Ao publicar este projeto na Vercel, o arquivo `.env` é ignorado por segurança. Você deve configurar a chave manualmente:

1.  Acesse seu projeto no Dashboard da Vercel.
2.  Vá em **Settings** (Configurações) -> **Environment Variables** (Variáveis de Ambiente).
3.  Adicione uma nova variável:
    *   **Key:** `API_KEY`
    *   **Value:** `AIzaSyDa8pnfqkPiBJBAUnL6wEL63XWdjEnHfzU`
4.  Clique em **Save**.
5.  Vá em **Deployments** e faça um "Redeploy" para que a nova variável entre em vigor.

## Comandos Úteis

*   **Instalar dependências:** `npm install`
*   **Rodar localmente:** `npm run dev`
*   **Build de produção:** `npm run build`
