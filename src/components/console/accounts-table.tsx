"use client";

import { useState } from "react";

interface AccountRow {
  id: number;
  createAt: string;
  accountId: string;
  accountName: string;
  bmId: string;
  timezone: string;
  deliveryStatus: string;
  totalTopup: string;
  balance: string;
}

const rows: AccountRow[] = [
  {
    id: 1,
    createAt: "2026-06-18 17:59:58",
    accountId: "2026061800...",
    accountName: "账户名称002",
    bmId: "--",
    timezone: "GMT-1",
    deliveryStatus: "Others",
    totalTopup: "$0.00",
    balance: "$0.00",
  },
  {
    id: 2,
    createAt: "2026-06-18 18:07:29",
    accountId: "23124312",
    accountName: "",
    bmId: "--",
    timezone: "GMT+1",
    deliveryStatus: "Others",
    totalTopup: "$0.00",
    balance: "$0.00",
  },
];

const tabs = ["租赁账户列表", "已购账户列表", "账户消费记录"];

const columns = [
  { key: "createAt", label: "创建时间", sortable: true },
  { key: "accountId", label: "账户 ID", sortable: true },
  { key: "accountName", label: "账户名称" },
  { key: "bmId", label: "BM ID" },
  { key: "timezone", label: "时区" },
  { key: "deliveryStatus", label: "投放状态" },
  { key: "totalTopup", label: "累计充值", sortable: true },
  { key: "balance", label: "余额" },
  { key: "action", label: "操作" },
];

export function AccountsTable() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selected, setSelected] = useState<number[]>([]);
  const [pageSize, setPageSize] = useState(20);

  const allSelected = selected.length === rows.length && rows.length > 0;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
  const toggleOne = (id: number) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-[30px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="whitespace-nowrap border-b-[3px] bg-transparent pb-1.5 text-base transition-colors"
                style={{
                  color: isActive ? "#14171a" : "#878e99",
                  borderColor: isActive ? "#3b80f7" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md bg-[#3b80f7] px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
            + 申请开户
          </button>
          <button className="rounded-md border border-[#e0e0e6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#14171a] transition-opacity hover:opacity-90">
            批量操作
          </button>
        </div>
      </div>

      <section className="rounded-lg bg-white p-[18px] shadow-[0_0_20px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex h-9 items-center gap-2 rounded-md border border-[#e0e0e6] px-3 text-[13px] text-[#14171a]">
            <span className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-[#878e99]">
              创建时间
            </span>
            <span>2025-07-01</span>
            <span className="text-[#878e99]">~</span>
            <span>2026-06-30</span>
            <CalendarIcon />
          </div>

          <input
            placeholder="账户 ID"
            className="h-9 w-[180px] rounded-md border border-[#e0e0e6] px-3 text-[13px] text-[#14171a] outline-none placeholder:text-[#878e99]"
          />

          <FilterSelect label="绑定状态" options={["已绑定", "未绑定"]} />
          <FilterSelect label="投放状态" options={["活跃", "其他"]} />

          <button className="flex h-9 items-center gap-1.5 rounded-md border border-[#3b80f7] bg-white px-3.5 text-[13px] font-medium text-[#3b80f7]">
            <SearchIcon />
            搜索
          </button>

          <IconButton label="筛选">
            <FilterIcon />
          </IconButton>
          <IconButton label="下载">
            <DownloadIcon />
          </IconButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f4] text-left font-normal text-[#878e99]">
                <th className="w-9 px-2 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="accent-[#3b80f7]"
                    aria-label="全选账户"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-2 py-3 text-left font-normal"
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {column.sortable ? <SortIcon /> : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-[#f0f0f4] text-[#14171a]">
                <td className="px-2 py-3.5" />
                <td className="px-2 py-3.5 font-medium">Sum</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
                <td className="px-2 py-3.5">$0.00</td>
                <td className="px-2 py-3.5">$0.00</td>
                <td className="px-2 py-3.5 text-[#878e99]">--</td>
              </tr>

              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#f0f0f4] text-[#14171a]">
                  <td className="px-2 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleOne(row.id)}
                      className="accent-[#3b80f7]"
                      aria-label={`选择 ${row.accountId}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5">{row.createAt}</td>
                  <td className="px-2 py-3.5">
                    <span className="inline-flex items-center gap-1">
                      <CopyIcon />
                      {row.accountId}
                      <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#19a451] text-[9px] text-white">
                        ✓
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-3.5">
                    <span className="inline-flex items-center gap-1">
                      <EditIcon />
                      {row.accountName}
                    </span>
                  </td>
                  <td className="px-2 py-3.5 text-[#878e99]">{row.bmId}</td>
                  <td className="px-2 py-3.5">{row.timezone}</td>
                  <td className="px-2 py-3.5">
                    <span className="rounded bg-[#f4ecfb] px-2.5 py-1 text-xs text-[#8b5cf6]">
                      {row.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-2 py-3.5">{row.totalTopup}</td>
                  <td className="px-2 py-3.5">
                    <span className="inline-flex items-center gap-1">
                      <RefreshIcon />
                      {row.balance}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5">
                    <div className="flex items-center gap-2 text-[#3b80f7]">
                      <button>充值</button>
                      <button>提现</button>
                      <button>取消</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-[13px] text-[#14171a]">
          <span className="text-[#878e99]">共 {rows.length} 条</span>
          <PaginationButton>‹</PaginationButton>
          <button className="h-7 w-7 rounded border border-[#3b80f7] bg-white text-[#3b80f7]">
            1
          </button>
          <PaginationButton>›</PaginationButton>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-7 rounded border border-[#e0e0e6] bg-white px-2 text-[13px] outline-none"
          >
            <option value={10}>10 / 页</option>
            <option value={20}>20 / 页</option>
            <option value={50}>50 / 页</option>
          </select>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <select
      defaultValue=""
      className="h-9 w-[180px] rounded-md border border-[#e0e0e6] bg-white px-3 text-[13px] text-[#878e99] outline-none"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e0e0e6] bg-white text-[#878e99]"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function PaginationButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="h-7 w-7 rounded border border-[#e0e0e6] bg-white text-[#878e99]">
      {children}
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-[#878e99]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L14 13.414V19a1 1 0 0 1-.553.894l-4 2A1 1 0 0 1 8 21v-7.586L3.293 6.707A1 1 0 0 1 3 6V4Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5m0 0 5-5m-5 5V4" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 9 4-4 4 4m0 6-4 4-4-4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
    </svg>
  );
}
