import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthSession } from "../api/axiosClient";
import { ArrowLeft, UserRoundCheck } from "lucide-react";

const TeacherLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { token, role, name, email } = response.data;

      if ((role || "").toString().toUpperCase() !== "TEACHER") {
        setStatus({
          type: "error",
          message: "This account is not authorized for teacher access.",
        });
        setLoading(false);
        return;
      }
      setAuthSession({ token, role: (role || "").toString().toUpperCase(), name, email });
      navigate("/teacher");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Link to="/login" className="inline-flex items-center text-purple-700 font-bold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login options
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRoundCheck className="h-8 w-8 text-purple-700" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Teacher Login</h1>
            <p className="text-slate-600 text-sm mt-2">Access your course management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition"
                placeholder="teacher@school.local"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {status.message && (
              <div className={`px-4 py-3 rounded-xl text-sm ${status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-800 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in as Teacher"}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            Contact your administrator if you need account credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
