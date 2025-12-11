# Guia de Publicação - LGPD Guardian

Este guia cobre como colocar o projeto no GitHub e publicá-lo na Vercel, garantindo que a Inteligência Artificial funcione corretamente.

## 1. GitHub (Armazenamento do Código)

Se você ainda não enviou seu código para o GitHub, siga estes passos. Abra o terminal na pasta do projeto e execute:

```bash
# 1. Inicializar o repositório git (se ainda não o fez)
git init -b main

# 2. Adicionar todos os arquivos para o controle de versão
git add .

# 3. Criar o primeiro "commit" (um ponto salvo na história do projeto)
git commit -m "Initial commit: LGPD Guardian App v1.0"

# 4. Crie um novo repositório vazio no site do GitHub.

# 5. Conecte seu projeto local ao repositório remoto que você criou.
#    (Substitua a URL abaixo pela URL do seu repositório no GitHub)
#    ex: git remote add origin https://github.com/seu-usuario/lgpd-guardian.git

# 6. Envie o código do seu computador para o GitHub.
#    git push -u origin main
```

---

## 2. Vercel (Publicação na Internet)

A Vercel vai ler seu código do GitHub e publicá-lo online.

1.  Crie uma conta em [vercel.com](https://vercel.com) (você pode usar sua conta do GitHub para se registrar).
2.  No painel principal, clique em **"Add New..."** e depois em **"Project"**.
3.  Selecione o repositório do GitHub do seu projeto (`lgpd-guardian`) e clique em **"Import"**.

### ⚠️ ETAPA CRÍTICA: Configuração da Chave da IA ⚠️

Antes de clicar em "Deploy", você **PRECISA** informar à Vercel qual é a sua chave de API do Gemini. Sem isso, a IA não funcionará.

O projeto usa **Vite**, que por segurança só expõe variáveis de ambiente que começam com o prefixo `VITE_`.

1.  Na tela de configuração do projeto (antes do deploy final), encontre a seção chamada **"Environment Variables"**.

2.  Crie uma nova variável com os seguintes dados:
    *   **Name (Nome/Chave):** `VITE_API_KEY` (É crucial começar com `VITE_`)
    *   **Value (Valor):** Cole aqui a sua chave de API do Google AI. (Ex: `AIzaSy...`)

3.  Clique no botão **"Add"** para salvar a variável.

### 3. Finalizar a Publicação

1.  Agora sim, clique no botão azul **"Deploy"**.
2.  A Vercel irá construir (build) seu projeto. Isso pode levar alguns minutos.
3.  Quando terminar, você verá uma tela de sucesso com uma imagem do seu site. Clique nela para visitar sua aplicação publicada e funcionando!

---

## Solução de Problemas Comuns

**"A IA funciona no meu computador, mas não no site da Vercel."**

Este é o problema mais comum e quase sempre está relacionado à variável de ambiente.

1.  **Verifique o Nome e o Valor:** Vá ao painel do seu projeto na Vercel. Clique na aba **"Settings"**, e depois em **"Environment Variables"** no menu lateral. Confirme se a variável se chama **exatamente** `VITE_API_KEY` e se o valor dela está 100% correto (sem espaços extras, etc.).

2.  **Faça o Redeploy:** Se você adicionou ou corrigiu a `VITE_API_KEY` *depois* de já ter feito o deploy inicial, a Vercel não aplica a mudança automaticamente. Você precisa forçar uma nova construção:
    *   Vá na aba **"Deployments"** do seu projeto na Vercel.
    *   Encontre o deploy mais recente (o do topo da lista).
    *   Clique no menu de três pontos (`...`) à direita e selecione **"Redeploy"**.
    *   Confirme o redeploy. Isso irá reconstruir o projeto, agora com a chave correta.