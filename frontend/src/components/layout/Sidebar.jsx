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
    { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { name: "Case Book", path: "/cases", icon: <FiFolder /> },
    { name: "Speech to Text", path: "/case/1/speech", icon: <FiMic /> },
    { name: "Previous Cases", path: "/case/1/previous-cases", icon: <FiClock /> },
    { name: "Generate Document", path: "/case/1/generate", icon: <FiFileText /> },
    { name: "Settings", path: "/settings", icon: <FiSettings /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-800 bg-zinc-900 p-6">
      <h1 className="mb-8 text-2xl font-bold text-white">Intelex</h1>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`
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