"""Outgoing email over SMTP.

Every send runs as a FastAPI background task after the response is sent, and
never raises: a mail outage must not break checkout or the contact form.
"""

import logging
import smtplib
import ssl
from decimal import Decimal
from email.message import EmailMessage
from email.utils import make_msgid
from html import escape

from .config import get_settings
from .models import ContactMessage, Order

logger = logging.getLogger("peptides_nepal.email")


def send_email(to: str, subject: str, text: str, html: str | None = None, reply_to: str | None = None) -> bool:
    s = get_settings()
    if not s.email_enabled or not to:
        logger.info("Email off or no recipient; skipped %r", subject)
        return False

    msg = EmailMessage()
    msg["From"] = s.mail_from
    msg["To"] = to
    msg["Subject"] = subject
    msg["Message-ID"] = make_msgid(domain=s.mail_from.rsplit("@", 1)[-1].strip("> ") or None)
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")

    try:
        if s.smtp_security == "ssl":
            server = smtplib.SMTP_SSL(s.smtp_host, s.smtp_port, timeout=15, context=ssl.create_default_context())
        else:
            server = smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=15)
        with server:
            if s.smtp_security == "starttls":
                server.starttls(context=ssl.create_default_context())
            if s.smtp_username:
                server.login(s.smtp_username, s.smtp_password)
            server.send_message(msg)
        return True
    except (smtplib.SMTPException, OSError):
        logger.exception("Could not send email %r to %s", subject, to)
        return False


def preload(order: Order) -> Order:
    """Load everything the templates read. The DB session is closed before background tasks run."""
    _ = order.customer_email, order.customer_name
    for item in order.items:
        _ = item.product_name
    return order


# --- Templates ----------------------------------------------------------------


def _npr(value: Decimal | float) -> str:
    return f"Rs. {Decimal(value):,.2f}".replace(".00", "")


def _layout(title: str, body_html: str) -> str:
    return f"""<!doctype html><html><body style="margin:0;background:#F4F7F6;font-family:Arial,Helvetica,sans-serif;color:#1B2F52">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E3E9EE;border-radius:16px">
<tr><td style="padding:28px 32px 8px"><p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#2F7353">Peptides Nepal</p>
<h1 style="margin:8px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:24px;color:#0B1628">{escape(title)}</h1></td></tr>
<tr><td style="padding:16px 32px 28px;font-size:15px;line-height:1.6">{body_html}</td></tr>
</table></td></tr></table></body></html>"""


def _items_table(order: Order) -> tuple[str, str]:
    text_lines = [f"- {i.product_name} x {i.quantity}: {_npr(i.unit_price * i.quantity)}" for i in order.items]
    text_lines.append(f"- Delivery: {'Free' if not order.delivery_fee else _npr(order.delivery_fee)}")
    rows = "".join(
        f'<tr><td style="padding:6px 0">{escape(i.product_name)} × {i.quantity}</td>'
        f'<td align="right" style="padding:6px 0">{_npr(i.unit_price * i.quantity)}</td></tr>'
        for i in order.items
    )
    rows += (
        f'<tr><td style="padding:6px 0;color:#43679A">Delivery</td><td align="right" style="padding:6px 0;color:#43679A">'
        f'{"Free" if not order.delivery_fee else _npr(order.delivery_fee)}</td></tr>'
        f'<tr><td style="padding:10px 0;border-top:1px solid #E3E9EE"><b>Total</b></td>'
        f'<td align="right" style="padding:10px 0;border-top:1px solid #E3E9EE"><b>{_npr(order.total_price)}</b></td></tr>'
    )
    return "\n".join(text_lines), f'<table role="presentation" width="100%" style="font-size:14px">{rows}</table>'


_PAYMENT_NOTE = {
    "COD": "Pay in cash when your parcel arrives. We'll call to confirm delivery.",
    "eSewa": "If your eSewa payment went through, you'll get a second email confirming it.",
    "Khalti": "If your Khalti payment went through, you'll get a second email confirming it.",
}


def order_confirmation(order: Order) -> None:
    s = get_settings()
    items_text, items_html = _items_table(order)
    link = f"{s.frontend_url.rstrip('/')}/account"
    note = _PAYMENT_NOTE[order.payment_method]
    text = (
        f"Hi {order.shipping_name},\n\nThanks for your order #{order.id}.\n\n{items_text}\n"
        f"Total: {_npr(order.total_price)}\n\n{note}\n\nDeliver to: {order.shipping_address}, {order.city}\n"
        f"Phone: {order.phone}\n\nTrack it at {link}\n\nPeptides Nepal"
    )
    html = _layout(
        f"Order #{order.id} received",
        f"<p>Hi {escape(order.shipping_name)}, thanks for your order.</p>{items_html}"
        f"<p>{escape(note)}</p><p style='color:#43679A;font-size:14px'>Deliver to: {escape(order.shipping_address)}, "
        f"{escape(order.city)} · {escape(order.phone)}</p>"
        f'<p><a href="{escape(link)}" style="color:#2F7353">View your orders</a></p>',
    )
    send_email(order.customer_email, f"Order #{order.id} received — Peptides Nepal", text, html)


def new_order_alert(order: Order) -> None:
    s = get_settings()
    items_text, items_html = _items_table(order)
    link = f"{s.frontend_url.rstrip('/')}/admin/orders"
    text = (
        f"New order #{order.id} — {_npr(order.total_price)} ({order.payment_method})\n\n{items_text}\n\n"
        f"{order.shipping_name}, {order.phone}\n{order.shipping_address}, {order.city}\n"
        f"Account: {order.customer_email}\nNotes: {order.notes or '-'}\n\n{link}"
    )
    html = _layout(
        f"New order #{order.id}",
        f"{items_html}<p><b>{escape(order.shipping_name)}</b> · {escape(order.phone)}<br>{escape(order.shipping_address)}, "
        f"{escape(order.city)}<br>{escape(order.customer_email)} · {escape(order.payment_method)}</p>"
        + (f"<p>Notes: {escape(order.notes)}</p>" if order.notes else "")
        + f'<p><a href="{escape(link)}" style="color:#2F7353">Open in admin</a></p>',
    )
    send_email(s.shop_notify_email, f"New order #{order.id} — {_npr(order.total_price)}", text, html,
               reply_to=order.customer_email)


_STATUS_MESSAGES = {
    "Paid": "We've received your payment. We'll start packing your order.",
    "Shipped": "Your order is on its way. We'll call before delivery.",
    "Delivered": "Your order has been delivered. Thank you for shopping with us.",
    "Cancelled": "Your order has been cancelled. If you already paid online, we'll contact you about the refund.",
}


def order_status_update(order: Order) -> None:
    message = _STATUS_MESSAGES.get(order.status)
    if message is None:
        return
    link = f"{get_settings().frontend_url.rstrip('/')}/account"
    text = f"Hi {order.shipping_name},\n\nOrder #{order.id}: {message}\n\nView your orders: {link}\n\nPeptides Nepal"
    html = _layout(
        f"Order #{order.id}: {order.status}",
        f"<p>Hi {escape(order.shipping_name)},</p><p>{escape(message)}</p>"
        f'<p><a href="{escape(link)}" style="color:#2F7353">View your orders</a></p>',
    )
    send_email(order.customer_email, f"Order #{order.id} {order.status.lower()} — Peptides Nepal", text, html)


def contact_alert(message: ContactMessage) -> None:
    s = get_settings()
    text = f"From: {message.sender_name} <{message.sender_email}>\nSubject: {message.subject}\n\n{message.message_body}"
    html = _layout(
        message.subject,
        f"<p style='color:#43679A'>From {escape(message.sender_name)} &lt;{escape(message.sender_email)}&gt;</p>"
        f"<p style='white-space:pre-wrap'>{escape(message.message_body)}</p>",
    )
    send_email(s.shop_notify_email, f"Contact form: {message.subject}", text, html, reply_to=message.sender_email)


def password_reset(to: str, name: str, link: str) -> None:
    minutes = get_settings().password_reset_minutes
    text = (
        f"Hi {name},\n\nSomeone asked to reset the password for your Peptides Nepal account.\n\n"
        f"Choose a new password here (the link works for {minutes} minutes, once):\n{link}\n\n"
        "If this wasn't you, ignore this email. Your password stays the same."
    )
    html = _layout(
        "Reset your password",
        f"<p>Hi {escape(name)},</p><p>Someone asked to reset the password for your account.</p>"
        f'<p><a href="{escape(link)}" style="display:inline-block;background:#13223D;color:#ffffff;padding:12px 22px;'
        f'border-radius:999px;text-decoration:none">Choose a new password</a></p>'
        f"<p style='color:#43679A;font-size:14px'>The link works once, for {minutes} minutes. "
        "If this wasn't you, ignore this email.</p>",
    )
    send_email(to, "Reset your Peptides Nepal password", text, html)
