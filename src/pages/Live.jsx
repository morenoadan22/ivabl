import { Link } from "react-router-dom";

// Replace with your YouTube live EMBED URL when you go live.
// Option A - single live video:  https://www.youtube.com/embed/YOUR_VIDEO_ID
// Option B - auto show whatever is live on your channel: https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID
// Get Channel ID: YouTube Studio → Settings → Advanced or https://www.youtube.com/account_advanced
const LIVE_EMBED_URL = ""; // e.g. "https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxx"
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ivabl"; // update to your channel
const IS_LIVE = Boolean(LIVE_EMBED_URL);

export default function Live() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-navy to-navy-mid flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-widest ${IS_LIVE ? "bg-red-600 text-white animate-pulse" : "bg-white/15 text-white/70"}`}>
              <span className={`h-2 w-2 rounded-full ${IS_LIVE ? "bg-white" : "bg-white/50"}`} /> {IS_LIVE ? "LIVE NOW" : "OFFLINE"}
            </span>
            <h1 className="font-display font-black text-white text-lg">Live Stream</h1>
          </div>
          <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" className="text-xs font-bold tracking-widest text-white/70 hover:text-white">
            YOUTUBE →
          </a>
        </div>

        <div className="bg-black">
          {IS_LIVE ? (
            <div className="aspect-video w-full">
              <iframe
                src={LIVE_EMBED_URL}
                title="IVABL Live Stream"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-gradient-to-br from-navy to-navy-deep">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <span className="text-xl">📺</span>
              </div>
              <h2 className="font-display font-bold text-white text-xl">No game live right now</h2>
              <p className="text-white/60 text-sm mt-2 max-w-[480px]">
                When the GoPro is live, the game will appear here automatically. Check the schedule for first pitch (7:00 PM) or watch on YouTube.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-white text-navy text-sm font-bold hover:bg-cream transition">
                  Watch on YouTube
                </a>
                <Link to="/" className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition">
                  View Schedule
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 bg-cream/40 border-t flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="text-sm text-navy/70">
            <span className="font-bold text-navy">GoPro → YouTube:</span> GoPro app → Live → RTMP → paste <code className="px-1 py-0.5 rounded bg-white border text-xs">rtmp://a.rtmp.youtube.com/live2/ + Stream Key</code>
          </div>
          <span className="text-xs font-semibold text-navy/50">Tip: use hotspot + USB battery at the field</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow ring-1 ring-black/5 p-5 sm:p-6">
        <h2 className="font-display font-bold text-navy">How to go live for volunteers</h2>
        <ol className="mt-3 space-y-2 text-sm text-navy/70 list-decimal list-inside">
          <li>YouTube Studio → <strong>Go Live → Stream</strong> → copy Stream Key (keep private)</li>
          <li>GoPro Quik → Live → **Set up Live → RTMP** → paste `rtmp://a.rtmp.youtube.com/live2/KEY`</li>
          <li>At field: GoPro → phone hotspot (5+ Mbps up) → Start Live. Set `LIVE_EMBED_URL` in `src/pages/Live.jsx` to `https://www.youtube.com/embed/YOUR_VIDEO_ID` or use `live_stream?channel=...` for auto.</li>
        </ol>
        <p className="text-xs text-navy/50 mt-3">To make the pill show “LIVE NOW” without a rebuild, set `LIVE_EMBED_URL` to your `live_stream` channel embed — it will show the live feed whenever YouTube has one.</p>
      </div>
    </div>
  );
}
