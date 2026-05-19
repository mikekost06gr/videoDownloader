from pydantic import BaseModel, field_validator
from typing import Literal

class InfoRequest( BaseModel ):
    url: str

    @field_validator ( "url" )
    @classmethod
    
    def url_must_not_be_empty( cls, v ):
        if not v or not v.strip():
            raise ValueError( "Url can't be empty." )
        return v.strip()
            
class DownloadRequest( BaseModel ):
    url: str
    format: Literal["mp4", "mp3"] = "mp4"
    quality: Literal["source", "1080", "720", "480", "360"] = "source"

    @field_validator( "url" )
    @classmethod
    def url_must_not_be_empty( cls, v ):
        if not v or not v.strip():
            raise ValueError( "Url can't be empty." )
        return v.strip()