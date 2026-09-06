import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Copy,
  FileText,
  LayoutDashboard,
  Pencil,
  Plus,
  RefreshCcw,
  School,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Panel from "../components/dashboard/Panel";
import EmptyState from "../components/dashboard/EmptyState";
import Toast from "../components/dashboard/Toast";
import ConfirmModal from "../components/dashboard/ConfirmModal";
import AdminResults from "./AdminResults";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "people", label: "People", icon: Users },
  { id: "academic", label: "Academic setup", icon: School },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "results", label: "Results", icon: FileText },
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const AdminWorkspace = () => {
  const session = JSON.parse(localStorage.getItem("lmsAuth") || "null");
  const [section, setSection] = useState("overview");
  const [data, setData] = useState({
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    subjectAssignments: [],
    slots: [],
    academicPeriod: null,
  });
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [confirmation, setConfirmation] = useState(null);
  const [periodForm, setPeriodForm] = useState({
    academicSession: "",
    term: "FIRST_TERM",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        api.get("/admin/account-students"),
        api.get("/admin/teachers"),
        api.get("/admin/classes"),
        api.get("/admin/subjects"),
        api.get("/admin/subject-assignments"),
        api.get("/admin/timetable"),
        api.get("/settings/academic-period"),
        api.get("/admin/courses"),
      ]);
      setData({
        students: responses[0].data.accountStudents || [],
        teachers: responses[1].data.teachers || [],
        classes: responses[2].data.classes || [],
        subjects: responses[3].data.subjects || [],
        subjectAssignments: responses[4].data.assignments || [],
        slots: responses[5].data.slots || [],
        academicPeriod: responses[6].data.period || null,
        courses: responses[7].data.courses || [],
      });
      if (responses[6].data.period)
        setPeriodForm({
          academicSession: responses[6].data.period.academicSession,
          term: responses[6].data.period.term,
        });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to load administration data.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notify = (message, type = "success") => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice({ type: "", message: "" }), 4000);
  };

  const setField = (name, value) =>
    setFields((current) => ({ ...current, [name]: value }));
  const open = (kind) => {
    setForm(kind);
    setFields({ periodsPerWeek: 1 });
  };
  const openEdit = (kind, item) => {
    if (kind === "assignment") {
      setForm("edit-assignment");
      setFields({ id: item._id, subject: item.subject?._id || "", class: item.class?._id || "", teacher: item.teacher?._id || "", periodsPerWeek: item.periodsPerWeek });
      return;
    }
    setForm(`edit-${kind}`);
    setFields({
      id: item._id,
      fullName: item.fullName,
      email: item.email,
      classRef: item.studentClass?._id || "",
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setWorking(true);
    const endpoints = {
      teacher: "/admin/create-teacher",
      student: "/admin/create-student",
      class: "/admin/classes",
      subject: "/admin/subjects",
      assignment: "/admin/subject-assignments",
    };
    try {
      if (form === "register")
        await api.post(
          `/admin/courses/${fields.courseId}/register-student/${fields.studentId}`,
          {},
        );
      else if (form === "edit-teacher" || form === "edit-student")
        await api.patch(
          `/admin/${form === "edit-teacher" ? "teachers" : "account-students"}/${fields.id}`,
          fields,
        );
      else if (form === "edit-assignment")
        await api.patch(`/admin/subject-assignments/${fields.id}`, fields);
      else await api.post(endpoints[form], fields);
      notify(`${form[0].toUpperCase()}${form.slice(1)} saved successfully.`);
      setForm(null);
      await loadData();
    } catch (error) {
      notify(
        error.response?.data?.message || "Action could not be completed.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  };

  const editSlot = async (slot) => {
    const room = window.prompt("Room", slot.room || "");
    if (room === null) return;
    const startTime = window.prompt("Start time", slot.startTime);
    if (startTime === null) return;
    const endTime = window.prompt("End time", slot.endTime);
    if (endTime === null) return;
    setWorking(true);
    try {
      await api.patch(`/admin/timetable/${slot._id}`, {
        room,
        startTime,
        endTime,
      });
      notify("Timetable slot updated.");
      await loadData();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to update timetable slot.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  };

  const generate = async () => {
    setWorking(true);
    try {
      const response = await api.post("/admin/timetable/generate", {});
      notify(
        `${response.data.generated} slots generated${response.data.conflicts?.length ? ` with ${response.data.conflicts.length} conflicts` : "."}`,
        response.data.conflicts?.length ? "error" : "success",
      );
      await loadData();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to generate timetable.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  };

  const savePeriod = async (event) => {
    event.preventDefault();
    setWorking(true);
    try {
      await api.put("/settings/academic-period", periodForm);
      notify("Current academic term updated.");
      await loadData();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to update the academic term.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  };

  const requestConfirmation = (title, message, action, confirmLabel = "Confirm", danger = true) => {
    setConfirmation({ title, message, action, confirmLabel, danger });
  };

  const confirmAction = async () => {
    if (!confirmation) return;
    setWorking(true);
    try {
      await confirmation.action();
      setConfirmation(null);
    } catch (error) {
      notify(
        error.response?.data?.message || "Action could not be completed.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  };

  const remove = (endpoint) => requestConfirmation(
    "Remove this item?",
    "Related timetable records and linked data may also be removed. This action cannot be undone.",
    async () => { await api.delete(endpoint); notify("Removed successfully."); await loadData(); },
    "Remove",
  );

  const regenerateStudentCode = async (student) => {
    requestConfirmation(
      "Regenerate parent-link code?",
      `The old code for ${student.fullName} will stop working immediately.`,
      async () => {
        const response = await api.post(`/admin/students/${student._id}/regenerate-code`);
        setData((current) => ({ ...current, students: current.students.map((item) => item._id === student._id ? { ...item, studentCode: response.data.studentCode } : item) }));
        notify(`New code for ${student.fullName}: ${response.data.studentCode}`);
      },
      "Regenerate code",
      false,
    );
  };

  const regenerateStudentPassword = async (student) => {
    requestConfirmation(
      "Reset student password?",
      `The current password for ${student.fullName} will stop working immediately.`,
      async () => {
        const response = await api.post(`/admin/account-students/${student._id}/regenerate-password`);
        notify(`New password for ${student.fullName}: ${response.data.temporaryPassword}`);
      },
      "Reset password",
      false,
    );
  };

  const filteredStudents = useMemo(
    () =>
      data.students.filter((student) =>
        `${student.fullName} ${student.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [data.students, search],
  );
  const slotMap = useMemo(
    () =>
      new Map(
        data.slots.map((slot) => [
          `${slot.class?._id}-${slot.day}-${slot.period}`,
          slot,
        ]),
      ),
    [data.slots],
  );
  const pendingStudents = data.students.filter(
    (student) => !student.isActivated,
  );
  const studentsWithoutClass = data.students.filter(
    (student) => !student.studentClass,
  );
  const timetableReady = data.classes.length > 0 && data.slots.length > 0;

  const renderForm = () => {
    if (!form) return null;
    const title = {
      teacher: "Add teacher",
      student: "Create student",
      "edit-teacher": "Edit teacher",
      "edit-student": "Edit student",
      "edit-assignment": "Edit course teacher",
      class: "Create class",
      subject: "Create subject",
      assignment: "Assign subject",
      register: "Register student to course",
    }[form];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {form === "teacher" ||
            form === "student" ||
            form === "edit-teacher" ||
            form === "edit-student" ? (
              <>
                <input
                  className="dash-input"
                  placeholder="Full name"
                  value={fields.fullName || ""}
                  onChange={(event) => setField("fullName", event.target.value)}
                  required
                />
                <input
                  className="dash-input"
                  type="email"
                  placeholder="Email address"
                  value={fields.email || ""}
                  onChange={(event) => setField("email", event.target.value)}
                  required
                />
                {(form === "teacher" || form === "student") && (
                  <input
                    className="dash-input"
                    type="password"
                    placeholder="Password"
                    value={fields.password || ""}
                    onChange={(event) =>
                      setField("password", event.target.value)
                    }
                    required
                  />
                )}
                {(form === "student" || form === "edit-student") && (
                  <select
                    className="dash-input"
                    value={fields.classRef || ""}
                    onChange={(event) =>
                      setField("classRef", event.target.value)
                    }
                  >
                    <option value="">Assign class later</option>
                    {data.classes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : null}
            {form === "class" && (
              <>
                <input
                  className="dash-input"
                  placeholder="Level, e.g. JS1"
                  value={fields.level || ""}
                  onChange={(event) => setField("level", event.target.value)}
                  required
                />
                <input
                  className="dash-input"
                  placeholder="Section, e.g. A"
                  value={fields.section || ""}
                  onChange={(event) => setField("section", event.target.value)}
                  required
                />
              </>
            )}
            {form === "subject" && (
              <>
                <input
                  className="dash-input"
                  placeholder="Subject name"
                  value={fields.name || ""}
                  onChange={(event) => setField("name", event.target.value)}
                  required
                />
                <input
                  className="dash-input"
                  placeholder="Subject code"
                  value={fields.code || ""}
                  onChange={(event) => setField("code", event.target.value)}
                  required
                />
              </>
            )}
            {form === "assignment" && (
              <>
                <select
                  className="dash-input"
                  value={fields.subject || ""}
                  onChange={(event) => setField("subject", event.target.value)}
                  required
                >
                  <option value="">Select subject</option>
                  {data.subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>
                <select
                  className="dash-input"
                  value={fields.class || ""}
                  onChange={(event) => setField("class", event.target.value)}
                  required
                >
                  <option value="">Select class</option>
                  {data.classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  className="dash-input"
                  value={fields.teacher || ""}
                  onChange={(event) => setField("teacher", event.target.value)}
                  required
                >
                  <option value="">Select teacher</option>
                  {data.teachers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.fullName}
                    </option>
                  ))}
                </select>
                <input
                  className="dash-input"
                  type="number"
                  min="1"
                  max="40"
                  value={fields.periodsPerWeek}
                  onChange={(event) =>
                    setField("periodsPerWeek", Number(event.target.value))
                  }
                  required
                />
              </>
            )}
            {form === "edit-assignment" && (
              <>
                <select className="dash-input" value={fields.class || ""} onChange={(event) => setField("class", event.target.value)} required>
                  <option value="">Select class</option>
                  {data.classes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
                <select className="dash-input" value={fields.teacher || ""} onChange={(event) => setField("teacher", event.target.value)} required>
                  <option value="">Select teacher</option>
                  {data.teachers.map((item) => <option key={item._id} value={item._id}>{item.fullName}</option>)}
                </select>
                <input className="dash-input" type="number" min="1" max="40" value={fields.periodsPerWeek} onChange={(event) => setField("periodsPerWeek", Number(event.target.value))} required />
              </>
            )}
            {form === "register" && (
              <>
                <select
                  className="dash-input"
                  value={fields.courseId || ""}
                  onChange={(event) => setField("courseId", event.target.value)}
                  required
                >
                  <option value="">Select course</option>
                  {data.courses.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title} · {item.targetClass?.name || "Class"}
                    </option>
                  ))}
                </select>
                <select
                  className="dash-input"
                  value={fields.studentId || ""}
                  onChange={(event) =>
                    setField("studentId", event.target.value)
                  }
                  required
                >
                  <option value="">Select student</option>
                  {data.students.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.fullName} · {item.email}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button className="dash-btn-primary w-full" disabled={working}>
              {working ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderTimetable = () =>
    data.classes.map((classItem) => (
      <div key={classItem._id} className="mb-8">
        <h3 className="mb-3 font-semibold text-slate-900">
          {classItem.name}
          <span className="ml-2 font-normal text-slate-400">
            {classItem.academicSession}
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs text-slate-400">
                  Period / time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-2 text-left text-xs uppercase text-slate-400"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <th className="rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500">
                    P{index + 1}
                    <span className="mt-1 block font-normal">
                      {index < 4
                        ? `${String(8 + Math.floor(index * 0.75)).padStart(2, "0")}:00`
                        : ""}
                    </span>
                  </th>
                  {days.map((day) => {
                    const slot = slotMap.get(
                      `${classItem._id}-${day}-${index + 1}`,
                    );
                    return (
                      <td
                        key={day}
                        className={`rounded-lg border p-3 align-top ${slot?.subjectAssignment ? "border-indigo-100 bg-indigo-50" : "border-slate-100 bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-700">
                            {slot?.subjectAssignment?.subject
                              ? `${slot.subjectAssignment.subject.name} (${slot.subjectAssignment.subject.code})`
                              : "Free period"}
                          </p>
                          {slot && (
                            <button
                              type="button"
                              onClick={() => editSlot(slot)}
                              className="text-slate-400 hover:text-indigo-700"
                              aria-label={`Edit ${day} period ${index + 1}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {slot?.startTime ||
                            (index < 4
                              ? `${String(8 + Math.floor(index * 0.75)).padStart(2, "0")}:00`
                              : "11:30")}{" "}
                          - {slot?.endTime || ""}
                        </p>
                        {slot?.room && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {slot.room}
                          </p>
                        )}
                        {slot?.subjectAssignment?.teacher?.fullName && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {slot.subjectAssignment.teacher.fullName}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )).reduce(
                (rows, row, index) =>
                  index === 4
                    ? [
                        ...rows,
                        <tr key="lunch">
                          <td
                            colSpan="6"
                            className="rounded-lg bg-amber-50 p-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-700"
                          >
                            Lunch break · 11:00 - 11:30
                          </td>
                        </tr>,
                        row,
                      ]
                    : [...rows, row],
                [],
              )}
            </tbody>
          </table>
        </div>
      </div>
    ));

  return (
    <DashboardLayout
      role="Administration"
      title="School control center"
      subtitle="Manage people, academic structure, and the school timetable from one focused workspace."
      userName={session?.name || session?.email}
      notifications={[
        pendingStudents.length && {
          title: "Pending activations",
          message: `${pendingStudents.length} student account${pendingStudents.length === 1 ? "" : "s"} need review.`,
        },
        studentsWithoutClass.length && {
          title: "Class assignments",
          message: `${studentsWithoutClass.length} student${studentsWithoutClass.length === 1 ? "" : "s"} still need a class.`,
        },
        !timetableReady && {
          title: "Timetable setup",
          message:
            "Set up classes and assignments before publishing the timetable.",
        },
      ].filter(Boolean)}
      onLogout={() => {
        localStorage.removeItem("lmsAuth");
        window.location.href = "/login";
      }}
      actions={
        <button type="button" onClick={loadData} className="dash-btn-secondary">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      }
    >
      {section === "overview" && (
        <Panel
          title="Needs attention"
          description="Review these items before the school is ready to run."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setSection("people");
                setSearch("");
              }}
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <p className="text-2xl font-bold text-slate-900">
                {pendingStudents.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Pending activations
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Review student access
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSection("people");
                setSearch("");
              }}
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <p className="text-2xl font-bold text-slate-900">
                {studentsWithoutClass.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Students without class
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Assign before registration
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSection("timetable")}
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="text-2xl font-bold text-slate-900">
                {timetableReady ? "Ready" : "Not ready"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Timetable status
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {timetableReady
                  ? "Schedule is published"
                  : "Generate a schedule"}
              </p>
            </button>
          </div>
        </Panel>
      )}
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${section === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      {section === "people" && !loading && (
        <Panel
          title="Student parent codes"
          description="Copy a code for a parent or generate a replacement when one has been forgotten."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {student.fullName}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    {student.studentCode || "No code generated"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={!student.studentCode}
                    onClick={() =>
                      navigator.clipboard
                        ?.writeText(student.studentCode)
                        .then(() => notify("Student code copied."))
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
                    aria-label={`Copy code for ${student.fullName}`}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => regenerateStudentCode(student)}
                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-40"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-500">
          Loading workspace...
        </div>
      ) : (
        <>
          {section === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Students", data.students.length, Users],
                  ["Teachers", data.teachers.length, UserPlus],
                  ["Classes", data.classes.length, School],
                  ["Timetable slots", data.slots.length, CalendarDays],
                ].map(([label, value, Icon]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-indigo-600" />
                    <p className="mt-5 text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel
                  title="Current academic term"
                  description="This setting is shown across the portals and used for school records."
                >
                  <form onSubmit={savePeriod} className="space-y-3">
                    <input
                      className="dash-input"
                      placeholder="Academic session, e.g. 2026/2027"
                      value={periodForm.academicSession}
                      onChange={(event) =>
                        setPeriodForm({
                          ...periodForm,
                          academicSession: event.target.value,
                        })
                      }
                      required
                    />
                    <select
                      className="dash-input"
                      value={periodForm.term}
                      onChange={(event) =>
                        setPeriodForm({
                          ...periodForm,
                          term: event.target.value,
                        })
                      }
                    >
                      <option value="FIRST_TERM">First term</option>
                      <option value="SECOND_TERM">Second term</option>
                      <option value="THIRD_TERM">Third term</option>
                    </select>
                    <button
                      className="dash-btn-primary w-full"
                      disabled={working}
                    >
                      Save current term
                    </button>
                  </form>
                </Panel>
                <Panel
                  title="Quick actions"
                  description="Jump directly to the work area you need."
                >
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSection("people");
                        open("student");
                      }}
                      className="dash-btn-primary"
                    >
                      <Plus className="h-4 w-4" /> Add student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSection("people");
                        open("teacher");
                      }}
                      className="dash-btn-secondary"
                    >
                      <Plus className="h-4 w-4" /> Add teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection("academic")}
                      className="dash-btn-secondary"
                    >
                      <School className="h-4 w-4" /> Academic setup
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection("timetable")}
                      className="dash-btn-secondary"
                    >
                      <CalendarDays className="h-4 w-4" /> View timetable
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
          )}
          {section === "people" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    People directory
                  </h2>
                  <p className="text-sm text-slate-500">
                    Student and teacher accounts.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => open("student")}
                    className="dash-btn-primary"
                  >
                    <Plus className="h-4 w-4" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => open("teacher")}
                    className="dash-btn-secondary"
                  >
                    <Plus className="h-4 w-4" /> Teacher
                  </button>
                </div>
              </div>
              <Panel
                title="Students"
                actions={
                  <input
                    className="dash-input w-56"
                    placeholder="Search students"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                }
              >
                {filteredStudents.length ? (
                  <div className="overflow-x-auto">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student._id}>
                            <td className="font-semibold">
                              {student.fullName}
                            </td>
                            <td>{student.email}</td>
                            <td>
                              <select
                                className="dash-input py-1"
                                value={student.studentClass?._id || ""}
                                onChange={async (event) => {
                                  try {
                                    await api.patch(
                                      `/admin/account-students/${student._id}`,
                                      { classRef: event.target.value },
                                    );
                                    notify("Student class updated.");
                                    await loadData();
                                  } catch (error) {
                                    notify(
                                      error.response?.data?.message ||
                                        "Unable to update class.",
                                      "error",
                                    );
                                  }
                                }}
                              >
                                <option value="">Unassigned</option>
                                {data.classes.map((item) => (
                                  <option key={item._id} value={item._id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="text-emerald-600">
                              {student.isActivated ? "Active" : "Pending"}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => openEdit("student", student)}
                                className="mr-2 text-indigo-700"
                                aria-label={`Edit ${student.fullName}`}
                              >
                                <Pencil className="inline h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => regenerateStudentPassword(student)}
                                disabled={working}
                                className="mr-2 text-amber-700"
                              >
                                Reset password
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  remove(
                                    `/admin/account-students/${student._id}`,
                                  )
                                }
                                className="text-red-600"
                                aria-label={`Delete ${student.fullName}`}
                              >
                                <Trash2 className="inline h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No students yet"
                    description="Create a student account to populate the directory."
                  />
                )}
              </Panel>
              <Panel title="Teachers">
                {data.teachers.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.teachers.map((teacher) => (
                      <div
                        key={teacher._id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{teacher.fullName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {teacher.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit("teacher", teacher)}
                              className="text-indigo-700"
                              aria-label={`Edit ${teacher.fullName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                remove(`/admin/teachers/${teacher._id}`)
                              }
                              className="text-red-600"
                              aria-label={`Delete ${teacher.fullName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={UserPlus}
                    title="No teachers yet"
                    description="Add teachers to build the timetable."
                  />
                )}
              </Panel>
            </div>
          )}
          {section === "academic" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Academic setup
                </h2>
                <p className="text-sm text-slate-500">
                  Define the structure used by the scheduler.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => open("class")}
                  className="dash-btn-primary"
                >
                  <Plus className="h-4 w-4" /> Create class
                </button>
                <button
                  type="button"
                  onClick={() => open("subject")}
                  className="dash-btn-secondary"
                >
                  <Plus className="h-4 w-4" /> Create subject
                </button>
                <button
                  type="button"
                  onClick={() => open("assignment")}
                  className="dash-btn-secondary"
                >
                  <Plus className="h-4 w-4" /> Assign subject
                </button>
                <button
                  type="button"
                  onClick={() => open("register")}
                  className="dash-btn-secondary"
                >
                  <Plus className="h-4 w-4" /> Register student
                </button>
              </div>
              <Panel title="Classes and subjects">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    {data.classes.map((item) => (
                      <div
                        key={item._id}
                        className="mb-2 rounded-lg bg-slate-50 p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <span>
                            <strong>{item.name}</strong>
                            <span className="ml-2 text-slate-500">
                              {item.academicSession}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(`/admin/classes/${item._id}`)}
                            className="text-slate-400 hover:text-red-600"
                            aria-label="Delete class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          {data.courses
                            ?.filter(
                              (course) => course.targetClass?._id === item._id,
                            )
                            .map((course) => `${course.title} (${course.code})`)
                            .join(", ") || "No subjects assigned"}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    {data.subjects.map((item) => (
                      <div
                        key={item._id}
                        className="mb-2 flex justify-between rounded-lg bg-slate-50 p-3 text-sm"
                      >
                        <span>
                          <span className="block">
                            <strong>{item.name}</strong>
                            <span className="ml-2 font-mono text-slate-500">
                              {item.code}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {data.subjectAssignments.filter((assignment) => assignment.subject?._id === item._id).map((assignment) => `${assignment.teacher?.fullName || "Unassigned"} · ${assignment.class?.name || "No class"}`).join(", ") || "No teacher assigned"}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(`/admin/subjects/${item._id}`)}
                          className="text-slate-400 hover:text-red-600"
                          aria-label="Delete subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
              <Panel title="Course assignments" description="Change the teacher without deleting course materials or assignments.">
                {data.subjectAssignments.length ? (
                  <div className="space-y-2">
                    {data.subjectAssignments.map((assignment) => (
                      <div key={assignment._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">{assignment.subject?.name} · {assignment.class?.name}</p>
                          <p className="text-slate-500">Teacher: {assignment.teacher?.fullName || "Unassigned"} · {assignment.periodsPerWeek} periods/week</p>
                        </div>
                        <button type="button" onClick={() => openEdit("assignment", assignment)} className="dash-btn-secondary px-3 py-1.5 text-xs" disabled={working}>
                          <Pencil className="h-3.5 w-3.5" /> Edit course
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No subject-teacher assignments yet.</p>}
              </Panel>
            </div>
          )}
          {section === "timetable" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Weekly timetable
                  </h2>
                  <p className="text-sm text-slate-500">
                    Eight periods per day, Monday through Friday.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generate}
                  disabled={working}
                  className="dash-btn-primary"
                >
                  <RefreshCcw className="h-4 w-4" /> Generate schedule
                </button>
              </div>
              {data.classes.length ? (
                <Panel
                  title="Schedule grid"
                  description={`${data.slots.length} persisted slots. Select a slot to edit its room and times.`}
                >
                  {renderTimetable()}
                </Panel>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Create a class first"
                  description="Add classes and subject assignments before generating a schedule."
                />
              )}
            </div>
          )}
          {section === "results" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Result distribution
                </h2>
                <p className="text-sm text-slate-500">
                  Publish academic reports securely to student profiles.
                </p>
              </div>
              <AdminResults />
            </div>
          )}
        </>
      )}
      {renderForm()}
      <ConfirmModal
        open={Boolean(confirmation)}
        title={confirmation?.title || "Confirm action"}
        message={confirmation?.message || ""}
        confirmLabel={confirmation?.confirmLabel || "Confirm"}
        onConfirm={confirmAction}
        onCancel={() => setConfirmation(null)}
        loading={working}
        danger={confirmation?.danger ?? true}
      />
      <Toast type={notice.type} message={notice.message} />
    </DashboardLayout>
  );
};
export default AdminWorkspace;
