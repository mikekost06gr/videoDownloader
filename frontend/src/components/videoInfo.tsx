import type { VideoInfo } from "../types";

interface Props {
    info: VideoInfo
}

function formatFilesize(bytes: number | null): string {
    if (!bytes) return '-'
    const mb = bytes / 1024 / 1024
    return mb > 1024 ? `${(mb / 1024).toFixed(1)} Gb` : `${mb.toFixed(0)} Mb`
}

export default function VideoInfoCard({ info }: Props) {
    return (
        <div className="w-full border border-[#6D28D9] bg-[#0B1120] animate-fade-in">
            <div className="flex gap-4 p-4">
                <img
                    src={info.thumbnail}
                    alt="thumbnail"
                    className="w-28 h-16 object-cover border border-[#6D28D9] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#A855F7] truncate mb-2">{info.title}</p>
                    <div className="flex gap-4 text-sm font-mono text-[#6D28D9]">
                        <span>⌛Duration: <span className="text-[#A855F7]">{info.duration}</span></span>
                        <span>👤Artist: <span className="text-[#A855F7]">{info.uploader || '-'}</span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { formatFilesize }