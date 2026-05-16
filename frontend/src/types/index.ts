export interface VideoFormat {
    format_id: string
    quality: string
    ext: string
    filesize: number | null
}

export interface VideoInfo {
    success: boolean
    title: string
    duration: string
    thumbnail: string
    uploader: string
    formats: VideoFormat[]
}

export interface DownloadRequest {
    url: string
    format: 'mp4' | 'mp3'
    quality: 'source' | '1080' | '720' | '480' | '360'
}

export type AppState = 'idle' | 'fetching' | 'ready' | 'downloading' | 'done' | 'error'