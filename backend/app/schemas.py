"""Request and response models. Every request body forbids unknown fields and trims whitespace."""

import re
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PaymentMethod = Literal["eSewa", "Khalti", "COD"]
OrderStatus = Literal["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"]

SLUG_RE = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


class RequestModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class ResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Auth -------------------------------------------------------------------


def _check_password(v: str) -> str:
    # bcrypt only reads the first 72 bytes; refuse longer so nothing is silently ignored.
    if len(v.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 bytes")
    if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
        raise ValueError("Password must contain at least one letter and one number")
    return v


class RegisterRequest(RequestModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def _lower(cls, v: str) -> str:
        return v.lower()

    @field_validator("password")
    @classmethod
    def _strong(cls, v: str) -> str:
        return _check_password(v)


class LoginRequest(RequestModel):
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def _lower(cls, v: str) -> str:
        return v.lower()


class UserOut(ResponseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserOut


# --- Catalogue --------------------------------------------------------------


class CategoryOut(ResponseModel):
    id: int
    name: str
    slug: str
    description: str | None
    product_count: int = 0


class CategoryRef(ResponseModel):
    id: int
    name: str
    slug: str


class ProductSummary(ResponseModel):
    id: int
    name: str
    slug: str
    price: float
    stock_level: int
    purity_percentage: float | None
    image_url: str | None
    coa_image_url: str | None
    category: CategoryRef


class ProductDetail(ProductSummary):
    description: str
    created_at: datetime


class ProductPage(BaseModel):
    items: list[ProductSummary]
    total: int
    page: int
    page_size: int


HttpsOrPathUrl = Annotated[str, Field(max_length=500, pattern=r"^(https://|/)[^\s]*$")]


class ProductCreate(RequestModel):
    category_id: int = Field(gt=0)
    name: str = Field(min_length=2, max_length=150)
    slug: str = Field(min_length=2, max_length=160, pattern=SLUG_RE)
    description: str = Field(min_length=10, max_length=10_000)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    stock_level: int = Field(ge=0, le=1_000_000)
    purity_percentage: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    coa_image_url: HttpsOrPathUrl | None = None
    image_url: HttpsOrPathUrl | None = None
    is_active: bool = True


class ProductUpdate(RequestModel):
    category_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, min_length=10, max_length=10_000)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    stock_level: int | None = Field(default=None, ge=0, le=1_000_000)
    purity_percentage: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    coa_image_url: HttpsOrPathUrl | None = None
    image_url: HttpsOrPathUrl | None = None
    is_active: bool | None = None


# --- Orders -----------------------------------------------------------------


class OrderItemIn(RequestModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=20)


class OrderCreate(RequestModel):
    items: list[OrderItemIn] = Field(min_length=1, max_length=30)
    payment_method: PaymentMethod
    shipping_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=20)
    shipping_address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=80)
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        v = re.sub(r"[\s-]", "", v)
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number, e.g. 98XXXXXXXX")
        return v


class OrderItemOut(ResponseModel):
    product_id: int
    product_name: str
    product_slug: str
    quantity: int
    unit_price: float


class OrderOut(ResponseModel):
    id: int
    total_price: float
    payment_method: PaymentMethod
    status: OrderStatus
    order_date: datetime
    shipping_name: str
    phone: str
    shipping_address: str
    city: str
    notes: str | None
    items: list[OrderItemOut]


class OrderStatusUpdate(RequestModel):
    status: OrderStatus


# --- Contact ----------------------------------------------------------------


class ContactCreate(RequestModel):
    sender_name: str = Field(min_length=2, max_length=120)
    sender_email: EmailStr = Field(max_length=254)
    subject: str = Field(min_length=3, max_length=150)
    message_body: str = Field(min_length=20, max_length=4000)
    # Honeypot: hidden in the form. People leave it empty; bots fill it in.
    website: str | None = Field(default=None, max_length=200)


class ContactAccepted(BaseModel):
    detail: str = "Thanks — your message has been received. We'll reply by email."


class ContactMessageOut(ResponseModel):
    id: int
    sender_name: str
    sender_email: str
    subject: str
    message_body: str
    submitted_at: datetime
    is_read: bool
