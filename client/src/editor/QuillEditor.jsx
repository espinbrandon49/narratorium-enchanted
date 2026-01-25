import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function QuillEditor({ value, onChange, disabled }) {
  // toolbar removed
  const modules = useMemo(() => ({ toolbar: false }), []);
  const formats = useMemo(() => [], []);

  return (
    <div
      className="
        rounded-lg
        [&_.ql-toolbar]:hidden
        [&_.ql-container]:rounded-lg
        [&_.ql-container]:border-slate-900/10
        [&_.ql-container]:bg-white/60
        [&_.ql-container]:min-h-[96px]
        [&_.ql-editor]:min-h-[96px]
        [&_.ql-editor]:text-slate-900
        [&_.ql-editor]:leading-6
      "
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        placeholder={disabled ? "Login to write..." : "Type your next submission..."}
      />
    </div>
  );
}
