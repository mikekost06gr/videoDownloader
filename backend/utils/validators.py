from urllib.parse import urlparse


def is_allowed_url(url: str, allowed_domains: list[str]) -> bool:
    """Checks if the URL is from an allowed domain."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return False

    hostname = parsed.hostname
    if parsed.scheme not in ("http", "https") or not hostname:
        return False

    return any(
        hostname == domain or hostname.endswith(f".{domain}")
        for domain in allowed_domains
    )