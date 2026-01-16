import { useAuth } from "../hooks/useAuth";
import { useStory } from "../hooks/useStory";
import LoadingState from "../components/LoadingState";
import StoryView from "../components/StoryView";
import SubmitBar from "../components/SubmitBar";

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

    return (
        <div className="stack">
            {!story.tokens?.length ? (
                <div className="card">
                    <div className="muted">Empty story. Be the first to write.</div>
                </div>
            ) : (
                <StoryView tokens={story.tokens} />
            )}

            <SubmitBar
                disabled={!auth.isAuthed}
                error={story.error}
                onSubmit={(plain) => story.submit({ submit_event: plain })}
            />
        </div>
    );
}
