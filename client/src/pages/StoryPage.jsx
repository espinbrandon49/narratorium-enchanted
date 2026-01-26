import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useStory } from "../hooks/useStory";
import LoadingState from "../components/LoadingState";
import StoryView from "../components/StoryView";
import SubmitBar from "../components/SubmitBar";

function formatAbsolute(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Gentle relative hint (no live countdown)
function formatRelativeHint(iso) {
  if (!iso) return "";
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffMs = t - now;
  if (diffMs <= 0) return "";

  const mins = Math.round(diffMs / 60000);
  if (mins <= 1) return "soon";
  if (mins < 60) return `in ~${mins} min`;

  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ~${hrs} hr`;

  const days = Math.round(hrs / 24);
  return `in ~${days} day${days === 1 ? "" : "s"}`;
}

function OpeningCard({ opening }) {
  if (!opening) return null;

  if (opening.isOpen) {
    return (
      <div className="rounded-2xl bg-emerald-500/10 p-5 ring-1 ring-emerald-700/20">
        <div className="font-['Cinzel'] text-sm tracking-wide text-slate-900">
          The Opening is live.
        </div>
        <div className="mt-1 text-sm text-slate-700">
          Closes at{" "}
          <span className="font-medium text-slate-900">
            {formatAbsolute(opening.closesAt)}
          </span>
          .
        </div>
      </div>
    );
  }

  const hint = formatRelativeHint(opening.nextOpenAt);
  return (
    <div className="rounded-2xl bg-slate-500/10 p-5 ring-1 ring-slate-900/10">
      <div className="font-['Cinzel'] text-sm tracking-wide text-slate-900">
        The story is resting.
      </div>
      <div className="mt-1 text-sm text-slate-700">
        Next Opening:{" "}
        <span className="font-medium">
          {formatAbsolute(opening.nextOpenAt)}
        </span>
        {hint ? ` (${hint})` : ""}
      </div>
    </div>
  );
}

function AuthCtaBar() {
  return (
    <div className="mb-3 rounded-2xl bg-white/55 p-4 ring-1 ring-slate-900/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-800">
          <span className="font-medium text-slate-900">
            Login required to write.
          </span>{" "}
          Join the moment:
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="
              rounded-full bg-slate-900 px-4 py-2
              font-['Cinzel'] text-xs tracking-wide text-amber-50
              shadow-[0_12px_30px_rgba(15,23,42,0.25)]
              ring-1 ring-slate-950/30
              transition hover:-translate-y-[1px] hover:bg-slate-800 active:translate-y-0
            "
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="
              rounded-full bg-white/70 px-4 py-2
              font-['Cinzel'] text-xs tracking-wide text-slate-900
              ring-1 ring-slate-900/15
              transition hover:-translate-y-[1px] hover:bg-white/85 active:translate-y-0
            "
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  const auth = useAuth();
  const story = useStory();

  if (story.loading)
    return <LoadingState label="Connecting + syncing story..." />;

  if (story.error) {
    return (
      <div className="rounded-2xl bg-white/60 p-6 ring-1 ring-slate-900/10">
        <div className="text-sm text-red-900">Error: {story.error}</div>
        <button
          className="
            mt-4 rounded-full bg-red-800 px-5 py-3
            font-['Cinzel'] text-xs tracking-wide text-amber-50
            shadow-[0_14px_40px_rgba(127,29,29,0.35)]
            ring-1 ring-red-950/30
            transition hover:-translate-y-[1px] hover:bg-red-700 active:translate-y-0
          "
          onClick={story.retry}
        >
          Retry
        </button>
      </div>
    );
  }

  const opening = story.opening;
  const isOpen = opening?.isOpen ?? true;

  const writeDisabled = !auth.isAuthed || !isOpen;

  // Keep SubmitBar's disabledReason focused on story-state.
  // Auth CTA is handled by StoryPage so user can act without scrolling.
  const disabledReason = !isOpen ? "The story is resting." : "";

  return (
    <div className="flex min-h-[70vh] flex-col gap-5">
      <OpeningCard opening={opening} />

      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-4">
        {/* Story scroll region */}
        <div className="min-h-0 overflow-y-auto pr-1">
          {!story.tokens?.length ? (
            <div className="rounded-2xl bg-white/55 p-6 ring-1 ring-slate-900/10">
              <div className="text-slate-700">
                Empty story. <span className="italic">Be the first to write.</span>
              </div>
            </div>
          ) : (
            <StoryView tokens={story.tokens} />
          )}
        </div>

        {/* Anchored "present" zone */}
        <div className="sticky bottom-0 z-20">
          <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-white/60 to-transparent" />

          <div className="pointer-events-auto">
            {!auth.isAuthed ? <AuthCtaBar /> : null}

            <SubmitBar
              disabled={writeDisabled}
              disabledReason={disabledReason}
              semanticMessage={story.openingMessage}
              onSubmit={(plain) => story.submit({ submit_event: plain })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
