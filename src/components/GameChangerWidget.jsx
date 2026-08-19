import { useEffect, useRef, useState } from "react";

const WIDGET_SRC = "https://widgets.gc.com/static/js/sdk.v1.js";
const WIDGET_ID = "394d13f8-9e99-4e33-998f-80b411ef9d8c";
const TARGET_ID = "gc-scoreboard-widget-su90";

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.GC?.scoreboard?.init) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load GameChanger script")));
      // if already loaded
      if (window.GC) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = WIDGET_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load GameChanger script"));
    document.head.appendChild(s);
  });
}

export default function GameChangerWidget() {
  const initialized = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (initialized.current) return;
    loadScript()
      .then(() => {
        if (cancelled) return;
        // Small delay to ensure target is in DOM and GC is ready
        const tryInit = (attempts = 10) => {
          if (window.GC?.scoreboard?.init && document.getElementById(TARGET_ID)) {
            try {
              window.GC.scoreboard.init({
                target: `#${TARGET_ID}`,
                widgetId: WIDGET_ID,
                maxVerticalGamesVisible: 1,
                maxHorizontalGamesVisible: 4,
              });
              initialized.current = true;
            } catch (e) {
              setError(e.message);
            }
          } else if (attempts > 0) {
            setTimeout(() => tryInit(attempts - 1), 300);
          } else {
            setError("GameChanger widget failed to initialize");
          }
        };
        tryInit();
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
      <div className="px-5 sm:px-6 py-3 border-b bg-gradient-to-r from-navy to-navy-mid flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow shadow-emerald-400/30" />
          <h2 className="font-display font-bold text-white text-[13px] tracking-wide">LIVE SCORES — GAMECHANGER</h2>
        </div>
        <a
          href="https://web.gc.com/organizations/Cr9gsGVDWegK"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex text-[11px] font-bold tracking-widest text-white/70 hover:text-white"
        >
          VIEW ON GC →
        </a>
      </div>

      <div className="bg-white">
        {error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-navy/70">Live scores temporarily unavailable.</p>
            <p className="text-xs text-navy/50 mt-1">{error}</p>
            <a href="https://web.gc.com/organizations/Cr9gsGVDWegK" target="_blank" rel="noreferrer" className="inline-flex mt-3 px-4 py-1.5 rounded-full bg-navy text-white text-xs font-bold">Open GameChanger</a>
          </div>
        ) : (
          <div
            id={TARGET_ID}
            style={{ height: 250, minHeight: 250 }}
            className="w-full overflow-auto"
          />
        )}
      </div>

      <div className="px-4 py-2 bg-cream/60 border-t flex items-center justify-between">
        <span className="text-[11px] font-semibold text-navy/50">Powered by GameChanger • Updates automatically on game day</span>
        <a href="https://web.gc.com/organizations/Cr9gsGVDWegK" target="_blank" rel="noreferrer" className="sm:hidden text-[11px] font-bold text-navy">View on GC →</a>
      </div>
    </div>
  );
}
