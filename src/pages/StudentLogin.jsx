import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthSession } from "../api/axiosClient";
import { ArrowLeft, CheckCircle2, GraduationCap } from "lucide-react";

const StudentLogin = () => {
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [activateData, setActivateData] = useState({ email: "", passkey: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleActivateChange = (e) => {
    setActivateData({ ...activateData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await api.post("/auth/login", loginData);
      const { token, role, name, email } = response.data;

      if ((role || "").toString().toUpperCase() !== "STUDENT") {
        setStatus({
          type: "error",
          message: "This account is not authorized for student access.",
        });
        setLoading(false);
        return;
      }
      setAuthSession({ token, role: (role || "").toString().toUpperCase(), name, email });
      navigate("/student");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await api.post("/auth/activate-student", activateData);
      setShowSuccess(true);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Activation failed. Check your details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Link to="/login" className="inline-flex items-center text-blue-700 font-bold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login options
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-blue-700" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Student Access</h1>
            <p className="text-slate-600 text-sm mt-2">
              {mode === "login" ? "Sign in to your account" : "Activate your new account"}
            </p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="student@school.local"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition"
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
                className="w-full bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("activate");
                  setStatus({ type: "", message: "" });
                }}
                className="w-full bg-gray-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                First time? Activate your account
              </button>
            </form>
          ) : (
            <form onSubmit={handleActivate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={activateData.email}
                  onChange={handleActivateChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Activation Passkey</label>
                <input
                  type="text"
                  name="passkey"
                  value={activateData.passkey}
                  onChange={handleActivateChange}
                  required
                  placeholder="6-character code from admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Create Password</label>
                <input
                  type="password"
                  name="password"
                  value={activateData.password}
                  onChange={handleActivateChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition"
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
                className="w-full bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? "Activating..." : "Activate my account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStatus({ type: "", message: "" });
                }}
                className="w-full bg-gray-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Activated!</h2>
            <p className="text-slate-600 mb-6">
              Your student account is ready. Log in with your email and password.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setMode("login");
                setActivateData({ email: "", passkey: "", password: "" });
                setStatus({ type: "", message: "" });
              }}
              className="w-full bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
            >
              Continue to login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLogin;
