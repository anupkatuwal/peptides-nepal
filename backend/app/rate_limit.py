from slowapi import Limiter
from slowapi.util import get_remote_address

from .config import get_settings

_settings = get_settings()

# The client IP comes from request.client.host. Behind a proxy or load balancer,
# run uvicorn with --proxy-headers --forwarded-allow-ips=<proxy ip> so that is
# the real visitor's IP and not the proxy's.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    storage_uri=_settings.rate_limit_storage_uri,
    enabled=_settings.rate_limit_enabled,
    strategy="moving-window",
)

# Per-endpoint limits
CONTACT_LIMIT = "3/minute;10/hour;20/day"
REGISTER_LIMIT = "5/minute;20/hour"
LOGIN_LIMIT = "10/minute;50/hour"
ORDER_LIMIT = "10/minute;60/hour"
