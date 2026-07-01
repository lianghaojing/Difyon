"use client";

import { useMemo, useState } from "react";

const timeFilters = ["1D", "7D", "1M", "QTD"];

const spendData = [
  { date: "03-01", value: 8500 },
  { date: "03-02", value: 8800 },
  { date: "03-03", value: 9200 },
  { date: "03-04", value: 9800 },
  { date: "03-05", value: 9500 },
  { date: "03-06", value: 7800 },
  { date: "03-07", value: 7500 },
  { date: "03-08", value: 7500 },
  { date: "03-09", value: 4200 },
  { date: "03-10", value: 9300 },
  { date: "03-11", value: 9800 },
  { date: "03-12", value: 7500 },
  { date: "03-13", value: 6200 },
  { date: "03-14", value: 7500 },
  { date: "03-15", value: 7800 },
  { date: "03-16", value: 11500 },
  { date: "03-17", value: 12000 },
  { date: "03-18", value: 9500 },
  { date: "03-19", value: 9200 },
  { date: "03-20", value: 7800 },
  { date: "03-21", value: 2500 },
  { date: "03-22", value: 7500 },
  { date: "03-23", value: 7800 },
  { date: "03-24", value: 10800 },
  { date: "03-25", value: 12673 },
  { date: "03-26", value: 11200 },
  { date: "03-27", value: 11800 },
  { date: "03-28", value: 7800 },
  { date: "03-29", value: 4500 },
  { date: "03-30", value: 9200 },
  { date: "03-31", value: 8800 },
];

const accountShare = [
  { name: "202509080010049", value: 920000, color: "#8b5cf6" },
  { name: "202509021441", value: 850000, color: "#6366f1" },
  { name: "1222286499840994", value: 330000, color: "#c084fc" },
  { name: "1539297584096955", value: 320000, color: "#7dd3fc" },
  { name: "202509080010049", value: 220000, color: "#4ade80" },
  { name: "202509021441", value: 180000, color: "#f472b6" },
  { name: "1222286499840994", value: 160000, color: "#ef4444" },
  { name: "1539297584096955", value: 100000, color: "#6366f1" },
];

export function DailyAdSpend() {
  const [activeFilter, setActiveFilter] = useState("1M");

  return (
    <section>
      <div className="mb-[18px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-semibold leading-9 text-[#14171a]">
          每日广告消费
        </h2>

        <div className="flex h-9 w-full max-w-[288px] items-center rounded-md bg-[#f9f9fa] p-[3px]">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="h-[30px] flex-1 rounded-[5px] text-[13px] font-medium transition-all"
              style={{
                color: activeFilter === filter ? "#14171a" : "#878e99",
                background: activeFilter === filter ? "#fff" : "transparent",
                boxShadow:
                  activeFilter === filter ? "0 3px 6px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {filter}
            </button>
          ))}
          <button className="flex h-[30px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] text-[13px] font-medium text-[#878e99] transition-all">
            <CalendarIcon />
            选择日期
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        <div className="console-chart-card flex flex-col rounded-lg bg-white px-[18px] pb-3 pt-[18px] shadow-[0_0_20px_rgba(0,0,0,0.06)]">
          <SpendBars filter={activeFilter} />
        </div>
        <div className="console-chart-card flex flex-col rounded-lg bg-white px-[18px] pb-3 pt-[18px] shadow-[0_0_20px_rgba(0,0,0,0.06)]">
          <SpendDonut filter={activeFilter} />
        </div>
      </div>
    </section>
  );
}

function SpendBars({ filter }: { filter: string }) {
  const data = useMemo(() => {
    if (filter === "1D") return spendData.slice(-1);
    if (filter === "7D") return spendData.slice(-7);
    return spendData;
  }, [filter]);

  const maxValue = 15000;
  const chartHeight = 174;
  const chartWidth = 560;
  const left = 52;
  const right = 14;
  const bottom = 26;
  const top = 10;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const barGap = data.length <= 7 ? 18 : 6;
  const barWidth = Math.max(6, (plotWidth - barGap * (data.length - 1)) / data.length);

  return (
    <div className="flex h-full flex-col">
      <h3 className="m-0 mb-3 text-sm font-semibold text-[#14171a]">
        账户消费占比
      </h3>
      <svg
        className="min-h-0 flex-1"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="每日广告消费柱状图"
      >
        {[0, 3000, 6000, 9000, 12000, 15000].map((tick) => {
          const y = top + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="#f0f0f0" strokeDasharray="3 3" />
              <text x={left - 14} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                {tick >= 1000 ? `$${tick / 1000}K` : `$${tick}`}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const x = left + index * (barWidth + barGap);
          const h = (item.value / maxValue) * plotHeight;
          const y = top + plotHeight - h;
          const showLabel = filter === "1D" || filter === "7D" || index % 4 === 0;
          return (
            <g key={item.date} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="4"
                fill="#9cbffb"
                className="transition-colors group-hover:fill-[#3b80f7]"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#9ca3af"
                opacity={showLabel ? 1 : 0}
              >
                {item.date}
              </text>
              <title>{`${item.date}: $${item.value.toLocaleString()}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SpendDonut({ filter }: { filter: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const multiplier = filter === "1D" ? 1 / 30 : filter === "7D" ? 7 / 30 : filter === "QTD" ? 3 : 1;
  const total = accountShare.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <div className="flex h-full flex-col">
      <h3 className="m-0 mb-3 text-sm font-semibold text-[#14171a]">
        账户消费占比
      </h3>
      <div className="flex min-h-0 flex-1 items-center gap-6">
        <svg
          className="aspect-square h-full max-h-[200px] shrink-0"
          viewBox="0 0 200 200"
          role="img"
          aria-label="账户消费占比环形图"
        >
          <g transform="rotate(-90 100 100)">
            {accountShare.map((item, index) => {
              const percent = item.value / total;
              const dash = percent * 565.49;
              const segment = (
                <circle
                  key={`${item.name}-${index}`}
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke={item.color}
                  strokeWidth={hoveredIndex === index ? 30 : 24}
                  strokeDasharray={`${dash} ${565.49 - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
              offset += dash + 4;
              return segment;
            })}
          </g>
          <circle cx="100" cy="100" r="48" fill="#fff" />
        </svg>

        <div className="grid flex-1 grid-cols-1 gap-1 sm:grid-cols-2">
          {accountShare.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const isDimmed = hoveredIndex !== null && !isHovered;
            return (
              <button
                key={`${item.name}-${index}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-left transition-all"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  boxShadow: isHovered ? "0 0 20px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    border: `2px solid ${item.color}`,
                    backgroundColor: `${item.color}4d`,
                  }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-normal text-[#878e99]">
                    {item.name}
                  </span>
                  <span className="block text-sm font-semibold text-[#14171a]">
                    ${Math.round(item.value * multiplier).toLocaleString()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
      />
    </svg>
  );
}
