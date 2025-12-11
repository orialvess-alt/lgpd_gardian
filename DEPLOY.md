# Guia de Publicação - LGPD Guardian

Este guia cobre como colocar o projeto no GitHub e publicá-lo na Vercel garantindo que a Inteligência Artificial funcione.

## 1. GitHub (Armazenamento do Código)

Abra o terminal na pasta do projeto e execute os comandos abaixo sequencialmente:

```bash
# 1. Inicializar o repositório git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar o primeiro commit
git commit -m "Initial commit: LGPD Guardian App"

# 4. (No site do GitHub) Crie um novo repositório vazio.
# 5. Conecte o repositório local ao remoto (substitua a URL abaixo pela do seu repositório):
# git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# 6. Envie o código
# git push -u origin master
```

## 2. Vercel (Publicação em Produção)

Para que a aplicação funcione na internet, usaremos a Vercel.

1.  Crie uma conta em [vercel.com](https://vercel.com) (pode usar o login do GitHub).
2.  No painel, clique em **"Add New..."** -> **"Project"**.
3.  Selecione o repositório do GitHub que você acabou de criar e clique em **Import**.

### ⚠️ ETAPA CRÍTICA: Configuração da API (Environment Variables) ⚠️

Antes de clicar em "Deploy", você **PRECISA** configurar a chave da API, caso contrário a IA não funcionará.

1.  Na tela de configuração do projeto (onde tem o botão "Deploy"), procure a seção **Environment Variables**.
2.  Adicione a seguinte variável:
    *   **Key:** `API_KEY`
    *   **Value:** `AIzaSyDa8pnfqkPiBJBAUnL6wEL63XWdjEnHfzU`
3.  Clique em **Add**.

*Nota: O valor acima é a chave que você forneceu. Em um cenário real de produção, certifique-se de restringir esta chave no Console do Google Cloud para aceitar requisições apenas do domínio da sua aplicação Vercel.*

### 3. Finalizar

1.  Clique em **Deploy**.
2.  Aguarde a construção (Build).
3.  Quando terminar, clique na imagem do site para abrir sua aplicação ao vivo.

## Solução de Problemas

**A IA não está gerando texto:**
1.  Vá no painel da Vercel do seu projeto.
2.  Clique em **Settings** > **Environment Variables**.
3.  Verifique se `API_KEY` está lá e se o valor está correto.
4.  Se você alterou a chave *depois* do deploy, vá na aba **Deployments**, clique nos três pontinhos do último deploy e escolha **Redeploy** para que a nova chave seja embutida no código.
