const Panel = ({ title, description, badge, actions, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>
    {(title || description || badge || actions) && (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badge}
          {actions}
        </div>
      </div>
    )}
    {children}
  </section>
);

export default Panel;
