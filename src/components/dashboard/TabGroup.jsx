const TabGroup = ({ tabs, activeTab, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          activeTab === tab.id
            ? "bg-indigo-600 text-white shadow-sm"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
        }`}
      >
        {tab.label}
        {typeof tab.count === "number" && (
          <span
            className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
              activeTab === tab.id ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default TabGroup;
