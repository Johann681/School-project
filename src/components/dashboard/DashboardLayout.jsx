import { LogOut } from "lucide-react";

const DashboardLayout = ({
  role,
  title,
  subtitle,
  userName,
  onLogout,
  stats = [],
  children,
  actions,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{role}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
              {userName && (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Signed in as <span className="text-slate-800">{userName}</span>
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {actions}
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          {stats.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                    {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </header>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
