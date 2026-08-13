import { FiUser, FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/cases": "Case Book",
    "/settings": "Settings",
  };

  let title = pageTitles[location.pathname];

  if (location.pathname.includes("/speech")) title = "Speech to Text";
  else if (location.pathname.includes("/previous-cases")) title = "Previous Cases";
  else if (location.pathname.includes("/generate")) title = "Generate Document";
  else if (location.pathname.includes("/preview")) title = "Preview";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      className="flex h-[52px] items-center justify-between border-b px-8"
      style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
    >
      <h1
        className="text-[11px] font-medium uppercase tracking-[0.05em]"
        style={{ color: "#4d6070" }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
          style={{ backgroundColor: "#162030", borderColor: "#1e2d3d" }}
        >
          <FiUser size={14} style={{ color: "#8a9baa" }} />
          <span className="text-[13px] font-medium" style={{ color: "#e8e0d0" }}>
            {user?.name || "Guest"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3 py-1.5 text-[13px] text-[#8a9baa] transition hover:border-[rgba(224,85,85,0.3)] hover:text-[#e05555]"
          title="Log out"
        >
          <FiLogOut size={14} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;