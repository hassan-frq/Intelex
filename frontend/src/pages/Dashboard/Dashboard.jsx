import StatCard from "../../components/dashboard/StatCard/StatCard";
import ActivityCard from "../../components/dashboard/ActivityCard/ActivityCard";

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back!
        </h1>
        <p className="mt-2 text-zinc-400">
          Here's an overview of your workspace.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Cases" value="0" />
        <StatCard title="Documents" value="0" />
        <StatCard title="Speech Sessions" value="0" />
      </div>

      {/* Recent Activity */}
      <ActivityCard />
    </div>
  );
}

export default Dashboard;