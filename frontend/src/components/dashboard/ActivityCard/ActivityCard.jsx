function ActivityCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Recent Activity
      </h2>

      <p className="text-zinc-400">
        No recent activity.
      </p>
    </div>
  );
}

export default ActivityCard;