const Toast = ({ message, type = "success" }) => {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-600 text-white"
      : "bg-emerald-600 text-white";

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${styles}`}>
      {message}
    </div>
  );
};

export default Toast;
