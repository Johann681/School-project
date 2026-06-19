import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  Plus,
  Trash2,
  Users,
  BarChart3,
  FileText,
  GraduationCap,
} from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import ConfirmModal from "../components/dashboard/ConfirmModal";
import Toast from "../components/dashboard/Toast";

const getStudentLabel = (studentRef) => {
  if (!studentRef) return "Unknown student";
  if (typeof studentRef === "object") return studentRef.name || studentRef.email || "Unknown student";
  return studentRef;
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [courseForm, setCourseForm] = useState({ title: "", code: "" });
  const [materialForm, setMaterialForm] = useState({ title: "", url: "" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "" });
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [courseResults, setCourseResults] = useState([]);
  const [activeTab, setActiveTab] = useState("materials");
  const [grading, setGrading] = useState({ open: false, record: null, score: "", focusAreas: "" });
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const authSession = useMemo(() => JSON.parse(localStorage.getItem("lmsAuth") || "null"), []);
  const token = authSession?.token;
  const teacherName = authSession?.name || "Teacher";

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get("/teacher/courses");
      setCourses(response.data.courses || []);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to load your courses.");
    }
  }, []);

  const fetchEnrollmentRequests = useCallback(async () => {
    try {
      const response = await api.get("/teacher/enrollment-requests");
      setEnrollmentRequests(response.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await api.get(`/teacher/course-students/${courseId}`);
      setCourseStudents(response.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseResults = async (courseId) => {
    try {
      const response = await api.get(`/teacher/course-results/${courseId}`);
      setCourseResults(response.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (courseId) => {
    try {
      const response = await api.get(`/teacher/submissions/${courseId}`);
      setSelectedCourse(response.data.course);
      setSubmissions(response.data.submissions || []);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to fetch submissions.");
    }
  };

  const selectCourse = (course) => {
    fetchSubmissions(course._id);
    fetchCourseStudents(course._id);
    fetchCourseResults(course._id);
    setSelectedCourse(course);
    setActiveTab("materials");
  };

  const handleEnrollment = async (requestId, action) => {
    try {
      await api.post(`/teacher/handle-enrollment/${requestId}`, { action });
      fetchEnrollmentRequests();
      if (selectedCourse) fetchCourseStudents(selectedCourse._id);
      showStatus("success", `Request ${action}d successfully.`);
    } catch (err) {
      showStatus("error", "Failed to handle enrollment request.");
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      await api.post("/teacher/create-course", courseForm);
      setCourseForm({ title: "", code: "" });
      fetchCourses();
      showStatus("success", "Course created successfully.");
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to create course.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;
    setActionLoading(true);
    try {
      await api.delete(`/teacher/courses/${deleteCourse._id}`);
      setCourses((current) => current.filter((course) => course._id !== deleteCourse._id));
      if (selectedCourse?._id === deleteCourse._id) {
        setSelectedCourse(null);
        setSubmissions([]);
        setCourseStudents([]);
        setCourseResults([]);
      }
      setDeleteCourse(null);
      showStatus("success", "Course deleted successfully.");
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to delete course.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMaterial = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;
    setActionLoading(true);
    try {
      await api.post(`/teacher/drop-material/${selectedCourse._id}`, materialForm);
      setMaterialForm({ title: "", url: "" });
      await fetchSubmissions(selectedCourse._id);
      showStatus("success", "Material added successfully.");
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to add material.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAssignment = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;
    setActionLoading(true);
    try {
      const response = await api.post(`/teacher/add-assignment/${selectedCourse._id}`, assignmentForm);
      const assignments = response.data.assignments || [];
      const updatedCourse = { ...selectedCourse, assignments };
      setSelectedCourse(updatedCourse);
      setCourses((current) =>
        current.map((course) => (course._id === selectedCourse._id ? { ...course, assignments } : course))
      );
      setAssignmentForm({ title: "", description: "" });
      showStatus("success", "Assignment added successfully.");
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to add assignment.");
    } finally {
      setActionLoading(false);
    }
  };

  const openGradeModal = (submission) => {
    setGrading({ open: true, record: submission, score: "", focusAreas: "" });
  };

  const handleGrade = async (event) => {
    event.preventDefault();
    if (!grading.record || !selectedCourse) return;
    setActionLoading(true);
    try {
      await api.post(`/teacher/grade-and-purge/${grading.record._id}`, {
        score: grading.score,
        focusAreas: grading.focusAreas,
      });
      setSubmissions((current) => current.filter((item) => item._id !== grading.record._id));
      setGrading({ open: false, record: null, score: "", focusAreas: "" });
      await Promise.all([
        fetchCourseStudents(selectedCourse._id),
        fetchCourseResults(selectedCourse._id),
      ]);
      showStatus("success", "Submission graded. Results updated.");
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to process grading.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lmsAuth");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCourses();
    fetchEnrollmentRequests();
  }, [fetchCourses, fetchEnrollmentRequests, navigate, token]);

  const activeCourse = useMemo(
    () => courses.find((course) => course._id === selectedCourse?._id) || selectedCourse,
    [courses, selectedCourse]
  );

  const courseTabs = [
    { id: "materials", label: "Materials" },
    { id: "assignments", label: "Assignments" },
    { id: "students", label: "Students" },
    { id: "results", label: "Results", count: courseResults.length },
  ];

  const averageScore = useMemo(() => {
    if (!courseResults.length) return null;
    const total = courseResults.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / courseResults.length);
  }, [courseResults]);

  return (
    <DashboardLayout
      role="Teacher Portal"
      title="Course Management"
      subtitle="Create courses, approve enrollments, publish materials, grade submissions, and review student results."
      userName={teacherName}
      onLogout={handleLogout}
      stats={[
        { label: "My courses", value: courses.length, icon: BookOpen },
        { label: "Pending enrollments", value: enrollmentRequests.length, icon: Users },
        { label: "Pending submissions", value: submissions.length, icon: ClipboardCheck },
        { label: "Graded results", value: courseResults.length, icon: BarChart3 },
      ]}
    >
      {enrollmentRequests.length > 0 && (
        <Panel title="Pending Enrollment Requests" description="Approve or reject students requesting to join your courses." className="mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollmentRequests.map((req) => (
              <div key={req._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{req.studentId?.name}</p>
                <p className="text-sm text-slate-500">{req.studentId?.email}</p>
                <Badge variant="info" className="mt-3">
                  {req.courseId?.code} — {req.courseId?.title}
                </Badge>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEnrollment(req._id, "approve")} className="dash-btn-primary flex-1 text-xs">
                    Approve
                  </button>
                  <button
                    onClick={() => handleEnrollment(req._id, "reject")}
                    className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Your Courses" description="Select a course to manage content, students, and results." badge={<Badge>{courses.length} total</Badge>}>
          <form onSubmit={handleCreateCourse} className="mb-6 grid gap-3 sm:grid-cols-2">
            <input
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              type="text"
              placeholder="Course title"
              required
              className="dash-input"
            />
            <input
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              type="text"
              placeholder="Course code"
              required
              className="dash-input"
            />
            <button type="submit" disabled={actionLoading} className="dash-btn-primary sm:col-span-2">
              <Plus className="h-4 w-4" /> Create Course
            </button>
          </form>

          {courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to start teaching." />
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className={`rounded-xl border p-4 transition ${
                    selectedCourse?._id === course._id
                      ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => selectCourse(course)} className="min-w-0 flex-1 text-left">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">{course.code}</p>
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{course.materials?.length || 0} materials</Badge>
                      <button
                        type="button"
                        onClick={() => setDeleteCourse(course)}
                        className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        aria-label={`Delete ${course.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={activeCourse ? activeCourse.title : "Course Workspace"}
          description={activeCourse ? `Managing ${activeCourse.code}` : "Select a course from the list"}
          actions={
            activeCourse && (
              <button type="button" onClick={() => setDeleteCourse(activeCourse)} className="dash-btn-danger text-xs">
                <Trash2 className="h-3.5 w-3.5" /> Delete Course
              </button>
            )
          }
        >
          {!activeCourse ? (
            <EmptyState icon={FileText} title="No course selected" description="Pick a course to manage materials, assignments, and grades." />
          ) : (
            <>
              <TabGroup tabs={courseTabs} activeTab={activeTab} onChange={setActiveTab} />

              <div className="mt-6">
                {activeTab === "materials" && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddMaterial} className="space-y-3">
                      <input
                        value={materialForm.title}
                        onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                        type="text"
                        placeholder="Material title"
                        required
                        className="dash-input"
                      />
                      <input
                        value={materialForm.url}
                        onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                        type="url"
                        placeholder="Material URL"
                        required
                        className="dash-input"
                      />
                      <button type="submit" disabled={actionLoading} className="dash-btn-primary w-full">
                        Add Material
                      </button>
                    </form>
                    {activeCourse.materials?.length ? (
                      <ul className="space-y-2">
                        {activeCourse.materials.map((item, idx) => (
                          <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-indigo-600 hover:underline">
                              {item.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No materials added yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "assignments" && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddAssignment} className="space-y-3">
                      <input
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                        type="text"
                        placeholder="Assignment title"
                        required
                        className="dash-input"
                      />
                      <textarea
                        value={assignmentForm.description}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                        placeholder="Instructions"
                        required
                        rows={4}
                        className="dash-input"
                      />
                      <button type="submit" disabled={actionLoading} className="dash-btn-primary w-full">
                        Add Assignment
                      </button>
                    </form>
                    {activeCourse.assignments?.length ? (
                      <ul className="space-y-2">
                        {activeCourse.assignments.map((item, idx) => (
                          <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-slate-600">{item.description}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No assignments added yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "students" && (
                  <div>
                    {courseStudents.length === 0 ? (
                      <EmptyState icon={Users} title="No enrolled students" description="Students appear here after you approve their enrollment requests." />
                    ) : (
                      <ul className="space-y-3">
                        {courseStudents.map((student) => {
                          const scores = student.performances || [];
                          const avg = scores.length
                            ? Math.round(scores.reduce((s, p) => s + p.score, 0) / scores.length)
                            : null;
                          return (
                            <li key={student._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{student.name}</p>
                                  <p className="text-xs text-slate-500">{student.email}</p>
                                </div>
                                {avg !== null && (
                                  <Badge variant={avg >= 50 ? "success" : "danger"}>Avg: {avg}%</Badge>
                                )}
                              </div>
                              {scores.length > 0 && (
                                <ul className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
                                  {scores.map((perf) => (
                                    <li key={perf._id} className="flex items-center justify-between text-xs">
                                      <span className="text-slate-700">{perf.assignmentTitle}</span>
                                      <span className={`font-bold ${perf.score >= 50 ? "text-emerald-600" : "text-red-600"}`}>
                                        {perf.score}/100
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "results" && (
                  <div>
                    {averageScore !== null && (
                      <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Course average</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{averageScore}%</p>
                      </div>
                    )}
                    {courseResults.length === 0 ? (
                      <EmptyState
                        icon={GraduationCap}
                        title="No graded results yet"
                        description="Results appear here after you grade student submissions."
                      />
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Assignment</th>
                              <th>Score</th>
                              <th>Feedback</th>
                              <th>Graded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseResults.map((result) => (
                              <tr key={result._id}>
                                <td>
                                  <div className="font-medium text-slate-900">{getStudentLabel(result.studentId)}</div>
                                  <div className="text-xs text-slate-500">
                                    {typeof result.studentId === "object" ? result.studentId.email : ""}
                                  </div>
                                </td>
                                <td>{result.assignmentTitle}</td>
                                <td>
                                  <Badge variant={result.score >= 50 ? "success" : "danger"}>
                                    {result.score}/100
                                  </Badge>
                                </td>
                                <td className="max-w-xs truncate text-slate-600" title={result.focusAreas}>
                                  {result.focusAreas}
                                </td>
                                <td className="text-slate-500">{new Date(result.gradedAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Panel>
      </div>

      <Panel
        title="Pending Submissions"
        description="Grade submissions to record results and remove them from the active queue."
        className="mt-6"
        badge={
          selectedCourse ? (
            <Badge variant="info">{selectedCourse.code}</Badge>
          ) : (
            <Badge>No course selected</Badge>
          )
        }
      >
        {!selectedCourse ? (
          <EmptyState icon={ClipboardCheck} title="Select a course" description="Choose a course to view and grade submissions." />
        ) : submissions.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No pending submissions" description="All caught up for this course." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>
                      <div className="font-medium text-slate-900">{getStudentLabel(submission.studentId)}</div>
                      <div className="text-xs text-slate-500">
                        {typeof submission.studentId === "object" ? submission.studentId.email : ""}
                      </div>
                    </td>
                    <td>{submission.assignmentTitle}</td>
                    <td className="text-slate-500">{new Date(submission.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      <button onClick={() => openGradeModal(submission)} className="dash-btn-primary text-xs">
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {grading.open && grading.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Grade Submission</h3>
            <p className="mt-1 text-sm text-slate-600">{grading.record.assignmentTitle}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Student: {getStudentLabel(grading.record.studentId)}
              </p>
              <pre className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-white p-3 text-sm text-slate-700 whitespace-pre-wrap">
                {grading.record.submissionData}
              </pre>
            </div>

            <form onSubmit={handleGrade} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Score (0–100)
                <input
                  value={grading.score}
                  onChange={(e) => setGrading({ ...grading, score: e.target.value })}
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="dash-input mt-1.5"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Focus Areas / Feedback
                <textarea
                  value={grading.focusAreas}
                  onChange={(e) => setGrading({ ...grading, focusAreas: e.target.value })}
                  rows={4}
                  required
                  className="dash-input mt-1.5"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGrading({ open: false, record: null, score: "", focusAreas: "" })}
                  className="dash-btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="dash-btn-primary flex-1">
                  {actionLoading ? "Saving..." : "Grade & Save Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteCourse)}
        title="Delete course?"
        message={
          deleteCourse
            ? `This permanently removes "${deleteCourse.title}", all submissions, grades, enrollment requests, and student links.`
            : ""
        }
        confirmLabel="Delete course"
        onConfirm={handleDeleteCourse}
        onCancel={() => setDeleteCourse(null)}
        loading={actionLoading}
      />

      <Toast message={status.type === "success" ? status.message : ""} type="success" />
      <Toast message={status.type === "error" ? status.message : ""} type="error" />
    </DashboardLayout>
  );
};

export default TeacherDashboard;
