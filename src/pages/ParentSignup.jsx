import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import api from "../api/axiosClient";

const ParentSignup = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", studentCode: "", password: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      await api.post("/auth/parent/signup", formData);
      navigate("/parent-login", { state: { message: "Account linked. You can now sign in." } });
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to create the parent account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Link to="/parent-login" className="inline-flex items-center text-slate-700 font-bold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to parent login
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Parent Signup</h1>
            <p className="text-slate-600 text-sm mt-2">Use a student code provided by the school to link your child.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[["fullName", "Full Name", "text"], ["email", "Email Address", "email"], ["studentCode", "Student Code", "text"], ["password", "Password", "password"]].map(([name, label, type]) => (
              <div key={name}>
                <label className="block text-sm font-bold text-slate-900 mb-2">{label}</label>
                <input type={type} name={name} value={formData[name]} onChange={(event) => setFormData({ ...formData, [name]: event.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-300 text-slate-900 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none" />
              </div>
            ))}
            {status && <div className="px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{status}</div>}
            <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50">
              {loading ? "Creating account..." : "Create parent account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentSignup;
