import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  GraduationCap,
  FileText,
} from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import Badge from "../components/dashboard/Badge";
import TabGroup from "../components/dashboard/TabGroup";
import EmptyState from "../components/dashboard/EmptyState";
import ConfirmModal from "../components/dashboard/ConfirmModal";
import Toast from "../components/dashboard/Toast";

const AdminPanel = () => {
  const navigate = useNavigate();
  const authSession = JSON.parse(localStorage.getItem("lmsAuth") || "null");
  const token = authSession?.token;

  const [teacherData, setTeacherData] = useState({ name: "", email: "", password: "" });
  const [studentData, setStudentData] = useState({ name: "", email: "" });
  const [directStudentData, setDirectStudentData] = useState({ name: "", email: "", password: "", classRef: "" });
  const [classData, setClassData] = useState({ level: "", section: "", academicSession: "" });
  const [subjectData, setSubjectData] = useState({ name: "", code: "" });
  const [assignmentData, setAssignmentData] = useState({ subject: "", class: "", teacher: "", periodsPerWeek: 1 });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetableStatus, setTimetableStatus] = useState("");
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [passkey, setPasskey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all-students");
  const [searchQuery, setSearchQuery] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [accountStudents, setAccountStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [applicantRes, accountRes, teacherRes, classRes, subjectRes] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/account-students"),
        api.get("/admin/teachers"),
        api.get("/admin/classes"),
        api.get("/admin/subjects"),
      ]);
      setApplicants(applicantRes.data.students || []);
      setAccountStudents(accountRes.data.accountStudents || []);
      setTeachers(teacherRes.data.teachers || []);
      setClasses(classRes.data.classes || []);
      setSubjects(subjectRes.data.subjects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [fetchData, navigate, token]);

  const unifiedStudents = useMemo(() => {
    const applicantRows = applicants.map((row) => ({
      ...row,
      type: "applicant",
      displayName: row.fullName || row.name || row.email,
      status: "Application",
    }));
    const accountRows = accountStudents.map((row) => ({
      ...row,
      type: "account",
      displayName: row.fullName || row.name || row.email,
      status: row.isActivated ? "Active" : "Pending activation",
    }));
    return [...accountRows, ...applicantRows].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [applicants, accountStudents]);

  const filteredStudents = useMemo(() => {
    let pool = unifiedStudents;
    if (activeTab === "applicants") pool = unifiedStudents.filter((s) => s.type === "applicant");
    if (activeTab === "accounts") pool = unifiedStudents.filter((s) => s.type === "account");

    if (!searchQuery) return pool;
    const query = searchQuery.toLowerCase();
    return pool.filter((student) =>
      [
        student.displayName,
        student.email,
        student.class,
        student.department,
        student.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [unifiedStudents, activeTab, searchQuery]);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter((teacher) =>
      [teacher.fullName || teacher.name || teacher.email, teacher.email].filter(Boolean).some((value) => value.toLowerCase().includes(query))
    );
  }, [teachers, searchQuery]);

  const showNotification = (messageText, isError = false) => {
    setMessage(isError ? "" : messageText);
    setError(isError ? messageText : "");
    window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 4500);
  };

  const handleTeacherSubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      const response = await api.post("/admin/create-teacher", {
        fullName: teacherData.name,
        email: teacherData.email,
        password: teacherData.password,
      });
      showNotification(response.data.message || "Teacher created successfully.");
      setTeacherData({ name: "", email: "", password: "" });
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || "Could not create teacher account.", true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePasskeySubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      const response = await api.post("/admin/create-student-passkey", {
        fullName: studentData.name,
        email: studentData.email,
      });
      setPasskey(response.data.passkey);
      showNotification("Student passkey generated successfully.");
      setStudentData({ name: "", email: "" });
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || "Could not generate student passkey.", true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDirectStudentSubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      const response = await api.post("/admin/create-student", { fullName: directStudentData.name, email: directStudentData.email, password: directStudentData.password, classRef: directStudentData.classRef || undefined });
      setPasskey(`Student code: ${response.data.studentCode}`);
      showNotification("Student account created successfully.");
      setDirectStudentData({ name: "", email: "", password: "", classRef: "" });
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || "Could not create student account.", true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleClassSubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      await api.post("/admin/classes", classData);
      setClassData({ level: "", section: "", academicSession: "" });
      showNotification("Class created successfully.");
      fetchData();
    } catch (err) { showNotification(err.response?.data?.message || "Could not create class.", true); }
    finally { setActionInProgress(false); }
  };

  const handleSubjectSubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      await api.post("/admin/subjects", subjectData);
      setSubjectData({ name: "", code: "" });
      showNotification("Subject created successfully.");
      fetchData();
    } catch (err) { showNotification(err.response?.data?.message || "Could not create subject.", true); }
    finally { setActionInProgress(false); }
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    setActionInProgress(true);
    try {
      await api.post("/admin/subject-assignments", assignmentData);
      setAssignmentData({ subject: "", class: "", teacher: "", periodsPerWeek: 1 });
      showNotification("Subject assignment created successfully.");
    } catch (err) { showNotification(err.response?.data?.message || "Could not assign subject.", true); }
    finally { setActionInProgress(false); }
  };

  const handleGenerateTimetable = async () => {
    setActionInProgress(true);
    try {
      const response = await api.post("/admin/timetable/generate", {});
      setTimetableStatus(`${response.data.generated} slots generated${response.data.conflicts?.length ? `; ${response.data.conflicts.length} conflicts need review` : "."}`);
      showNotification("Timetable generated successfully.");
      const slots = await api.get("/admin/timetable");
      setTimetableSlots(slots.data.slots || []);
    } catch (err) { showNotification(err.response?.data?.message || "Could not generate timetable.", true); }
    finally { setActionInProgress(false); }
  };

  const handleRegenerateCode = async (studentId) => {
    setActionInProgress(true);
    try {
      const response = await api.post(`/admin/students/${studentId}/regenerate-code`);
      setAccountStudents((current) => current.map((student) => student._id === studentId ? { ...student, studentCode: response.data.studentCode } : student));
      showNotification("Student code regenerated successfully.");
    } catch (err) { showNotification(err.response?.data?.message || "Could not regenerate student code.", true); }
    finally { setActionInProgress(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionInProgress(true);
    try {
      if (deleteTarget.kind === "teacher") {
        await api.delete(`/admin/teachers/${deleteTarget._id}`);
        setTeachers((current) => current.filter((row) => row._id !== deleteTarget._id));
        showNotification("Teacher account deleted successfully.");
      } else if (deleteTarget.type === "account") {
        await api.delete(`/admin/account-students/${deleteTarget._id}`);
        setAccountStudents((current) => current.filter((row) => row._id !== deleteTarget._id));
        showNotification("LMS student account removed.");
      } else {
        await api.delete(`/admin/students/${deleteTarget._id}`);
        setApplicants((current) => current.filter((row) => row._id !== deleteTarget._id));
        showNotification("Admission application removed.");
      }
      setDeleteTarget(null);
    } catch (err) {
      showNotification(err.response?.data?.message || "Delete failed.", true);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCopyPasskey = async () => {
    await navigator.clipboard.writeText(passkey);
    showNotification("Passkey copied to clipboard.");
  };

  const handleLogout = () => {
    localStorage.removeItem("lmsAuth");
    navigate("/login");
  };

  const deleteMessage = deleteTarget
    ? deleteTarget.kind === "teacher"
      ? `Delete teacher ${deleteTarget.fullName || deleteTarget.name || deleteTarget.email}? This removes their profile and linked course data.`
      : deleteTarget.type === "account"
        ? `Delete LMS account for ${deleteTarget.displayName}? This removes their grades, submissions, and enrollments.`
        : `Remove admission application for ${deleteTarget.displayName}? This cannot be undone.`
    : "";

  const studentTabs = [
    { id: "all-students", label: "All Students", count: unifiedStudents.length },
    { id: "accounts", label: "LMS Accounts", count: accountStudents.length },
    { id: "applicants", label: "Applications", count: applicants.length },
    { id: "teachers", label: "Teachers", count: teachers.length },
  ];

  const isTeacherTab = activeTab === "teachers";

  return (
    <DashboardLayout
      role="Administration"
      title="School Management"
      subtitle="Manage admission applications, LMS student accounts, teachers, and passkey provisioning from one place."
      userName={authSession?.fullName || authSession?.name || authSession?.email}
      onLogout={handleLogout}
      stats={[
        { label: "Total students", value: unifiedStudents.length, icon: Users },
        { label: "LMS accounts", value: accountStudents.length, icon: GraduationCap },
        { label: "Applications", value: applicants.length, icon: FileText },
        { label: "Teachers", value: teachers.length, icon: UserPlus },
      ]}
      actions={
        <button type="button" onClick={fetchData} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      }
    >
      <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Administration sections">
        {[['overview', 'Overview'], ['people', 'People'], ['academic', 'Academic setup'], ['timetable', 'Timetable'], ['records', 'Records']].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">{label}</a>
        ))}
      </nav>
      <div id="overview" className="scroll-mt-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div id="people" className="grid gap-6 lg:grid-cols-2 scroll-mt-6">
            <Panel title="Create Teacher" description="Provision instructors with direct login access.">
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                  <input
                    value={teacherData.name}
                    onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                    type="text"
                    required
                    className="dash-input mt-1.5"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                  <input
                    value={teacherData.email}
                    onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                    type="email"
                    required
                    className="dash-input mt-1.5"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <input
                    value={teacherData.password}
                    onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                    type="password"
                    required
                    className="dash-input mt-1.5"
                  />
                </label>
                <button type="submit" disabled={actionInProgress} className="dash-btn-primary w-full">
                  Create Teacher
                </button>
              </form>
            </Panel>

            <Panel title="Issue Student Passkey" description="Create an LMS account the student activates with a passkey.">
              <form onSubmit={handlePasskeySubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Student Name
                  <input
                    value={studentData.name}
                    onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                    type="text"
                    required
                    className="dash-input mt-1.5"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Student Email
                  <input
                    value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                    type="email"
                    required
                    className="dash-input mt-1.5"
                  />
                </label>
                <button type="submit" disabled={actionInProgress} className="dash-btn-primary w-full">
                  Issue Passkey
                </button>
              </form>

              {passkey && (
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Passkey issued</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-2xl font-bold tracking-widest text-slate-900">{passkey}</p>
                    <button type="button" onClick={handleCopyPasskey} className="dash-btn-primary">
                      <Copy className="h-4 w-4" /> Copy
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          <div id="academic" className="scroll-mt-6">
          <Panel title="Portal Setup" description="Create students, organize classes, assign subjects, and generate the weekly timetable.">
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleDirectStudentSubmit} className="space-y-3">
                <h3 className="font-semibold text-slate-900">Create Student Directly</h3>
                <input className="dash-input" placeholder="Full name" value={directStudentData.name} onChange={(e) => setDirectStudentData({ ...directStudentData, name: e.target.value })} required />
                <input className="dash-input" type="email" placeholder="Email" value={directStudentData.email} onChange={(e) => setDirectStudentData({ ...directStudentData, email: e.target.value })} required />
                <input className="dash-input" type="password" placeholder="Password (8+ chars, upper/lower/number)" value={directStudentData.password} onChange={(e) => setDirectStudentData({ ...directStudentData, password: e.target.value })} required />
                <select className="dash-input" value={directStudentData.classRef} onChange={(e) => setDirectStudentData({ ...directStudentData, classRef: e.target.value })}>
                  <option value="">No class yet</option>
                  {classes.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.academicSession})</option>)}
                </select>
                <button className="dash-btn-primary w-full" disabled={actionInProgress}>Create Student</button>
              </form>

              <form onSubmit={handleClassSubmit} className="space-y-3">
                <h3 className="font-semibold text-slate-900">Create Class</h3>
                <input className="dash-input" placeholder="Level, e.g. JS1" value={classData.level} onChange={(e) => setClassData({ ...classData, level: e.target.value })} required />
                <input className="dash-input" placeholder="Section, e.g. A" value={classData.section} onChange={(e) => setClassData({ ...classData, section: e.target.value })} required />
                <input className="dash-input" placeholder="Academic session, e.g. 2026/2027" value={classData.academicSession} onChange={(e) => setClassData({ ...classData, academicSession: e.target.value })} required />
                <button className="dash-btn-primary w-full" disabled={actionInProgress}>Create Class</button>
              </form>

              <form onSubmit={handleSubjectSubmit} className="space-y-3">
                <h3 className="font-semibold text-slate-900">Create Subject</h3>
                <input className="dash-input" placeholder="Subject name" value={subjectData.name} onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })} required />
                <input className="dash-input" placeholder="Subject code, e.g. MATH" value={subjectData.code} onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })} required />
                <button className="dash-btn-primary w-full" disabled={actionInProgress}>Create Subject</button>
              </form>

              <form onSubmit={handleAssignmentSubmit} className="space-y-3">
                <h3 className="font-semibold text-slate-900">Assign Subject and Teacher</h3>
                <select className="dash-input" value={assignmentData.subject} onChange={(e) => setAssignmentData({ ...assignmentData, subject: e.target.value })} required><option value="">Select subject</option>{subjects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
                <select className="dash-input" value={assignmentData.class} onChange={(e) => setAssignmentData({ ...assignmentData, class: e.target.value })} required><option value="">Select class</option>{classes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
                <select className="dash-input" value={assignmentData.teacher} onChange={(e) => setAssignmentData({ ...assignmentData, teacher: e.target.value })} required><option value="">Select teacher</option>{teachers.map((item) => <option key={item._id} value={item._id}>{item.fullName || item.email}</option>)}</select>
                <input className="dash-input" type="number" min="1" max="40" placeholder="Periods per week" value={assignmentData.periodsPerWeek} onChange={(e) => setAssignmentData({ ...assignmentData, periodsPerWeek: Number(e.target.value) })} required />
                <button className="dash-btn-primary w-full" disabled={actionInProgress}>Save Assignment</button>
              </form>
            </div>
            <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-semibold text-slate-900">Weekly timetable</p><p className="text-sm text-slate-600">Generates eight periods across Monday to Friday for every configured class.</p>{timetableStatus && <p className="mt-1 text-sm font-medium text-emerald-700">{timetableStatus}</p>}</div>
              <button type="button" onClick={handleGenerateTimetable} disabled={actionInProgress} className="dash-btn-primary shrink-0"><RefreshCcw className="h-4 w-4" /> Generate Timetable</button>
            </div>
          </Panel>
          </div>

          <div id="records" className="scroll-mt-6">
          <Panel
            title="Student & Teacher Records"
            description="Admission applications come from the public enroll form. LMS accounts are created via passkey."
          >
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabGroup tabs={studentTabs} activeTab={activeTab} onChange={setActiveTab} />
              <div className="relative min-w-[220px] flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${isTeacherTab ? "teachers" : "students"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dash-input pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : isTeacherTab ? (
              filteredTeachers.length === 0 ? (
                <EmptyState icon={UserPlus} title="No teachers found" description="Create a teacher account to get started." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Instructor</th>
                        <th>Email</th>
                        <th>Added</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher._id}>
                          <td className="font-semibold text-slate-900">{teacher.fullName || teacher.name || teacher.email}</td>
                          <td>{teacher.email}</td>
                          <td className="text-slate-500">{new Date(teacher.createdAt).toLocaleDateString()}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ ...teacher, kind: "teacher" })}
                              className="dash-btn-danger px-3 py-1.5 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students match this filter"
                description="Applications appear from the enroll form. LMS accounts appear after you issue a passkey."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={`${student.type}-${student._id}`}>
                        <td>
                          <div className="font-semibold text-slate-900">{student.displayName}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </td>
                        <td>
                          <Badge variant={student.type === "account" ? "info" : "cyan"}>
                            {student.type === "account" ? "LMS Account" : "Application"}
                          </Badge>
                          <div className="mt-1">
                            <Badge variant={student.status === "Active" ? "success" : student.status === "Pending activation" ? "warning" : "default"}>
                              {student.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-sm">
                          {student.type === "applicant" ? (
                            <>
                              <div>{student.class}</div>
                              <div className="text-slate-500">{student.department}</div>
                              <div className="text-xs text-slate-400">DOB: {new Date(student.dob).toLocaleDateString()}</div>
                            </>
                          ) : (
                            <>
                              <div>{student.enrolledCourses?.length || 0} enrolled courses</div>
                              {student.studentCode && <div className="font-mono text-xs text-emerald-700">{student.studentCode}</div>}
                              <div className="text-slate-500">{student.isActivated ? "Can log in" : "Awaiting activation"}</div>
                            </>
                          )}
                        </td>
                        <td className="text-slate-500">{new Date(student.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="text-right">
                          {student.type === "account" && student.studentCode && <button type="button" onClick={() => handleRegenerateCode(student._id)} className="dash-btn-secondary mr-2 px-3 py-1.5 text-xs">Regenerate code</button>}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(student)}
                            className="dash-btn-danger px-3 py-1.5 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
          </div>

          {timetableSlots.length > 0 && <div id="timetable" className="scroll-mt-6"><Panel title="Generated Timetable Preview" description="The latest generated schedule across all configured classes.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{timetableSlots.slice(0, 20).map((slot) => <div key={slot._id} className="rounded-xl border border-slate-200 p-3 text-sm"><p className="font-semibold text-slate-900">{slot.subjectAssignment?.subject?.name || "Free Period"}</p><p className="text-slate-600">{slot.class?.name} · {slot.day} P{slot.period}</p></div>)}</div>
          </Panel></div>}
        </div>

        <aside className="space-y-6">
          <Panel title="Quick Guide">
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
                <span><strong className="text-slate-800">Applications</strong> — students who filled the public enroll form. They do not have LMS access yet.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
                <span><strong className="text-slate-800">LMS Accounts</strong> — students you create with a passkey. They activate at student login and can take courses.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
                <span><strong className="text-slate-800">Teachers</strong> — manage faculty accounts and remove them with confirmation.</span>
              </li>
            </ul>
          </Panel>

          <Panel title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Pending activations</span>
                <span className="text-lg font-bold text-amber-600">
                  {accountStudents.filter((s) => !s.isActivated).length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Active LMS students</span>
                <span className="text-lg font-bold text-emerald-600">
                  {accountStudents.filter((s) => s.isActivated).length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Open applications</span>
                <span className="text-lg font-bold text-indigo-600">{applicants.length}</span>
              </div>
            </div>
          </Panel>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Secure admin access</p>
            <p className="mt-1 text-sm text-slate-600">All actions are logged to your session. Passkeys are shown once — copy them immediately.</p>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Confirm deletion"
        message={deleteMessage}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={actionInProgress}
      />

      <Toast message={message} type="success" />
      <Toast message={error} type="error" />
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
