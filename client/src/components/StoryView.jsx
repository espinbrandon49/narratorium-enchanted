export default function StoryView({ tokens }) {
    if (!tokens?.length) return null;

    return (
        <div className="card">
            <div className="storyText">
                {tokens
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((t) => t.value)
                    .join(" ")}
            </div>
            <div className="muted small">tokens: {tokens.length}</div>
        </div>
    );
}
