import { useEffect, useState } from "react";
import { CalendarDays, RefreshCcw } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import EmptyState from "../components/dashboard/EmptyState";

const TeacherTimetable = () => {
  const session = JSON.parse(localStorage.getItem("lmsAuth") || "null");
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchTimetable = async () => { setLoading(true); try { const response = await api.get("/teacher/timetable"); setTimetable(response.data.timetable || []); } finally { setLoading(false); } };
  useEffect(() => { fetchTimetable(); }, []);
  return <DashboardLayout role="Teacher Timetable" title="My Weekly Schedule" subtitle="Review your assigned classes and subjects." userName={session?.name || session?.email} onLogout={() => { localStorage.removeItem("lmsAuth"); window.location.href = "/login"; }} actions={<button type="button" onClick={fetchTimetable} className="dash-btn-secondary"><RefreshCcw className="h-4 w-4" /> Refresh</button>}>
    <Panel title="Assigned timetable" description={`${timetable.length} scheduled periods. Lunch break is 11:00 - 11:30.`}>
      {loading ? <div className="p-8 text-center text-slate-600">Loading timetable...</div> : !timetable.length ? <EmptyState icon={CalendarDays} title="No timetable published" description="Your assigned schedule will appear after the administrator generates it." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{timetable.map((slot) => <div key={slot._id} className="rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">{slot.subjectAssignment.subject.name}</p><p className="text-sm text-slate-600">{slot.class.name}</p><p className="mt-2 text-sm font-medium text-emerald-700">{slot.day}, Period {slot.period}</p><p className="mt-1 text-xs text-slate-500">{slot.startTime} - {slot.endTime}</p></div>)}</div>}
    </Panel>
  </DashboardLayout>;
};
export default TeacherTimetable;
