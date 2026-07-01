import Image from "next/image";

type WatermarkType = "count" | "active" | "disabled" | "cancel" | "nonSpending";

const CARD_PATH =
  "M6,132 a6,6 0 0 1 -6,-6 V6 a6,6 0 0 1 6,-6 H159.362 a10.046,10.046 0 0 1 9.876,11.548 25.425,25.425 0 0 0 -0.081,6.28 25.062,25.062 0 0 0 22.015,22.015 25.338,25.338 0 0 0 6.28,-0.081 A10.046,10.046 0 0 1 209,49.638 V126 a6,6 0 0 1 -6,6 Z";

const cards = [
  {
    icon: "/console-icons/Count.svg",
    watermark: "count" as const,
    label: "总数",
    value: 189,
  },
  {
    icon: "/console-icons/Active.svg",
    watermark: "active" as const,
    label: "活跃",
    value: 90,
  },
  {
    icon: "/console-icons/Disabled.svg",
    watermark: "disabled" as const,
    label: "已禁用",
    value: 389,
    tooltip: "已禁用投放的租赁账户总数",
  },
  {
    icon: "/console-icons/CancelAccount.svg",
    watermark: "cancel" as const,
    label: "已取消",
    value: 10,
    tooltip: "停用已回收与停用的账户",
  },
  {
    icon: "/console-icons/Active NonSpending.svg",
    watermark: "nonSpending" as const,
    label: "活跃未消费",
    value: 11,
    tooltip: "活跃但零广告消费的租赁账户总数",
  },
  {
    icon: "/console-icons/Count.svg",
    watermark: "count" as const,
    label: "总数",
    value: 232,
  },
];

export function StatsCards() {
  return (
    <section className="mb-[18px]">
      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-6">
        <h2 className="m-0 hidden text-base font-normal leading-tight text-[#14171a] lg:col-span-5 lg:block">
          租赁账户
        </h2>
        <h2 className="m-0 hidden text-base font-normal leading-tight text-[#14171a] lg:col-span-1 lg:block">
          已购账户
        </h2>
        <h2 className="m-0 text-base font-normal leading-tight text-[#14171a] lg:hidden">
          租赁与已购账户
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <StatCard key={`${card.label}-${card.value}`} {...card} />
        ))}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  watermark,
  label,
  value,
  tooltip,
}: {
  icon: string;
  watermark: WatermarkType;
  label: string;
  value: number;
  tooltip?: string;
}) {
  return (
    <div className="console-stat-card group relative w-full">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 209 132"
        preserveAspectRatio="xMidYMid meet"
        style={{
          overflow: "visible",
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.06))",
        }}
        aria-hidden="true"
      >
        <path d={CARD_PATH} fill="#fff" />
        <Watermark type={watermark} />
        <circle cx="194" cy="15" r="15" fill="#fff" />
        <image href="/console-icons/arrow.svg" x="189" y="10" width="10" height="10" />
      </svg>

      <div className="absolute inset-0 flex flex-col justify-between p-[7%]">
        <div className="flex items-center gap-2">
          <Image src={icon} alt="" width={30} height={30} />
          <div className="min-w-0 flex-1 leading-tight">
            <span className="text-base font-normal text-[#14171a]">{label}</span>
            {tooltip ? (
              <span className="relative ml-1 inline-flex align-middle">
                <Image
                  src="/console-icons/question-circle-solid.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="opacity-40"
                />
                <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-[220px] -translate-x-1/2 translate-y-1 scale-95 rounded-md bg-[#14171a] px-3 py-2 text-center text-xs font-normal leading-[1.4] text-white opacity-0 shadow-[0_0_20px_rgba(20,23,26,0.1)] transition group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                  {tooltip}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#14171a]" />
                </span>
              </span>
            ) : null}
          </div>
        </div>
        <span className="text-4xl font-bold leading-none text-[#14171a]">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function Watermark({ type }: { type: WatermarkType }) {
  const common = { opacity: 0.05 };

  if (type === "active") {
    return (
      <g transform="translate(120 51)" {...common}>
        <path
          fill="#19a451"
          fillRule="evenodd"
          d="M47.227,3.425a15.343,15.343,0,0,1,19.326,0l5.8,4.72a15.355,15.355,0,0,0,8.077,3.341l7.433.774A15.321,15.321,0,0,1,101.52,25.917l.782,7.441a15.331,15.331,0,0,0,3.341,8.069l4.713,5.8a15.343,15.343,0,0,1,0,19.326l-4.713,5.8a15.355,15.355,0,0,0-3.341,8.077l-.782,7.433A15.321,15.321,0,0,1,87.865,101.52l-7.433.782a15.355,15.355,0,0,0-8.077,3.341l-5.8,4.713a15.343,15.343,0,0,1-19.326,0l-5.8-4.713a15.331,15.331,0,0,0-8.069-3.341l-7.441-.782A15.321,15.321,0,0,1,12.261,87.865l-.774-7.433a15.355,15.355,0,0,0-3.341-8.077l-4.72-5.8a15.343,15.343,0,0,1,0-19.326l4.72-5.8a15.331,15.331,0,0,0,3.341-8.069l.774-7.441A15.321,15.321,0,0,1,25.917,12.261l7.441-.774a15.331,15.331,0,0,0,8.069-3.341ZM85.3,36.147a7.655,7.655,0,0,0-10.836,0L49.228,61.381l-9.908-9.908A7.662,7.662,0,0,0,28.484,62.308L43.81,77.635a7.654,7.654,0,0,0,10.836,0L85.3,46.982a7.655,7.655,0,0,0,0-10.836"
        />
      </g>
    );
  }

  const color =
    type === "disabled" ? "#ff4337" : type === "cancel" ? "#878e99" : "#3b80f7";

  return (
    <g transform="translate(124 66)" {...common}>
      <circle cx="38" cy="38" r="34" fill={color} />
      <path
        d="M38 14c13.255 0 24 10.745 24 24S51.255 62 38 62 14 51.255 14 38 24.745 14 38 14Zm-10 24 6.5 6.5L49 30"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
    </g>
  );
}
