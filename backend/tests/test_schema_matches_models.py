"""Checks the ORM models against the real database built from sql/*.sql.

Runs only when SCHEMA_DATABASE_URL points at a SQL Server database created
with the T-SQL scripts, e.g.
mssql+pyodbc://sa:<pw>@localhost:1433/PeptidesNepal?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
"""

import os

import pytest
from sqlalchemy import create_engine, inspect

from app.database import Base

URL = os.environ.get("SCHEMA_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="SCHEMA_DATABASE_URL not set")


def test_every_model_column_exists_in_sql_schema():
    engine = create_engine(URL)
    insp = inspect(engine)
    problems = []
    for table in Base.metadata.sorted_tables:
        if not insp.has_table(table.name, schema="dbo"):
            problems.append(f"missing table {table.name}")
            continue
        db_cols = {c["name"]: c for c in insp.get_columns(table.name, schema="dbo")}
        for col in table.columns:
            db = db_cols.get(col.name)
            if db is None:
                problems.append(f"{table.name}.{col.name} missing in database")
            elif not col.primary_key and db["nullable"] != col.nullable:
                problems.append(f"{table.name}.{col.name}: nullable db={db['nullable']} model={col.nullable}")
        for name in db_cols.keys() - {c.name for c in table.columns}:
            problems.append(f"{table.name}.{name} in database but not in model")
    engine.dispose()
    assert not problems, "\n".join(problems)
