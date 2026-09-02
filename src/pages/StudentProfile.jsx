/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Send,
  Star,
  X,
  AlertTriangle,
  Clock3,
  Maximize2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";

// Isolated component for individual assignments to keep typing snappy and fluid
const AssignmentItem = ({
  courseId,
  assignment,
  initialValue,
  onUpdateForm,
  onTriggerReview,
  onOpenWorkspace,
}) => {
  const currentText = initialValue || "";
  const wordCount =
    currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!currentText.trim()) return;
    onTriggerReview(courseId, assignment.title, currentText);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
      <p className="font-semibold text-slate-900">{assignment.title}</p>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
        {assignment.description}
      </p>

      <form onSubmit={handleSubmitAttempt} className="mt-4">
        <div className="relative">
          <textarea
            placeholder="Type your submission here... (Or click the expand icon on the right for a massive writing space)"
            value={currentText}
            onChange={(e) =>
              onUpdateForm(`${courseId}-${assignment.title}`, e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
            rows={4}
            required
          />
          {/* Expand Workspace Button */}
          <button
            type="button"
            onClick={() =>
              onOpenWorkspace(courseId, assignment.title, currentText)
            }
            className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
            title="Open expanded note subpage"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <span className="absolute bottom-3 right-3 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium pointer-events-none">
            {wordCount} words
          </span>
        </div>
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <Send className="h-3 w-3" /> Review & Submit
        </button>
      </form>
    </div>
  );
};

const StructuredAssignmentItem = ({
  courseId,
  assignment,
  submitted,
  onComplete,
  onError,
}) => {
  const [objectiveAnswers, setObjectiveAnswers] = useState({});
  const [theoryAnswers, setTheoryAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const objectiveCount = assignment.objectiveQuestions?.length || 0;
  const questionCount =
    objectiveCount + (assignment.theoryQuestions?.length || 0);
  const answered =
    Object.keys(objectiveAnswers).length +
    Object.values(theoryAnswers).filter((value) => value.trim()).length;
  const deadline = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isClosed = deadline && new Date() > deadline;

  const submit = async (event) => {
    event.preventDefault();
    if (Object.keys(objectiveAnswers).length < objectiveCount) {
      onError(
        "Please select an answer for every objective question before submitting.",
      );
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/student/submit-assignment", {
        courseId,
        assignmentId: assignment._id,
        objectiveAnswers: Object.entries(objectiveAnswers).map(
          ([questionIndex, selectedOptionIndex]) => ({
            questionIndex: Number(questionIndex),
            selectedOptionIndex,
          }),
        ),
        theoryAnswers: Object.entries(theoryAnswers).map(
          ([questionIndex, answerText]) => ({
            questionIndex: Number(questionIndex),
            answerText,
          }),
        ),
      });
      onComplete(data.message);
    } catch (error) {
      onError(error.response?.data?.message || "Unable to submit assignment.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    const scoreReleased = ["RELEASED", "GRADED"].includes(submitted.status);
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-900">{assignment.title}</p>
        {scoreReleased ? (
          <p className="mt-1 text-sm text-emerald-700">Submitted — objective score: {submitted.objectiveScore ?? 0}.{submitted.status === "GRADED" ? ` Final score: ${submitted.totalScore ?? 0}.` : " Theory answers are awaiting grading."}</p>
        ) : (
          <p className="mt-1 text-sm text-emerald-700">
            Submitted successfully. Your teacher will release your score after
            reviewing the attempt.
          </p>
        )}
      </div>
    );
  }

  if (isClosed) return <div className="rounded-xl border border-slate-200 bg-slate-100 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-800">{assignment.title}</p><p className="mt-1 text-sm text-slate-500">Submission closed · due {deadline.toLocaleDateString()}</p></div><Badge variant="default">Closed</Badge></div></div>;

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-900">
              {assignment.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {assignment.dueDate
                ? `Due ${new Date(assignment.dueDate).toLocaleDateString()} · `
                : ""}
              {assignment.totalMarks} total marks
            </p>
          </div>
          <Badge variant={answered === questionCount ? "success" : "info"}>
            {answered}/{questionCount} answered
          </Badge>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${questionCount ? (answered / questionCount) * 100 : 0}%`,
            }}
          />
        </div>
      </header>

      <div className="p-5 sm:p-7">
        {objectiveCount > 0 && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Objective questions
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Select one answer for each question. Your objective score is
                  marked automatically.
                </p>
              </div>
              <span className="text-sm font-semibold text-indigo-700">
                {objectiveCount} questions
              </span>
            </div>
            <div className="mt-5 space-y-5">
              {assignment.objectiveQuestions.map((question, qi) => (
                <fieldset
                  key={question.questionId || qi}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                >
                  <legend className="sr-only">Question {qi + 1}</legend>
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {qi + 1}
                    </span>
                    <div>
                      <p className="font-semibold leading-relaxed text-slate-900">
                        {question.questionText}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Choose one answer · {question.marks} mark
                        {question.marks === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, oi) => {
                      const selected = objectiveAnswers[qi] === oi;
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 text-sm transition ${selected ? "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"}`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name={`${assignment._id}-${qi}`}
                            checked={selected}
                            onChange={() =>
                              setObjectiveAnswers((answers) => ({
                                ...answers,
                                [qi]: oi,
                              }))
                            }
                          />
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600"}`}
                          >
                            {"ABCD"[oi]}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        )}

        {assignment.theoryQuestions?.length > 0 && (
          <section className="mt-8">
            <h4 className="text-lg font-bold text-slate-900">
              Theory questions
            </h4>
            <div className="mt-4 space-y-4">
              {assignment.theoryQuestions.map((question, qi) => {
                const value = theoryAnswers[qi] || "";
                return (
                  <div
                    className="rounded-xl border border-slate-200 p-4"
                    key={question.questionId || qi}
                  >
                    <p className="font-medium text-slate-900">
                      {qi + 1}. {question.questionText}{" "}
                      <span className="text-xs text-slate-500">
                        ({question.marks} marks)
                      </span>
                    </p>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      rows="5"
                      maxLength="5000"
                      placeholder="Write your answer for this question here…"
                      value={value}
                      onChange={(e) =>
                        setTheoryAnswers((answers) => ({
                          ...answers,
                          [qi]: e.target.value,
                        }))
                      }
                    />
                    <p className="mt-1 text-right text-xs text-slate-500">
                      {value.length}/5000 characters · draft saved in this form
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        <button
          disabled={sending}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          <Send className="h-4 w-4" />{" "}
          {sending ? "Submitting…" : "Submit assignment"}
        </button>
      </div>
    </form>
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
  const [submissionForms, setSubmissionForms] = useState({});
  const [activeTab, setActiveTab] = useState("registered");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseSection, setCourseSection] = useState("materials");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [activeSubmissions, setActiveSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal tracking states
  const [activeModalSubmission, setActiveModalSubmission] = useState(null);
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);

  const authSession = useMemo(
    () => JSON.parse(localStorage.getItem("lmsAuth") || "null"),
    [],
  );
  const token = authSession?.token;
  const studentName =
    authSession?.fullName ||
    authSession?.name ||
    authSession?.email ||
    "Student";

  const showStatus = (type, message) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus({ type: "", message: "" }), 4500);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/student/dashboard");
      setCourses(response.data.courses || []);
      setPerformanceRecords(response.data.performanceRecords || []);
      setActiveSubmissions(response.data.activeSubmissions || []);
    } catch (err) {
      showStatus(
        "error",
        err.response?.data?.message || "Unable to load your academic profile.",
      );
    }
  }, []);

  // Triggers final submission summary sheet
  const handleTriggerReview = (courseId, assignmentTitle, textContent) => {
    setActiveModalSubmission({ courseId, assignmentTitle, textContent });
  };

  // Opens big subpage full-screen editor setup
  const handleOpenWorkspace = (courseId, assignmentTitle, currentText) => {
    setExpandedWorkspace({
      courseId,
      assignmentTitle,
      textContent: currentText,
    });
  };

  // Saves data back from big panel into main form states
  const handleSaveWorkspaceChanges = () => {
    if (!expandedWorkspace) return;
    const { courseId, assignmentTitle, textContent } = expandedWorkspace;
    setSubmissionForms((prev) => ({
      ...prev,
      [`${courseId}-${assignmentTitle}`]: textContent,
    }));
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
        submissionData: textContent,
      });
      showStatus("success", "Assignment finalized and submitted successfully!");

      setSubmissionForms((prev) => ({
        ...prev,
        [`${courseId}-${assignmentTitle}`]: "",
      }));
      setActiveModalSubmission(null);
      fetchDashboard();
    } catch (err) {
      showStatus(
        "error",
        err.response?.data?.message || "Failed to submit assignment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateForm = (key, val) => {
    setSubmissionForms((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogout = () => {
    localStorage.removeItem("lmsAuth");
    navigate("/login");
  };

  const toggleCourse = (courseId) => {
    setExpandedCourseId((current) => (current === courseId ? null : courseId));
    setCourseSection("materials");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [token]);

  const averageScore = useMemo(() => {
    if (!performanceRecords.length) return null;
    return Math.round(
      performanceRecords.reduce((sum, r) => sum + r.score, 0) /
        performanceRecords.length,
    );
  }, [performanceRecords]);

  const structuredAssignments = courses.flatMap((course) => course.structuredAssignments || []);
  const dueSoonAssignments = structuredAssignments.filter((assignment) => {
    if (!assignment.dueDate || activeSubmissions.some((submission) => String(submission.assignment) === String(assignment._id))) return false;
    const due = new Date(assignment.dueDate);
    const daysUntilDue = (due.getTime() - Date.now()) / 86400000;
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  });
  const closedAssignments = structuredAssignments.filter((assignment) => assignment.dueDate && new Date(assignment.dueDate) < new Date() && !activeSubmissions.some((submission) => String(submission.assignment) === String(assignment._id)));

  const tabs = [
    { id: "registered", label: "My Courses" },
    { id: "insights", label: "My Results", count: performanceRecords.length },
  ];

  return (
    <DashboardLayout
      role="Student Portal"
      title={`${getGreeting()}, ${studentName}`}
      subtitle="Access your administrator-assigned courses, submit assignments, and track your graded results."
      userName={studentName}
      notifications={dueSoonAssignments.map((assignment) => ({ id: assignment._id, title: "Assignment due soon", message: `${assignment.title} is due ${new Date(assignment.dueDate).toLocaleDateString()}.` }))}
      onLogout={handleLogout}
      stats={[
        { label: "Enrolled courses", value: courses.length, icon: BookOpen },
        {
          label: "Submitted assignments",
          value: activeSubmissions.length,
          icon: Send,
        },
        {
          label: "Grades received",
          value: performanceRecords.length,
          icon: GraduationCap,
        },
        {
          label: "Average score",
          value: averageScore !== null ? `${averageScore}%` : "—",
          icon: Star,
        },
      ]}
    >
      <div className="mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "registered" && <Panel title="Your next steps" description="Stay ahead of deadlines and keep track of submitted work." className="mb-6"><div className="grid gap-3 sm:grid-cols-3"><button type="button" onClick={() => setExpandedCourseId(dueSoonAssignments.length ? courses.find((course) => course.structuredAssignments?.some((assignment) => assignment._id === dueSoonAssignments[0]._id))?._id : expandedCourseId)} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left"><Clock3 className="h-5 w-5 text-amber-700" /><p className="mt-3 text-2xl font-bold text-slate-900">{dueSoonAssignments.length}</p><p className="text-sm font-semibold text-slate-800">Due within 3 days</p></button><button type="button" onClick={() => setActiveTab("registered")} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left"><Send className="h-5 w-5 text-indigo-700" /><p className="mt-3 text-2xl font-bold text-slate-900">{activeSubmissions.length}</p><p className="text-sm font-semibold text-slate-800">Submitted attempts</p></button><button type="button" onClick={() => setActiveTab("insights")} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left"><GraduationCap className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-2xl font-bold text-slate-900">{performanceRecords.length}</p><p className="text-sm font-semibold text-slate-800">Grades received</p></button></div>{closedAssignments.length > 0 && <p className="mt-4 text-xs font-medium text-slate-500">{closedAssignments.length} assignment{closedAssignments.length === 1 ? "" : "s"} closed without a submission.</p>}</Panel>}

      {activeTab === "registered" && (
        <Panel
          title="My Courses & Assignments"
          description="Your enrolled subjects, materials, and assignment submissions."
          badge={<Badge variant="info">{courses.length} courses</Badge>}
        >
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses assigned yet"
              description="Your administrator will register you for courses when your timetable is set up."
            />
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const isExpanded = expandedCourseId === course._id;
                return (
                  <div
                    key={course._id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCourse(course._id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 shrink-0 text-indigo-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-slate-900">
                            {course.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            Code: {course.code}
                          </p>
                        </div>
                      </div>
                      <Badge>
                        {(course.materials?.length || 0) +
                          (course.assignments?.length || 0)}{" "}
                        items
                      </Badge>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                        <div className="mb-5 flex gap-2 border-b border-slate-200 pb-3">
                          <button
                            type="button"
                            onClick={() => setCourseSection("materials")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${courseSection === "materials" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"}`}
                          >
                            Materials ({course.materials?.length || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseSection("assignments")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${courseSection === "assignments" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"}`}
                          >
                            Assignments ({course.assignments?.length || 0})
                          </button>
                        </div>

                        {courseSection === "materials" &&
                          (course.materials?.length > 0 ? (
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {course.materials.map((material, idx) => (
                                <a
                                  key={idx}
                                  href={material.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm transition hover:border-indigo-400 hover:shadow-sm"
                                >
                                  <p className="font-medium text-slate-900">
                                    {material.title}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-indigo-600">
                                    {material.url}
                                  </p>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-slate-500">
                              No materials shared yet.
                            </p>
                          ))}

                        {courseSection === "assignments" && (
                          <div className="mt-5">
                            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                              <ClipboardList className="h-4 w-4 text-indigo-600" />{" "}
                              Assignments
                            </p>
                            {course.structuredAssignments?.length > 0 && (
                              <div className="mb-4 space-y-4">
                                {course.structuredAssignments.map(
                                  (assignment) => (
                                    <StructuredAssignmentItem
                                      key={assignment._id}
                                      courseId={course._id}
                                      assignment={assignment}
                                      submitted={activeSubmissions.find(
                                        (submission) =>
                                          String(submission.assignment) ===
                                          String(assignment._id),
                                      )}
                                      onComplete={(message) => {
                                        showStatus("success", message);
                                        fetchDashboard();
                                      }}
                                      onError={(message) =>
                                        showStatus("error", message)
                                      }
                                    />
                                  ),
                                )}
                              </div>
                            )}
                            {course.assignments?.length > 0 ? (
                              <div className="space-y-3">
                                {course.assignments.map((assignment, idx) => (
                                  <AssignmentItem
                                    key={idx}
                                    courseId={course._id}
                                    assignment={assignment}
                                    initialValue={
                                      submissionForms[
                                        `${course._id}-${assignment.title}`
                                      ]
                                    }
                                    onUpdateForm={handleUpdateForm}
                                    onTriggerReview={handleTriggerReview}
                                    onOpenWorkspace={handleOpenWorkspace}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">
                                No active assignments.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
              <Badge variant={averageScore >= 50 ? "success" : "warning"}>
                Average: {averageScore}%
              </Badge>
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
                <div
                  key={record._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {record.assignmentTitle}
                      </p>
                      <p className="text-sm text-slate-500">
                        Graded {new Date(record.gradedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={record.score >= 50 ? "success" : "danger"}>
                      {record.score}/100
                    </Badge>
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                    <p className="font-semibold text-amber-800">
                      Teacher Feedback
                    </p>
                    <p className="mt-2 leading-relaxed text-slate-700">
                      {record.focusAreas}
                    </p>
                  </div>
                </div>
              ))}
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
                <h3 className="text-lg font-bold text-slate-900">
                  Assignment Workspace
                </h3>
                <p className="text-xs text-slate-500">
                  Task: {expandedWorkspace.assignmentTitle}
                </p>
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
                onChange={(e) =>
                  setExpandedWorkspace({
                    ...expandedWorkspace,
                    textContent: e.target.value,
                  })
                }
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
                <h3 className="text-lg font-bold text-slate-900">
                  Review Your Submission
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assignment: {activeModalSubmission.assignmentTitle}
                </p>
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
                <p className="text-xs text-amber-700 mt-0.5">
                  Once you click submit, your entry will be officially marked
                  for grading. You cannot make any changes or edits after this
                  point.
                </p>
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

      <Toast
        message={status.type === "success" ? status.message : ""}
        type="success"
      />
      <Toast
        message={status.type === "error" ? status.message : ""}
        type="error"
      />
    </DashboardLayout>
  );
};

export default StudentProfile;
