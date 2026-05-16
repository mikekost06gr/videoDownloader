interface Props {
    value: string
    onChange: (val: string) => void
    onFetch: () => void
    loading: boolean
}

export default function UrlInput({ value, onChange, onFetch, loading }: Props) {
    return (
        <div className="w-full">
            <label className="block text-xs font-mono text-[#A855F7] uppercase tracking-widest mb-2">
            // Paste your video Url
            </label>
            <div className="flex border border-[#6D28D9] focus-within:border-[#A855F7] transition-colors">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onFetch()}
                    placeholder="https://www.youtube.com/watch?v-..."
                    className="flex-1 bg-transparent outline-none px-5 py-4 text-sm font-mono text-[#A855F7] placeholder-[#6D28D9] min-w-0"
                />
                <button
                    onClick={onFetch}
                    disabled={loading}
                    className="bg-[#6D28D9] text-black px-6 py-4 font-bold text-sm uppercase tracking-wide hover:bg-[#A855F7] disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors whitespace-norap"
                >
                    {loading ? '...' : 'Fetch →'}
                </button>
            </div>
        </div>
    )
}