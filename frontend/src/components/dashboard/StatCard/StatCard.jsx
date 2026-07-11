import { FiArrowUpRight } from "react-icons/fi";

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-zinc-800 p-3 text-blue-500">
          {icon}
        </div>

        <FiArrowUpRight className="text-zinc-500" />
      </div>

      <h3 className="mt-6 text-sm font-medium text-zinc-400">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

export default StatCard;