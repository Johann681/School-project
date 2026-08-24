import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarDays, FileText, HeartHandshake, RefreshCcw, ShieldCheck } from "lucide-react";
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

  const fetchData = async () => {
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
      if (!selectedChildId && childrenRes.data.children?.[0]) setSelectedChildId(childrenRes.data.children[0].studentId);
      setAnnouncements(announcementRes.data.announcements || []);
    } catch (err) {
      console.error(err);
      showStatus("error", "Unable to load parent portal content yet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const tabs = [
    { id: "children", label: "Children Results", count: childrenResults.length },
    { id: "announcements", label: "Announcements", count: announcements.length },
  ];
  const selectedChild = childrenResults.find((child) => child.studentId === selectedChildId) || childrenResults[0];

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
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        navigate("/login");
      }}
      stats={[
        { label: "Children linked", value: childrenResults.length || 0, icon: HeartHandshake },
        { label: "Recent updates", value: announcements.length || 0, icon: Bell },
        { label: "Active alerts", value: "—", icon: ShieldCheck },
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
              {childrenResults.length > 1 && <select className="dash-input" value={selectedChild?.studentId || ""} onChange={(event) => setSelectedChildId(event.target.value)} aria-label="Select child">
                {childrenResults.map((child) => <option key={child.studentId} value={child.studentId}>{child.studentName}</option>)}
              </select>}
              {[selectedChild].filter(Boolean).map((child) => (
                <div key={child.studentId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{child.studentName}</p>
                      <p className="text-sm text-slate-500">Linked student ID: {child.studentId}</p>
                    </div>
                    <Badge variant="info">{child.latestGrade ?? "No grade yet"}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{child.summary || "No recent grades have been published."}</p>
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
