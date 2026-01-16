import { useMemo, useState } from "react";
import QuillEditor from "../editor/QuillEditor";

const MAX_CHARS = 200;

export default function SubmitBar({ disabled, onSubmit, error }) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  // Plain text extraction only
  function toPlainText(htmlOrDeltaString) {
    // ReactQuill gives HTML string by default
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

  return (
    <div className="card">
      <QuillEditor value={value} onChange={setValue} disabled={disabled || sending} />

      <div className="row">
        <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
          {sending ? "Sending..." : "Submit"}
        </button>

        <div className="muted">
          {count}/{MAX_CHARS}
          {disabled ? " · Login required to write." : ""}
          {overLimit ? " · Too long — shorten to submit." : " · Plain-text intent only."}
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
