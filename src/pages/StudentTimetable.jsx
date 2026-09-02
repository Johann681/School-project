import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, LayoutGrid, RefreshCcw } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const StudentTimetable = () => {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const authSession = useMemo(() => JSON.parse(localStorage.getItem("lmsAuth") || "null"), []);
  const studentName = authSession?.fullName || authSession?.name || authSession?.email || "Student";
  const token = authSession?.token;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const fetchTimetable = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/student/timetable");
      setTimetable(response.data.timetable || []);
    } catch (err) {
      console.error(err);
      showStatus("error", "Unable to load timetable at this time.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const scheduleSummary = useMemo(() => {
    if (!timetable.length) return "No timetable published yet.";
    return `Loaded ${timetable.length} scheduled periods across your classes.`;
  }, [timetable]);

  return (
    <DashboardLayout
      role="Student Timetable"
      navigationRole="Student Portal"
      title={`Your Weekly Schedule, ${studentName}`}
      subtitle="Check period assignments, teacher names, and room details for the current week."
      userName={studentName}
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        navigate("/login");
      }}
      stats={[
        { label: "Published slots", value: timetable.length || 0, icon: LayoutGrid },
        { label: "Next class", value: timetable[0]?.subject || "—", icon: Clock3 },
        { label: "Today", value: new Date().toLocaleDateString(), icon: CalendarDays },
      ]}
      actions={
        <button type="button" onClick={fetchTimetable} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      <Panel title="Weekly timetable" description={scheduleSummary}>
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading timetable…</div>
        ) : timetable.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Timetable not available"
            description="When the school publishes class schedules, they will appear here."
          />
        ) : (
          <div className="space-y-4">
            {timetable.map((entry, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{entry.subject}</p>
                    <p className="text-sm text-slate-500">{entry.className} · {entry.room || "Room TBD"}</p>
                  </div>
                  <Badge>{entry.day} · {entry.period} · {entry.startTime || "08:00"} - {entry.endTime || "08:45"}</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-600">Teacher: {entry.teacherName || "TBD"}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Toast type={status.type} message={status.message} />
    </DashboardLayout>
  );
};

export default StudentTimetable;
