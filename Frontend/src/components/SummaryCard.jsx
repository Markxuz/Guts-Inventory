const SummaryCard = ({ label, value, subtitle, icon: Icon }) => {
  return (
    <article className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-5 h-full min-h-[170px] flex flex-col justify-between text-center transition-colors duration-300 dark:bg-slate-800 dark:border-slate-700">
      <div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="inline-flex rounded-lg bg-slate-100 p-2 text-[var(--brand-primary)] dark:bg-slate-700 dark:text-yellow-400 transition-colors duration-300">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 transition-colors duration-300">{label}</p>
        </div>
        <h3 className="font-title text-4xl font-extrabold text-slate-800 dark:text-white transition-colors duration-300">{value}</h3>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{subtitle}</p>
    </article>
  )
}

export default SummaryCard
