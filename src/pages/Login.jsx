import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="mb-14 text-center">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-blue-700">Greater Access Private Schools</p>
          <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your school, <span className="text-blue-700">connected.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            Welcome to the Greater Access Private Schools management system.
          </p>
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
