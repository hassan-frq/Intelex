import { FiFolderPlus, FiMic, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// TODO: replace hardcoded case id "1" with a real case id once
// Case Book (create/select case) is implemented by Hasnain.
const PLACEHOLDER_CASE_ID = "1";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Case",
      icon: <FiFolderPlus size={20} />,
      onClick: null, // disabled until Case Book backend exists
      disabled: true,
    },
    {
      title: "Start Recording",
      icon: <FiMic size={20} />,
      onClick: () => navigate(`/case/${PLACEHOLDER_CASE_ID}/speech`),
      disabled: false,
    },
    {
      title: "Generate Document",
      icon: <FiFileText size={20} />,
      onClick: () => navigate(`/case/${PLACEHOLDER_CASE_ID}/generate`),
      disabled: false,
    },
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
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.disabled ? "Coming soon" : undefined}
            className={`flex items-center gap-3 rounded-xl border p-4 text-white transition ${
              action.disabled
                ? "cursor-not-allowed border-zinc-800 bg-zinc-800/50 opacity-50"
                : "border-zinc-800 bg-zinc-800 hover:border-blue-500 hover:bg-zinc-700"
            }`}
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