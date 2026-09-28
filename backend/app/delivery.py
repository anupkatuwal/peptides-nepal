from decimal import Decimal

from .config import get_settings
from .schemas import DeliveryOption, DeliveryOptions, DeliveryZone

ZONE_LABELS: dict[str, str] = {
    "inside_valley": "Inside Kathmandu Valley",
    "outside_valley": "Outside Kathmandu Valley",
}


def zone_fee(zone: DeliveryZone) -> Decimal:
    s = get_settings()
    return s.delivery_fee_inside_valley if zone == "inside_valley" else s.delivery_fee_outside_valley


def delivery_fee(zone: DeliveryZone, items_total: Decimal) -> Decimal:
    threshold = get_settings().free_delivery_threshold
    if threshold > 0 and items_total >= threshold:
        return Decimal("0.00")
    return zone_fee(zone).quantize(Decimal("0.01"))


def delivery_options() -> DeliveryOptions:
    threshold = get_settings().free_delivery_threshold
    return DeliveryOptions(
        options=[DeliveryOption(zone=z, label=label, fee=float(zone_fee(z))) for z, label in ZONE_LABELS.items()],
        free_delivery_threshold=float(threshold) if threshold > 0 else None,
    )
