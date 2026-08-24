import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Search, ShieldCheck, RefreshCcw, FilterX, ChevronDown } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const AdminAuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const authSession = JSON.parse(localStorage.getItem("lmsAuth") || "null");
  const adminName = authSession?.fullName || authSession?.name || authSession?.email || "Administrator";
  const token = authSession?.token;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const loadLogs = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/admin/audit-logs", {
        params: {
          role: roleFilter || undefined,
          userID: userIdFilter || undefined,
          action: actionFilter || undefined,
        },
      });

      setLogs(response.data.logs || []);
    } catch (err) {
      console.error(err);
      showStatus("error", "Unable to load audit logs right now.");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, navigate, roleFilter, token, userIdFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const clearFilters = () => {
    setRoleFilter("");
    setUserIdFilter("");
    setActionFilter("");
    setLogs([]);
  };

  const formatAction = (action) => action.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  const actor = (log) => typeof log.actorId === "object" ? log.actorId : null;
  const detailEntries = (details) => Object.entries(details || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const activeFilters = [roleFilter && `Role: ${roleFilter}`, actionFilter && `Action: ${actionFilter}`, userIdFilter && "Actor ID"].filter(Boolean);

  return (
    <DashboardLayout
      role="Audit Oversight"
      title={`Audit Logs for ${adminName}`}
      subtitle="Monitor write actions across the system and filter by user or role."
      userName={adminName}
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        navigate("/login");
      }}
      stats={[
        { label: "Entries", value: logs.length || 0, icon: ListChecks },
        { label: "Filtered role", value: roleFilter || "All", icon: ShieldCheck },
        { label: "Scan status", value: loading ? "Refreshing…" : "Ready", icon: RefreshCcw },
      ]}
      statsClassName="grid-cols-3 lg:grid-cols-3"
      compactHeader
      actions={
        <button type="button" onClick={loadLogs} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      <Panel title="Activity history" description="Review who changed the system, what changed, and when.">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700">
            Role filter
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none"
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Action contains
            <input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="e.g. create or delete"
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Actor ID
            <input value={userIdFilter} onChange={(e) => setUserIdFilter(e.target.value)} placeholder="Optional user id" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={loadLogs} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"><Search className="h-4 w-4" /> Apply filters</button>
          <button onClick={clearFilters} className="dash-btn-secondary"><FilterX className="h-4 w-4" /> Clear filters</button>
          {activeFilters.length > 0 && <span className="text-xs text-slate-500">{activeFilters.join(" · ")}</span>}
        </div>
      </Panel>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading audit logs…</div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No audit entries found"
          description="Actions will appear here once the system begins writing audit logs." 
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><ShieldCheck className="h-5 w-5" /></div>
                  <div className="min-w-0"><h3 className="text-base font-bold text-slate-900">{formatAction(log.action)}</h3><p className="mt-1 text-sm text-slate-600"><strong>{actor(log)?.fullName || "Unknown actor"}</strong><span className="mx-1 text-slate-400">·</span>{actor(log)?.email || log.actorId}</p></div>
                </div>
                <div className="shrink-0 text-left sm:text-right"><p className="text-sm font-medium text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</p><p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><Badge>{log.role}</Badge><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{log.method}</span><span className="max-w-full truncate font-mono text-xs text-slate-500" title={log.endpoint}>{log.endpoint}</span></div>
              <details className="group mt-3"><summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"><ChevronDown className="h-4 w-4 transition group-open:rotate-180" /> View change details</summary><div className="mt-3 flex flex-wrap gap-1.5">{detailEntries(log.details).length ? detailEntries(log.details).map(([key, value]) => <span key={key} className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-800"><strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}</span>) : <span className="text-xs text-slate-400">No extra details recorded.</span>}</div></details>
            </article>
          ))}
        </div>
      )}

      <Toast type={status.type} message={status.message} />
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
