import { useCallback, useEffect, useState } from "react";
import { LogOut, RefreshCcw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import legacyAdminApi from "../api/legacyAdminClient";

const LegacyAdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/legacy-admin-login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await legacyAdminApi.get("/legacy-admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.students || []);
    } catch (requestError) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/legacy-admin-login", { replace: true });
        return;
      }
      setError(requestError.response?.data?.message || "Unable to load enrolled students.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/legacy-admin-login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Greater Access Private Schools</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Enrolled students</h1>
            <p className="mt-1 text-slate-600">Student enrollment records.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={loadStudents} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <Users className="h-5 w-5 text-blue-700" />
            <h2 className="font-bold text-slate-900">Students ({students.length})</h2>
          </div>
          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading student records...</p>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-700">{error}</p>
              <button type="button" onClick={loadStudents} className="mt-3 font-semibold text-blue-700 hover:underline">Try again</button>
            </div>
          ) : students.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No student enrollment records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Department</th><th className="px-5 py-3">Applied</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{student.fullName}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.email}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.class}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.department}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default LegacyAdminDashboard;
