import { ConsoleSectionPage } from "@/components/console/console-section-page";

const columns = [
  { label: "流水号", key: "id" },
  { label: "类型", key: "type" },
  { label: "金额", key: "amount" },
  { label: "状态", key: "status" },
  { label: "关联账户", key: "account" },
  { label: "提交人", key: "owner" },
  { label: "时间", key: "updatedAt" },
];

const rows = [
  {
    id: "W20260701001",
    type: "充值",
    amount: "+5,000.00 USD",
    status: "已通过",
    account: "US-App-Scale-01",
    owner: "haojing.liang",
    updatedAt: "2026-07-01 11:08",
  },
  {
    id: "W20260701002",
    type: "转账",
    amount: "-1,200.00 USD",
    status: "处理中",
    account: "JP-Game-Test-02",
    owner: "ops.cn",
    updatedAt: "2026-07-01 10:35",
  },
  {
    id: "W20260630018",
    type: "退款",
    amount: "+320.00 USD",
    status: "已通过",
    account: "EU-Ecom-Retarget",
    owner: "finance",
    updatedAt: "2026-06-30 16:20",
  },
];

export default function ConsoleWalletPage() {
  return (
    <ConsoleSectionPage
      title="钱包"
      description="查看余额、充值、转账与资金流水"
      metrics={[
        { label: "可用余额", value: "13,731.72" },
        { label: "冻结金额", value: "2,180.00" },
        { label: "本月充值", value: "28,600.00" },
        { label: "待处理", value: "3" },
      ]}
      columns={columns}
      rows={rows}
    />
  );
}
