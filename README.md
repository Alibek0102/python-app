# Merch Store

Внутренний магазин мерча за корпоративные коины. Stack: FastAPI + PostgreSQL + Next.js.

## Быстрый старт

```bash
docker compose up --build
```

Первый запуск: если БД уже была создана на старой схеме (TIMESTAMP WITHOUT TIME ZONE), сбросить volume:

```bash
docker compose down -v
docker compose up --build
```

## Сервисы

| Сервис    | URL                             | Описание                       |
|-----------|---------------------------------|--------------------------------|
| Frontend  | http://localhost:3100           | Next.js UI                     |
| Backend   | http://localhost:8000           | FastAPI                        |
| Swagger   | http://localhost:8000/docs      | OpenAPI документация           |
| pgAdmin   | http://localhost:5050           | UI для PostgreSQL              |
| Postgres  | localhost:5432                  | База данных                    |

## Тестовые аккаунты

| Роль  | Email              | Пароль    | Баланс коинов |
|-------|--------------------|-----------|---------------|
| Admin | admin@company.com  | admin123  | 9999          |
| User  | user@company.com   | user123   | 150           |

## Доступ к БД

**Из хоста (psql, DBeaver и т.п.):**

- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `postgres`
- database: `merch_store`

**Через pgAdmin** (http://localhost:5050):

- login: `admin@admin.com`
- password: `admin`
- Добавить сервер → Connection:
  - host: `db` (имя контейнера в docker network)
  - port: `5432`
  - user: `postgres`
  - password: `postgres`
  - database: `merch_store`

## API (основные группы)

- `POST /auth/login` — получить JWT.
- `GET  /store/products` — каталог товаров.
- `POST /store/orders` — оформить заказ (списать коины).
- `GET  /profile/me` — текущий пользователь.
- `GET  /profile/transactions` — история транзакций.
- `/admin/*` — админские эндпоинты (только роль `ADMIN`).

Подробности и формы запросов: http://localhost:8000/docs

## Остановка

```bash
docker compose down          # оставить данные
docker compose down -v       # включая volumes (сбросить БД и pgAdmin)
```

## Структура

```
backend/   — FastAPI (app/, alembic/, seed.py, Dockerfile)
frontend/  — Next.js
docker-compose.yml
```
