import { useMemo, useState } from "react";
import WaxSealButton from "../components/WaxSealButton";
import QuillEditor from "../editor/QuillEditor";

const MAX_SUBMISSION_CHARS = 200;
const WARN_SUBMISSION_AT = 170;

const MAX_TOKEN_CHARS = 48;
const WARN_TOKEN_AT = 40;

function toPlainText(htmlOrDeltaString) {
  return (htmlOrDeltaString || "")
    .replace(/<(.|\n)*?>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "Token" here means a single uninterrupted chunk between whitespace.
// This matches the real-world failure mode: long URLs / long strings.
function getTokenStats(plain) {
  if (!plain) return { longestLen: 0, longestToken: "" };

  const tokens = plain.split(/\s+/).filter(Boolean);
  let longestLen = 0;
  let longestToken = "";

  for (const t of tokens) {
    const len = t.length;
    if (len > longestLen) {
      longestLen = len;
      longestToken = t;
    }
  }

  return { longestLen, longestToken };
}

export default function SubmitBar({
  disabled,
  disabledReason,
  onSubmit,
  semanticMessage,
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const plainNow = useMemo(() => toPlainText(value), [value]);
  const count = plainNow.length;

  const { longestLen, longestToken } = useMemo(
    () => getTokenStats(plainNow),
    [plainNow]
  );

  const showTokenPill = longestLen >= WARN_TOKEN_AT;

  const empty = count === 0;

  const overSubmissionLimit = count > MAX_SUBMISSION_CHARS;
  const overTokenLimit = longestLen > MAX_TOKEN_CHARS;

  const canSubmit =
    !disabled && !sending && !empty && !overSubmissionLimit && !overTokenLimit;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSending(true);
    try {
      await onSubmit(plainNow);
      setValue("");
    } finally {
      setSending(false);
    }
  }

  const editorDisabled = disabled || sending;

  // Counter tone is about total submission length
  const counterTone = overSubmissionLimit
    ? "text-red-800"
    : count >= WARN_SUBMISSION_AT
      ? "text-amber-800"
      : "text-slate-700";

  const counterRing = overSubmissionLimit
    ? "ring-red-900/15"
    : count >= WARN_SUBMISSION_AT
      ? "ring-amber-900/15"
      : "ring-slate-900/10";

  // Token warning tone (separate from total count)
  const tokenTone = overTokenLimit
    ? "text-red-800"
    : longestLen >= WARN_TOKEN_AT
      ? "text-amber-800"
      : "text-slate-700";

  const tokenRing = overTokenLimit
    ? "ring-red-900/15"
    : longestLen >= WARN_TOKEN_AT
      ? "ring-amber-900/15"
      : "ring-slate-900/10";

  const helper = disabledReason
    ? disabledReason
    : overTokenLimit
      ? `That word is a little too long for this moment (${longestLen}/${MAX_TOKEN_CHARS}). Try breaking it up or trimming it.`
      : overSubmissionLimit
        ? `Too long (${count}/${MAX_SUBMISSION_CHARS}). Trim ${count - MAX_SUBMISSION_CHARS} character(s).`
        : count >= WARN_SUBMISSION_AT
          ? "Close to the 200-character limit."
          : "Plain-text intent only.";

  const tokenPreview =
    longestToken && longestToken.length > 24
      ? `${longestToken.slice(0, 18)}…${longestToken.slice(-5)}`
      : longestToken;

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl bg-white/60 p-5
        shadow-[0_18px_60px_rgba(15,23,42,0.14)]
        ring-1 ring-slate-900/10
        backdrop-blur-sm

        before:pointer-events-none
        before:absolute before:inset-0
        before:rounded-2xl
        before:bg-[radial-gradient(900px_500px_at_20%_0%,rgba(255,255,255,0.55),rgba(255,255,255,0)_60%),radial-gradient(900px_700px_at_50%_120%,rgba(0,0,0,0.08),rgba(0,0,0,0)_55%)]
        before:opacity-80

        after:pointer-events-none
        after:absolute after:inset-0
        after:rounded-2xl
        after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]

        ${disabled ? "opacity-95" : ""}
      `}
    >
      <div className="rounded-xl bg-white/65 p-4 ring-1 ring-slate-900/10 focus-within:ring-2 focus-within:ring-amber-700/25">
        <QuillEditor
          value={value}
          onChange={setValue}
          disabled={editorDisabled}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <WaxSealButton onClick={handleSubmit} disabled={!canSubmit}>
          {sending ? "Sending..." : "Seal & Submit"}
        </WaxSealButton>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {/* Total submission counter (200) */}
          <div
            className={`
              inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1
              text-sm ${counterTone} ring-1 ${counterRing}
            `}
            title="Total submission length"
          >
            <span className="font-medium">
              {count}/{MAX_SUBMISSION_CHARS}
            </span>
            <span className="text-xs opacity-80">
              {Math.max(0, MAX_SUBMISSION_CHARS - count)} left
            </span>
          </div>

          {/* Token-length guard (48) — gentle fade/slide, no pop */}
          <div
            className={`
              overflow-hidden transition-all duration-150 ease-out
              ${showTokenPill ? "max-h-12 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}
            `}
          >
            <div
              className={`
                inline-flex items-center gap-2 rounded-full bg-white/45 px-3 py-1
                text-xs ${tokenTone} ring-1 ${tokenRing}
              `}
              title="Longest single word length"
            >
              <span className="font-medium">
                long word {longestLen}/{MAX_TOKEN_CHARS}
              </span>
              {longestToken ? (
                <span className="opacity-80">“{tokenPreview}”</span>
              ) : null}
            </div>
          </div>

          <div className="text-xs text-slate-700">{helper}</div>
        </div>
      </div>

      {semanticMessage ? (
        <div className="mt-3 rounded-xl bg-white/50 px-3 py-2 text-xs italic text-slate-700 ring-1 ring-slate-900/10">
          {semanticMessage}
        </div>
      ) : null}
    </div>
  );
}
