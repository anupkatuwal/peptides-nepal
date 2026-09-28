"""ORM models. They mirror sql/001_schema.sql, which is the source of truth for the database."""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, LargeBinary, Numeric, String, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, deferred, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    # Stored as DATETIME2 (no offset); always UTC.
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "Users"

    id: Mapped[int] = mapped_column("UserID", Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column("FullName", Unicode(120))
    email: Mapped[str] = mapped_column("Email", Unicode(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column("PasswordHash", String(100))
    role: Mapped[str] = mapped_column("Role", String(20), default="Customer")
    created_at: Mapped[datetime] = mapped_column("CreatedAt", DateTime, default=utcnow)
    # Added in sql/003. Sessions (JWTs) issued before this moment are rejected.
    password_changed_at: Mapped[datetime | None] = mapped_column("PasswordChangedAt", DateTime)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Category(Base):
    __tablename__ = "Categories"

    id: Mapped[int] = mapped_column("CategoryID", Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column("CategoryName", Unicode(80), unique=True)
    slug: Mapped[str] = mapped_column("Slug", String(80), unique=True)
    description: Mapped[str | None] = mapped_column("Description", Unicode(400))
    sort_order: Mapped[int] = mapped_column("SortOrder", Integer, default=0)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "Products"

    id: Mapped[int] = mapped_column("ProductID", Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column("CategoryID", ForeignKey("Categories.CategoryID"), index=True)
    name: Mapped[str] = mapped_column("Name", Unicode(150))
    slug: Mapped[str] = mapped_column("Slug", String(160), unique=True)
    description: Mapped[str] = mapped_column("Description", UnicodeText)
    price: Mapped[Decimal] = mapped_column("Price", Numeric(10, 2))
    stock_level: Mapped[int] = mapped_column("StockLevel", Integer, default=0)
    purity_percentage: Mapped[Decimal | None] = mapped_column("PurityPercentage", Numeric(5, 2))
    coa_image_url: Mapped[str | None] = mapped_column("COA_ImageURL", Unicode(500))
    image_url: Mapped[str | None] = mapped_column("ImageURL", Unicode(500))
    is_active: Mapped[bool] = mapped_column("IsActive", Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column("CreatedAt", DateTime, default=utcnow)

    category: Mapped[Category] = relationship(back_populates="products")


class Order(Base):
    __tablename__ = "Orders"

    id: Mapped[int] = mapped_column("OrderID", Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column("UserID", ForeignKey("Users.UserID"), index=True)
    total_price: Mapped[Decimal] = mapped_column("TotalPrice", Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column("PaymentMethod", String(10))
    status: Mapped[str] = mapped_column("OrderStatus", String(20), default="Pending")
    order_date: Mapped[datetime] = mapped_column("OrderDate", DateTime, default=utcnow)
    shipping_name: Mapped[str] = mapped_column("ShippingName", Unicode(120))
    phone: Mapped[str] = mapped_column("Phone", String(20))
    shipping_address: Mapped[str] = mapped_column("ShippingAddress", Unicode(300))
    city: Mapped[str] = mapped_column("City", Unicode(80))
    notes: Mapped[str | None] = mapped_column("Notes", Unicode(500))
    # Added in sql/003_store_upgrades.sql
    delivery_fee: Mapped[Decimal] = mapped_column("DeliveryFee", Numeric(10, 2), default=Decimal("0.00"))
    payment_status: Mapped[str] = mapped_column("PaymentStatus", String(20), default="Unpaid")
    payment_reference: Mapped[str | None] = mapped_column("PaymentReference", Unicode(100))
    paid_at: Mapped[datetime | None] = mapped_column("PaidAt", DateTime)

    user: Mapped[User] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )

    @property
    def customer_name(self) -> str:
        return self.user.full_name

    @property
    def customer_email(self) -> str:
        return self.user.email


class OrderItem(Base):
    __tablename__ = "OrderItems"

    id: Mapped[int] = mapped_column("OrderItemID", Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column("OrderID", ForeignKey("Orders.OrderID", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column("ProductID", ForeignKey("Products.ProductID"), index=True)
    quantity: Mapped[int] = mapped_column("Quantity", Integer)
    unit_price: Mapped[Decimal] = mapped_column("UnitPrice", Numeric(10, 2))

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped[Product] = relationship(lazy="joined")

    @property
    def product_name(self) -> str:
        return self.product.name

    @property
    def product_slug(self) -> str:
        return self.product.slug


class ContactMessage(Base):
    __tablename__ = "ContactMessages"

    id: Mapped[int] = mapped_column("MessageID", Integer, primary_key=True, autoincrement=True)
    sender_name: Mapped[str] = mapped_column("SenderName", Unicode(120))
    sender_email: Mapped[str] = mapped_column("SenderEmail", Unicode(254))
    subject: Mapped[str] = mapped_column("Subject", Unicode(150))
    message_body: Mapped[str] = mapped_column("MessageBody", Unicode(4000))
    submitted_at: Mapped[datetime] = mapped_column("SubmittedAt", DateTime, default=utcnow)
    is_read: Mapped[bool] = mapped_column("IsRead", Boolean, default=False)


class Media(Base):
    """Uploaded product photos and COA files, stored in the database."""

    __tablename__ = "Media"

    id: Mapped[int] = mapped_column("MediaID", Integer, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column("FileName", Unicode(200))
    content_type: Mapped[str] = mapped_column("ContentType", String(50))
    size_bytes: Mapped[int] = mapped_column("SizeBytes", Integer)
    sha256: Mapped[str] = mapped_column("Sha256", String(64), index=True)
    data: Mapped[bytes] = deferred(mapped_column("Data", LargeBinary, nullable=False))
    uploaded_by: Mapped[int] = mapped_column("UploadedBy", ForeignKey("Users.UserID"))
    created_at: Mapped[datetime] = mapped_column("CreatedAt", DateTime, default=utcnow)


class PasswordResetToken(Base):
    __tablename__ = "PasswordResetTokens"

    id: Mapped[int] = mapped_column("TokenID", Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column("UserID", ForeignKey("Users.UserID", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column("TokenHash", String(64), unique=True)  # SHA-256 of the emailed token
    expires_at: Mapped[datetime] = mapped_column("ExpiresAt", DateTime)
    used_at: Mapped[datetime | None] = mapped_column("UsedAt", DateTime)
    created_at: Mapped[datetime] = mapped_column("CreatedAt", DateTime, default=utcnow)
