import { FiFolderPlus, FiMic, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_CASE_ID = "1";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Start Recording",
      icon: <FiMic size={15} />,
      onClick: () => navigate(`/case/${PLACEHOLDER_CASE_ID}/speech`),
      variant: "primary",
    },
    {
      title: "New Case",
      icon: <FiFolderPlus size={15} />,
      onClick: () => navigate("/cases"),
      variant: "secondary",
    },
    {
      title: "Generate Document",
      icon: <FiFileText size={15} />,
      onClick: () => navigate(`/case/${PLACEHOLDER_CASE_ID}/generate`),
      variant: "secondary",
    },
  ];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
    >
      <span
        className="mb-4 block text-[10px] font-medium uppercase tracking-[0.12em]"
        style={{ color: "#4d6070" }}
      >
        Quick Actions
      </span>

      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[13px] font-medium transition ${
              action.variant === "primary"
                ? "border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.08)] text-[#c9a84c] hover:bg-[rgba(201,168,76,0.14)] hover:border-[rgba(201,168,76,0.35)]"
                : "border-[#1e2d3d] bg-[#162030] text-[#8a9baa] hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
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