import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, Send, Star, Compass } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [pendingCourseIds, setPendingCourseIds] = useState([]);
  const [submissionForms, setSubmissionForms] = useState({});
  const [activeTab, setActiveTab] = useState("registered");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [activeSubmissions, setActiveSubmissions] = useState([]);

  const authSession = useMemo(() => JSON.parse(localStorage.getItem("lmsAuth") || "null"), []);
  const token = authSession?.token;
  const studentName = authSession?.name || "Student";

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await api.get("/student/available-courses");
      setAvailableCourses(res.data.availableCourses || []);
      setPendingCourseIds(res.data.pendingCourseIds || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/student/dashboard");
      setCourses(response.data.courses || []);
      setPerformanceRecords(response.data.performanceRecords || []);
      setActiveSubmissions(response.data.activeSubmissions || []);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Unable to load your academic profile.");
    }
  }, []);

  const handleRequestEnrollment = async (courseId) => {
    try {
      await api.post(`/student/request-enrollment/${courseId}`, {});
      showStatus("success", "Enrollment request sent.");
      fetchAvailableCourses();
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Failed to request enrollment.");
    }
  };

  const handleSubmitAssignment = async (e, courseId, assignmentTitle) => {
    e.preventDefault();
    const submissionData = submissionForms[`${courseId}-${assignmentTitle}`];
    if (!submissionData) return;

    try {
      await api.post("/student/submit-assignment", { courseId, assignmentTitle, submissionData });
      showStatus("success", "Assignment submitted successfully.");
      setSubmissionForms({ ...submissionForms, [`${courseId}-${assignmentTitle}`]: "" });
      fetchDashboard();
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Failed to submit assignment.");
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
    fetchDashboard();
    fetchAvailableCourses();
  }, [token]);

  const averageScore = useMemo(() => {
    if (!performanceRecords.length) return null;
    return Math.round(
      performanceRecords.reduce((sum, r) => sum + r.score, 0) / performanceRecords.length
    );
  }, [performanceRecords]);

  const tabs = [
    { id: "registered", label: "My Courses" },
    { id: "discovery", label: "Browse Courses", count: availableCourses.length },
    { id: "insights", label: "My Results", count: performanceRecords.length },
  ];

  return (
    <DashboardLayout
      role="Student Portal"
      title={`${getGreeting()}, ${studentName}`}
      subtitle="Access course materials, submit assignments, browse new courses, and track your graded results."
      userName={studentName}
      onLogout={handleLogout}
      stats={[
        { label: "Enrolled courses", value: courses.length, icon: BookOpen },
        { label: "Pending submissions", value: activeSubmissions.length, icon: Send },
        { label: "Grades received", value: performanceRecords.length, icon: GraduationCap },
        { label: "Average score", value: averageScore !== null ? `${averageScore}%` : "—", icon: Star },
      ]}
    >
      <div className="mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "registered" && (
        <Panel
          title="My Courses & Assignments"
          description="Your enrolled subjects, materials, and assignment submissions."
          badge={<Badge variant="info">{courses.length} courses</Badge>}
        >
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses enrolled"
              description="Browse available courses and request enrollment from your teacher."
            />
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">Code: {course.code}</p>
                    </div>
                    <Badge>{course.materials?.length || 0} resources</Badge>
                  </div>

                  {course.materials?.length > 0 ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {course.materials.map((material, idx) => (
                        <a
                          key={idx}
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 bg-white p-3 text-sm transition hover:border-indigo-400 hover:shadow-sm"
                        >
                          <p className="font-medium text-slate-900">{material.title}</p>
                          <p className="mt-1 truncate text-xs text-indigo-600">{material.url}</p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No materials shared yet.</p>
                  )}

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <ClipboardList className="h-4 w-4 text-indigo-600" /> Assignments
                    </p>
                    {course.assignments?.length > 0 ? (
                      <div className="space-y-3">
                        {course.assignments.map((assignment, idx) => (
                          <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4">
                            <p className="font-semibold text-slate-900">{assignment.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{assignment.description}</p>
                            <form onSubmit={(e) => handleSubmitAssignment(e, course._id, assignment.title)} className="mt-3">
                              <textarea
                                placeholder="Type your submission here..."
                                value={submissionForms[`${course._id}-${assignment.title}`] || ""}
                                onChange={(e) =>
                                  setSubmissionForms({
                                    ...submissionForms,
                                    [`${course._id}-${assignment.title}`]: e.target.value,
                                  })
                                }
                                className="dash-input"
                                rows={3}
                                required
                              />
                              <button type="submit" className="dash-btn-primary mt-2 text-xs">
                                Submit Assignment
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No active assignments.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === "insights" && (
        <Panel
          title="Academic Results"
          description="Your permanent grade record with scores and teacher feedback."
          badge={
            averageScore !== null ? (
              <Badge variant={averageScore >= 50 ? "success" : "warning"}>Average: {averageScore}%</Badge>
            ) : (
              <Badge>{performanceRecords.length} records</Badge>
            )
          }
        >
          {performanceRecords.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No grades yet"
              description="Your graded assignments will appear here once your teacher finishes reviewing them."
            />
          ) : (
            <div className="space-y-4">
              {performanceRecords.map((record) => (
                <div key={record._id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{record.assignmentTitle}</p>
                      <p className="text-sm text-slate-500">Graded {new Date(record.gradedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={record.score >= 50 ? "success" : "danger"}>{record.score}/100</Badge>
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-800">Teacher Feedback</p>
                    <p className="mt-2 leading-relaxed text-slate-700">{record.focusAreas}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === "discovery" && (
        <Panel title="Browse Courses" description="Request enrollment in courses offered by your teachers.">
          {availableCourses.length === 0 ? (
            <EmptyState icon={Compass} title="No courses available" description="Check back later for new courses." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => {
                const isPending = pendingCourseIds.includes(course._id.toString());
                return (
                  <div key={course._id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">Code: {course.code}</p>
                      <p className="mt-2 text-xs text-slate-500">Teacher: {course.teacherId?.name || "—"}</p>
                    </div>
                    <button
                      onClick={() => handleRequestEnrollment(course._id)}
                      disabled={isPending}
                      className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                        isPending
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {isPending ? "Request Pending" : "Request to Join"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      <Toast message={status.type === "success" ? status.message : ""} type="success" />
      <Toast message={status.type === "error" ? status.message : ""} type="error" />
    </DashboardLayout>
  );
};

export default StudentProfile;
