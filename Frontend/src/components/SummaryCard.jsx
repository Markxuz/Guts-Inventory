const SummaryCard = ({ label, value, subtitle, icon: Icon }) => {
  return (
    <article className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-5 h-full min-h-[170px] flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-lg bg-slate-100 p-2 text-[var(--brand-primary)]">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        </div>
        <h3 className="mt-4 font-title text-4xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </article>
  )
}

export default SummaryCard
