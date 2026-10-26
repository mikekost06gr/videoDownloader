import type { VideoInfo, DownloadRequest } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchVideoInfo( url: string ): Promise<VideoInfo> {
    const res = await fetch(`${API_BASE}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({url}),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
        throw new Error(data.details?.error || data.detail || 'Failed to fetch video info.')
    }

    return data as VideoInfo
}

export async function downloadVideo(payload: DownloadRequest, signal?: AbortSignal): Promise<Blob> {
    const res = await fetch(`${API_BASE}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail?.error || data.detail || 'Download Failed.')
    }

    return res.blob()
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
}