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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back!
        </h1>
        <p className="mt-2 text-zinc-400">
          Here's an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Cases"
          value={caseCount === null ? "..." : String(caseCount)}
          icon={<FiFolder size={22} />}
        />
        <StatCard title="Documents" value="0" icon={<FiFileText size={22} />}/>
        <StatCard title="Speech Sessions" value="0" icon={<FiMic size={22} />}/>
      </div>

      <QuickActions />
    </div>
  );
}

export default Dashboard;