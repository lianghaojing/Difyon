import { ConsoleSectionPage } from "@/components/console/console-section-page";

const columns = [
  { label: "Create At", key: "createdAt" },
  { label: "Account ID", key: "id" },
  { label: "Account Name", key: "name" },
  { label: "BM ID", key: "bmId" },
  { label: "Timezone", key: "timezone" },
  { label: "Delivery Status", key: "status" },
  { label: "Total TopupBalance", key: "balance", align: "right" as const },
  { label: "Account Consumption", key: "spend", align: "right" as const },
];

const filters = [
  { label: "Create At", key: "createdAt", type: "date" as const },
  { label: "Delivery Status", key: "status", type: "select" as const },
  { label: "Account ID", key: "id", placeholder: "Account ID" },
  { label: "Account Name", key: "name", placeholder: "Account Name" },
  { label: "Timezone", key: "timezone", type: "select" as const },
  { label: "Binding Status", key: "bindingStatus", type: "select" as const },
];

const rows = [
  {
    createdAt: "2026-07-01 10:24:36",
    id: "202509080010049",
    name: "US-App-Scale-01",
    bmId: "BM-88492011",
    timezone: "UTC-08:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "4,280.20 USD",
    spend: "892.11 USD",
  },
  {
    createdAt: "2026-07-01 09:18:12",
    id: "202509021441",
    name: "JP-Game-Test-02",
    bmId: "BM-77410352",
    timezone: "UTC+09:00",
    bindingStatus: "Pending",
    status: "处理中",
    balance: "1,738.00 USD",
    spend: "233.50 USD",
  },
  {
    createdAt: "2026-06-30 17:42:08",
    id: "1222286499840994",
    name: "EU-Ecom-Retarget",
    bmId: "BM-52904817",
    timezone: "UTC+01:00",
    bindingStatus: "Unbound",
    status: "已禁用",
    balance: "0.00 USD",
    spend: "0.00 USD",
  },
  {
    createdAt: "2026-06-30 15:16:44",
    id: "1539297584096955",
    name: "KR-Brand-Launch",
    bmId: "BM-68391744",
    timezone: "UTC+09:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "6,904.33 USD",
    spend: "1,024.88 USD",
  },
  {
    createdAt: "2026-06-30 13:05:29",
    id: "202508290771",
    name: "SEA-Utility-Install",
    bmId: "BM-43012885",
    timezone: "UTC+08:00",
    bindingStatus: "Pending",
    status: "异常",
    balance: "184.00 USD",
    spend: "0.00 USD",
  },
  {
    createdAt: "2026-06-29 18:44:03",
    id: "202508260032",
    name: "US-Finance-Test",
    bmId: "BM-12094863",
    timezone: "UTC-05:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "2,420.75 USD",
    spend: "610.24 USD",
  },
  {
    createdAt: "2026-06-29 12:30:51",
    id: "202508210998",
    name: "BR-Ecom-Scale",
    bmId: "BM-90218450",
    timezone: "UTC-03:00",
    bindingStatus: "Pending",
    status: "处理中",
    balance: "930.00 USD",
    spend: "104.12 USD",
  },
  {
    createdAt: "2026-06-28 20:11:17",
    id: "202508180602",
    name: "MX-Game-Reactivation",
    bmId: "BM-67124590",
    timezone: "UTC-06:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "7,811.60 USD",
    spend: "1,308.90 USD",
  },
  {
    createdAt: "2026-06-28 16:09:40",
    id: "202508140455",
    name: "CA-Subscription-Core",
    bmId: "BM-31880564",
    timezone: "UTC-08:00",
    bindingStatus: "Unbound",
    status: "已禁用",
    balance: "0.00 USD",
    spend: "0.00 USD",
  },
  {
    createdAt: "2026-06-27 14:57:22",
    id: "202508110224",
    name: "AU-Ecom-Creative",
    bmId: "BM-71033925",
    timezone: "UTC+10:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "3,776.18 USD",
    spend: "487.66 USD",
  },
  {
    createdAt: "2026-06-27 09:36:05",
    id: "202508070119",
    name: "DE-App-Retention",
    bmId: "BM-56209318",
    timezone: "UTC+01:00",
    bindingStatus: "Pending",
    status: "处理中",
    balance: "1,120.00 USD",
    spend: "92.45 USD",
  },
  {
    createdAt: "2026-06-26 17:50:33",
    id: "202508030088",
    name: "FR-Fashion-Prospect",
    bmId: "BM-88210347",
    timezone: "UTC+01:00",
    bindingStatus: "Bound",
    status: "正常",
    balance: "5,606.42 USD",
    spend: "774.19 USD",
  },
];

export default function ConsoleAccountsPage() {
  return (
    <ConsoleSectionPage
      title="账户"
      description="管理广告账户状态、余额、消耗与负责人"
      metrics={[
        { label: "账户总数", value: "189" },
        { label: "正常账户", value: "90" },
        { label: "处理中", value: "12" },
        { label: "异常账户", value: "7" },
      ]}
      columns={columns}
      rows={rows}
      filters={filters}
      showSummary={false}
    />
  );
}
