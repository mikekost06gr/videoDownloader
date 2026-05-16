interface Props {
    status: string
    percent: number
    visible: boolean
}

export default function ProgressBar({ status, percent, visible }: Props) {
    if (!visible) return null

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#6D28D9]">
                <span>{status}</span>
                <span className="text-[#A855F7]">{percent > 0 ? `${Math.round(percent)}%` : '-'}</span>
            </div>
            <div className="h-0.5 bg-[#6D28D9] overflow-hidden">
                <div className="h-full bg-[#A855F7] transition-all duration-300"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}