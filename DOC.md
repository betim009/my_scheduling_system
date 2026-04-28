# Sistema de Agendamento

Guia rápido de uso do ambiente de desenvolvimento.

## Visão geral

- `backend/`: API Node.js + Express + MySQL
- `frontend/`: aplicação React + Vite + MUI
- banco padrão: `sistema_agendamento`
- porta padrão do backend: `3333`
- frontend Vite: normalmente `5173`

## Pré-requisitos

- Node.js 18+
- npm
- MySQL em execução

## Configuração do backend

Arquivo principal de ambiente:

```env
backend/.env
```

Variáveis usadas hoje:

```env
PORT=3333
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=sistema_agendamento
JWT_SECRET=coxinha
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_NAME=Administrador
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@sistema.local
DEFAULT_ADMIN_PASSWORD=123456
DEFAULT_ADMIN_PHONE=
```

## Instalação

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Comandos do backend

Subir em desenvolvimento:

```bash
cd backend
npm run dev
```

Subir em modo normal:

```bash
cd backend
npm start
```

Criar/aplicar schema do banco:

```bash
cd backend
npm run db:schema
```

Rodar seed:

```bash
cd backend
npm run db:seed
```

Dropar o banco:

```bash
cd backend
npm run db:drop
```

Reset completo do banco:

```bash
cd backend
npm run db:drop
npm run db:schema
npm run db:seed
```

## Comandos do frontend

Subir em desenvolvimento:

```bash
cd frontend
npm run dev
```

Build de produção:

```bash
cd frontend
npm run build
```

Lint:

```bash
cd frontend
npm run lint
```

Preview local do build:

```bash
cd frontend
npm run preview
```

## Primeiro acesso

O seed cria automaticamente um admin padrão se ele ainda não existir.

Credenciais padrão atuais:

- email: `admin@sistema.local`
- username: `admin`
- senha: `123456`

Esses valores podem ser alterados no `backend/.env` antes de rodar:

```bash
cd backend
npm run db:seed
```

Depois do login, o usuário pode alterar seus dados em:

- frontend: `/profile`

## Fluxo recomendado para ambiente local

1. Suba o MySQL.
2. Rode o schema:

```bash
cd backend
npm run db:schema
```

3. Rode o seed:

```bash
cd backend
npm run db:seed
```

4. Suba o backend:

```bash
cd backend
npm run dev
```

5. Em outro terminal, suba o frontend:

```bash
cd frontend
npm run dev
```

## URLs úteis

- backend healthcheck:

```text
http://localhost:3333/health
```

- frontend:

```text
http://localhost:5173
```

- login:

```text
http://localhost:5173/login
```

- perfil:

```text
http://localhost:5173/profile
```

- configurações do sistema:

```text
http://localhost:5173/admin/system-settings
```

- gerar agenda:

```text
http://localhost:5173/admin/calendar-generation
```

## Observações importantes

- `npm run db:seed` hoje popula:
  - `system_settings`
  - usuário admin padrão
- o cadastro público pelo frontend cria apenas `student`
- contas `admin` não podem mais ser criadas pela tela de registro
- a geração de agenda agora usa `system_settings` como fallback quando não houver regra ativa

## Comandos rápidos

Subir tudo no dia a dia:

```bash
cd backend && npm run dev
```

em outro terminal:

```bash
cd frontend && npm run dev
```

Resetar tudo e começar limpo:

```bash
cd backend && npm run db:drop && npm run db:schema && npm run db:seed
```
