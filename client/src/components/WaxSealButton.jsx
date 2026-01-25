export default function WaxSealButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center
        rounded-full bg-red-800 px-5 py-3
        font-['Cinzel'] text-xs tracking-[0.08em] text-amber-50
        ring-1 ring-red-950/40
        transition duration-200
        hover:-translate-y-[2px]
        active:translate-y-[1px]
        hover:bg-red-700
        shadow-[0_14px_40px_rgba(127,29,29,0.35)]
        hover:shadow-[0_20px_60px_rgba(220,38,38,0.55)]
        active:shadow-[0_8px_20px_rgba(127,29,29,0.45)]
        before:absolute before:inset-[-6px]
        before:rounded-full
        before:bg-red-600/25
        before:blur-xl
        before:opacity-0
        hover:before:opacity-100
        before:transition before:duration-300
        disabled:opacity-60
        disabled:hover:translate-y-0
        disabled:hover:shadow-[0_14px_40px_rgba(127,29,29,0.35)]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-amber-200/70
        focus-visible:ring-offset-2
        focus-visible:ring-offset-red-900
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
