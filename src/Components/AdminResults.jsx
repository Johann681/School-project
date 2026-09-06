import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Panel from "../components/dashboard/Panel";
import Toast from "../components/dashboard/Toast";

const AdminResults = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", title: "", resultType: "EXAM", session: "", term: "FIRST_TERM", reportText: "", imageUrl: "" });
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/account-students").then((response) => {
      const list = response.data.accountStudents || [];
      setStudents(list);
      setForm((current) => ({ ...current, studentId: current.studentId || list[0]?._id || "" }));
    }).catch(() => setNotice({ type: "error", message: "Unable to load students." }));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/results", form);
      setNotice({ type: "success", message: "Result published to the student profile." });
      setForm((current) => ({ ...current, title: "", reportText: "", imageUrl: "" }));
    } catch (error) {
      setNotice({ type: "error", message: error.response?.data?.message || "Unable to publish result." });
    } finally {
      setSaving(false);
    }
  };

  return <Panel title="Distribute result" description="Publish a test, exam, or terminal report directly to a student profile.">
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <select className="dash-input" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Select student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.fullName} · {student.email}</option>)}</select>
      <input className="dash-input" placeholder="Result title, e.g. First term examination" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
      <select className="dash-input" value={form.resultType} onChange={(event) => setForm({ ...form, resultType: event.target.value })}><option value="TEST">Test</option><option value="EXAM">Exam</option><option value="TERMINAL_REPORT">Terminal report</option></select>
      <input className="dash-input" placeholder="Academic session (optional)" value={form.session} onChange={(event) => setForm({ ...form, session: event.target.value })} />
      <select className="dash-input" value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })}><option value="FIRST_TERM">First term</option><option value="SECOND_TERM">Second term</option><option value="THIRD_TERM">Third term</option></select>
      <input className="dash-input" type="url" placeholder="Report image URL (optional)" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
      <textarea className="dash-input min-h-32 md:col-span-2" placeholder="Enter total exam result, grades, comments, or report details" value={form.reportText} onChange={(event) => setForm({ ...form, reportText: event.target.value })} required={!form.imageUrl} />
      <button className="dash-btn-primary md:col-span-2" disabled={saving}>{saving ? "Publishing..." : "Publish result"}</button>
    </form>
    <Toast type={notice.type} message={notice.message} />
  </Panel>;
};

export default AdminResults;
