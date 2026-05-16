import os
from pathlib import Path
from dotenv import load_dotenv
from loguru import logger

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.services.downloader import get_video_info, download_video
from backend.models.requests import InfoRequest, DownloadRequest
from backend.utils.validators import is_allowed_url

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = [os.getenv( "FRONTEND_URL")],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

DOWNLOAD_FOLDER = Path( os.getenv( "DOWNLOAD_FOLDER", "downloads" ) )

ALLOWED_DOMAINS = [
    "www.youtube.com", "youtu.be", 
    "www.vimeo.com", "vimeo.com",
    "www.dailymotion.com", "dailymotion.com",
]

# --- Routes ---

@app.get( "/" )
def index():
    return {"status": "ok"}


@app.post( "/api/info" )
def info( payload: InfoRequest ):
    """Collects video metadata."""

    url = payload.url.strip()

    if not url:
        raise HTTPException( status_code = 400, detail = "URL is required." )
    
    if not is_allowed_url( url, ALLOWED_DOMAINS ):
        raise HTTPException( status_code = 400, detail = "Unsupported Url." )
    
    logger.info( f"Fetching info for url: {url}" )

    result = get_video_info( url )

    if not result["success"]:
        raise HTTPException( status_code = 400, detail = result )
    
    return result

@app.post( "/api/download" )
def download( payload: DownloadRequest ):
    """Downloads video or audio."""

    url = payload.url.strip()
    fmt = payload.format.lower()
    quality = payload.quality

    if not url:
        raise HTTPException( status_code = 400, detail = "URL is required." )
    
    if not is_allowed_url( url, ALLOWED_DOMAINS ):
        raise HTTPException( status_code = 403, detail = "Unsupported URL." )
    
    if fmt not in ( "mp4", "mp3" ):
        raise HTTPException( status_code = 400, detail = "Invalid format. Supported: mp4, mp3." )
    
    logger.info( f"Downloading url: {url} as {fmt} with {quality} quality." )

    result = download_video( url, fmt, quality )

    if not result["success"]:
        raise HTTPException( status_code = 500, detail = result )
    
    filepath = Path( result["filepath"] )

    if not filepath.exists():
        raise HTTPException( status_code = 404, detail = "File not found." )
    
    return FileResponse(
        path = filepath,
        filename = result["filename"],
        media_type = "application/octet-stream",
    )

# -- Error Handlers ---

@app.exception_handler( 404 )
def not_found( request, exc ):
    return JSONResponse(
        status_code = 404,
        content = {"success": False, "error": "Invalid endpoint."},
    )

@app.exception_handler( 500 )
def internal_error( request, exc ):
    return JSONResponse(
        status_code = 500,
        content = {"success": False, "error": "Internal server error."},
    )