const stats = [
  { value: "12k+", label: "learners on a roadmap" },
  { value: "340+", label: "coding problems" },
  { value: "4 tracks", label: "tutor, roadmap, code, awards" },
  { value: "Built for", label: "Pakistan & South Asia" },
] as const;

export function StatsBar() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
      <div className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-6 py-9 text-center ${
              index < stats.length - 1 ? "lg:border-r lg:border-line" : ""
            } ${index % 2 === 0 ? "border-r border-line lg:border-r" : ""} ${
              index < 2 ? "border-b border-line lg:border-b-0" : ""
            }`}
          >
            <p className="display text-[34px] font-bold">{stat.value}</p>
            <p className="mt-1.5 text-[13px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
