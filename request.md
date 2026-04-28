# Endpoints de Backend

Base path atual: `/`

## Status

| Método | Endpoint | Acesso |
| --- | --- | --- |
| GET | `/` | Público |
| GET | `/health` | Público |

## Auth

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/auth/register` | Público |
| POST | `/auth/login` | Público |
| GET | `/auth/me` | Autenticado |
| GET | `/auth/admin-only` | Admin |

## Availability Rules

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/availability-rules` | Admin |
| GET | `/availability-rules` | Admin |
| GET | `/availability-rules/:id` | Admin |
| PUT | `/availability-rules/:id` | Admin |
| DELETE | `/availability-rules/:id` | Admin |

## Availability Exceptions

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/availability-exceptions` | Admin |
| GET | `/availability-exceptions` | Admin |
| GET | `/availability-exceptions/:id` | Admin |
| PUT | `/availability-exceptions/:id` | Admin |
| DELETE | `/availability-exceptions/:id` | Admin |

## Calendar Slots

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/calendar-slots/generate` | Admin |
| GET | `/calendar-slots/day` | Autenticado |
| GET | `/calendar-slots` | Autenticado |

## Booking Requests

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/booking-requests` | Student |
| GET | `/booking-requests/my` | Student |
| GET | `/booking-requests` | Admin |
| PATCH | `/booking-requests/:id/approve` | Admin |
| PATCH | `/booking-requests/:id/reject` | Admin |
| PATCH | `/booking-requests/:id/cancel` | Student |
| GET | `/booking-requests/:id` | Autenticado |

## Bookings

| Método | Endpoint | Acesso |
| --- | --- | --- |
| GET | `/bookings/my` | Student |
| GET | `/bookings` | Admin |
| PATCH | `/bookings/:id/cancel` | Admin |
| PATCH | `/bookings/:id/reschedule` | Admin |
| GET | `/bookings/:id` | Autenticado |

## Dashboard

| Método | Endpoint | Acesso |
| --- | --- | --- |
| GET | `/dashboard/admin-summary` | Admin |

## Plans

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/plans` | Admin |
| GET | `/plans` | Autenticado |
| GET | `/plans/:id` | Autenticado |
| PUT | `/plans/:id` | Admin |
| PATCH | `/plans/:id/toggle-active` | Admin |
| DELETE | `/plans/:id` | Admin |

## Plan Requests

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/plan-requests` | Student |
| GET | `/plan-requests` | Autenticado |
| GET | `/plan-requests/:id` | Autenticado |
| PATCH | `/plan-requests/:id/approve` | Admin |
| PATCH | `/plan-requests/:id/reject` | Admin |

## Subscriptions

| Método | Endpoint | Acesso |
| --- | --- | --- |
| POST | `/subscriptions` | Admin |
| GET | `/subscriptions/my/summary` | Student |
| GET | `/subscriptions/my` | Student |
| GET | `/subscriptions` | Admin |
| GET | `/subscriptions/:id` | Autenticado |
| PUT | `/subscriptions/:id` | Admin |
| PATCH | `/subscriptions/:id/status` | Admin |
| PATCH | `/subscriptions/:id/remaining-classes` | Admin |

## System Settings

| Método | Endpoint | Acesso |
| --- | --- | --- |
| GET | `/system-settings/public` | Público |
| GET | `/system-settings` | Admin |
| PUT | `/system-settings` | Admin |
| GET | `/system-settings/:key` | Admin |
| PUT | `/system-settings/:key` | Admin |

## Users

| Método | Endpoint | Acesso |
| --- | --- | --- |
| PATCH | `/users/me` | Autenticado |
| GET | `/users` | Admin |

## Observações

- `Autenticado` significa que a rota usa o middleware `authenticate`.
- `Admin` significa rota autenticada com `authorizeRoles('admin')`.
- `Student` significa rota autenticada com `authorizeRoles('student')`.
- As rotas estão montadas diretamente em `backend/src/app.js`, sem prefixo global adicional como `/api`.
