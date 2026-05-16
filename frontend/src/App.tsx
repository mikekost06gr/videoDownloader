import { useState, useRef } from 'react'
import UrlInput from './components/UrlInput'
import VideoInfoCard from './components/videoInfo'
import DownloadOptions from './components/DownloadOptions'
import ProgressBar from './components/ProgressBar'
import { fetchVideoInfo, downloadVideo, triggerBrowserDownload } from './api/client'
import type { VideoInfo, DownloadRequest, AppState } from './types'

export default function App() {

  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [state, setState] = useState<AppState>('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [options, setOptions] = useState<DownloadRequest>({ url: '', format: 'mp4', quality: 'source', })
  const abortControllerRef = useRef<AbortController | null>(null)

  const fakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startFakeProgress() {
    setProgress(0)
    let p = 0
    fakeIntervalRef.current = setInterval(() => {
      p += Math.random() * 8
      if (p < 85) {
        setProgress(p)
      }
    }, 600)
  }

  function stopFakeProgress() {
    if (fakeIntervalRef.current) {
      clearInterval(fakeIntervalRef.current)
      fakeIntervalRef.current = null
    }
  }

  function handleReset() {
    stopFakeProgress()
    setUrl('')
    setVideoInfo(null)
    setState('idle')
    setError('')
    setProgress(0)
    setOptions({ url: '', format: 'mp4', quality: 'source', })
  }

  async function handleFetch() {
    if (!url.trim()) {
      setError('Paste a URL first.')
      return
    }

    setError('')
    setVideoInfo(null)
    setState('fetching')

    try {

      const info = await fetchVideoInfo(url.trim())
      setVideoInfo(info)
      setOptions(prev => ({ ...prev, url: url.trim() }))
      setState('ready')
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to collect video info.'
      )
      setState('error')
    }
  }

  async function handleDownload() {
    setError('')
    setState('downloading')
    startFakeProgress()

    abortControllerRef.current = new AbortController()

    try {

      const blob = await downloadVideo({ ...options, url: url.trim() }, abortControllerRef.current.signal)

      stopFakeProgress()
      setProgress(100)
      setState('done')

      const ext = options.format
      const safeName = (videoInfo?.title ?? 'download')
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      triggerBrowserDownload(
        blob,
        `${safeName}.${ext}`
      )

    } catch (e) {

      if (e instanceof DOMException && e.name === 'AbortError') {
        setState('ready')
        return
      }

      stopFakeProgress()
      setError(
        e instanceof Error
          ? e.message
          : 'Download failed!'
      )
      setState('error')
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort()
    stopFakeProgress()
    setProgress(0)
    setState('ready')
  }

  const isFetching = state === 'fetching'
  const isDownloading = state === 'downloading'
  const isDone = state === 'done'
  const showInfo = videoInfo !== null
  const showOptions = state === 'ready' || state === 'downloading' || state === 'done'

  return (
    <div className="min-h-screen flex flex-col">

      {/*---Top Section---*/}
      <div className="bg-[#0b1120] flex flex-col items-center justify-start h-[50vh] pt-12 px-5">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl text-[#a855f7] tracking-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            Video Converter v1.0
          </h1>
          <p className="text-[#a855f7] test-sm opacity-60">
            Download your favourite Youtube videos on <strong>MP4</strong> or convert them to <strong>MP3</strong>
          </p>
        </div>
      </div>

      {/*---Card: Pages' middle part---*/}
      <div className="bg-[#0b1120] flex flex-col items-center px-5 -mt-14 z-10">
        <div className="w-full max-w-2xl bg-[#0b1120] border border-[#6d28d9] rounded shadow-xl flex flex-col gap-4">

          {!showInfo && (
            <UrlInput
              value={url}
              onChange={setUrl}
              onFetch={handleFetch}
              loading={isFetching}
            />
          )}

          {error && (
            <div className="border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400 rounded">
              ⚠ {error}
            </div>
          )}

          {showInfo && videoInfo && (
            <div className="relative">
              <button
                onClick={handleReset}
                title="Clear"
                className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-[#0b1120] border border-[#6d28d9] text-[#6d28d9] hover:text-[#a855f7] hover:border-[#a855f7] flex items-center justify-center text-xs rounded-full transition-all"
              >
                ✖️
              </button>
              <VideoInfoCard info={videoInfo} />
            </div>
          )}

          {showOptions && (
            <DownloadOptions
              options={options}
              onChange={setOptions}
              onDownload={handleDownload}
              loading={isDownloading}
            />
          )}

          <ProgressBar
            visible={isDownloading || isDone}
            status={isDone ? "✔️Done!" : "Downloading..."}
            percent={progress}
          />

          {isDownloading && (
            <button
              onClick={handleCancel}
              className="w-full border border-red-800 text-red-400 py-2 text-sm rounded hover:border-red-300 transition-colors"
            >
              ✖️ Cancel Download
            </button>
          )}

          {isDone && (
            <button
              onClick={handleReset}
              className="w-full border border-[#6d28d9] text-[#6d28d9] py-2 text-sm rounded hover:border-[#a855f7] hover:text-[#a855f7] transition-colors"
            >
              ➕ Convert another video
            </button>
          )}
        </div>
      </div>

      {/*---Bottom---*/}
      <div className="flex-1 bg-[#0b1120] flex flex-col items-center justify-end py-6 px-5">
        <footer className="flex flex-row items-center gap-3 text-xs text-[#6d28d9]">
          <a
            href="https://github.com/mikekost06gr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Github"
            className="hover:text-[#a855f7] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
          <p>© 2026 Designed &amp; Built by mikekost06gr</p>
        </footer>
      </div>
    </div>
  )
}