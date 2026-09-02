import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const blankObjective = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  marks: 1,
});
const blankTheory = () => ({ questionText: "", marks: 5 });

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const session = useMemo(
    () => JSON.parse(localStorage.getItem("lmsAuth") || "null"),
    [],
  );
  const [courses, setCourses] = useState([]),
    [selectedId, setSelectedId] = useState(""),
    [view, setView] = useState("materials"),
    [tab, setTab] = useState("objective"),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [notice, setNotice] = useState({ type: "", message: "" });
  const [material, setMaterial] = useState({ title: "", url: "" });
  const [structuredSubmissions, setStructuredSubmissions] = useState([]);
  const [submissionSummary, setSubmissionSummary] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [theoryScore, setTheoryScore] = useState("");
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    objectiveQuestions: [],
    theoryQuestions: [],
  });
  const [editingAssignmentId, setEditingAssignmentId] = useState("");
  const selected = courses.find((course) => course._id === selectedId);
  const total = [...form.objectiveQuestions, ...form.theoryQuestions].reduce(
    (sum, q) => sum + (Number(q.marks) || 0),
    0,
  );
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/teacher/courses");
      setCourses(data.courses || []);
      const summaries = await Promise.all((data.courses || []).map(async (course) => {
        try {
          const response = await api.get(`/teacher/submissions/${course._id}`);
          const submissions = response.data.structuredSubmissions || [];
          return { courseId: course._id, pending: submissions.filter((submission) => submission.status !== "GRADED").length, submissions: submissions.map((submission) => ({ ...submission, courseId: course._id, courseTitle: course.title })) };
        } catch {
          return { courseId: course._id, pending: 0, submissions: [] };
        }
      }));
      setSubmissionSummary(summaries);
      setRecentSubmissions(summaries.flatMap((summary) => summary.submissions).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      setSelectedId((id) =>
        id && data.courses.some((c) => c._id === id)
          ? id
          : data.courses[0]?._id || "",
      );
    } catch (e) {
      setNotice({
        type: "error",
        message: e.response?.data?.message || "Unable to load courses.",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!session?.token) navigate("/login");
    else load();
  }, [load, navigate, session?.token]);
  const loadStructuredSubmissions = useCallback(async () => {
    if (!selectedId) {
      setStructuredSubmissions([]);
      return;
    }
    try {
      const { data } = await api.get(`/teacher/submissions/${selectedId}`);
      setStructuredSubmissions(data.structuredSubmissions || []);
      setSelectedSubmissionId((current) =>
        current &&
        data.structuredSubmissions?.some(
          (submission) => submission._id === current,
        )
          ? current
          : data.structuredSubmissions?.[0]?._id || "",
      );
    } catch {
      setStructuredSubmissions([]);
    }
  }, [selectedId]);
  useEffect(() => {
    loadStructuredSubmissions();
  }, [loadStructuredSubmissions]);
  const alert = (message, type = "success") => {
    setNotice({ type, message });
    setTimeout(() => setNotice({ type: "", message: "" }), 4000);
  };
  const updateObjective = (i, patch) =>
    setForm((f) => ({
      ...f,
      objectiveQuestions: f.objectiveQuestions.map((q, x) =>
        x === i ? { ...q, ...patch } : q,
      ),
    }));
  const updateTheory = (i, patch) =>
    setForm((f) => ({
      ...f,
      theoryQuestions: f.theoryQuestions.map((q, x) =>
        x === i ? { ...q, ...patch } : q,
      ),
    }));
  const publish = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAssignmentId) await api.patch(`/teacher/assignments/${editingAssignmentId}`, form);
      else await api.post(`/teacher/assignments/${selectedId}`, form);
      setForm({
        title: "",
        dueDate: "",
        objectiveQuestions: [],
        theoryQuestions: [],
      });
      await load();
      await loadStructuredSubmissions();
      alert(editingAssignmentId ? "Assignment updated." : "Structured assignment published.");
      setEditingAssignmentId("");
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to publish assignment.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  const editAssignment = (assignment) => {
    setEditingAssignmentId(assignment._id);
    setForm({ title: assignment.title, dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : "", objectiveQuestions: assignment.objectiveQuestions || [], theoryQuestions: assignment.theoryQuestions || [] });
    setTab(assignment.objectiveQuestions?.length ? "objective" : "theory");
    setView("assignments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addMaterial = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/teacher/drop-material/${selectedId}`, material);
      setMaterial({ title: "", url: "" });
      await load();
      alert("Material added.");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add material.", "error");
    } finally {
      setSaving(false);
    }
  };
  const assignmentCount = courses.reduce(
    (sum, c) =>
      sum +
      (c.assignments?.length || 0) +
      (c.structuredAssignments?.length || 0),
    0,
  );
  const pendingReviews = submissionSummary.reduce((sum, summary) => sum + summary.pending, 0);
  const coursesWithoutAssignments = courses.filter((course) => !course.structuredAssignments?.length);
  const today = new Date().toISOString().slice(0, 10);
  const assignmentTitles = Object.fromEntries(
    (selected?.structuredAssignments || []).map((assignment) => [
      String(assignment._id),
      assignment.title,
    ]),
  );
  const selectedSubmission = structuredSubmissions.find(
    (submission) => submission._id === selectedSubmissionId,
  );
  const visibleSubmissions = useMemo(() => structuredSubmissions
    .filter((submission) => submissionFilter === "all" || (submissionFilter === "review" ? submission.status === "SUBMITTED" : submission.status !== "SUBMITTED"))
    .filter((submission) => assignmentFilter === "all" || String(submission.assignment) === assignmentFilter)
    .sort((first, second) => Number(second.status === "SUBMITTED") - Number(first.status === "SUBMITTED") || new Date(second.createdAt) - new Date(first.createdAt)), [assignmentFilter, structuredSubmissions, submissionFilter]);
  const selectedSubmissionAssignment = (
    selected?.structuredAssignments || []
  ).find(
    (assignment) =>
      String(assignment._id) === String(selectedSubmission?.assignment),
  );
  const selectedAnswers = Object.fromEntries(
    (selectedSubmission?.objectiveAnswers || []).map((answer) => [
      answer.questionIndex,
      answer.selectedOptionIndex,
    ]),
  );
  const maximumTheoryScore = (
    selectedSubmissionAssignment?.theoryQuestions || []
  ).reduce((sum, question) => sum + question.marks, 0);
  const releaseObjectiveScore = async () => {
    if (!selectedSubmission) return;
    setSaving(true);
    try {
      const { data } = await api.post(
        `/teacher/release-structured-submission/${selectedSubmission._id}`,
      );
      alert(data.message);
      await loadStructuredSubmissions();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to release score.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  const gradeTheory = async () => {
    if (!selectedSubmission) return;
    setSaving(true);
    try {
      await api.post(
        `/teacher/grade-structured-submission/${selectedSubmission._id}`,
        { theoryScore: Number(theoryScore) },
      );
      alert("Theory score saved and released.");
      setTheoryScore("");
      await loadStructuredSubmissions();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to save theory score.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <DashboardLayout
      role="Teacher Portal"
      title="Teaching workspace"
      subtitle="Create professional CBT and theory assignments for your assigned courses."
      userName={session?.name || session?.email || "Teacher"}
      notifications={recentSubmissions.filter((submission) => submission.status !== "GRADED").map((submission) => ({ id: submission._id, title: `${submission.student?.fullName || "Student"} submitted work`, message: `${submission.assignmentTitle || "Assignment"} · ${submission.courseTitle || "Course"}` }))}
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        navigate("/login");
      }}
      stats={[
        { label: "Assigned courses", value: courses.length, icon: BookOpen },
        {
          label: "Materials",
          value: courses.reduce((s, c) => s + (c.materials?.length || 0), 0),
          icon: FileText,
        },
        { label: "Assignments", value: assignmentCount, icon: Users },
      ]}
      actions={
        <button type="button" onClick={load} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-indigo-950">
            Welcome back, {session?.name || "Teacher"}
          </p>
          <p className="mt-1 text-sm text-indigo-800">
            {pendingReviews ? `${pendingReviews} student ${pendingReviews === 1 ? "attempt is" : "attempts are"} waiting for your review.` : "Your teaching workspace is ready for today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
          <button type="button" onClick={() => navigate("/teacher-timetable")} className="dash-btn-secondary"><CalendarDays className="h-4 w-4" /> Timetable</button>
        </div>
      </div>
      <Panel title="Needs attention" description="Your next teaching actions across all assigned courses." className="mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => { const courseId = submissionSummary.find((summary) => summary.pending > 0)?.courseId || courses[0]?._id; if (courseId) { setSelectedId(courseId); setView("assignments"); } }} className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50">
            <p className="text-2xl font-bold text-slate-900">{pendingReviews}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Attempts to review</p>
            <p className="mt-1 text-xs text-slate-500">Open the grading queue</p>
          </button>
          <button type="button" onClick={() => { if (courses[0]?._id) { setSelectedId(coursesWithoutAssignments[0]?._id || courses[0]._id); setView("assignments"); } }} className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50">
            <p className="text-2xl font-bold text-slate-900">{coursesWithoutAssignments.length}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Courses without assignments</p>
            <p className="mt-1 text-xs text-slate-500">Publish a first assessment</p>
          </button>
          <button type="button" onClick={() => navigate("/teacher-attendance")} className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50">
            <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Attendance</p>
            <p className="mt-1 text-xs text-slate-500">Check today&apos;s teaching schedule</p>
          </button>
        </div>
        {recentSubmissions.length > 0 && <div className="mt-5 border-t border-slate-200 pt-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Recent student submissions</p><span className="text-xs text-slate-500">Latest 5</span></div><div className="grid gap-2 md:grid-cols-2">{recentSubmissions.map((submission) => <button key={submission._id} type="button" onClick={() => { setSelectedId(submission.courseId); setView("assignments"); }} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-indigo-300 hover:bg-indigo-50"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{submission.student?.fullName || "Student"}</span><span className="block truncate text-xs text-slate-500">{submission.assignment?.title || submission.assignmentTitle || "Assignment"} · {submission.courseTitle}</span></span><Badge variant={submission.status === "GRADED" ? "success" : "warning"}>{submission.status === "GRADED" ? "Graded" : "Review"}</Badge></button>)}</div></div>}
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <Panel
          title="Your courses"
          description="Choose a subject."
          badge={<Badge>{courses.length}</Badge>}
        >
          {loading ? (
            <p className="p-4 text-slate-500">Loading…</p>
          ) : !courses.length ? (
            <EmptyState
              icon={BookOpen}
              title="No courses assigned"
              description="Your administrator will assign courses here."
            />
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <button
                  type="button"
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full rounded-xl border p-4 text-left ${c._id === selectedId ? "border-indigo-400 bg-indigo-50" : "border-slate-200"}`}
                >
                  <p className="font-semibold">{c.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {c.code} · {c.structuredAssignments?.length || 0} published
                  </p>
                </button>
              ))}
            </div>
          )}
        </Panel>
        <Panel
          title={selected?.title || "Course workspace"}
          description={
            selected
              ? "Materials and structured assessments."
              : "Select a course to begin."
          }
        >
          {!selected ? (
            <EmptyState
              icon={BookOpen}
              title="Select a course"
              description="Choose a course from the list."
            />
          ) : (
            <>
              <div className="mb-5 flex gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setView("materials")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "materials" ? "bg-indigo-600 text-white" : "text-slate-600"}`}
                >
                  Materials
                </button>
                <button
                  type="button"
                  onClick={() => setView("assignments")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "assignments" ? "bg-indigo-600 text-white" : "text-slate-600"}`}
                >
                  Assignments
                </button>
              </div>
              {view === "materials" ? (
                <form onSubmit={addMaterial} className="space-y-3">
                  <input
                    className="dash-input"
                    placeholder="Material title"
                    value={material.title}
                    onChange={(e) =>
                      setMaterial({ ...material, title: e.target.value })
                    }
                    required
                  />
                  <input
                    className="dash-input"
                    type="url"
                    placeholder="Material URL"
                    value={material.url}
                    onChange={(e) =>
                      setMaterial({ ...material, url: e.target.value })
                    }
                    required
                  />
                  <button disabled={saving} className="dash-btn-primary">
                    <Plus className="h-4 w-4" /> Add material
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  {(selected.structuredAssignments || []).length > 0 && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Published assignments</p><span className="text-xs text-slate-500">{selected.structuredAssignments.length} total</span></div><div className="space-y-2">{selected.structuredAssignments.map((assignment) => <div key={assignment._id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">{assignment.totalMarks} marks · {assignment.dueDate ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}` : "No due date"}</p></div><button type="button" onClick={() => editAssignment(assignment)} className="dash-btn-secondary self-start sm:self-auto"><Pencil className="h-4 w-4" /> Edit</button></div>)}</div></div>}
                <form onSubmit={publish} className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{editingAssignmentId ? "Edit assignment" : "New assignment"}</p>
                    <p className="mt-1 text-xs text-slate-500">Choose how students will answer and how their work will be marked.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="dash-input sm:col-span-2"
                      placeholder="Assignment title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                    />
                    <input
                      className="dash-input"
                      type="date"
                      min={editingAssignmentId ? undefined : today}
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                    <p className="text-xs text-slate-500 sm:col-span-3">After this date and time, student submissions will be closed automatically.</p>
                    <p className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-semibold text-indigo-900">
                      Total marks: {total}
                    </p>
                  </div>
                  <div className="flex gap-2 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTab("objective")}
                      className={`px-3 py-2 text-sm font-semibold ${tab === "objective" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-slate-500"}`}
                    >
                      Objective · auto-marked ({form.objectiveQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("theory")}
                      className={`px-3 py-2 text-sm font-semibold ${tab === "theory" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-slate-500"}`}
                    >
                      Theory · manual marking ({form.theoryQuestions.length})
                    </button>
                  </div>
                  {tab === "objective" ? (
                    <div className="space-y-4">
                      {form.objectiveQuestions.map((q, i) => (
                        <div
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          key={i}
                        >
                          <div className="mb-3 flex gap-3">
                            <div className="flex-1">
                              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                                Question {i + 1}
                              </label>
                              <textarea
                                className="dash-input"
                                rows="2"
                                placeholder="Type the question here"
                                value={q.questionText}
                                onChange={(e) =>
                                  updateObjective(i, {
                                    questionText: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  objectiveQuestions:
                                    f.objectiveQuestions.filter(
                                      (_, x) => x !== i,
                                    ),
                                }))
                              }
                              className="text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mb-2 text-sm font-medium text-slate-600">
                            Enter the four options, then select the correct
                            answer.
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {q.options.map((option, oi) => (
                              <label
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 bg-white p-3 text-sm transition ${q.correctOptionIndex === oi ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-indigo-300"}`}
                                key={oi}
                              >
                                <input
                                  type="radio"
                                  name={`correct-${i}`}
                                  checked={q.correctOptionIndex === oi}
                                  onChange={() =>
                                    updateObjective(i, {
                                      correctOptionIndex: oi,
                                    })
                                  }
                                />
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${q.correctOptionIndex === oi ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                  {"ABCD"[oi]}
                                </span>
                                <input
                                  className="min-w-0 flex-1 outline-none"
                                  placeholder={`Option ${"ABCD"[oi]}`}
                                  value={option}
                                  onChange={(e) => {
                                    const options = [...q.options];
                                    options[oi] = e.target.value;
                                    updateObjective(i, { options });
                                  }}
                                  required
                                />
                              </label>
                            ))}
                          </div>
                          <label className="mt-4 block w-40 text-sm font-semibold text-slate-700">
                            Marks for this question
                            <input
                              className="dash-input mt-1.5"
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="e.g. 5"
                              value={q.marks}
                              onChange={(e) =>
                                updateObjective(i, { marks: e.target.value })
                              }
                              required
                            />
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            objectiveQuestions: [
                              ...f.objectiveQuestions,
                              blankObjective(),
                            ],
                          }))
                        }
                        className="dash-btn-secondary"
                      >
                        <Plus className="h-4 w-4" /> Add question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.theoryQuestions.map((q, i) => (
                        <div
                          className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                          key={i}
                        >
                          <textarea
                            className="dash-input flex-1"
                            rows="3"
                            placeholder={`Theory question ${i + 1}`}
                            value={q.questionText}
                            onChange={(e) =>
                              updateTheory(i, { questionText: e.target.value })
                            }
                            required
                          />
                          <input
                            className="dash-input w-24"
                            type="number"
                            min="0"
                            step="0.5"
                            value={q.marks}
                            onChange={(e) =>
                              updateTheory(i, { marks: e.target.value })
                            }
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                theoryQuestions: f.theoryQuestions.filter(
                                  (_, x) => x !== i,
                                ),
                              }))
                            }
                            className="text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            theoryQuestions: [
                              ...f.theoryQuestions,
                              blankTheory(),
                            ],
                          }))
                        }
                        className="dash-btn-secondary"
                      >
                        <Plus className="h-4 w-4" /> Add theory question
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3"><button disabled={saving} className="dash-btn-primary">{saving ? "Saving…" : editingAssignmentId ? "Save assignment changes" : "Publish assignment"}</button>{editingAssignmentId && <button type="button" disabled={saving} onClick={() => { setEditingAssignmentId(""); setForm({ title: "", dueDate: "", objectiveQuestions: [], theoryQuestions: [] }); }} className="dash-btn-secondary">Cancel edit</button>}</div>
                </form>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>
      {selected && (
        <Panel
          title="CBT submissions"
          description="Objective questions are scored automatically as soon as a student submits."
          badge={
            <Badge variant="info">
              {visibleSubmissions.length} shown · {structuredSubmissions.filter((submission) => submission.status === "SUBMITTED").length} to review
            </Badge>
          }
        >
          {structuredSubmissions.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No CBT submissions yet"
              description="Submitted student attempts for this course will appear here."
            />
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Status<select className="dash-input mt-1.5" value={submissionFilter} onChange={(event) => setSubmissionFilter(event.target.value)}><option value="all">All submissions</option><option value="review">Awaiting review</option><option value="graded">Released or graded</option></select></label><label className="text-sm font-semibold text-slate-700">Assignment<select className="dash-input mt-1.5" value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value)}><option value="all">All assignments</option>{selected?.structuredAssignments?.map((assignment) => <option key={assignment._id} value={assignment._id}>{assignment.title}</option>)}</select></label></div>
              {visibleSubmissions.length === 0 ? <EmptyState icon={Users} title="No submissions match" description="Try a different status or assignment filter." /> : <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Assignment</th>
                      <th className="px-4 py-3 font-semibold">
                        Objective score
                      </th>
                      <th className="px-4 py-3 font-semibold">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleSubmissions.map((submission) => (
                      <tr key={submission._id} className="text-slate-700">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {submission.student?.fullName || "Student"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {submission.student?.email}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {assignmentTitles[String(submission.assignment)] ||
                            "CBT assignment"}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="success">
                            {submission.objectiveScore ?? 0} marks
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              }
              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="block text-sm font-semibold text-slate-800">
                  Review a student attempt
                  <select
                    className="dash-input mt-2"
                    value={selectedSubmissionId}
                    onChange={(event) => {
                      setSelectedSubmissionId(event.target.value);
                      setTheoryScore("");
                    }}
                  >
                    {visibleSubmissions.map((submission) => (
                      <option key={submission._id} value={submission._id}>
                        {submission.student?.fullName || "Student"} —{" "}
                        {assignmentTitles[String(submission.assignment)] ||
                          "CBT assignment"}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedSubmission && selectedSubmissionAssignment && (
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {selectedSubmission.student?.fullName || "Student"}'s
                          attempt
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Automatic objective score:{" "}
                          {selectedSubmission.objectiveScore ?? 0} marks
                        </p>
                      </div>
                      <Badge
                        variant={
                          selectedSubmission.status === "SUBMITTED"
                            ? "warning"
                            : "success"
                        }
                      >
                        {selectedSubmission.status === "SUBMITTED"
                          ? "Awaiting release"
                          : "Score released"}
                      </Badge>
                    </div>
                    {selectedSubmissionAssignment.objectiveQuestions?.length >
                      0 && (
                      <div className="mt-5 space-y-3">
                        <h5 className="font-semibold text-slate-900">
                          Objective answers
                        </h5>
                        {selectedSubmissionAssignment.objectiveQuestions.map(
                          (question, index) => {
                            const selectedOption = selectedAnswers[index];
                            const correct =
                              selectedOption === question.correctOptionIndex;
                            return (
                              <div
                                key={question.questionId || index}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                              >
                                <p className="font-medium text-slate-900">
                                  {index + 1}. {question.questionText}
                                </p>
                                <p
                                  className={`mt-2 text-sm font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}
                                >
                                  Student chose:{" "}
                                  {selectedOption === undefined
                                    ? "No answer"
                                    : `${"ABCD"[selectedOption]}. ${question.options[selectedOption]}`}{" "}
                                  {correct
                                    ? "✓ Correct"
                                    : `• Correct answer: ${"ABCD"[question.correctOptionIndex]}. ${question.options[question.correctOptionIndex]}`}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                    {selectedSubmission.status === "SUBMITTED" && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={releaseObjectiveScore}
                        className="dash-btn-primary mt-5"
                      >
                        Release objective score to student
                      </button>
                    )}
                    {selectedSubmissionAssignment.theoryQuestions?.length >
                    0 ? (
                      <div className="mt-6 border-t border-slate-200 pt-5">
                        <h5 className="font-semibold text-slate-900">
                          Theory marking
                        </h5>
                        {selectedSubmissionAssignment.theoryQuestions.map(
                          (question, index) => (
                            <div
                              key={question.questionId || index}
                              className="mt-3 rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <p className="font-medium text-slate-900">
                                {index + 1}. {question.questionText}{" "}
                                <span className="text-xs text-slate-500">
                                  ({question.marks} marks)
                                </span>
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                {selectedSubmission.theoryAnswers?.find(
                                  (answer) => answer.questionIndex === index,
                                )?.answerText || "No answer provided."}
                              </p>
                            </div>
                          ),
                        )}
                        <div className="mt-4 flex flex-wrap items-end gap-3">
                          <label className="block text-sm font-semibold text-slate-700">
                            Theory score (out of {maximumTheoryScore})
                            <input
                              className="dash-input mt-1.5 w-40"
                              type="number"
                              min="0"
                              max={maximumTheoryScore}
                              step="0.5"
                              value={theoryScore}
                              onChange={(event) =>
                                setTheoryScore(event.target.value)
                              }
                              required
                            />
                          </label>
                          <button
                            type="button"
                            disabled={saving || theoryScore === ""}
                            onClick={gradeTheory}
                            className="dash-btn-primary"
                          >
                            Save theory score & release
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                        This student attempt has no theory questions. Add theory
                        questions in the <strong>Theory</strong> tab when
                        creating an assignment; once the student submits, their
                        written answers will appear here for individual marking.
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </Panel>
      )}
      <Toast type={notice.type} message={notice.message} />
    </DashboardLayout>
  );
}
