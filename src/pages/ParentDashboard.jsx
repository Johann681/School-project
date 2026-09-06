import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, CheckCircle2, FileText, HeartHandshake, RefreshCcw, ShieldCheck, TrendingUp, TriangleAlert } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("children");
  const [childrenResults, setChildrenResults] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [childTimetable, setChildTimetable] = useState([]);

  const authSession = useMemo(() => JSON.parse(localStorage.getItem("lmsAuth") || "null"), []);
  const parentName = authSession?.fullName || authSession?.name || authSession?.email || "Parent";
  const token = authSession?.token;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const [childrenRes, announcementRes] = await Promise.all([
        api.get("/parent/children/results"),
        api.get("/parent/announcements"),
      ]);

      setChildrenResults(childrenRes.data.children || []);
      setSelectedChildId((current) => current || childrenRes.data.children?.[0]?.studentId || "");
      setAnnouncements(announcementRes.data.announcements || []);
    } catch (err) {
      console.error(err);
      showStatus("error", "Unable to load parent portal content yet.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs = [
    { id: "children", label: "Children Results", count: childrenResults.length },
    { id: "announcements", label: "Announcements", count: announcements.length },
  ];
  const selectedChild = childrenResults.find((child) => child.studentId === selectedChildId) || childrenResults[0];
  const selectedAttendance = selectedChild?.attendance || [];
  const attendanceRecords = selectedAttendance.flatMap((entry) => entry.records || []);
  const attendancePresent = attendanceRecords.filter((record) => record.status === "PRESENT").length;
  const attendanceRate = attendanceRecords.length ? Math.round((attendancePresent / attendanceRecords.length) * 100) : null;
  const selectedSubmissions = selectedChild?.submissions || [];
  const pendingSubmissions = selectedSubmissions.filter((submission) => submission.status !== "GRADED" && submission.status !== "RELEASED").length;
  const selectedAbsences = attendanceRecords.filter((record) => record.status === "ABSENT").length;
  const alertCount = childrenResults.reduce((total, child) => total + (child.submissions || []).filter((submission) => submission.status !== "GRADED" && submission.status !== "RELEASED").length, 0) + childrenResults.reduce((total, child) => total + (child.attendance || []).flatMap((entry) => entry.records || []).filter((record) => record.status === "ABSENT").length, 0);

  const loadChildTimetable = async () => {
    if (!selectedChild) return;
    const response = await api.get(`/parent/timetable/${selectedChild.studentId}`);
    setChildTimetable(response.data.timetable || []);
  };

  return (
    <DashboardLayout
      role="Parent Portal"
      title={`Welcome, ${parentName}`}
      subtitle="Review your linked children’s progress and school announcements from one place."
      userName={parentName}
      notifications={[...childrenResults.flatMap((child) => (child.publishedResults || []).slice(0, 3).map((result) => ({ id: `${child.studentId}-${result._id}`, title: "New result published", message: `${result.title} is available for ${child.studentName}.` }))), ...childrenResults.flatMap((child) => (child.submissions || []).filter((submission) => !["GRADED", "RELEASED"].includes(submission.status)).map((submission) => ({ id: `${child.studentId}-${submission._id}`, title: `${child.studentName} has submitted work`, message: submission.assignmentTitle || "An assignment is awaiting teacher review." })) )].slice(0, 9)}
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        navigate("/login");
      }}
      stats={[
        { label: "Children linked", value: childrenResults.length || 0, icon: HeartHandshake },
        { label: "Recent updates", value: announcements.length || 0, icon: Bell },
        { label: "Active alerts", value: alertCount, icon: alertCount ? TriangleAlert : ShieldCheck },
        { label: "Refreshed", value: isLoading ? "Loading..." : "Live", icon: RefreshCcw },
      ]}
      actions={
        <button type="button" onClick={fetchData} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      <div className="mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "children" && selectedChild && <div className="mb-6 grid gap-4 md:grid-cols-3"><Panel title="Attendance" description="Based on the latest recorded sessions."><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-emerald-600" /><p className="text-3xl font-bold text-slate-900">{attendanceRate === null ? "—" : `${attendanceRate}%`}</p></div><p className="mt-2 text-sm text-slate-500">{attendanceRecords.length ? `${attendancePresent} of ${attendanceRecords.length} sessions present.` : "No attendance records yet."}</p></Panel><Panel title="Assignment progress" description={`Recent work for ${selectedChild.studentName}.`}><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-indigo-600" /><p className="text-3xl font-bold text-slate-900">{selectedSubmissions.length}</p></div><p className="mt-2 text-sm text-slate-500">{pendingSubmissions ? `${pendingSubmissions} awaiting teacher review.` : "No submissions awaiting review."}</p></Panel><Panel title="Latest performance" description="Your child’s recent academic result."><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-amber-600" /><p className="text-3xl font-bold text-slate-900">{selectedChild.latestGrade ?? "—"}{selectedChild.latestGrade !== null && selectedChild.latestGrade !== undefined ? "/100" : ""}</p></div><p className="mt-2 text-sm text-slate-500">{selectedChild.summary || "No graded work published yet."}</p></Panel></div>}

      {activeTab === "children" && selectedChild && (pendingSubmissions > 0 || selectedAbsences > 0) && <Panel title="Needs attention" description="Recent items that may need a parent’s attention." className="mb-6"><div className="grid gap-2 sm:grid-cols-2">{pendingSubmissions > 0 && <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900"><FileText className="h-5 w-5 shrink-0" /><span>{selectedChild.studentName} has {pendingSubmissions} submitted assignment{pendingSubmissions === 1 ? "" : "s"} awaiting review.</span></div>}{selectedAbsences > 0 && <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><TriangleAlert className="h-5 w-5 shrink-0" /><span>{selectedChild.studentName} has {selectedAbsences} recent absence record{selectedAbsences === 1 ? "" : "s"} to review.</span></div>}</div></Panel>}

      {activeTab === "children" ? (
        <Panel title="Children Performance" description="A quick view of your linked learners and their latest graded results.">
          {childrenResults.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No child results available"
              description="Once your children are linked and graded, their performance data will appear here."
            />
          ) : (
            <div className="space-y-4">
              {childrenResults.length > 1 && <select className="dash-input" value={selectedChild?.studentId || ""} onChange={(event) => { setSelectedChildId(event.target.value); setChildTimetable([]); }} aria-label="Select child">
                {childrenResults.map((child) => <option key={child.studentId} value={child.studentId}>{child.studentName}</option>)}
              </select>}
              {[selectedChild].filter(Boolean).map((child) => (
                <div key={child.studentId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{child.studentName}</p>
                      <p className="text-sm text-slate-500">{child.studentClass || "Class not assigned"}{child.academicSession ? ` · ${child.academicSession}` : ""}</p>
                    </div>
                    <Badge variant="info">{child.latestGrade ?? "No grade yet"}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{child.summary || "No recent grades have been published."}</p>
                  {child.publishedResults?.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">Published reports</p><button type="button" onClick={() => window.print()} className="dash-btn-secondary"><FileText className="h-4 w-4" /> Print / Save PDF</button></div><div className="grid gap-3 sm:grid-cols-2">{child.publishedResults.map((result) => <article key={result._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-slate-900">{result.title}</p><p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{result.resultType?.replace("_", " ")} · {result.term?.replace("_", " ")}</p></div><Badge variant="success">Published</Badge></div>{result.session && <p className="mt-2 text-xs text-slate-500">Session: {result.session}</p>}{result.reportText && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{result.reportText}</p>}{result.imageUrl && <img src={result.imageUrl} alt={`${result.title} report`} className="mt-3 max-h-64 w-full rounded-lg border border-slate-200 object-contain" />}</article>)}</div></div>}
                  {child.performance?.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{child.performance.slice(0, 4).map((record) => <div key={record._id} className="rounded-lg bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-800">{record.assignmentTitle}</p><Badge variant={record.score >= 50 ? "success" : "danger"}>{record.score}/100</Badge></div><p className="mt-1 text-xs text-slate-500">{record.courseId?.title || "Course"} · {new Date(record.gradedAt).toLocaleDateString()}</p></div>)}</div>}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-slate-800">Assignment submissions</p>
                    <p className="mt-1 text-sm text-slate-600">{child.submissions?.length || 0} submitted assignments in recent activity.</p>
                  </div>
                  <button type="button" onClick={loadChildTimetable} className="dash-btn-secondary mt-4"><CalendarDays className="h-4 w-4" /> Load timetable</button>
                  {childTimetable.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{childTimetable.map((slot) => <div key={slot._id} className="rounded-lg bg-slate-50 p-3 text-sm"><strong>{slot.subjectAssignment?.subject?.name || "Free Period"}</strong><span className="block text-slate-600">{slot.day}, Period {slot.period} · {slot.startTime} - {slot.endTime}</span></div>)}</div>}
                </div>
              ))}
            </div>
          )}
        </Panel>
      ) : (
        <Panel title="School Announcements" description="Important news and updates published by the school.">
          {announcements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No announcements yet"
              description="Announcements will appear here once the school publishes them."
            />
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement._id || announcement.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-1">{announcement.publishedAt || "Today"}</p>
                    </div>
                    <Badge>{announcement.type || "Update"}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{announcement.message}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <Toast type={status.type} message={status.message} />
    </DashboardLayout>
  );
};

export default ParentDashboard;
