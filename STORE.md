# Peptides Nepal — online store

The store is two apps in this repo, separate from the static education site at the root:

- `backend/` — FastAPI + SQLAlchemy + pyodbc, talking to Microsoft SQL Server.
- `frontend/` — Next.js 16 (App Router) + Tailwind CSS 3.

## Folder structure

```
backend/
  app/
    main.py            FastAPI app: CORS, rate limiting, security headers, routers
    config.py          Settings from environment variables
    database.py        Engine + connection pool, get_db()
    models.py          ORM models (mirror sql/001_schema.sql)
    schemas.py         Pydantic request/response models (strict validation)
    security.py        bcrypt hashing, JWT create/verify
    deps.py            Current-user and admin dependencies
    rate_limit.py      slowapi limiter and per-route limits
    create_admin.py    CLI: create or promote an admin
    routers/
      auth.py          POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
      categories.py    GET  /api/categories
      products.py      GET  /api/products, GET /api/products/{slug}; admin POST/PATCH
      orders.py        POST /api/orders, GET /api/orders/me, GET /api/orders/{id}; admin list + status
      contact.py       POST /api/contact; admin inbox + mark read
  sql/
    001_schema.sql     T-SQL: tables, keys, constraints, indexes
    002_seed.sql       T-SQL: categories + starter products
  tests/               pytest suite (runs on SQLite, no SQL Server needed)
  Dockerfile           Production image with ODBC Driver 18
  requirements.txt
  .env.example

frontend/
  app/
    layout.tsx         Fonts, navbar, footer, WhatsApp button
    page.tsx           Home
    shop/              Product listing with category chips, search, sort, paging
    products/[slug]/   Product detail with purity and COA
    lab-results/       All purity results and COAs in one table
    guides/            Protocols & guides (+ [slug] articles)
    contact/           Contact form
    cart/ checkout/    Cart and checkout (checkout needs sign-in)
    login/ register/ account/
  components/          Navbar, Footer, WhatsAppButton, ProductCard, PurityBadge, forms, providers
  lib/                 API client, types, site config, guide content, formatters
  public/products/     Vial illustrations
  tailwind.config.ts
  next.config.ts       Security headers + CSP
  .env.example
```

## What the schema adds to the brief

- **OrderItems** — an order needs its lines (product, quantity, price paid). Prices are copied at checkout.
- **Orders** also stores delivery name, phone, address, city and notes.
- **Slug** on Categories and Products for readable URLs (`/products/bpc-157-5mg`).
- **IsActive** on Products to hide a product without deleting order history.
- **PurityPercentage** and **COA_ImageURL** allow NULL. The site shows "Lab report pending" until you add real figures.

## Payments

Orders record the chosen method (eSewa, Khalti or COD) with status `Pending`. There is no live eSewa or Khalti gateway. Those need merchant credentials. For now you confirm payment by hand and set the status with the admin endpoint:

```
PATCH /api/orders/{id}/status   {"status": "Paid"}
```

Cancelling an order puts its stock back.

## Local development

Backend (needs Python 3.11+, SQL Server, and [ODBC Driver 18](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)):

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # fill in DB_* and JWT_SECRET_KEY
sqlcmd -S localhost -U sa -P '<password>' -C -i sql/001_schema.sql
sqlcmd -S localhost -U sa -P '<password>' -C -i sql/002_seed.sql
python -m app.create_admin --email you@example.com --name "Your Name"
uvicorn app.main:app --reload   # http://localhost:8000/docs
pytest                          # 17 tests, no database needed
```

SQL Server on your machine with Docker:

```bash
docker run -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Str0ng!Passw0rd' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

Frontend (Node 20.9+):

```bash
cd frontend
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                     # http://localhost:3000
```

## Adding lab results

Per batch, set the HPLC purity and a link to the COA image or PDF (must start with `https://` or `/`):

```bash
curl -X PATCH https://api.yourdomain.com/api/products/1 \
  -H "Authorization: Bearer <admin token>" -H "Content-Type: application/json" \
  -d '{"purity_percentage": "99.12", "coa_image_url": "https://.../coa-bpc157-batch42.jpg"}'
```

Get an admin token from `POST /api/auth/login`. Or run the `UPDATE` shown at the top of `sql/002_seed.sql`.

---

# Deployment

## 1. Database — Azure SQL Database (or any SQL Server 2017+)

1. In the Azure portal create a **SQL Database** named `PeptidesNepal`. The *General Purpose – Serverless* tier suits medium traffic and pauses when idle.
2. Under the server's **Networking**, allow your backend host's outbound IPs (or "Allow Azure services" if the API runs on Azure).
3. Open **Query editor** (or Azure Data Studio). Run `sql/001_schema.sql` **from the `USE PeptidesNepal;` line down**. Azure SQL doesn't allow `CREATE DATABASE`/`USE` inside a script. Then run `sql/002_seed.sql` the same way.
4. Create a least-privilege login for the API (see the commented block at the end of `001_schema.sql`). Don't give the app the admin login.

## 2. Backend — Render, Railway, Fly.io or Azure App Service (Docker)

The `backend/Dockerfile` installs Microsoft ODBC Driver 18, so any host that runs Docker images works. Example with **Render**:

1. New → **Web Service** → connect this GitHub repo.
2. **Root Directory**: `backend`. **Runtime**: Docker. Render finds the Dockerfile.
3. **Environment variables**:

   | Name | Value |
   |---|---|
   | `ENVIRONMENT` | `production` |
   | `DB_SERVER` | `<server>.database.windows.net` |
   | `DB_NAME` | `PeptidesNepal` |
   | `DB_USER` / `DB_PASSWORD` | the API login from step 1.4 |
   | `JWT_SECRET_KEY` | output of `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `CORS_ORIGINS` | `https://shop.yourdomain.com` (your exact Vercel domain; comma-separate if several) |
   | `RATE_LIMIT_STORAGE_URI` | `redis://...` from a Render Key Value / Redis instance |
   | `WEB_CONCURRENCY` | `2`–`4` |

4. **Health check path**: `/api/health`.
5. Deploy. Then add a custom domain such as `api.yourdomain.com`.
6. Create your admin: open the service **Shell** and run `python -m app.create_admin --email you@example.com --name "Your Name"`.

Notes:
- Each worker keeps up to `DB_POOL_SIZE + DB_MAX_OVERFLOW` (10 + 20) connections. Keep `workers × 30` under your database's connection limit.
- With more than one worker, use Redis for `RATE_LIMIT_STORAGE_URI`. With `memory://` each worker counts separately, so the real limit multiplies.
- The Docker command trusts `X-Forwarded-For` from any proxy (`--forwarded-allow-ips='*'`). That is right on Render/Railway/Fly/App Service, where only their proxy can reach the container. On a plain VM, put nginx in front and change it to nginx's IP.
- API docs (`/docs`) are switched off when `ENVIRONMENT=production`.

**Without Docker** (e.g. a Linux VM): install `msodbcsql18` from Microsoft's apt repo, then
`pip install -r requirements.txt` and run
`gunicorn app.main:app -k uvicorn_worker.UvicornWorker -w 4 -b 127.0.0.1:8000 --forwarded-allow-ips=127.0.0.1` behind nginx with HTTPS.

## 3. Frontend — Vercel

The education site already deploys from the repo root, so the store needs its **own** Vercel project:

1. Vercel → **Add New… → Project** → import this repo again.
2. **Root Directory**: `frontend`. Framework preset: Next.js (auto-detected). Leave build settings at their defaults.
3. **Environment variables** (Production and Preview):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://shop.yourdomain.com` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | digits only with country code, e.g. `9779812345678` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | your support email |

4. Deploy, then add the domain (e.g. `shop.yourdomain.com`) under **Settings → Domains**.
5. Put that exact origin in the backend's `CORS_ORIGINS` and redeploy the backend. A mismatch here is the most common reason the browser can't reach the API.

`NEXT_PUBLIC_*` values are baked in at build time. Redeploy the frontend after changing them.

The root `.vercelignore` keeps `backend/` and `frontend/` out of the education site's deployment.

## Launch checklist

- [ ] Real prices, stock, purity and COA links entered for each product
- [ ] Admin account created; test order placed and moved through each status
- [ ] `CORS_ORIGINS` matches the live frontend domain exactly
- [ ] Redis set for rate limits if running more than one worker
- [ ] Database backups on (Azure SQL does point-in-time restore by default)
