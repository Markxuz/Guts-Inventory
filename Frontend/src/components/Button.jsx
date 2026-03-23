const Button = ({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) => {
  const variants = {
    primary:
      "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)] focus-visible:ring-[var(--color-brand)]",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-[var(--brand-secondary-soft)] focus-visible:ring-slate-300",
    edit:
      "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/30 focus-visible:ring-[var(--brand-primary)]",
    delete:
      "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 focus-visible:ring-rose-300",
    ghost:
      "bg-white/80 text-slate-700 hover:bg-white border border-slate-200 focus-visible:ring-slate-300"
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
