# Peptides Nepal API — production image with Microsoft ODBC Driver 18.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    ACCEPT_EULA=Y

# Microsoft's apt repo for msodbcsql18 (needed by pyodbc to reach SQL Server).
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl gnupg ca-certificates unixodbc \
 && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
      | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
 && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
      > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends msodbcsql18 \
 && apt-get purge -y curl gnupg && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

RUN useradd --system --uid 10001 api && chown -R api /srv
USER api

EXPOSE 8000
# 4 workers x (10 pooled + 20 overflow) = at most 120 DB connections.
# With more than one worker, set RATE_LIMIT_STORAGE_URI to Redis so limits are shared.
CMD ["sh", "-c", "gunicorn app.main:app -k uvicorn_worker.UvicornWorker -w ${WEB_CONCURRENCY:-4} -b 0.0.0.0:${PORT:-8000} --forwarded-allow-ips='*' --timeout 60 --graceful-timeout 30 --access-logfile -"]
