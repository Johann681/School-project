import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, ShieldCheck, UserRoundCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
            Welcome to the Learning Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            Select your role to access the Greater Access Private Schools management system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Student Login */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-8 text-center flex flex-col">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-blue-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Student</h2>
            <p className="text-slate-600 text-sm mb-8 flex-grow">
              Access your courses, submit assignments, and track your academic progress.
            </p>
            <button
              onClick={() => navigate("/student-login")}
              className="inline-flex items-center justify-center bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
            >
              Student Login <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>

          {/* Teacher Login */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-8 text-center flex flex-col">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserRoundCheck className="h-8 w-8 text-purple-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Teacher</h2>
            <p className="text-slate-600 text-sm mb-8 flex-grow">
              Manage your courses, upload materials, and grade student submissions.
            </p>
            <button
              onClick={() => navigate("/teacher-login")}
              className="inline-flex items-center justify-center bg-purple-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-800 transition-all"
            >
              Teacher Login <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>

          {/* Admin Login */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-8 text-center flex flex-col">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8 text-red-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Administrator</h2>
            <p className="text-slate-600 text-sm mb-8 flex-grow">
              Manage users, create accounts, and oversee the entire platform.
            </p>
            <button
              onClick={() => navigate("/admin-login")}
              className="inline-flex items-center justify-center bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-all"
            >
              Admin Login <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-600">
            Don't have an account? <button onClick={() => navigate("/enroll")} className="text-blue-700 font-bold hover:underline">Enroll here.</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
