import os
from pathlib import Path
from datetime import datetime, timedelta
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

DOWNLOAD_FOLDER = Path(os.getenv("DOWNLOAD_FOLDER"))
MAX_AGE_HOURS = int(os.getenv("CLEANUP_HOURS"))

def cleanup_old_files():
    """Deletes files older than MAX_AGE_HOURS"""

    if not DOWNLOAD_FOLDER.exists():
        return
    
    cutoff = datetime.now() - timedelta(hours = MAX_AGE_HOURS)
    deleted = 0

    for file in DOWNLOAD_FOLDER.iterdir():
        
        if not file.is_file():
            continue
        modified = datetime.fromtimestamp(file.stat().st_atime)
        
        if modified < cutoff:
            
            try:
                file.unlink()
                deleted += 1
                logger.info(f"Deleted old file: {file.name}")
            except Exception as e:
                logger.error(f"Failed to delete {file.name}: {e}")

        if deleted:
            logger.info(f"Cleanup complete: {deleted} file(s) deleted.")
        else:
            logger.debug("Cleanup ran: no old files found.")

def start_cleanup_scheduler():
    """Starts background scheduler every 30 minutes"""
    
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(
        cleanup_old_files,
        trigger = "interval",
        minutes = 30,
        id = "cleanup__job",
        replace_existing = True,
    )

    scheduler.start()
    logger.info("Cleanup scheduler started (runs every 30 minutes).")
    
    return scheduler