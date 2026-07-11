import { FiClock } from "react-icons/fi";

function ActivityCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <FiClock className="text-blue-500" />
        <h2 className="text-lg font-semibold text-white">
          Recent Activity
        </h2>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
        <p className="text-zinc-400">No recent activity available.</p>
      </div>
    </div>
  );
}

export default ActivityCard;