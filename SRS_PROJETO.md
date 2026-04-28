# SRS - Sistema de Agendamento

## 1. Introdução

### Objetivo do documento

Este documento descreve os requisitos, funcionalidades, telas, APIs, entidades, regras de negócio e lacunas identificadas no código existente do projeto `sistema-agendamento`. A análise foi baseada na estrutura real do repositório, incluindo frontend, backend, serviços, rotas, models, banco de dados e componentes de interface.

### Escopo identificado no projeto

O sistema implementa uma plataforma web para agendamento de aulas entre alunos e um usuário administrador/professor. O escopo identificado inclui:

- Cadastro e login de usuários.
- Controle de perfis `admin` e `student`.
- Visualização de calendário e slots de aula.
- Solicitação de horários por alunos.
- Aprovação, rejeição e cancelamento de solicitações de agendamento.
- Criação de bookings confirmados a partir de solicitações aprovadas.
- Gestão de planos, solicitações de planos e assinaturas.
- Gestão administrativa de regras e exceções de disponibilidade.
- Geração de slots de calendário.
- Configurações gerais do sistema.
- Dashboard administrativo com métricas.

### Visão geral do sistema

O sistema é uma aplicação web full stack. O frontend é uma aplicação React com Vite, React Router e Material UI. O backend é uma API REST em Node.js com Express, autenticação JWT e persistência em MySQL. O domínio principal é o agendamento de aulas por horários previamente gerados no calendário.

## 2. Análise da Estrutura do Projeto

### Tecnologias identificadas

Frontend:

- React 19.
- Vite.
- React Router DOM.
- Material UI e MUI Icons.
- Axios.
- ESLint.

Backend:

- Node.js.
- Express 5.
- MySQL com `mysql2/promise`.
- JWT com `jsonwebtoken`.
- Hash de senha com `bcryptjs`.
- CORS.
- Dotenv.
- Nodemon para desenvolvimento.

Banco de dados:

- MySQL.
- Script SQL em `backend/src/database/schema.sql`.
- Scripts Node para criação de schema, seed e drop.

### Estrutura de pastas

```text
backend/
  src/
    config/
    controllers/
    database/
    middlewares/
    models/
    routes/
    services/
    utils/
    app.js
    server.js
frontend/
  src/
    components/
    contexts/
    hooks/
    pages/
    routes/
    services/
    utils/
```

### Principais arquivos

- `backend/src/app.js`: inicializa Express, CORS, JSON, rotas e middlewares de erro.
- `backend/src/server.js`: testa conexão MySQL e inicia servidor.
- `backend/src/routes/index.js`: agrega todas as rotas da API.
- `backend/src/database/schema.sql`: define tabelas, constraints e seed inicial de planos.
- `backend/src/database/run-system-settings-seed.js`: popula configurações do sistema e cria admin padrão.
- `frontend/src/routes/AppRouter.jsx`: define rotas públicas, protegidas e por perfil.
- `frontend/src/contexts/AuthContext.jsx`: gerencia autenticação, login, cadastro, logout e usuário atual.
- `frontend/src/services/api.js`: configura Axios e injeta token JWT.
- `frontend/src/components/Sidebar.jsx`: navegação por perfil.

### Separação entre frontend, backend e banco de dados

A separação está bem definida:

- Frontend consome a API via serviços em `frontend/src/services`.
- Backend organiza fluxo em `routes -> controllers -> services -> models`.
- Banco de dados é acessado pelos models usando pool MySQL.
- Regras de negócio ficam majoritariamente em `backend/src/services`.

## 3. Visão Geral do Sistema

### O que o sistema faz

O sistema permite que alunos visualizem horários disponíveis, solicitem agendamentos, acompanhem solicitações, agendamentos e assinaturas. Administradores gerenciam disponibilidade, geram agenda, aprovam/rejeitam solicitações, controlam bookings, planos, assinaturas e configurações.

### Problema que o sistema parece resolver

O projeto resolve a necessidade de organizar agenda de aulas, controle de planos pagos/pacotes de aulas, saldo de aulas por aluno e aprovação administrativa de pedidos de horários.

### Público-alvo identificado

- Professor ou administrador responsável pela agenda.
- Alunos que compram planos e solicitam aulas.

### Perfis de usuário identificados

- `admin`: gerencia calendário, planos, assinaturas, solicitações, bookings, regras, exceções e configurações.
- `student`: visualiza horários disponíveis, solicita aulas, solicita planos e acompanha seus próprios dados.

## 4. Funcionalidades Identificadas

### Autenticação e cadastro

- Descrição: permite cadastro público apenas de alunos, login por email/senha e leitura do usuário autenticado.
- Arquivos relacionados: `authRoutes.js`, `authController.js`, `authService.js`, `AuthContext.jsx`, `Login.jsx`, `Register.jsx`.
- Fluxo principal: usuário cadastra ou informa credenciais, backend valida, gera JWT e frontend armazena token e usuário no `localStorage`.
- Regras identificadas: cadastro público só permite `role=student`; email e username são únicos; senha é armazenada com hash; token JWT expira conforme configuração.
- Status: completo.

### Controle de perfil do usuário

- Descrição: usuário autenticado pode atualizar nome, username, email, telefone e senha.
- Arquivos relacionados: `userRoutes.js`, `userController.js`, `userService.js`, `Profile/index.jsx`, `profileService.js`.
- Fluxo principal: tela de perfil envia `PATCH /users/me`; backend valida duplicidade de email/username e senha mínima.
- Regras identificadas: senha nova deve ter pelo menos 6 caracteres; email e username não podem duplicar outro usuário.
- Status: completo.

### Listagem de usuários para administração

- Descrição: admin lista usuários, com filtro por role.
- Arquivos relacionados: `userRoutes.js`, `userService.js`, `usersService.js`, `AdminSubscriptions/index.jsx`.
- Fluxo principal: tela de assinaturas busca alunos com `GET /users?role=student` para popular selects.
- Regras identificadas: apenas admin pode listar usuários; role deve ser `admin` ou `student`.
- Status: completo, mas uso no frontend está concentrado na gestão de assinaturas.

### Calendário público/protegido de slots

- Descrição: exibe calendário mensal/semanal e horários do dia.
- Arquivos relacionados: `calendarSlotRoutes.js`, `calendarSlotService.js`, `Calendar/index.jsx`, componentes em `components/calendar`.
- Fluxo principal: frontend consulta `GET /calendar-slots` e `GET /calendar-slots/day` usando `user_id` e mês/data.
- Regras identificadas: rota exige autenticação; students recebem apenas slots `available`; admins visualizam todos os status.
- Status: parcial, pois a rota `/calendar` é pública no frontend, mas os endpoints de slots exigem token.

### Solicitação de agendamento

- Descrição: aluno solicita um slot disponível.
- Arquivos relacionados: `bookingRequestRoutes.js`, `bookingRequestService.js`, `Calendar/index.jsx`, `bookingRequestService.js` do frontend.
- Fluxo principal: aluno seleciona slot disponível, informa mensagem opcional e envia `POST /booking-requests`.
- Regras identificadas: somente student cria solicitação; slot deve existir e estar `available`; não pode existir solicitação pending para o mesmo slot; configuração `allow_same_day_booking` pode bloquear pedidos para o mesmo dia; slot muda para `pending`.
- Status: completo, com observação de que há geração de mensagem de notificação, mas não há envio real automático identificado.

### Gestão administrativa de solicitações de agendamento

- Descrição: admin lista, filtra, visualiza detalhes, aprova ou rejeita solicitações.
- Arquivos relacionados: `AdminBookingRequests/index.jsx`, componentes `adminBookingRequests`, `bookingRequestService.js`.
- Fluxo principal: admin usa `GET /booking-requests`, `GET /booking-requests/:id`, `PATCH /approve` ou `PATCH /reject`.
- Regras identificadas: somente solicitações `pending` podem ser aprovadas/rejeitadas; ao aprovar exige assinatura ativa com saldo na data; consome uma aula; cria booking confirmado; marca slot como `booked`; ao rejeitar libera slot.
- Status: completo.

### Cancelamento de solicitação pelo aluno

- Descrição: aluno cancela solicitação própria ainda pendente.
- Arquivos relacionados: `MyBookingRequests/index.jsx`, `bookingRequestService.js`.
- Fluxo principal: aluno envia `PATCH /booking-requests/:id/cancel`.
- Regras identificadas: somente dono da solicitação pode cancelar; solicitação precisa estar `pending`; slot volta para `available`.
- Status: completo.

### Gestão de bookings/agendamentos

- Descrição: admin lista bookings, filtra, cancela e reagenda.
- Arquivos relacionados: `bookingRoutes.js`, `bookingService.js`, `AdminBookings/index.jsx`, componentes `adminBookings`.
- Fluxo principal: admin usa `GET /bookings`, `PATCH /bookings/:id/cancel` e `PATCH /bookings/:id/reschedule`.
- Regras identificadas: apenas admin cancela/reagenda; cancelamento libera slot; reagendamento só permite bookings `confirmed`, cancela booking antigo, libera slot atual e cria novo booking em slot disponível.
- Status: parcial, pois não há endpoint/tela para marcar booking como `completed` ou `no_show`, embora os status existam no banco/código.

### Meus agendamentos

- Descrição: student visualiza bookings vinculados ao próprio usuário.
- Arquivos relacionados: `MyBookings/index.jsx`, `bookingsService.js`, `bookingRoutes.js`.
- Fluxo principal: frontend chama `GET /bookings/my`.
- Regras identificadas: apenas student acessa; backend filtra por `student_id` do usuário autenticado.
- Status: completo.

### Gestão de planos

- Descrição: admin cria, lista, edita e remove planos de aula.
- Arquivos relacionados: `planRoutes.js`, `planService.js`, `AdminPlans/index.jsx`, componentes `adminPlans`.
- Fluxo principal: admin usa `GET /plans`, `POST /plans`, `PUT /plans/:id` e `DELETE /plans/:id`.
- Regras identificadas: delete é lógico, alterando `is_active=false`; students visualizam apenas planos ativos; valores numéricos devem ser positivos ou não negativos conforme campo.
- Status: completo. O endpoint `PATCH /plans/:id/toggle-active` existe, mas não foi identificado uso direto no frontend.

### Solicitação de planos por alunos

- Descrição: student visualiza planos ativos e solicita contratação.
- Arquivos relacionados: `Plans.jsx`, `planRequestsService.js`, `planRequestRoutes.js`, `planRequestService.js`.
- Fluxo principal: student chama `GET /plans`, `GET /plan-requests` e `POST /plan-requests`.
- Regras identificadas: apenas student cria; plano deve estar ativo; não pode existir solicitação pending do mesmo aluno para o mesmo plano; gera link WhatsApp com mensagem configurável.
- Status: completo, com observação de que a notificação é retornada/linkada, não enviada automaticamente.

### Aprovação/rejeição de solicitação de plano

- Descrição: admin aprova ou rejeita pedidos de plano.
- Arquivos relacionados: `AdminPlanRequests/index.jsx`, `planRequestService.js`.
- Fluxo principal: admin usa `GET /plan-requests`, `PATCH /plan-requests/:id/approve` e `PATCH /plan-requests/:id/reject`.
- Regras identificadas: solicitação deve estar `pending`; aprovação cria assinatura com período calculado por `default_subscription_duration_days`; assinatura é criada como `active`.
- Status: completo, com lacuna: configuração `auto_activate_subscription_after_approval` é lida, mas o código sempre cria assinatura `active`.

### Gestão de assinaturas

- Descrição: admin cria, edita, filtra e ajusta saldo de assinaturas.
- Arquivos relacionados: `subscriptionRoutes.js`, `subscriptionService.js`, `AdminSubscriptions/index.jsx`, componentes `adminSubscriptions`.
- Fluxo principal: admin usa `GET /subscriptions`, `POST /subscriptions`, `PUT /subscriptions/:id`, `PATCH /status`, `PATCH /remaining-classes`.
- Regras identificadas: assinatura deve ser de usuário `student`; `end_date >= start_date`; total e saldo vêm do plano na criação; saldo não pode ser maior que total; `student_id` e `plan_id` não podem ser alterados na edição.
- Status: completo.

### Minhas assinaturas

- Descrição: student acompanha assinaturas, saldo e solicitações de plano.
- Arquivos relacionados: `MySubscriptions/index.jsx`, componentes `subscriptions` e `planRequests`, `subscriptionsService.js`.
- Fluxo principal: frontend chama `GET /subscriptions/my`, `GET /subscriptions/my/summary` e `GET /plan-requests`.
- Regras identificadas: apenas student acessa suas próprias assinaturas.
- Status: completo.

### Regras de disponibilidade

- Descrição: admin cadastra regras semanais de disponibilidade.
- Arquivos relacionados: `availabilityRuleRoutes.js`, `availabilityRuleService.js`, `AdminAvailabilityRules/index.jsx`.
- Fluxo principal: admin lista, cria, edita e exclui regras.
- Regras identificadas: `weekday` da API deve estar entre 1 e 7; no banco é armazenado de 0 a 6; `end_time > start_time`; duração positiva; `user_id` deve ser de admin.
- Status: completo.

### Exceções de disponibilidade

- Descrição: admin cadastra bloqueios, horários extras ou horários customizados por data.
- Arquivos relacionados: `availabilityExceptionRoutes.js`, `availabilityExceptionService.js`, `AdminAvailabilityExceptions/index.jsx`.
- Fluxo principal: admin lista, cria, edita e exclui exceções.
- Regras identificadas: tipos permitidos `block_full_day`, `block_time_range`, `extra_time_range`, `custom_time_range`; bloqueio de dia inteiro não usa horário; demais tipos exigem `start_time` e `end_time`; `end_time > start_time`.
- Status: completo.

### Geração de agenda

- Descrição: admin gera slots de calendário por usuário e período.
- Arquivos relacionados: `calendarSlotRoutes.js`, `calendarSlotService.js`, `AdminCalendarGeneration/index.jsx`.
- Fluxo principal: admin envia `POST /calendar-slots/generate` com `user_id`, `start_date`, `end_date`.
- Regras identificadas: usa regras ativas, exceções e configurações padrão; preserva slots já vinculados a booking ou solicitação; weekdays têm fallback por configuração; sábado usa lista configurada; domingo sem fallback.
- Status: completo.

### Configurações do sistema

- Descrição: admin visualiza e atualiza configurações de professor, agenda, horários, notificações e assinaturas.
- Arquivos relacionados: `systemSettingRoutes.js`, `systemSettingService.js`, `systemSettingsCatalog.js`, `AdminSystemSettings/index.jsx`.
- Fluxo principal: admin usa `GET /system-settings` e `PUT /system-settings`.
- Regras identificadas: tipos aceitos `string`, `number`, `boolean`, `json`; somente chaves presentes no catálogo podem ser atualizadas.
- Status: completo.

### Dashboard administrativo

- Descrição: admin visualiza métricas, solicitações pendentes recentes e próximos agendamentos.
- Arquivos relacionados: `dashboardRoutes.js`, `dashboardService.js`, `AdminDashboard/index.jsx`.
- Fluxo principal: admin chama `GET /dashboard/admin-summary`.
- Regras identificadas: acesso apenas para admin.
- Status: completo.

## 5. Telas e Interfaces

### Login

- Rota: `/login`.
- Componentes principais: `Login.jsx`.
- Campos: email, senha.
- Botões e ações: entrar, acessar calendário, link para cadastro.
- Integração com API: `POST /auth/login`.

### Cadastro

- Rota: `/register`.
- Componentes principais: `Register.jsx`.
- Campos: nome, username, email, telefone, senha, perfil.
- Botões e ações: cadastrar, link para login.
- Integração com API: `POST /auth/register`.
- Observação: frontend fixa/valida perfil `student`.

### Calendário

- Rota: `/calendar`.
- Componentes principais: `Calendar/index.jsx`, `CalendarHeader`, `CalendarControls`, `CalendarGrid`, `WeeklyCalendarView`, `DaySlots`, `RequestBookingDialog`.
- Campos exibidos: mês, ano, dias, horários, status dos slots, mensagem opcional para solicitação.
- Botões e ações: mês anterior/próximo, hoje, alternar mês/semana, filtrar status, solicitar horário.
- Integração com API: `GET /calendar-slots`, `GET /calendar-slots/day`, `POST /booking-requests`, `GET /system-settings/public`.
- Observação: tela é pública no router, mas a API de slots exige autenticação.

### Dashboard

- Rota: `/dashboard`.
- Componentes principais: `Dashboard.jsx`.
- Campos exibidos: identifica perfil e mostra atalhos.
- Botões e ações: navegação para áreas do perfil.
- Integração com API: não identificada nesta tela genérica.
- Status: parcial; para admin existe tela específica em `/admin` não roteada diretamente como `/dashboard`.

### Perfil

- Rota: `/profile`.
- Componentes principais: `Profile/index.jsx`.
- Campos: nome, username, email, telefone, nova senha.
- Botões e ações: salvar perfil.
- Integração com API: `PATCH /users/me`, `GET /auth/me` via contexto.

### Minhas solicitações de agendamento

- Rota: `/my-booking-requests`.
- Componentes principais: `MyBookingRequests/index.jsx`, `RequestsList`, `RequestCard`, `RequestStatusChip`.
- Campos exibidos: data, horário, status, mensagens.
- Botões e ações: cancelar solicitação pendente.
- Integração com API: `GET /booking-requests/my`, `PATCH /booking-requests/:id/cancel`.

### Meus agendamentos

- Rota: `/my-bookings`.
- Componentes principais: `MyBookings/index.jsx`, `BookingsList`, `BookingCard`, `BookingStatusChip`.
- Campos exibidos: data, horário, professor, plano, status.
- Botões e ações: não foram identificadas ações de alteração pelo aluno.
- Integração com API: `GET /bookings/my`.

### Minhas aulas/assinaturas

- Rota: `/my-subscriptions`.
- Componentes principais: `MySubscriptions/index.jsx`, `SubscriptionSummary`, `SubscriptionsList`, `SubscriptionCard`, `PlanRequestsList`.
- Campos exibidos: assinaturas ativas, aulas restantes, plano, período, status e solicitações de plano.
- Botões e ações: não identificadas ações diretas nesta tela.
- Integração com API: `GET /subscriptions/my`, `GET /subscriptions/my/summary`, `GET /plan-requests`.

### Planos

- Rota: `/plans`.
- Componentes principais: `Plans.jsx`, `PlanRequestStatusChip`.
- Campos exibidos: nome do plano, aulas, aulas por semana, preço, preço por aula, última solicitação.
- Botões e ações: solicitar plano.
- Integração com API: `GET /plans`, `GET /plan-requests`, `POST /plan-requests`, `GET /system-settings/public`.

### Admin - Solicitações de agendamento

- Rota: `/admin/booking-requests`.
- Componentes principais: `AdminBookingRequests/index.jsx`, `RequestsFilters`, `RequestsTable`, `RequestDetailsDialog`, `RejectRequestDialog`.
- Campos: status, data solicitada, student ID, aluno, horário, mensagem do aluno/admin.
- Botões e ações: filtrar, limpar filtros, detalhes, aprovar, rejeitar.
- Integração com API: `GET /booking-requests`, `GET /booking-requests/:id`, `PATCH /booking-requests/:id/approve`, `PATCH /booking-requests/:id/reject`.

### Admin - Agendamentos

- Rota: `/admin/bookings`.
- Componentes principais: `AdminBookings/index.jsx`, `BookingsFilters`, `BookingsTable`, `CancelBookingDialog`, `RescheduleBookingDialog`.
- Campos: status, data, ID do aluno, aluno, plano, horário, aulas restantes.
- Botões e ações: filtrar, limpar, cancelar, reagendar.
- Integração com API: `GET /bookings`, `PATCH /bookings/:id/cancel`, `PATCH /bookings/:id/reschedule`.

### Admin - Regras da agenda

- Rota: `/admin/availability-rules`.
- Componentes principais: `AdminAvailabilityRules/index.jsx`, `RuleFormDialog`, `RulesTable`.
- Campos: user ID, dia da semana, início, fim, duração do slot, regra ativa.
- Botões e ações: filtrar por user ID, nova regra, editar, excluir.
- Integração com API: `GET/POST/PUT/DELETE /availability-rules`.

### Admin - Exceções da agenda

- Rota: `/admin/availability-exceptions`.
- Componentes principais: `AdminAvailabilityExceptions/index.jsx`, `ExceptionFormDialog`, `ExceptionsTable`.
- Campos: user ID, data, tipo, início, fim, motivo.
- Botões e ações: filtrar por user ID, nova exceção, editar, excluir.
- Integração com API: `GET/POST/PUT/DELETE /availability-exceptions`.

### Admin - Gerar agenda

- Rota: `/admin/calendar-generation`.
- Componentes principais: `AdminCalendarGeneration/index.jsx`, `GenerationForm`.
- Campos: user ID, data inicial, data final.
- Botões e ações: gerar agenda.
- Integração com API: `POST /calendar-slots/generate`, `GET /system-settings/public`.

### Admin - Solicitações de planos

- Rota: `/admin/plan-requests`.
- Componentes principais: `AdminPlanRequests/index.jsx`, `PlanRequestsTable`.
- Campos: aluno, plano, status, datas, valores.
- Botões e ações: aprovar, rejeitar.
- Integração com API: `GET /plan-requests`, `PATCH /plan-requests/:id/approve`, `PATCH /plan-requests/:id/reject`.

### Admin - Planos

- Rota: `/admin/plans`.
- Componentes principais: `AdminPlans/index.jsx`, `PlanFormDialog`, `PlansTable`.
- Campos: nome, aulas totais, aulas por semana, preço, preço por aula, status.
- Botões e ações: novo plano, editar, excluir/desativar.
- Integração com API: `GET /plans`, `POST /plans`, `PUT /plans/:id`, `DELETE /plans/:id`.

### Admin - Assinaturas

- Rota: `/admin/subscriptions`.
- Componentes principais: `AdminSubscriptions/index.jsx`, `SubscriptionsFilters`, `SubscriptionsTable`, `SubscriptionFormDialog`, `AdjustClassesDialog`.
- Campos: aluno, plano, total de aulas, restantes, status, início, fim.
- Botões e ações: filtrar, criar, editar, ajustar aulas restantes.
- Integração com API: `GET/POST/PUT /subscriptions`, `PATCH /subscriptions/:id/status`, `PATCH /subscriptions/:id/remaining-classes`, `GET /users?role=student`, `GET /plans`.

### Admin - Configurações

- Rota: `/admin/system-settings`.
- Componentes principais: `AdminSystemSettings/index.jsx`, `SettingsSection`, `SettingsField`.
- Campos: nome/telefone/email do professor, duração do slot, limite diário, permitir mesmo dia, horários padrão, horas excluídas, horários de sábado, templates de notificação, duração de assinatura, autoativação.
- Botões e ações: salvar seção.
- Integração com API: `GET /system-settings`, `PUT /system-settings`.

## 6. Backend e APIs

Formato geral de resposta identificado: os controllers usam `sendSuccess`, retornando mensagens e objeto `data`. Erros são tratados por middlewares de erro.

| Método | Rota | Responsável | Entrada esperada | Saída esperada | Permissão |
|---|---|---|---|---|---|
| GET | `/` | `routes/index.js` | nenhuma | texto `API running` | pública |
| GET | `/health` | `routes/index.js` | nenhuma | `{ success, message }` | pública |
| POST | `/auth/register` | `authController.register` | `name`, `username`, `email`, `password`, `role`, `phone?` | `token`, `user` | pública |
| POST | `/auth/login` | `authController.login` | `email`, `password` | `token`, `user` | pública |
| GET | `/auth/me` | `authController.getMe` | Bearer token | `user` | autenticado |
| GET | `/auth/admin-only` | `authController.getAdminArea` | Bearer token | `user` | admin |
| PATCH | `/users/me` | `userController.updateCurrentUser` | campos parciais de perfil | `user` | autenticado |
| GET | `/users` | `userController.listUsers` | filtro `role?` | `users` | admin |
| GET | `/plans` | `planController.listPlans` | nenhuma | `plans` | autenticado |
| POST | `/plans` | `planController.createPlan` | `name`, `total_classes`, `classes_per_week`, `price`, `price_per_class` | `plan` | admin |
| GET | `/plans/:id` | `planController.getPlanById` | `id` | `plan` | autenticado |
| PUT | `/plans/:id` | `planController.updatePlan` | dados do plano | `plan` | admin |
| PATCH | `/plans/:id/toggle-active` | `planController.togglePlanActive` | `is_active?` | `plan` | admin |
| DELETE | `/plans/:id` | `planController.deletePlan` | `id` | plano desativado | admin |
| POST | `/plan-requests` | `planRequestController.createPlanRequest` | `plan_id` | `plan_request`, `whatsapp_link`, mensagem | student |
| GET | `/plan-requests` | `planRequestController.listPlanRequests` | `student_id?`, `plan_id?`, `status?` | `plan_requests` | autenticado; student vê próprias |
| GET | `/plan-requests/:id` | `planRequestController.getPlanRequestById` | `id` | `plan_request` | autenticado |
| PATCH | `/plan-requests/:id/approve` | `planRequestController.approvePlanRequest` | `id` | `plan_request`, `subscription` | admin |
| PATCH | `/plan-requests/:id/reject` | `planRequestController.rejectPlanRequest` | `id` | `plan_request` | admin |
| POST | `/subscriptions` | `subscriptionController.createSubscription` | `student_id`, `plan_id`, `start_date`, `end_date`, `status?` | `subscription` | admin |
| GET | `/subscriptions/my/summary` | `subscriptionController.getMySubscriptionsSummary` | nenhuma | resumo e assinatura atual | student |
| GET | `/subscriptions/my` | `subscriptionController.listMySubscriptions` | nenhuma | `subscriptions` | student |
| GET | `/subscriptions` | `subscriptionController.listSubscriptions` | `student_id?`, `plan_id?`, `status?` | `subscriptions` | admin |
| GET | `/subscriptions/:id` | `subscriptionController.getSubscriptionById` | `id` | `subscription` | autenticado; student só própria |
| PUT | `/subscriptions/:id` | `subscriptionController.updateSubscription` | `start_date`, `end_date`, `status?` | `subscription` | admin |
| PATCH | `/subscriptions/:id/status` | `subscriptionController.updateSubscriptionStatus` | `status` | `subscription` | admin |
| PATCH | `/subscriptions/:id/remaining-classes` | `subscriptionController.updateRemainingClasses` | `remaining_classes` | `subscription` | admin |
| POST | `/availability-rules` | `availabilityRuleController.createRule` | `user_id`, `weekday`, `start_time`, `end_time`, `slot_duration_minutes`, `is_active?` | `rule` | admin |
| GET | `/availability-rules` | `availabilityRuleController.listRules` | `user_id?` | `rules` | admin |
| GET | `/availability-rules/:id` | `availabilityRuleController.getRuleById` | `id` | `rule` | admin |
| PUT | `/availability-rules/:id` | `availabilityRuleController.updateRule` | dados da regra | `rule` | admin |
| DELETE | `/availability-rules/:id` | `availabilityRuleController.deleteRule` | `id` | sucesso | admin |
| POST | `/availability-exceptions` | `availabilityExceptionController.createException` | `user_id`, `exception_date`, `type`, `start_time?`, `end_time?`, `reason?` | `exception` | admin |
| GET | `/availability-exceptions` | `availabilityExceptionController.listExceptions` | `user_id?`, `start_date?`, `end_date?` | `exceptions` | admin |
| GET | `/availability-exceptions/:id` | `availabilityExceptionController.getExceptionById` | `id` | `exception` | admin |
| PUT | `/availability-exceptions/:id` | `availabilityExceptionController.updateException` | dados da exceção | `exception` | admin |
| DELETE | `/availability-exceptions/:id` | `availabilityExceptionController.deleteException` | `id` | sucesso | admin |
| POST | `/calendar-slots/generate` | `calendarSlotController.generateSlots` | `user_id`, `start_date`, `end_date` | `generation_summary` | admin |
| GET | `/calendar-slots` | `calendarSlotController.listSlotsByMonth` | `user_id`, `month=YYYY-MM` | `slots` | autenticado |
| GET | `/calendar-slots/day` | `calendarSlotController.listSlotsByDay` | `user_id`, `date=YYYY-MM-DD` | `slots` | autenticado |
| POST | `/booking-requests` | `bookingRequestController.createBookingRequest` | `teacher_id`, `requested_date`, `start_time`, `end_time`, `student_message?` | `booking_request` | student |
| GET | `/booking-requests/my` | `bookingRequestController.listMyBookingRequests` | nenhuma | `booking_requests` | student |
| GET | `/booking-requests` | `bookingRequestController.listBookingRequests` | `status?`, `student_id?`, `teacher_id?`, `requested_date?` | `booking_requests` | admin |
| GET | `/booking-requests/:id` | `bookingRequestController.getBookingRequestById` | `id` | `booking_request` | autenticado |
| PATCH | `/booking-requests/:id/approve` | `bookingRequestController.approveBookingRequest` | `admin_message?` | `booking_request`, `booking`, `subscription` | admin |
| PATCH | `/booking-requests/:id/reject` | `bookingRequestController.rejectBookingRequest` | `admin_message?` | `booking_request` | admin |
| PATCH | `/booking-requests/:id/cancel` | `bookingRequestController.cancelBookingRequest` | `id` | `booking_request` | student |
| GET | `/bookings/my` | `bookingController.listMyBookings` | nenhuma | `bookings` | student |
| GET | `/bookings` | `bookingController.listBookings` | `student_id?`, `teacher_id?`, `booking_date?`, `status?` | `bookings` | admin |
| GET | `/bookings/:id` | `bookingController.getBookingById` | `id` | `booking` | autenticado |
| PATCH | `/bookings/:id/cancel` | `bookingController.cancelBooking` | `notes?` | `booking` | admin |
| PATCH | `/bookings/:id/reschedule` | `bookingController.rescheduleBooking` | `new_date`, `new_start_time`, `new_end_time`, `notes?` | `cancelled_booking`, `new_booking` | admin |
| GET | `/dashboard/admin-summary` | `dashboardController.getAdminSummary` | nenhuma | métricas, pendências, próximos bookings | admin |
| GET | `/system-settings/public` | `systemSettingController.listPublicSettings` | nenhuma | `settings` | pública |
| GET | `/system-settings` | `systemSettingController.listSettings` | nenhuma | `settings` | admin |
| PUT | `/system-settings` | `systemSettingController.updateManySettings` | `{ settings: { chave: valor } }` | `settings` | admin |
| GET | `/system-settings/:key` | `systemSettingController.getSettingByKey` | `key` | `setting` | admin |
| PUT | `/system-settings/:key` | `systemSettingController.updateSetting` | `value` ou `setting_value` | `setting` | admin |

## 7. Banco de Dados

### Entidades/tabelas identificadas

#### `users`

Campos principais: `id`, `name`, `username`, `email`, `password`, `role`, `phone`, `created_at`, `updated_at`.

Relacionamentos: referenciada por assinaturas, regras/exceções, solicitações e bookings.

#### `plans`

Campos principais: `id`, `name`, `total_classes`, `classes_per_week`, `price`, `price_per_class`, `is_active`, timestamps.

Relacionamentos: referenciada por `subscriptions` e `plan_requests`.

#### `system_settings`

Campos principais: `id`, `setting_key`, `setting_value`, `value_type`, timestamps.

Relacionamentos: sem FK; usada para parametrização do sistema.

#### `subscriptions`

Campos principais: `id`, `student_id`, `plan_id`, `start_date`, `end_date`, `total_classes`, `remaining_classes`, `status`.

Relacionamentos: `student_id -> users.id`, `plan_id -> plans.id`; referenciada por `bookings`.

#### `availability_rules`

Campos principais: `id`, `user_id`, `weekday`, `start_time`, `end_time`, `slot_duration_minutes`, `is_active`.

Relacionamentos: `user_id -> users.id`.

#### `availability_exceptions`

Campos principais: `id`, `user_id`, `exception_date`, `type`, `start_time`, `end_time`, `reason`.

Relacionamentos: `user_id -> users.id`.

#### `booking_requests`

Campos principais: `id`, `student_id`, `teacher_id`, `requested_date`, `start_time`, `end_time`, `status`, `student_message`, `admin_message`.

Relacionamentos: `student_id` e `teacher_id` apontam para `users`.

#### `bookings`

Campos principais: `id`, `booking_request_id`, `student_id`, `teacher_id`, `subscription_id`, `booking_date`, `start_time`, `end_time`, `status`, `notes`.

Relacionamentos: aponta para `booking_requests`, `users` e `subscriptions`.

Observação: `booking_request_id` está definido como `NOT NULL` no `CREATE TABLE`, mas o script executa `ALTER TABLE bookings MODIFY subscription_id BIGINT UNSIGNED NULL;`. O código de reagendamento cria booking com `bookingRequestId: null`, o que conflita com `booking_request_id NOT NULL`. Essa é uma lacuna importante.

#### `calendar_slots`

Campos principais: `id`, `user_id`, `slot_date`, `start_time`, `end_time`, `status`, `booking_request_id`, `booking_id`, `source`.

Relacionamentos: aponta para `users`, `booking_requests` e `bookings`.

### Scripts de migration/seed

- `backend/src/database/schema.sql`: cria tabelas e popula planos iniciais.
- `backend/src/database/run-schema.js`: cria database se necessário e aplica schema.
- `backend/src/database/run-system-settings-seed.js`: popula configurações do catálogo e cria admin padrão.
- `backend/src/database/drop-database.js`: identificado, mas não detalhado neste documento.

### Observações sobre possíveis lacunas

- Não há ferramenta formal de migrations incremental; há script SQL monolítico.
- O schema parece incompatível com o fluxo de reagendamento por causa de `bookings.booking_request_id NOT NULL`.
- Não há tabela específica para pagamentos, transações financeiras ou histórico de consumo de aulas.
- Não há campo de status pendente/inativo em assinaturas, apesar da configuração de autoativação sugerir evolução futura.

## 8. Autenticação e Permissões

### Forma de login identificada

Login por email e senha em `POST /auth/login`. A senha é comparada com hash bcrypt. O backend retorna JWT com `sub`, `role` e `email`.

### Controle de acesso

O backend usa:

- `authenticate`: valida header `Authorization: Bearer <token>`.
- `authorizeRoles`: restringe rotas por `admin` ou `student`.

O frontend usa:

- `AuthContext` para guardar token/usuário.
- `ProtectedRoute` para proteger rotas e perfis.
- `Sidebar` filtra navegação por role.

### Perfis de usuário

- `admin`.
- `student`.

### Proteções de rotas

Rotas públicas no frontend:

- `/login`.
- `/register`.
- `/calendar`.

Rotas autenticadas:

- `/dashboard`.
- `/profile`.

Rotas student:

- `/my-booking-requests`.
- `/my-bookings`.
- `/my-subscriptions`.
- `/plans`.

Rotas admin:

- `/admin/booking-requests`.
- `/admin/bookings`.
- `/admin/availability-rules`.
- `/admin/availability-exceptions`.
- `/admin/calendar-generation`.
- `/admin/plan-requests`.
- `/admin/plans`.
- `/admin/system-settings`.
- `/admin/subscriptions`.

### Uso de token, sessão ou middleware

O sistema usa JWT stateless armazenado no `localStorage`. Não foi identificado uso de sessão server-side, refresh token ou rotação de token.

## 9. Fluxos do Sistema

### Cadastro

1. Usuário acessa `/register`.
2. Preenche nome, username, email, telefone, senha e perfil `student`.
3. Frontend chama `POST /auth/register`.
4. Backend valida obrigatórios, role, duplicidade de email/username.
5. Backend cria usuário com senha hasheada.
6. Token e usuário são retornados e armazenados.

### Login

1. Usuário acessa `/login`.
2. Informa email e senha.
3. Frontend chama `POST /auth/login`.
4. Backend valida credenciais.
5. Token e usuário são armazenados no frontend.

### Listagem

Listagens seguem padrão de chamada via serviços do frontend para endpoints REST. Admin lista recursos globais; student lista apenas recursos próprios em endpoints `/my` ou por filtro automático no service.

### Criação

Criações implementadas: usuário, plano, solicitação de plano, assinatura, regra, exceção, slots gerados e solicitação de agendamento.

### Edição

Edições implementadas: perfil, plano, assinatura, saldo de assinatura, status de assinatura, regras, exceções, configurações.

### Exclusão

Exclusões implementadas:

- Regras e exceções são removidas fisicamente.
- Planos são desativados por delete lógico (`is_active=false`).

### Fluxo específico: solicitar aula

1. Student seleciona slot disponível no calendário.
2. Envia solicitação com data, horário, professor e mensagem opcional.
3. Backend valida slot disponível e reserva como `pending`.
4. Admin aprova ou rejeita.
5. Se aprovado, backend localiza assinatura ativa com saldo, cria booking confirmado, decrementa saldo e marca slot como `booked`.
6. Se rejeitado/cancelado, slot volta para `available`.

### Fluxo específico: contratar plano

1. Student acessa `/plans`.
2. Escolhe plano ativo.
3. Backend cria `plan_request` pending e retorna mensagem/link de WhatsApp.
4. Admin aprova ou rejeita.
5. Se aprovado, backend cria assinatura ativa com saldo igual ao total de aulas do plano.

### Fluxo específico: gerar agenda

1. Admin informa user ID e período.
2. Backend busca regras ativas, exceções e configurações padrão.
3. Slots são calculados por dia.
4. Slots livres não vinculados são removidos e recriados.
5. Slots com booking ou solicitação são preservados.

## 10. Requisitos Funcionais

- RF001 - O sistema deve permitir cadastro público de usuários do tipo aluno.
- RF002 - O sistema deve impedir cadastro público de usuários administradores.
- RF003 - O sistema deve permitir login por email e senha.
- RF004 - O sistema deve emitir token JWT após login ou cadastro válido.
- RF005 - O sistema deve permitir consultar o usuário autenticado.
- RF006 - O sistema deve permitir atualização do perfil do usuário autenticado.
- RF007 - O sistema deve permitir que admins listem usuários por perfil.
- RF008 - O sistema deve permitir que admins cadastrem planos.
- RF009 - O sistema deve permitir que admins editem planos.
- RF010 - O sistema deve permitir que admins desativem planos.
- RF011 - O sistema deve permitir que alunos listem apenas planos ativos.
- RF012 - O sistema deve permitir que alunos solicitem planos.
- RF013 - O sistema deve impedir solicitação duplicada pendente do mesmo plano pelo mesmo aluno.
- RF014 - O sistema deve permitir que admins aprovem solicitações de plano.
- RF015 - O sistema deve criar assinatura ao aprovar solicitação de plano.
- RF016 - O sistema deve permitir que admins rejeitem solicitações de plano.
- RF017 - O sistema deve permitir que alunos consultem suas assinaturas.
- RF018 - O sistema deve permitir que admins criem assinaturas manualmente.
- RF019 - O sistema deve permitir que admins editem período e status de assinatura.
- RF020 - O sistema deve permitir que admins ajustem saldo de aulas de assinatura.
- RF021 - O sistema deve permitir que admins criem regras semanais de disponibilidade.
- RF022 - O sistema deve permitir que admins editem regras de disponibilidade.
- RF023 - O sistema deve permitir que admins excluam regras de disponibilidade.
- RF024 - O sistema deve permitir que admins criem exceções de disponibilidade.
- RF025 - O sistema deve permitir que admins editem exceções de disponibilidade.
- RF026 - O sistema deve permitir que admins excluam exceções de disponibilidade.
- RF027 - O sistema deve permitir que admins gerem slots de calendário por período.
- RF028 - O sistema deve preservar slots vinculados a solicitações ou bookings durante geração.
- RF029 - O sistema deve permitir consulta de slots por mês.
- RF030 - O sistema deve permitir consulta de slots por dia.
- RF031 - O sistema deve limitar alunos a visualizar slots disponíveis.
- RF032 - O sistema deve permitir que alunos solicitem slots disponíveis.
- RF033 - O sistema deve impedir solicitação de slot indisponível.
- RF034 - O sistema deve permitir que alunos cancelem solicitações pendentes próprias.
- RF035 - O sistema deve permitir que admins aprovem solicitações de agendamento.
- RF036 - O sistema deve criar booking confirmado ao aprovar solicitação de agendamento.
- RF037 - O sistema deve consumir uma aula da assinatura ao aprovar agendamento.
- RF038 - O sistema deve marcar assinatura como concluída quando saldo chegar a zero.
- RF039 - O sistema deve permitir que admins rejeitem solicitações de agendamento.
- RF040 - O sistema deve permitir que alunos consultem suas solicitações de agendamento.
- RF041 - O sistema deve permitir que alunos consultem seus bookings.
- RF042 - O sistema deve permitir que admins listem bookings com filtros.
- RF043 - O sistema deve permitir que admins cancelem bookings.
- RF044 - O sistema deve permitir que admins reagendem bookings confirmados.
- RF045 - O sistema deve permitir que admins consultem dashboard administrativo.
- RF046 - O sistema deve permitir que admins editem configurações do sistema.
- RF047 - O sistema deve expor configurações públicas necessárias ao frontend.

## 11. Requisitos Não Funcionais

### Segurança

- RNF001 - O sistema deve armazenar senhas com hash bcrypt.
- RNF002 - O sistema deve proteger rotas privadas com JWT.
- RNF003 - O sistema deve restringir ações administrativas ao perfil `admin`.
- RNF004 - O sistema deve impedir que students acessem dados de outros students nos endpoints implementados.
- RNF005 - O segredo JWT deve ser configurado por variável de ambiente em produção.

### Usabilidade

- RNF006 - O frontend deve apresentar feedback de carregamento, erro e sucesso.
- RNF007 - O sistema deve oferecer filtros em listagens administrativas.
- RNF008 - O sistema deve usar componentes visuais de status para solicitações, bookings e assinaturas.

### Organização do código

- RNF009 - O backend deve manter separação entre routes, controllers, services e models.
- RNF010 - O frontend deve centralizar chamadas HTTP em services.
- RNF011 - O frontend deve centralizar estado de autenticação em contexto.

### Performance

- RNF012 - O backend deve usar pool de conexões MySQL.
- RNF013 - Operações críticas de aprovação/cancelamento devem usar transações.
- RNF014 - Listagens por data/status devem usar índices existentes no schema.

### Responsividade

- RNF015 - O frontend deve usar layout responsivo com drawer mobile e permanente em desktop.

### Manutenibilidade

- RNF016 - Configurações operacionais devem ficar no catálogo `systemSettingsCatalog`.
- RNF017 - Regras de negócio complexas devem permanecer nos services, não nos controllers.

## 12. Regras de Negócio

- RN001 - Cadastro público só pode criar usuários `student`.
- RN002 - Email e username devem ser únicos.
- RN003 - Usuários só podem ter roles `admin` ou `student`.
- RN004 - Apenas admins podem gerenciar regras, exceções, planos, assinaturas, configurações e dashboard administrativo.
- RN005 - Students só podem criar solicitações de agendamento e de plano para si mesmos.
- RN006 - Students só visualizam seus próprios bookings, assinaturas e solicitações.
- RN007 - Planos desativados não devem aparecer para usuários não admin.
- RN008 - Excluir plano significa desativar `is_active`.
- RN009 - Solicitação de plano exige plano ativo.
- RN010 - Não pode haver solicitação pendente duplicada do mesmo aluno para o mesmo plano.
- RN011 - Aprovar solicitação de plano cria assinatura com saldo igual ao total de aulas do plano.
- RN012 - Assinatura deve ter `end_date >= start_date`.
- RN013 - Saldo de assinatura não pode ser maior que total de aulas.
- RN014 - Aprovar agendamento exige solicitação `pending`.
- RN015 - Rejeitar ou cancelar solicitação de agendamento exige solicitação `pending`.
- RN016 - Solicitação de agendamento exige slot existente e `available`.
- RN017 - Ao criar solicitação de agendamento, slot muda para `pending`.
- RN018 - Ao rejeitar ou cancelar solicitação, slot volta para `available`.
- RN019 - Aprovar solicitação de agendamento exige assinatura ativa, dentro da data e com saldo.
- RN020 - Aprovar solicitação decrementa uma aula da assinatura.
- RN021 - Se o saldo virar zero, assinatura muda para `completed`.
- RN022 - Aprovar solicitação cria booking com status `confirmed`.
- RN023 - Aprovar solicitação muda slot para `booked`.
- RN024 - Limite diário de bookings usa configuração `default_max_bookings_per_day`.
- RN025 - Solicitações para o mesmo dia podem ser bloqueadas por `allow_same_day_booking`.
- RN026 - Cancelar booking libera o slot correspondente.
- RN027 - Reagendar booking só é permitido para booking `confirmed`.
- RN028 - Reagendar booking exige novo slot existente e `available`.
- RN029 - Reagendamento cancela booking anterior e cria novo booking.
- RN030 - Regras de disponibilidade exigem dia 1 a 7 na API, horário final maior que inicial e duração positiva.
- RN031 - Exceção `block_full_day` não deve ter horários.
- RN032 - Exceções de intervalo exigem início e fim.
- RN033 - Geração de agenda preserva slots já vinculados a booking ou solicitação.

## 13. Pontos Incompletos ou Ausentes

- A rota frontend `/calendar` é pública, mas os endpoints `GET /calendar-slots` e `GET /calendar-slots/day` exigem autenticação. Isso pode causar erro para visitante não logado.
- Existe `frontend/src/pages/Calendar.jsx` como placeholder, mas a rota usa `frontend/src/pages/Calendar/index.jsx`.
- Existe `frontend/src/pages/Requests.jsx` como placeholder e a rota `/requests` apenas redireciona para `/my-booking-requests`.
- Não foi identificado endpoint ou tela para marcar booking como `completed` ou `no_show`, apesar dos status existirem.
- O fluxo de reagendamento cria booking com `bookingRequestId: null`, mas o schema define `bookings.booking_request_id NOT NULL`. Isso pode falhar no banco.
- A configuração `auto_activate_subscription_after_approval` é lida, mas aprovação de plano sempre cria assinatura `active`.
- Não há envio real de WhatsApp, email ou notificação; o sistema apenas retorna mensagem/link.
- Alguns filtros administrativos usam IDs manuais (`student_id`, `teacher_id`, `user_id`) em vez de selects/autocomplete, especialmente em bookings, booking requests, regras e exceções.
- Não há tela identificada para criação de usuário admin; admin padrão vem de seed.
- Não há controle de refresh token, expiração no frontend ou logout automático ao token expirar além do erro de API.
- Não há testes automatizados identificados.
- Não há documentação de API OpenAPI/Swagger identificada.
- Não há paginação nas listagens.
- Não há controle financeiro/pagamentos, apesar de planos terem preço.
- Não há migrations incrementais; o schema é monolítico.
- Não há auditoria/histórico de alterações de saldo de aulas.

## 14. Recomendações Técnicas

### Organização

- Remover ou consolidar páginas placeholder não roteadas, como `frontend/src/pages/Calendar.jsx` e `Requests.jsx`.
- Criar documentação de setup com ordem de execução de schema, seed, backend e frontend.
- Padronizar nomes visíveis: o backend usa termos como `booking` e `student`; a interface mistura português e inglês.

### Arquitetura

- Adicionar camada de validação padronizada para payloads, evitando validações manuais duplicadas.
- Criar contratos de API documentados, preferencialmente OpenAPI.
- Introduzir paginação e ordenação explícita nas listagens administrativas.

### Banco de dados

- Corrigir `bookings.booking_request_id` para permitir `NULL` se reagendamentos realmente não tiverem solicitação associada, ou alterar o fluxo para criar uma nova solicitação vinculada.
- Migrar de schema monolítico para migrations versionadas.
- Criar tabela de histórico para consumo/ajuste de aulas.
- Avaliar tabela de pagamentos se o controle financeiro entrar no escopo.

### Segurança

- Definir `JWT_SECRET` obrigatório em produção e remover fallback inseguro.
- Avaliar refresh token ou estratégia de renovação/expiração controlada.
- Considerar proteção contra brute force em login.
- Revisar CORS para restringir origens em produção.

### UX/UI

- Substituir campos manuais de ID por selects/autocomplete com busca de usuários/professores.
- Resolver conflito da página pública de calendário com API autenticada: tornar slots públicos somente para disponibilidade ou proteger a rota.
- Adicionar ações administrativas para concluir aula e marcar falta, se esses status forem necessários.
- Exibir mensagens de notificação/WhatsApp de forma consistente após solicitações.

### Integração frontend/backend

- Usar o endpoint `PATCH /plans/:id/toggle-active` no frontend ou remover se não for necessário.
- Alinhar retorno de aprovação de booking request com o frontend, que hoje atualiza apenas `booking_request` no serviço administrativo.
- Tratar token expirado globalmente no interceptor Axios.

### Padronização do projeto

- Padronizar idioma de entidades e mensagens.
- Criar testes unitários para services críticos: aprovação de agendamento, geração de agenda, aprovação de plano e atualização de saldo.
- Criar testes de integração para endpoints transacionais.

## 15. Conclusão

O projeto está em estado funcional avançado para um sistema de agendamento de aulas com perfis de admin e aluno. A arquitetura está organizada em frontend React e backend Express com divisão clara entre rotas, controllers, services e models. As principais regras de negócio do domínio estão implementadas, especialmente solicitação/aprovação de aulas, consumo de saldo e geração de agenda.

Os principais pontos de atenção são a inconsistência entre o schema e o fluxo de reagendamento, a rota pública de calendário consumindo endpoints autenticados, a ausência de ações para status `completed` e `no_show`, a falta de testes automatizados e algumas lacunas de UX em campos que exigem IDs manuais. Para evoluir o sistema, recomenda-se corrigir essas inconsistências, formalizar migrations, documentar a API e ampliar testes sobre os fluxos transacionais críticos.
