import { useMemo, useState } from "react";
import WaxSealButton from "../components/WaxSealButton";
import QuillEditor from "../editor/QuillEditor";

const MAX_CHARS = 200;

export default function SubmitBar({
  disabled,
  disabledReason,
  onSubmit,
  semanticMessage,
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  function toPlainText(htmlOrDeltaString) {
    return (htmlOrDeltaString || "")
      .replace(/<(.|\n)*?>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const plainNow = useMemo(() => toPlainText(value), [value]);
  const count = plainNow.length;

  const overLimit = count > MAX_CHARS;
  const empty = count === 0;

  const canSubmit = !disabled && !sending && !empty && !overLimit;

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
      {/* Editor wrapper (focus-visible accessibility) */}
      <div className="rounded-xl bg-white/65 p-4 ring-1 ring-slate-900/10 focus-within:ring-2 focus-within:ring-amber-700/25">
        <QuillEditor
          value={value}
          onChange={setValue}
          disabled={editorDisabled}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* wax-seal submit */}
        <WaxSealButton onClick={handleSubmit} disabled={!canSubmit}>
          {sending ? "Sending..." : "Seal & Submit"}
        </WaxSealButton>

        <div className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">
            {count}/{MAX_CHARS}
          </span>
          {disabledReason ? ` · ${disabledReason}` : ""}
          {overLimit
            ? " · Too long — trim the seal."
            : " · Plain-text intent only."}
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
