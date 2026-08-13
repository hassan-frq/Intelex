import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiFolder,
  FiMic,
  FiFileText,
  FiClock,
  FiSettings,
} from "react-icons/fi";

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome size={15} /> },
    { name: "Case Book", path: "/cases", icon: <FiFolder size={15} /> },
    { name: "Speech to Text", path: "/case/1/speech", icon: <FiMic size={15} /> },
    { name: "Previous Cases", path: "/case/1/previous-cases", icon: <FiClock size={15} /> },
    { name: "Generate Document", path: "/case/1/generate", icon: <FiFileText size={15} /> },
    { name: "Settings", path: "/settings", icon: <FiSettings size={15} /> },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] border-r px-4 py-6"
      style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
    >
      <div className="mb-8 flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-[6px] font-bold"
          style={{ backgroundColor: "#c9a84c", color: "#0f1923" }}
        >
          I
        </div>
        <span
          className="text-base font-bold tracking-wide"
          style={{ color: "#e8e0d0" }}
        >
          Intelex
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-[9px] text-[13px] transition border ${
                isActive ? "font-medium" : "border-transparent"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    color: "#c9a84c",
                    backgroundColor: "rgba(201, 168, 76, 0.12)",
                    borderColor: "rgba(201, 168, 76, 0.2)",
                  }
                : { color: "#8a9baa" }
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;