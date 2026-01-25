import { useMemo, useState } from "react";
import QuillEditor from "../editor/QuillEditor";

const MAX_CHARS = 200;

export default function SubmitBar({ disabled, disabledReason, onSubmit, semanticMessage }) {
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
    <div className={`card ${disabled ? "opacity-90" : ""}`}>
      <QuillEditor value={value} onChange={setValue} disabled={editorDisabled} />

      <div className="row">
        <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
          {sending ? "Sending..." : "Submit"}
        </button>

        <div className="muted">
          {count}/{MAX_CHARS}
          {disabledReason ? ` · ${disabledReason}` : ""}
          {overLimit ? " · Too long — shorten to submit." : " · Plain-text intent only."}
        </div>
      </div>

      {semanticMessage ? <div className="muted small">{semanticMessage}</div> : null}
    </div>
  );
}
