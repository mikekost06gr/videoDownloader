import sys
import uvicorn
from urllib.parse import urlparse

ALLOWED_DOMAINS = [
    "youtube.com" , "youtu.be",
]

def main():
   ## Starts the FastAPI server.
    print("Starting server at http://localhost:8000")
    print("Press CTRL+C to stop")
    uvicorn.run("backend.main:app, host = localhost, port = 8000, reload = False")


def format_duration(seconds: int) -> str:
    ## Converts seconds to mm:ss or hh:mm:ss
    ##Arguments:
    ##    seconds: Duration in seconds
    ##Returns:
    ##    Formatted duration string
    
    if not seconds or seconds < 0:
        return "0:00"
    
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def is_allowed_url(url: str, allowed_domains: list = ALLOWED_DOMAINS) -> bool:
    ##Checks if a URL belongs to an allowed domain by using urlparse for safe hostname extraction to avoid false positives."
    ##Arguments:
    ##    url: The to be checked URL.
    ##    allowed_domains: List of allowed domains.
    ##Returns:
    ##    True if allowed, False otherwise.
    
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or " "
        
        return any( hostname == domain or hostname.endswith(f".{domain}") for domain in allowed_domains )
    except Exception:
        return False
    

def sanitize_filename(title: str) -> str:
    ## Alters a video's title to be safed to use as a filename by removing characters that are invalid in filenames and collapses multiple spaces into one.
    ##Arguments:
    ##    title: The un-altered video title.
    ##Returns:
    ##    An altered "sanitized" filename-safe string.
    
    if not title:
        return "download"
    sanitized = "".join( c for c in title if c not in r'<>:"/\|?*' )
    sanitized = " ".join( sanitized.split() )
    return sanitized.strip() or "download"

if __name__ == "__main__":
    main()