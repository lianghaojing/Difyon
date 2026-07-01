import { DailyAdSpend } from "@/components/console/daily-ad-spend";
import { StatsCards } from "@/components/console/stats-cards";

export default function ConsoleDashboardPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="m-0 text-[18px] font-bold leading-tight text-[#14171a]">
          仪表盘
        </h1>
        <p className="mt-1 text-xs leading-tight text-[#878e99]">
          监控账户状态、可用性及广告消费
        </p>
      </div>
      <StatsCards />
      <DailyAdSpend />
    </>
  );
}
