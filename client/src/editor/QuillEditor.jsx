import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function QuillEditor({ value, onChange, disabled }) {
    // toolbar removed
    const modules = useMemo(() => ({ toolbar: false }), []);
    const formats = useMemo(() => [], []);

    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            readOnly={disabled}
            placeholder={disabled ? "Login to write..." : "Type your next submission..."}
        />
    );
}
