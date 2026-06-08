# 🔬 LabSystem - Sistema de Gestão de Laboratório Clínico (Serverless SPA)

Este é um sistema web completo para um **Laboratório de Análises Clínicas**, projetado com foco em usabilidade, segurança e conformidade com a **LGPD (Lei Geral de Proteção de Dados)**.

Esta versão foi convertida em uma **Single Page Application (SPA) 100% Client-Side**, permitindo que o sistema completo (incluindo o banco de dados e a geração de laudos em PDF) rode diretamente no seu navegador através de `localStorage` e bibliotecas de CDN (como `jsPDF`).

---

## 🚀 Como Executar Localmente

Como o sistema é totalmente estático e roda no lado do cliente:
1. **Dê dois cliques no arquivo `index.html`** na raiz da pasta do projeto para abri-lo no seu navegador.
2. Não é necessário rodar nenhum servidor backend nem instalar dependências de node para usar!

### 🔑 Credenciais de Acesso (Demonstração)
*   **Administrador**: `admin@labsystem.com` / Senha: `Admin@123`
*   **Biomédico**: `biomedico@labsystem.com` / Senha: `Bio@123`
*   **Recepção**: `recepcao@labsystem.com` / Senha: `Rec@123`

---

## 🌐 Como Hospedar Gratuitamente no GitHub Pages

Para colocar o sistema online de graça para que qualquer pessoa possa acessá-lo:

### Passo 1: Instalar o Git (caso não tenha)
Caso ainda não tenha o Git instalado no seu computador:
1. Faça o download em [git-scm.com](https://git-scm.com/) e instale-o.

### Passo 2: Criar um Repositório no GitHub
1. Acesse o [GitHub](https://github.com/) e faça login.
2. Clique no botão **New** (Novo) para criar um repositório.
3. Dê um nome ao repositório (ex: `labsystem`) e marque-o como **Public** (Público).
4. Clique em **Create repository** (Criar repositório).

### Passo 3: Enviar o código para o GitHub
Abra o terminal (PowerShell ou CMD) na pasta deste projeto e execute os seguintes comandos:

```bash
# Inicializar o repositório git local
git init

# Adicionar todos os arquivos ao controle de versão
git add .

# Criar o primeiro commit das alterações
git commit -m "feat: configuracao do sistema estatico para github pages"

# Criar a branch principal
git branch -M main

# Vincular ao seu repositório do GitHub (Substitua USERNAME e REPONAME)
git remote add origin https://github.com/USERNAME/REPONAME.git

# Enviar os arquivos para o GitHub
git push -u origin main
```

*(Dica: Se preferir, você também pode simplesmente arrastar e soltar todos os arquivos e pastas deste diretório diretamente na página do repositório no site do GitHub usando o navegador).*

### Passo 4: Ativar o GitHub Pages
1. Na página do seu repositório no GitHub, clique em **Settings** (Configurações) na aba superior.
2. Na barra lateral esquerda, clique em **Pages**.
3. Na seção **Build and deployment** -> **Branch**, selecione **main** (ou a branch padrão) e a pasta `/ (root)`.
4. Clique em **Save** (Salvar).
5. Aguarde cerca de 1 a 2 minutos. O GitHub gerará um link público para o seu site (ex: `https://seu-usuario.github.io/seu-repositorio/`).

---

## 🛡️ Funcionalidades e Conformidade LGPD

*   **Banco de Dados Local (`localStorage`)**: Toda a gravação de dados de pacientes, exames, usuários e requisições persiste no armazenamento local do seu navegador.
*   **Controle de Acesso por Níveis**: Perfis de Recepcionista, Biomédico e Administrador com restrições de tela adequadas.
*   **Anonimização de Dados (LGPD)**: Botão no cadastro de pacientes que substitui permanentemente dados sensíveis (Nome, CPF, Contato) por valores anônimos, revogando o consentimento imediatamente.
*   **Logs de Auditoria**: Aba de Relatórios contendo um histórico completo de logs detalhando quem acessou qual prontuário ou realizou ações no sistema (essencial para conformidade jurídica).
*   **Gerador de Laudos Clínicos em PDF**: Geração de PDFs premium utilizando a biblioteca `jsPDF-AutoTable` diretamente no navegador, destacando automaticamente valores alterados (altos/baixos/críticos) e aplicando assinaturas digitais dos biomédicos responsáveis.
