import os
import yt_dlp
import uuid
from pathlib import Path
from loguru import logger

DOWNLOAD_FOLDER = Path(os.getenv("DOWNLOAD_FOLDER", "downloads"))
DOWNLOAD_FOLDER.mkdir(exist_ok = True)

def format_duration(seconds: int) -> str:

    if not seconds:
        return "0:00"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60  # ✅ Fix: seconds % 60, όχι minutes % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def get_video_info( url: str ) -> dict:
    """Collects the metadata of the video."""

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download = False)
            formats = _parse_formats(info.get("formats", []))

            return {
                "success": True,
                "title": info.get("title", "Unknown Title"),
                "duration": format_duration(info.get("duration", 0)),
                "thumbnail": info.get("thumbnail"),
                "uploader": info.get("uploader"),
                "formats": formats,

            }
        
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp error for {url}: {e}")
        return {"success": False, "error": "Failed to retrieve video info."}
    
def download_video( url: str, format_type: str = "mp4", quality: str = "source" ) -> dict:
    """Downloads the video or audio, formats: "mp4", "mp3" and quality: "source", "1080", "720", "480", "360"."""

    file_id = str(uuid.uuid4())[:8]
    output_template = str(DOWNLOAD_FOLDER / f"{file_id}_%(title)s.%(ext)s")
    ydl_opts = _build_ydl_opts(format_type, quality, output_template)

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download = True)
            filename = ydl.prepare_filename(info)

            if format_type == "mp3":
                filename = Path(filename).with_suffix(".mp3")

            final_path = Path(filename)
            if not final_path.exists():
                matches = list(DOWNLOAD_FOLDER.glob(f"{file_id}_*"))
                if matches:
                    final_path = matches[0]

            logger.info(f"Downloaded: {final_path.name}")

            return {
                "success": True,
                "filename": final_path.name,
                "filepath": str(final_path),
                "title": info.get("title"),
                "filesize": final_path.stat().st_size if final_path.exists() else 0,
            }

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Download error: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"success": False, "error": "Download failed due to an unexpected error."}

def _build_ydl_opts( format_type: str, quality: str, output_template: str ) -> dict:
    """Builds yt-dlp options based on the requested format and quality."""

    base_opts = {
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
    }

    if format_type == "mp3":
        return {
            **base_opts,
            "format": "bestaudio/best",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        }

    quality_map = {
        "source": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "1080": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
        "720": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]",
        "480": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]",
        "360": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]",
    }

    return {
        **base_opts,
        "format": quality_map.get(quality, quality_map["source"]),
        "merge_output_format": "mp4",
    }

def _parse_formats( formats: list ) -> list:
    """Filters and returns only the relevant formats."""
    
    seen_heights = set()
    result = []

    for f in reversed(formats):
        height = f.get("height")
        ext = f.get("ext")
        if height and ext in ["mp4", "webm"] and height not in seen_heights:
            seen_heights.add(height)
            result.append({
                "format_id": f.get("format_id"),
                "quality": f"{height}p",
                "ext": ext,
                "filesize": f.get("filesize"),
            })

    return sorted(result, key = lambda x: int(x["quality"][:-1]), reverse = True)


if __name__ == "__main__":
    TEST_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    print("Gathering info...")
    info = get_video_info(TEST_URL)
    if info["success"]:
        print(f"Title: {info['title']}")
        print(f"Duration: {info['duration']}")
        print(f"Available formats: {[f['quality'] for f in info['formats']]}")
    else:
        print(f"Error: {info['error']}")