import { ConsoleSectionPage } from "@/components/console/console-section-page";

const columns = [
  { label: "申请编号", key: "id" },
  { label: "客户", key: "customer" },
  { label: "平台", key: "platform" },
  { label: "申请数量", key: "quantity" },
  { label: "状态", key: "status" },
  { label: "提交人", key: "owner" },
  { label: "提交时间", key: "updatedAt" },
];

const rows = [
  {
    id: "AOR-20260701001",
    customer: "Northstar Apps",
    platform: "Meta",
    quantity: "12",
    status: "待审核",
    owner: "haojing.liang",
    updatedAt: "2026-07-01 11:32",
  },
  {
    id: "AOR-20260630014",
    customer: "Kumo Studio",
    platform: "Google",
    quantity: "6",
    status: "已通过",
    owner: "ops.cn",
    updatedAt: "2026-06-30 14:10",
  },
  {
    id: "AOR-20260629009",
    customer: "Atlas Commerce",
    platform: "TikTok",
    quantity: "4",
    status: "已拒绝",
    owner: "risk",
    updatedAt: "2026-06-29 18:45",
  },
];

export default function ConsoleApplicationOpeningRecordsPage() {
  return (
    <ConsoleSectionPage
      title="申请开户记录"
      description="跟踪开户申请、审核状态与处理进度"
      metrics={[
        { label: "申请总数", value: "42" },
        { label: "待审核", value: "9" },
        { label: "已通过", value: "28" },
        { label: "已拒绝", value: "5" },
      ]}
      columns={columns}
      rows={rows}
    />
  );
}
