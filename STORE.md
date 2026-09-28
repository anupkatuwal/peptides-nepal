# Peptides Nepal — online store

The store is two apps in this repo, separate from the static education site at the root:

- `backend/` — FastAPI + SQLAlchemy + pyodbc on Microsoft SQL Server.
- `frontend/` — Next.js 16 (App Router) + Tailwind CSS 3.

## What it does

| Area | What's there |
|---|---|
| Shop | Categories, search, sort, product pages with HPLC purity and the COA, cart |
| Checkout | Account required. Delivery zone (inside/outside Kathmandu Valley) with fees and a free-delivery threshold. Pay by COD, eSewa or Khalti |
| Online payments | eSewa ePay v2 and Khalti KPG-2, confirmed server-to-server. Retry from the account page |
| Accounts | Register, sign in, order history, forgot/reset password (signs out every session) |
| Email | Order confirmation, payment/shipping/cancel updates, new-order and contact alerts to the shop, reset links |
| Admin (`/admin`) | Overview, orders (change status; cancelling returns stock), products (edit price, stock, purity, upload photos and COAs), messages |
| Content | Lab results table, guides, contact form, floating WhatsApp button |
| SEO | Sitemap, robots.txt, product structured data |

## Folder structure

```
backend/
  app/
    main.py            App setup: CORS, rate limits, body-size limit, security headers, routers
    config.py          Settings from environment variables (see .env.example)
    database.py        Engine + connection pool
    models.py          ORM models (mirror sql/*.sql)
    schemas.py         Request/response validation
    security.py        bcrypt, JWT
    deps.py            Current user / admin checks
    rate_limit.py      Per-route limits
    delivery.py        Delivery fee rules
    email.py           SMTP sending + email templates
    payments.py        eSewa and Khalti clients
    create_admin.py    CLI: create or promote an admin
    routers/
      auth.py          register, login, me, forgot-password, reset-password
      categories.py    category list
      products.py      product list/detail; admin create/update
      orders.py        place order, my orders, delivery options; admin list/status
      payments.py      start payment, eSewa/Khalti confirmation
      contact.py       contact form; admin inbox
      media.py         admin uploads; public file serving
      admin.py         dashboard summary, all products
  sql/
    001_schema.sql     Tables, keys, constraints, indexes
    002_seed.sql       Categories + starter products
    003_store_upgrades.sql  Uploads, delivery fees, payments, password resets (safe to re-run)
  tests/               pytest (SQLite by default, SQL Server with TEST_DATABASE_URL)
    e2e_app.py         API with fake payment gateways, for the browser tests only
    e2e_seed.py        Creates the browser tests' admin account
  Dockerfile

frontend/
  app/                 Pages: home, shop, products/[slug], lab-results, guides, contact, cart,
                       checkout, account, login, register, forgot/reset-password,
                       payment/esewa, payment/khalti, admin/*, sitemap.ts, robots.ts
  components/          Navbar, Footer, WhatsAppButton, product cards, forms, admin shell
  lib/                 API client, payments, types, site config, guide content
  e2e/                 Playwright end-to-end tests
  public/products/     Vial illustrations

.github/workflows/store.yml   CI: backend tests on SQL Server, build, browser tests
```

## Local development

**Database.** SQL Server in Docker:

```bash
docker run -d --name mssql -e ACCEPT_EULA=Y -e 'MSSQL_SA_PASSWORD=Str0ng!Passw0rd' -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
for f in 001_schema 002_seed 003_store_upgrades; do
  docker exec -i mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Str0ng!Passw0rd' -C -b < backend/sql/$f.sql
done
```

**Backend** (Python 3.11+, [ODBC Driver 18](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)):

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # set DB_PASSWORD, JWT_SECRET_KEY
python -m app.create_admin --email you@example.com --name "Your Name"
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

**Frontend** (Node 20.9+):

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

## Tests

```bash
# Backend: 37 tests. SQLite by default:
cd backend && pytest
# ...or against SQL Server, plus a check that the models match the T-SQL schema:
Q='?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes'
TEST_DATABASE_URL="mssql+pyodbc://sa:<pw>@localhost:1433/PeptidesTest$Q" \
SCHEMA_DATABASE_URL="mssql+pyodbc://sa:<pw>@localhost:1433/PeptidesNepal$Q" pytest

# Browser tests (6): start the API with fake gateways, start the site, then run Playwright.
cd backend && python -m tests.e2e_seed && KHALTI_SECRET_KEY=fake uvicorn tests.e2e_app:app --port 8000
cd frontend && npm run build && npm start      # in another terminal
cd frontend && npx playwright install chromium && npm run test:e2e
```

GitHub Actions runs all of this on every push that touches `backend/` or `frontend/`.

## Running the shop

**Lab results.** Admin → Products & lab results → Edit. Enter the HPLC purity and upload the COA (PNG, JPEG, WebP or PDF, up to 8 MB). The product page shows "Lab report pending" until both are set. Files are stored in the database (`dbo.Media`) and served from the API.

**Orders.** Admin → Orders. Online payments set an order to *Paid* on their own. For COD, move it through *Processing → Shipped → Delivered*. The customer gets an email at *Paid*, *Shipped*, *Delivered* and *Cancelled*. Cancelling returns stock. It doesn't refund an online payment: do that in the eSewa or Khalti merchant portal.

**Unpaid online orders** keep their stock reserved. If a customer never pays, cancel the order to release it.

## Going live with payments

Payments start in test mode (`PAYMENTS_ENV=test`).

- **eSewa** works in test mode with no setup: it uses eSewa's public sandbox merchant `EPAYTEST`. Test wallet logins are in eSewa's developer docs. To go live, get your merchant code and secret key from eSewa and set `ESEWA_PRODUCT_CODE` and `ESEWA_SECRET_KEY`.
- **Khalti** needs a key even in test mode. Sign up at test-admin.khalti.com for a test secret key; your live key comes from admin.khalti.com. Set `KHALTI_SECRET_KEY`.
- With both set, change `PAYMENTS_ENV=live` and redeploy. Place one small real order with each gateway and check it shows *Paid* in admin.

A method without keys doesn't break checkout: those orders fall back to "we send payment details", and you confirm payment by hand.

How confirmation works: the customer's browser comes back from the gateway, and the API asks the gateway directly (eSewa status API / Khalti lookup) before marking anything paid. It also checks that the amount paid equals the order total.

## Email

Any SMTP provider works: Gmail/Google Workspace (app password, `smtp.gmail.com:587`), Brevo, Mailgun, Amazon SES, Zoho. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, and `SHOP_NOTIFY_EMAIL`. Without `SMTP_HOST`, email is off, and password reset can't reach anyone. Add SPF and DKIM for your sending domain (your provider shows the DNS records) so emails don't land in spam.

---

# Deployment

## 1. Database — Azure SQL Database (or any SQL Server 2017+)

1. Create an Azure **SQL Database** named `PeptidesNepal`. *General Purpose – Serverless* suits medium traffic.
2. Under the server's **Networking**, allow your backend host's outbound IPs.
3. In **Query editor**, run `001_schema.sql`, `002_seed.sql`, then `003_store_upgrades.sql`, each **from the `SET`/first statement after `USE`**. Azure SQL doesn't allow `CREATE DATABASE`/`USE` inside a script.
4. Create a least-privilege login for the API (commented block at the end of `001_schema.sql`).

Future schema changes go in a new numbered script (`004_...sql`), written so it can be re-run safely, like `003`.

## 2. Backend — Render, Railway, Fly.io or Azure App Service (Docker)

`backend/Dockerfile` installs ODBC Driver 18. Example with **Render**:

1. New → **Web Service** → this repo. **Root Directory**: `backend`. **Runtime**: Docker.
2. **Environment variables**: everything in `backend/.env.example`. At minimum:

   | Name | Value |
   |---|---|
   | `ENVIRONMENT` | `production` |
   | `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | from step 1 |
   | `JWT_SECRET_KEY` | `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `CORS_ORIGINS`, `FRONTEND_URL` | `https://shop.yourdomain.com` |
   | `PUBLIC_API_URL` | `https://api.yourdomain.com` |
   | `RATE_LIMIT_STORAGE_URI` | `redis://...` (Render Key Value) when running more than one worker |
   | delivery, email and payment settings | as above |

3. **Health check path**: `/api/health`. Deploy, then add the custom domain `api.yourdomain.com`.
4. In the service **Shell**: `python -m app.create_admin --email you@example.com --name "Your Name"`.

Notes:
- Each worker holds up to `DB_POOL_SIZE + DB_MAX_OVERFLOW` (10 + 20) connections. Keep `workers × 30` under the database's limit.
- The Docker command trusts `X-Forwarded-For` from any proxy. That's right on Render/Railway/Fly/App Service. On a plain VM, put nginx in front and set `--forwarded-allow-ips` to nginx's IP.
- `/docs` is off when `ENVIRONMENT=production`.

## 3. Frontend — Vercel

The education site already deploys from the repo root, so the store needs its **own** Vercel project:

1. Vercel → **Add New… → Project** → this repo. **Root Directory**: `frontend`.
2. **Environment variables**:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://shop.yourdomain.com` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | digits with country code, e.g. `9779812345678` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | your support email |

3. Deploy, then add `shop.yourdomain.com` under **Settings → Domains**.
4. Make sure the backend's `CORS_ORIGINS` and `FRONTEND_URL` match that domain exactly.

`NEXT_PUBLIC_*` values are built in: redeploy after changing them. The root `.vercelignore` keeps `backend/` and `frontend/` out of the education site's deployment.

## Launch checklist

- [ ] `003_store_upgrades.sql` run on the production database
- [ ] Real prices and stock; purity and COA for each product
- [ ] Delivery fees set
- [ ] Email configured; test order and password reset emails received (check spam)
- [ ] Admin account created
- [ ] Payment keys set, `PAYMENTS_ENV=live`, one small real payment with each gateway shows *Paid*
- [ ] `CORS_ORIGINS`, `FRONTEND_URL`, `PUBLIC_API_URL` match the live domains
- [ ] Redis set for rate limits if running more than one worker
- [ ] Submit `https://shop.yourdomain.com/sitemap.xml` in Google Search Console
- [ ] Database backups on (Azure SQL does point-in-time restore by default)
