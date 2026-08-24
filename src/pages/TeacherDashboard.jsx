import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Plus, RefreshCcw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const session = useMemo(() => JSON.parse(localStorage.getItem("lmsAuth") || "null"), []);
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [view, setView] = useState("materials");
  const [material, setMaterial] = useState({ title: "", url: "" });
  const [assignment, setAssignment] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const selectedCourse = courses.find((course) => course._id === selectedId) || null;
  const teacherName = session?.name || session?.email || "Teacher";

  const loadCourses = useCallback(async () => {
    if (!session?.token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/teacher/courses");
      const nextCourses = response.data.courses || [];
      setCourses(nextCourses);
      setSelectedId((current) => current && nextCourses.some((course) => course._id === current) ? current : nextCourses[0]?._id || "");
    } catch (error) {
      setNotice({ type: "error", message: error.response?.data?.message || "Unable to load your courses." });
    } finally {
      setLoading(false);
    }
  }, [navigate, session?.token]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const notify = (message, type = "success") => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice({ type: "", message: "" }), 4000);
  };

  const refreshSelectedCourse = async () => {
    if (!selectedCourse) return;
    const response = await api.get(`/teacher/submissions/${selectedCourse._id}`);
    setCourses((current) => current.map((course) => course._id === selectedCourse._id ? response.data.course : course));
  };

  const addMaterial = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;
    setSaving(true);
    try {
      await api.post(`/teacher/drop-material/${selectedCourse._id}`, material);
      setMaterial({ title: "", url: "" });
      await refreshSelectedCourse();
      notify("Material added to the course.");
    } catch (error) { notify(error.response?.data?.message || "Unable to add material.", "error"); }
    finally { setSaving(false); }
  };

  const addAssignment = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;
    setSaving(true);
    try {
      await api.post(`/teacher/add-assignment/${selectedCourse._id}`, assignment);
      setAssignment({ title: "", description: "" });
      await refreshSelectedCourse();
      notify("Assignment added to the course.");
    } catch (error) { notify(error.response?.data?.message || "Unable to add assignment.", "error"); }
    finally { setSaving(false); }
  };

  const totalMaterials = courses.reduce((sum, course) => sum + (course.materials?.length || 0), 0);
  const totalAssignments = courses.reduce((sum, course) => sum + (course.assignments?.length || 0), 0);

  return <DashboardLayout role="Teacher Portal" title="Teaching workspace" subtitle="Select one of your courses, then add learning materials or assignments." userName={teacherName} onLogout={() => { localStorage.removeItem("lmsAuth"); navigate("/login"); }} stats={[{ label: "Assigned courses", value: courses.length, icon: BookOpen }, { label: "Materials", value: totalMaterials, icon: FileText }, { label: "Assignments", value: totalAssignments, icon: Users }]} actions={<button type="button" onClick={loadCourses} className="dash-btn-secondary"><RefreshCcw className="h-4 w-4" /> Refresh</button>}>
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><div><p className="text-sm font-semibold text-indigo-950">Teaching only</p><p className="mt-1 text-sm text-indigo-800">Course creation, enrollment decisions, grading, and school setup are managed elsewhere.</p></div><button type="button" onClick={() => navigate("/teacher-timetable")} className="dash-btn-secondary shrink-0"><CalendarDays className="h-4 w-4" /> Timetable</button></div>
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Panel title="Your courses" description="Choose a course to manage its learning content." badge={<Badge>{courses.length}</Badge>}>
        {loading ? <div className="p-6 text-center text-slate-500">Loading courses...</div> : courses.length === 0 ? <EmptyState icon={BookOpen} title="No courses assigned" description="Your administrator will assign courses here." /> : <div className="space-y-2">{courses.map((course) => <button key={course._id} type="button" onClick={() => setSelectedId(course._id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === course._id ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200" : "border-slate-200 hover:border-indigo-300"}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">{course.title}</span><span className="font-mono text-xs text-slate-500">{course.code}</span></div><p className="mt-2 text-xs text-slate-500">{course.materials?.length || 0} materials · {course.assignments?.length || 0} assignments</p></button>)}</div>}
      </Panel>
      <Panel title={selectedCourse ? selectedCourse.title : "Course workspace"} description={selectedCourse ? `Manage content for ${selectedCourse.code}.` : "Select a course from the list to begin."}>
        {!selectedCourse ? <EmptyState icon={BookOpen} title="Select a course" description="Only course materials and assignments can be managed here." /> : <><div className="mb-6 flex gap-2 border-b border-slate-200 pb-3"><button type="button" onClick={() => setView("materials")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "materials" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Materials</button><button type="button" onClick={() => setView("assignments")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "assignments" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Assignments</button></div>{view === "materials" ? <div className="space-y-5"><form onSubmit={addMaterial} className="space-y-3"><input className="dash-input" placeholder="Material title" value={material.title} onChange={(event) => setMaterial({ ...material, title: event.target.value })} required /><input className="dash-input" type="url" placeholder="Material URL" value={material.url} onChange={(event) => setMaterial({ ...material, url: event.target.value })} required /><button className="dash-btn-primary" disabled={saving}><Plus className="h-4 w-4" /> Add material</button></form><div className="space-y-2">{selectedCourse.materials?.length ? selectedCourse.materials.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{item.title}</p><a className="mt-1 block truncate text-sm text-indigo-600 hover:underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a></div>) : <p className="text-sm text-slate-500">No materials have been added.</p>}</div></div> : <div className="space-y-5"><form onSubmit={addAssignment} className="space-y-3"><input className="dash-input" placeholder="Assignment title" value={assignment.title} onChange={(event) => setAssignment({ ...assignment, title: event.target.value })} required /><textarea className="dash-input min-h-32" placeholder="Assignment instructions" value={assignment.description} onChange={(event) => setAssignment({ ...assignment, description: event.target.value })} required /><button className="dash-btn-primary" disabled={saving}><Plus className="h-4 w-4" /> Add assignment</button></form><div className="space-y-2">{selectedCourse.assignments?.length ? selectedCourse.assignments.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.description}</p></div>) : <p className="text-sm text-slate-500">No assignments have been added.</p>}</div></div>}</>}
      </Panel>
    </div>
    <Toast type={notice.type} message={notice.message} />
  </DashboardLayout>;
};

export default TeacherDashboard;
