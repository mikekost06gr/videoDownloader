import type { DownloadRequest } from "../types";

interface Props {
    options: DownloadRequest
    onChange: (opts: DownloadRequest) => void
    onDownload: () => void
    loading: boolean
}

const QUALITIES = ['source', '1080', '720', '480', '360'] as const

export default function DownloadOptions({ options, onChange, onDownload, loading }: Props) {
    const isMP3 = options.format === 'mp3'

    return (
        <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">

                <div>
                    <label className="block text-xs font-mono text-[#A855F7] uppercase tracking-widest mb-2">
                        //format
                    </label>
                    <select
                        value={options.format}
                        onChange={e => onChange({ ...options, format: e.target.value as 'mp4' | 'mp3' })}
                        className="w-full bg-[#0B1120] border border-[#6D28D9] text-[#A855F7] px-4 py-3 text-sm font-mono outline-none focus:border-[#A855F7] transition-colors cursor-pointer"
                    >
                        <option value="mp4">MP4 - Video</option>
                        <option value="mp3">MP3 - Audio Only</option>
                    </select>
                </div>

                <div className={isMP3 ? 'opacity-40 pointer-events-none' : ''}>
                    <label className="block text-xs font-mono text-[#A855F7] uppercase tracking-widest mb-2">
                                //quality
                    </label>
                    <select
                        value={options.quality}
                        disabled={isMP3}
                        onChange={e => onChange({ ...options, quality: e.target.value as DownloadRequest['quality'] })}
                        className="w-full bg-[#0B1120] border border-[#6D28D9] text-[#A855F7] px-4 py-3 text-sm font-mono outline-none focus:border-[#A855F7] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        {QUALITIES.map(q => (
                            <option key={q} value={q}>
                                {q === 'source' ? 'Source (best)' : `${q}p`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={onDownload}
                disabled={loading}
                className="w-full border-2 border-[#6D28D9] text-[#A855F7] py-4 font-bold text-base uppercase tracking-widest hover:bg-[#6D28D9] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                {loading ? '⏳ Downloading...' : '⬇ Download'}
            </button>
        </div>
    )
}