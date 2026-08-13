function StatCard({ title, value, icon }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "#4d6070" }}
        >
          {title}
        </span>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(201, 168, 76, 0.08)", color: "#c9a84c" }}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold" style={{ color: "#e8e0d0" }}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;