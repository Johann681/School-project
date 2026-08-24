import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, LockKeyhole, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const TeacherAttendance = () => {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("lmsAuth") || "null");
  const [currentSession, setCurrentSession] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const loadSession = useCallback(async () => {
    if (!session?.token) { navigate("/login"); return; }
    setLoading(true);
    try {
      const response = await api.get("/attendance/current-session");
      setCurrentSession(response.data.active ? response.data.session : null);
      if (response.data.session?.students) setStatuses(Object.fromEntries(response.data.session.students.map((student) => [student._id, "PRESENT"])));
    } catch (error) { setNotice({ type: "error", message: error.response?.data?.message || "Unable to check the attendance window." }); }
    finally { setLoading(false); }
  }, [navigate, session?.token]);

  useEffect(() => { loadSession(); }, [loadSession]);

  const notify = (message, type = "success") => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice({ type: "", message: "" }), 4000);
  };

  const saveAttendance = async (event) => {
    event.preventDefault();
    if (!currentSession) return;
    setSaving(true);
    try {
      const { slot, course } = currentSession;
      await api.post("/attendance/record", {
        classId: slot.class._id,
        courseId: course._id,
        period: String(slot.period),
        academicSession: slot.academicSession,
        term: slot.term,
        records: currentSession.students.map((student) => ({ studentId: student._id, status: statuses[student._id] || "ABSENT" })),
      });
      notify("Attendance recorded for the registered course students.");
    } catch (error) { notify(error.response?.data?.message || "Unable to record attendance.", "error"); }
    finally { setSaving(false); }
  };

  const teacherName = session?.name || session?.email || "Teacher";
  const slot = currentSession?.slot;
  return <DashboardLayout role="Teacher Attendance" title="Mark attendance" subtitle="Attendance opens only during your scheduled timetable period and uses the administrator-approved course roster." userName={teacherName} onLogout={() => { localStorage.removeItem("lmsAuth"); navigate("/login"); }} actions={<button type="button" onClick={loadSession} className="dash-btn-secondary"><RefreshCcw className="h-4 w-4" /> Check current period</button>}>
    {loading ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Checking the timetable...</div> : !currentSession ? <Panel><EmptyState icon={LockKeyhole} title="Attendance is closed" description="Attendance becomes available only while you are inside a scheduled class period. It is also unavailable when no administrator-approved course roster exists." /></Panel> : <div className="space-y-6"><Panel title={`${currentSession.course.title} · ${slot.class.name}`} description={`${slot.day} · Period ${slot.period} · ${slot.startTime} - ${slot.endTime} · ${slot.academicSession} · ${slot.term.replace("_", " ")}`}><div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><CalendarClock className="h-5 w-5" /><span>Active attendance window. Students shown below are registered to this course by the administrator.</span></div></Panel><Panel title="Registered students" description={`${currentSession.students.length} students in the approved course roster.`}>{currentSession.students.length === 0 ? <EmptyState icon={CheckCircle2} title="No registered students" description="The administrator has not registered students for this course yet." /> : <form onSubmit={saveAttendance} className="space-y-3"><div className="overflow-x-auto"><table className="dash-table"><thead><tr><th>Student</th><th>Email</th><th>Status</th></tr></thead><tbody>{currentSession.students.map((student) => <tr key={student._id}><td className="font-semibold">{student.fullName}</td><td>{student.email}</td><td><select className="dash-input max-w-[150px]" value={statuses[student._id] || "ABSENT"} onChange={(event) => setStatuses({ ...statuses, [student._id]: event.target.value })}><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option></select></td></tr>)}</tbody></table></div><button className="dash-btn-primary" disabled={saving}><CheckCircle2 className="h-4 w-4" /> {saving ? "Saving..." : "Save attendance"}</button></form>}</Panel></div>}
    <Toast type={notice.type} message={notice.message} />
  </DashboardLayout>;
};
export default TeacherAttendance;
