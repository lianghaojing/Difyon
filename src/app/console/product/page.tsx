import { ConsoleSectionPage } from "@/components/console/console-section-page";

const columns = [
  { label: "产品 ID", key: "id" },
  { label: "产品名称", key: "name" },
  { label: "类型", key: "type" },
  { label: "状态", key: "status" },
  { label: "账户数", key: "accounts" },
  { label: "负责人", key: "owner" },
  { label: "更新时间", key: "updatedAt" },
];

const rows = [
  {
    id: "P-1001",
    name: "Acctable Rental Account",
    type: "租赁账户",
    status: "已启用",
    accounts: "128",
    owner: "product",
    updatedAt: "2026-07-01 10:12",
  },
  {
    id: "P-1002",
    name: "Owned Account Service",
    type: "已购账户",
    status: "已启用",
    accounts: "61",
    owner: "product",
    updatedAt: "2026-06-29 15:48",
  },
  {
    id: "P-1003",
    name: "Compliance Review",
    type: "审核服务",
    status: "处理中",
    accounts: "24",
    owner: "risk",
    updatedAt: "2026-06-28 18:06",
  },
];

export default function ConsoleProductPage() {
  return (
    <ConsoleSectionPage
      title="产品"
      description="维护账户产品、服务类型与启用状态"
      metrics={[
        { label: "产品总数", value: "8" },
        { label: "已启用", value: "6" },
        { label: "处理中", value: "2" },
        { label: "关联账户", value: "213" },
      ]}
      columns={columns}
      rows={rows}
    />
  );
}
