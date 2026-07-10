function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-white">{value}</h2>
    </div>
  );
}

export default StatCard;