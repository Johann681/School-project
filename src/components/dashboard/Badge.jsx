const variants = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
};

const Badge = ({ children, variant = "default", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant] || variants.default} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
