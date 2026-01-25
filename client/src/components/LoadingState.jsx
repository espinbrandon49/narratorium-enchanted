export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="rounded-2xl bg-white/55 p-5 ring-1 ring-slate-900/10">
      <div className="text-slate-700">{label}</div>
      <div className="mt-3 h-2 w-40 rounded-full bg-slate-900/10" />
    </div>
  );
}
