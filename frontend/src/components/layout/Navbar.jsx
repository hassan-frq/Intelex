import { FiUser } from "react-icons/fi";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/cases": "Case Book",
    "/settings": "Settings",
  };

  let title = pageTitles[location.pathname];

  if (location.pathname.includes("/speech")) {
    title = "Speech to Text";
  } else if (location.pathname.includes("/previous-cases")) {
    title = "Previous Cases";
  } else if (location.pathname.includes("/generate")) {
    title = "Generate Document";
  } else if (location.pathname.includes("/preview")) {
    title = "Preview";
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <h1 className="text-xl font-semibold text-white">
        {title}
      </h1>

      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
        <FiUser className="text-zinc-400" />
        <span className="text-sm text-white">Guest</span>
      </div>
    </header>
  );
}

export default Navbar;