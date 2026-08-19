import { useEffect, useState } from "react";
import StatCard from "../../components/dashboard/StatCard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions/QuickActions";
import { FiFolder, FiFileText, FiMic } from "react-icons/fi";
import { getCases } from "../../services/caseService";

function Dashboard() {
  const [caseCount, setCaseCount] = useState(null);

  useEffect(() => {
    getCases()
      .then((cases) => setCaseCount(cases.length))
      .catch((err) => {
        console.error("Failed to load case count:", err);
        setCaseCount(0);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#c9a84c" }}
        >
          Operations Overview
        </span>
        <h1
          className="mt-1 text-[22px] font-semibold"
          style={{ color: "#e8e0d0" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "#4d6070" }}>
          Track cases, documents, and sessions across your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Cases"
          value={caseCount === null ? "..." : String(caseCount)}
          icon={<FiFolder size={16} />}
        />
        <StatCard title="Documents" value="0" icon={<FiFileText size={16} />} />
        <StatCard title="Speech Sessions" value="0" icon={<FiMic size={16} />} />
      </div>

      <QuickActions />
    </div>
  );
}

export default Dashboard;