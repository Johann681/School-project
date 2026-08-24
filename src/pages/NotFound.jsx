import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-900/95 p-10 shadow-2xl">
        <h1 className="text-6xl font-black tracking-tight">404</h1>
        <p className="mt-4 text-xl text-slate-300">Page not found.</p>
        <p className="mt-2 text-sm text-slate-500">The route you requested does not exist in this portal yet.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;
