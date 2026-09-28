"""Create an admin account, or promote an existing one.

    python -m app.create_admin --email you@example.com --name "Your Name"

The password is asked for at the prompt so it never lands in shell history.
"""

import argparse
import getpass
import sys

from pydantic import ValidationError
from sqlalchemy import select

from .database import SessionLocal
from .models import User
from .schemas import RegisterRequest
from .security import hash_password


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    args = parser.parse_args()

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == args.email.strip().lower()))
        if existing:
            existing.role = "Admin"
            db.commit()
            print(f"{existing.email} is now an admin.")
            return 0

        password = getpass.getpass("Password (8+ chars, a letter and a number): ")
        if password != getpass.getpass("Repeat password: "):
            print("Passwords don't match.", file=sys.stderr)
            return 1
        try:
            data = RegisterRequest(full_name=args.name, email=args.email, password=password)
        except ValidationError as exc:
            print(exc, file=sys.stderr)
            return 1

        db.add(User(full_name=data.full_name, email=data.email, password_hash=hash_password(data.password), role="Admin"))
        db.commit()
        print(f"Admin {data.email} created.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
