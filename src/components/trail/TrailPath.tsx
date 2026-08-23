function windingPath(stops: number): string {
  const step = 1000 / Math.max(stops, 1);
  let d = "M100,0";
  for (let i = 1; i <= stops; i += 1) {
    const y = i * step;
    const x = i % 2 === 0 ? 170 : 30;
    const prevX = (i - 1) % 2 === 0 ? 170 : i === 1 ? 100 : 30;
    const mid = y - step / 2;
    d += ` C${prevX},${mid} ${x},${mid} ${x},${y}`;
  }
  return d;
}

export function TrailPath({ stops }: { stops: number }) {
  return (
    <svg className="trail-path" viewBox="0 0 200 1000" preserveAspectRatio="none">
      <defs>
        <linearGradient
          id="aro-trail-grad"
          x1="0"
          y1="0"
          x2="0"
          y2="1000"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--gold)" />
          <stop offset="45%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--sage)" />
        </linearGradient>
      </defs>
      <path
        d={windingPath(stops)}
        stroke="url(#aro-trail-grad)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="1 9"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
