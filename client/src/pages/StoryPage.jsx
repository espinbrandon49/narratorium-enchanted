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
      <div className="card border border-emerald-400/30 bg-emerald-500/5 ring-1 ring-emerald-400/20">
        <div className="muted">The Opening is live.</div>
        <div className="small muted">
          Closes at {formatAbsolute(opening.closesAt)}.
        </div>
      </div>
    );
  }

  const hint = formatRelativeHint(opening.nextOpenAt);
  return (
    <div className="card border border-slate-400/20 bg-slate-500/5">
      <div className="muted">The story is resting.</div>
      <div className="small muted">
        Next Opening: {formatAbsolute(opening.nextOpenAt)}
        {hint ? ` (${hint})` : ""}
      </div>
    </div>
  );
}

export default function StoryPage() {
  const auth = useAuth();
  const story = useStory();

  if (story.loading) return <LoadingState label="Connecting + syncing story..." />;

  if (story.error) {
    return (
      <div className="card">
        <div className="error">Error: {story.error}</div>
        <button className="btn" onClick={story.retry}>Retry</button>
      </div>
    );
  }

  const opening = story.opening;
  const isOpen = opening?.isOpen ?? true;

  const writeDisabled = !auth.isAuthed || !isOpen;

  const disabledReason = !auth.isAuthed
    ? "Login required to write."
    : !isOpen
      ? "The story is resting."
      : "";

  return (
    <div className="stack">
      <OpeningCard opening={opening} />

      {!story.tokens?.length ? (
        <div className="card">
          <div className="muted">Empty story. Be the first to write.</div>
        </div>
      ) : (
        <StoryView tokens={story.tokens} />
      )}

      <SubmitBar
        disabled={writeDisabled}
        disabledReason={disabledReason}
        semanticMessage={story.openingMessage}
        onSubmit={(plain) => story.submit({ submit_event: plain })}
      />
    </div>
  );
}
