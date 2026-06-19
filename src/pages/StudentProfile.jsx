/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, Send, Star, Compass, X, AlertTriangle, Maximize2 } from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

// Isolated component for individual assignments to keep typing snappy and fluid
const AssignmentItem = ({ courseId, assignment, initialValue, onUpdateForm, onTriggerReview, onOpenWorkspace }) => {
  const currentText = initialValue || "";
  const wordCount = currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!currentText.trim()) return;
    onTriggerReview(courseId, assignment.title, currentText);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
      <p className="font-semibold text-slate-900">{assignment.title}</p>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{assignment.description}</p>
      
      <form onSubmit={handleSubmitAttempt} className="mt-4">
        <div className="relative">
          <textarea
            placeholder="Type your submission here... (Or click the expand icon on the right for a massive writing space)"
            value={currentText}
            onChange={(e) => onUpdateForm(`${courseId}-${assignment.title}`, e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
            rows={4}
            required
          />
          {/* Expand Workspace Button */}
          <button
            type="button"
            onClick={() => onOpenWorkspace(courseId, assignment.title, currentText)}
            className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
            title="Open expanded note subpage"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          <span className="absolute bottom-3 right-3 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium pointer-events-none">
            {wordCount} words
          </span>
        </div>
        <button type="submit" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
          <Send className="h-3 w-3" /> Review & Submit
        </button>
      </form>
    </div>
  );
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal tracking states
  const [activeModalSubmission, setActiveModalSubmission] = useState(null);
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);

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

  // Triggers final submission summary sheet
  const handleTriggerReview = (courseId, assignmentTitle, textContent) => {
    setActiveModalSubmission({ courseId, assignmentTitle, textContent });
  };

  // Opens big subpage full-screen editor setup
  const handleOpenWorkspace = (courseId, assignmentTitle, currentText) => {
    setExpandedWorkspace({ courseId, assignmentTitle, textContent: currentText });
  };

  // Saves data back from big panel into main form states
  const handleSaveWorkspaceChanges = () => {
    if (!expandedWorkspace) return;
    const { courseId, assignmentTitle, textContent } = expandedWorkspace;
    setSubmissionForms(prev => ({ ...prev, [`${courseId}-${assignmentTitle}`]: textContent }));
    setExpandedWorkspace(null);
  };

  const handleConfirmFinalSubmission = async () => {
    if (!activeModalSubmission || isSubmitting) return;
    setIsSubmitting(true);

    const { courseId, assignmentTitle, textContent } = activeModalSubmission;

    try {
      await api.post("/student/submit-assignment", { 
        courseId, 
        assignmentTitle, 
        submissionData: textContent 
      });
      showStatus("success", "Assignment finalized and submitted successfully!");
      
      setSubmissionForms(prev => ({ ...prev, [`${courseId}-${assignmentTitle}`]: "" }));
      setActiveModalSubmission(null);
      fetchDashboard();
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Failed to submit assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateForm = (key, val) => {
    setSubmissionForms(prev => ({ ...prev, [key]: val }));
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
                          <AssignmentItem
                            key={idx}
                            courseId={course._id}
                            assignment={assignment}
                            initialValue={submissionForms[`${course._id}-${assignment.title}`]}
                            onUpdateForm={handleUpdateForm}
                            onTriggerReview={handleTriggerReview}
                            onOpenWorkspace={handleOpenWorkspace}
                          />
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

      {/* Expanded Subpage Text Editor / Notepad Overlay */}
      {expandedWorkspace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assignment Workspace</h3>
                <p className="text-xs text-slate-500">Task: {expandedWorkspace.assignmentTitle}</p>
              </div>
              <button 
                onClick={() => setExpandedWorkspace(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 my-4">
              <textarea
                value={expandedWorkspace.textContent}
                onChange={(e) => setExpandedWorkspace({ ...expandedWorkspace, textContent: e.target.value })}
                placeholder="Type your deep answers, paragraphs, code submission or reports here..."
                className="w-full h-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm resize-none leading-relaxed text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExpandedWorkspace(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSaveWorkspaceChanges}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Apply Text to Input
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal Overlay */}
      {activeModalSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review Your Submission</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assignment: {activeModalSubmission.assignmentTitle}</p>
              </div>
              <button 
                onClick={() => setActiveModalSubmission(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Your Answer Content
              </label>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {activeModalSubmission.textContent}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 mb-6 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Ready to send?</p>
                <p className="text-xs text-amber-700 mt-0.5">Once you click submit, your entry will be officially marked for grading. You cannot make any changes or edits after this point.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveModalSubmission(null)}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmFinalSubmission}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:bg-indigo-400"
              >
                {isSubmitting ? "Submitting..." : "Confirm Final Submission"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={status.type === "success" ? status.message : ""} type="success" />
      <Toast message={status.type === "error" ? status.message : ""} type="error" />
    </DashboardLayout>
  );
};

export default StudentProfile;