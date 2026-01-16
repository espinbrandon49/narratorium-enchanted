import { useState } from "react";
import QuillEditor from "../editor/QuillEditor";

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

    const canSubmit = !disabled && !sending;

    async function handleSubmit() {
        const plain = toPlainText(value);
        if (!plain) return;

        setSending(true);
        try {
            await onSubmit(plain);
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
                {disabled ? <div className="muted">Login required to write.</div> : <div className="muted">Plain-text intent only.</div>}
            </div>
            {error ? <div className="error">{error}</div> : null}
        </div>
    );
}
