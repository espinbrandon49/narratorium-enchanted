export default function StoryView({ tokens }) {
  if (!tokens?.length) return null;

  const text = tokens
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((t) => t.value)
    .join(" ");

  // For a tasteful drop cap, we split the first visible character
  const trimmed = (text || "").trimStart();
  const firstChar = trimmed ? trimmed[0] : "";
  const rest = trimmed ? trimmed.slice(1) : "";

  return (
    <div className="rounded-2xl bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/10 backdrop-blur-sm">
      {/* header + margin-note tooltip */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="font-['Cinzel'] text-sm tracking-wide text-slate-900">
          The Story
        </div>

        <div className="relative">
          <button
            type="button"
            className="
              group inline-flex h-9 w-9 items-center justify-center
              rounded-full bg-white/55 ring-1 ring-slate-900/10
              hover:bg-white/75
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/25
            "
            aria-label="About tokens"
          >
            <span className="text-slate-800">✦</span>
            <span
              className="
                pointer-events-none absolute right-0 top-10 z-10 w-64
                rounded-xl bg-white/85 p-3 text-xs text-slate-800
                shadow-[0_18px_60px_rgba(15,23,42,0.18)]
                ring-1 ring-slate-900/10
                opacity-0 translate-y-1
                transition group-hover:opacity-100 group-hover:translate-y-0
              "
            >
              <span className="font-semibold">Margin Note:</span> the story is stored as tokens
              (ordered fragments). Readers see the stitched narrative; writers submit plain-text intent.
            </span>
          </button>
        </div>
      </div>

      {/* book-page typography */}
      <div
        className="
          font-['Lora']
          text-[1.05rem] leading-8
          text-slate-900
          max-w-[72ch]
        "
      >
        {firstChar ? (
          <p className="[text-wrap:pretty] whitespace-pre-wrap">
            {/* Drop cap */}
            <span
              className="
                float-left mr-3 mt-1
                font-['Cinzel']
                text-5xl leading-none
                text-slate-900
                drop-shadow-[0_1px_0_rgba(0,0,0,0.12)]
              "
              aria-hidden="true"
            >
              {firstChar}
            </span>
            <span>{rest}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-5 text-xs text-slate-600">tokens: {tokens.length}</div>
    </div>
  );
}
