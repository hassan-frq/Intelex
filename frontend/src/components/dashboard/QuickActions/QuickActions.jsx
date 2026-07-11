import { FiFolderPlus, FiMic, FiFileText } from "react-icons/fi";

function QuickActions() {
  const actions = [
    { title: "New Case", icon: <FiFolderPlus size={20} /> },
    { title: "Start Recording", icon: <FiMic size={20} /> },
    { title: "Generate Document", icon: <FiFileText size={20} /> },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">
        Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800 p-4 text-white transition hover:border-blue-500 hover:bg-zinc-700"
          >
            {action.icon}
            {action.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;