import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Bell, BookOpen, CalendarDays, ClipboardCheck, FileText, LayoutDashboard, LogOut, Moon, Settings, Sun, Users, X } from "lucide-react";
import api from "../../api/axiosClient";

const DashboardLayout = ({
  role,
  title,
  subtitle,
  userName,
  onLogout,
  navigationRole,
  stats = [],
  children,
  actions,
  statsClassName = "sm:grid-cols-2 lg:grid-cols-4",
  compactHeader = false,
  notifications = [],
  workspaceNav = [],
}) => {
  const [academicPeriod, setAcademicPeriod] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dashboardTheme") === "dark");

  useEffect(() => {
    localStorage.setItem("dashboardTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    let active = true;
    api.get("/settings/academic-period")
      .then((response) => { if (active) setAcademicPeriod(response.data.period); })
      .catch(() => { if (active) setAcademicPeriod(null); });
    return () => { active = false; };
  }, []);
  const navigationByRole = {
    Administration: [
      { label: "Home", path: "/admin", icon: LayoutDashboard },
      { label: "Audit logs", path: "/admin/audit", icon: FileText },
    ],
    "Teacher Portal": [
      { label: "Home", path: "/teacher", icon: LayoutDashboard },
      { label: "My timetable", path: "/teacher-timetable", icon: CalendarDays },
      { label: "Attendance", path: "/teacher-attendance", icon: ClipboardCheck },
    ],
    "Student Portal": [
      { label: "Home", path: "/student", icon: LayoutDashboard },
      { label: "Timetable", path: "/student-timetable", icon: CalendarDays },
    ],
    "Parent Portal": [
      { label: "Home", path: "/parent", icon: LayoutDashboard },
    ],
  };
  const navigation = navigationByRole[navigationRole || role] || [];
  return (
    <div className={`dashboard-shell min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 ${darkMode ? "dashboard-dark" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className={`${compactHeader ? "mb-5 p-4 sm:mb-8 sm:p-6" : "mb-8 p-6"} rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{role}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
              {userName && (
                <p className={`${compactHeader ? "hidden sm:block" : ""} mt-3 text-sm font-medium text-slate-500`}>
                  Signed in as <span className="text-slate-800">{userName}</span>
                </p>
              )}
              {academicPeriod && (
                <span className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {academicPeriod.academicSession} · {academicPeriod.term.replace("_", " ")}
                </span>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => setDarkMode((value) => !value)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
              <div className="relative">
                <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50" aria-label="Open notifications" aria-expanded={notificationsOpen}><Bell className="h-5 w-5" />{notifications.length > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{notifications.length > 9 ? "9+" : notifications.length}</span>}</button>
                {notificationsOpen && <div className="absolute right-0 top-14 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl"><div className="mb-3 flex items-center justify-between"><p className="font-bold text-slate-900">Notifications</p><button type="button" onClick={() => setNotificationsOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close notifications"><X className="h-4 w-4" /></button></div>{notifications.length ? <div className="space-y-2">{notifications.map((notification, index) => <div key={notification.id || index} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-800">{notification.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{notification.message}</p></div>)}</div> : <p className="py-4 text-sm text-slate-500">You are all caught up.</p>}</div>}
              </div>
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
            <div className={`${compactHeader ? "mt-4 sm:mt-6" : "mt-6"} grid gap-3 ${statsClassName}`}>
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

        {navigation.length > 0 && (
          <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm lg:hidden" aria-label="Mobile dashboard navigation">
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/admin" || path === "/teacher" || path === "/student" || path === "/parent"}
                className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {workspaceNav.length > 0 && (
          <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm lg:hidden" aria-label="Mobile workspace sections">
            {workspaceNav.map(({ id, label, icon: Icon, active, onClick }) => <button key={id} type="button" onClick={onClick} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="h-4 w-4" />{label}</button>)}
          </nav>
        )}

        <div className={navigation.length > 0 ? "grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]" : ""}>
          {navigation.length > 0 && (
            <aside className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm lg:sticky lg:top-6 lg:block">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
              <nav className="space-y-1" aria-label="Dashboard navigation">
                {navigation.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === "/admin" || path === "/teacher" || path === "/student" || path === "/parent"}
                    className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              {workspaceNav.length > 0 && <><p className="mt-5 px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">This workspace</p><nav className="space-y-1" aria-label="Workspace sections">{workspaceNav.map(({ id, label, icon: Icon, active, onClick }) => <button key={id} type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></>}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="flex items-center gap-2 px-3 text-xs font-medium text-slate-400"><Settings className="h-3.5 w-3.5" /> Account secured</p>
              </div>
            </aside>
          )}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
