"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { SortIcon, type SortDirection } from "@/components/console/icons/sort-icon";

gsap.registerPlugin(Flip);

export type ConsoleTableColumn = {
  label: string;
  key: string;
  align?: "left" | "right";
  sortable?: boolean;
};

export type ConsoleTableRow = Record<string, string>;

export type ConsoleTableFilter = {
  label: string;
  key: string;
  type?: "text" | "select" | "date";
  placeholder?: string;
  options?: string[];
};

type SortState = {
  key: string;
  direction: Exclude<SortDirection, null>;
} | null;

const pageSizes = [5, 10, 20];

const statusToneStyles = {
  blue: "bg-[#f4f8ff] text-[#3b80f7]",
  green: "bg-[#f3fbf6] text-[#19a451]",
  red: "bg-[#fff6f5] text-[#ff4337]",
  gray: "bg-[#f7f8fa] text-[#5f6773]",
};

const checkboxClass =
  "console-table-checkbox h-4 w-4 appearance-none rounded-[4px] border-2 border-[#ECEDF3] bg-white focus:outline-none";

export function ConsoleDataTable({
  title,
  columns,
  rows,
  primaryKey,
  filters = [],
}: {
  title: string;
  columns: ConsoleTableColumn[];
  rows: ConsoleTableRow[];
  primaryKey?: string;
  filters?: ConsoleTableFilter[];
}) {
  const rowKey = primaryKey || columns[0]?.key || "id";
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(() =>
    columns.map((column) => column.key)
  );
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [draftColumnKeys, setDraftColumnKeys] = useState<string[]>([]);
  const [columnSearch, setColumnSearch] = useState("");
  const [draggedColumnKey, setDraggedColumnKey] = useState<string | null>(null);

  const defaultColumnKeys = useMemo(
    () => columns.map((column) => column.key),
    [columns]
  );
  const visibleColumns = useMemo(() => {
    const knownColumns = new Map(columns.map((column) => [column.key, column]));
    return visibleColumnKeys
      .map((key) => knownColumns.get(key))
      .filter((column): column is ConsoleTableColumn => Boolean(column));
  }, [columns, visibleColumnKeys]);

  const resolvedFilters = useMemo(() => {
    return filters.map((filter) => {
      if (filter.type === "select" && !filter.options) {
        const options = Array.from(
          new Set(rows.map((row) => row[filter.key]).filter(Boolean))
        );
        return { ...filter, options };
      }
      return filter;
    });
  }, [filters, rows]);
  const visibleFilters = resolvedFilters.slice(0, 2);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        columns.some((column) =>
          String(row[column.key] || "")
            .toLowerCase()
            .includes(normalizedQuery)
        );
      const matchesFilters = resolvedFilters.every((filter) => {
        const value = filterValues[filter.key]?.trim();
        if (!value) return true;

        const cell = row[filter.key] || "";
        if (filter.type === "select") return cell === value;
        if (filter.type === "date") return cell.startsWith(value);
        return cell.toLowerCase().includes(value.toLowerCase());
      });

      return matchesQuery && matchesFilters;
    });
  }, [columns, filterValues, query, resolvedFilters, rows]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const leftValue = left[sort.key] || "";
      const rightValue = right[sort.key] || "";
      const comparison = compareCellValues(leftValue, rightValue);
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = sortedRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const visibleKeys = visibleRows.map((row, index) => getRowKey(row, rowKey, index));
  const allVisibleSelected =
    visibleKeys.length > 0 &&
    visibleKeys.every((key) => selectedKeys.includes(key));

  const handleSort = (column: ConsoleTableColumn) => {
    if (column.sortable === false) return;
    setPage(1);
    setSort((current) => {
      if (!current || current.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key: column.key, direction: "desc" };
      }
      return null;
    });
  };

  const toggleVisibleRows = () => {
    setSelectedKeys((current) => {
      if (allVisibleSelected) {
        return current.filter((key) => !visibleKeys.includes(key));
      }
      return Array.from(new Set([...current, ...visibleKeys]));
    });
  };

  const resetFilters = () => {
    setQuery("");
    setFilterValues({});
    setSort(null);
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#f0f1f4] px-4 py-4">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-semibold text-[#1A1E26]">
              {title}列表
            </div>
            <div className="mt-1 text-xs font-medium text-[#55637F]">
              {selectedKeys.length > 0
                ? `已选择 ${selectedKeys.length} 项`
                : `共 ${sortedRows.length} 条记录`}
            </div>
          </div>

          <div className="grid gap-4 rounded-lg bg-white px-0 py-0">
            <FloatingFilterField label="Search" value={query}>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className={floatingFieldInputClass}
                placeholder="ID / Name / BM"
              />
            </FloatingFilterField>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {visibleFilters.map((filter) => (
                <FilterControl
                  key={filter.key}
                  filter={filter}
                  value={filterValues[filter.key] || ""}
                  onChange={(value) => {
                    setFilterValues((current) => ({
                      ...current,
                      [filter.key]: value,
                    }));
                    setPage(1);
                  }}
                />
              ))}
              <button
                onClick={resetFilters}
                className="h-12 rounded-[8px] border border-[#ECEDF3] px-4 text-xs font-semibold text-[#55637F] shadow-[inset_0_-2px_0_#ECEDF3]"
                type="button"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setDraftColumnKeys(visibleColumnKeys);
                  setColumnSearch("");
                  setIsColumnModalOpen(true);
                }}
                className="h-12 rounded-[8px] border border-[#ECEDF3] px-4 text-xs font-semibold text-[#55637F] shadow-[inset_0_-2px_0_#ECEDF3]"
                type="button"
              >
                Columns
              </button>
              <button
                className="h-12 rounded-[8px] border border-[#ECEDF3] px-4 text-xs font-semibold text-[#7b2cff] shadow-[inset_0_-2px_0_#ECEDF3]"
                type="button"
              >
                导出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="h-9">
              <th className="h-9 w-12 px-4 py-0">
                <input
                  aria-label="选择当前页"
                  checked={allVisibleSelected}
                  onChange={toggleVisibleRows}
                  type="checkbox"
                  className={checkboxClass}
                />
              </th>
              {visibleColumns.map((column) => {
                const activeSort = sort?.key === column.key ? sort.direction : null;

                return (
                  <th
                    key={column.key}
                    className={`h-9 px-4 py-0 text-xs font-semibold text-[#55637F] ${
                      column.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`inline-flex items-center gap-1 ${
                        column.sortable === false
                          ? "cursor-default"
                          : "transition hover:text-[#1A1E26]"
                      }`}
                    >
                      {column.label}
                      {column.sortable === false ? null : (
                        <SortIcon direction={activeSort} />
                      )}
                    </button>
                  </th>
                );
              })}
              <th className="h-9 px-4 py-0 text-right text-xs font-semibold text-[#55637F]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, index) => {
                const key = getRowKey(row, rowKey, index);
                const selected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key}
                    className="h-[54px] border-t border-[#f0f1f4]"
                  >
                    <td className="h-[54px] px-4 py-0">
                      <input
                        aria-label={`选择 ${key}`}
                        checked={selected}
                        onChange={() => {
                          setSelectedKeys((current) =>
                            current.includes(key)
                              ? current.filter((item) => item !== key)
                              : [...current, key]
                          );
                        }}
                        type="checkbox"
                        className={checkboxClass}
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`h-[54px] px-4 py-0 text-sm font-medium text-[#1A1E26] ${
                          column.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {column.key === "createdAt" ? (
                          <DateTimeCell value={row[column.key]} />
                        ) : column.key === "status" ? (
                          <StatusBadge value={row[column.key]} />
                        ) : (
                          row[column.key]
                        )}
                      </td>
                    ))}
                    <td className="h-[54px] px-4 py-0 text-right">
                      <button
                        className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#3b80f7]"
                        type="button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-4 py-14 text-center"
                >
                  <div className="text-sm font-semibold text-[#1A1E26]">
                    没有匹配的记录
                  </div>
                  <div className="mt-1 text-xs text-[#55637F]">
                    调整搜索关键词或筛选条件后再试
                  </div>
                  <button
                    onClick={resetFilters}
                    className="mt-4 h-8 rounded-md border border-[#ECEDF3] px-3 text-xs font-semibold text-[#55637F]"
                    type="button"
                  >
                    清除条件
                  </button>
                </td>
              </tr>
            )}
          </tbody>
          </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#f0f1f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-[#55637F]">
          第 {(safePage - 1) * pageSize + (sortedRows.length > 0 ? 1 : 0)}-
          {Math.min(safePage * pageSize, sortedRows.length)} 条，共{" "}
          {sortedRows.length} 条
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="h-8 rounded-md border border-[#ECEDF3] bg-white px-2 text-xs font-semibold text-[#55637F] outline-none"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size} / 页
              </option>
            ))}
          </select>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-8 rounded-md border border-[#ECEDF3] px-3 text-xs font-semibold text-[#55637F] disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
          >
            上一页
          </button>
          <span className="min-w-12 text-center text-xs font-semibold text-[#55637F]">
            {safePage} / {pageCount}
          </span>
          <button
            disabled={safePage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="h-8 rounded-md border border-[#ECEDF3] px-3 text-xs font-semibold text-[#55637F] disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
          >
            下一页
          </button>
        </div>
      </div>
      {isColumnModalOpen ? (
        <ColumnSettingsModal
          columns={columns}
          defaultColumnKeys={defaultColumnKeys}
          draftColumnKeys={draftColumnKeys}
          draggedColumnKey={draggedColumnKey}
          search={columnSearch}
          onSearchChange={setColumnSearch}
          onClose={() => {
            setIsColumnModalOpen(false);
            setDraggedColumnKey(null);
          }}
          onDraftChange={setDraftColumnKeys}
          onDragStart={setDraggedColumnKey}
          onDragOverColumn={(targetKey) => {
            if (!draggedColumnKey || draggedColumnKey === targetKey) return;
            setDraftColumnKeys((current) =>
              reorderKeys(current, draggedColumnKey, targetKey)
            );
          }}
          onReset={() => setDraftColumnKeys(defaultColumnKeys)}
          onApply={() => {
            const nextKeys = draftColumnKeys.length > 0
              ? draftColumnKeys
              : defaultColumnKeys.slice(0, 1);
            setVisibleColumnKeys(nextKeys);
            setSort((current) =>
              current && !nextKeys.includes(current.key) ? null : current
            );
            setIsColumnModalOpen(false);
            setDraggedColumnKey(null);
          }}
        />
      ) : null}
    </section>
  );
}

function ColumnSettingsModal({
  columns,
  defaultColumnKeys,
  draftColumnKeys,
  draggedColumnKey,
  search,
  onSearchChange,
  onClose,
  onDraftChange,
  onDragStart,
  onDragOverColumn,
  onReset,
  onApply,
}: {
  columns: ConsoleTableColumn[];
  defaultColumnKeys: string[];
  draftColumnKeys: string[];
  draggedColumnKey: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onDraftChange: (keys: string[]) => void;
  onDragStart: (key: string | null) => void;
  onDragOverColumn: (targetKey: string) => void;
  onReset: () => void;
  onApply: () => void;
}) {
  const [dragOverColumnKey, setDragOverColumnKey] = useState<string | null>(null);
  const selectedListRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    if (!flipStateRef.current) return;

    Flip.from(flipStateRef.current, {
      duration: 1.8,
      ease: "power1.inOut",
      absolute: false,
      nested: true,
    });
    flipStateRef.current = null;
  }, [draftColumnKeys]);

  const normalizedSearch = search.trim().toLowerCase();
  const selectedColumns = draftColumnKeys
    .map((key) => columns.find((column) => column.key === key))
    .filter((column): column is ConsoleTableColumn => Boolean(column));
  const availableColumns = columns.filter((column) =>
    column.label.toLowerCase().includes(normalizedSearch)
  );

  const toggleColumn = (key: string) => {
    if (draftColumnKeys.includes(key)) {
      if (draftColumnKeys.length <= 1) return;
      onDraftChange(draftColumnKeys.filter((item) => item !== key));
      return;
    }
    onDraftChange([...draftColumnKeys, key]);
  };

  return (
    <div className="console-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-contain bg-black/20 px-4">
      <div className="console-modal-panel w-full max-w-[720px] overflow-hidden rounded-[8px] bg-white shadow-[0_24px_80px_rgba(26,30,38,0.18)]">
        <div className="flex h-14 items-center justify-between border-b border-[#ECEDF3] px-6">
          <div className="text-base font-semibold text-[#1A1E26]">
            自定义列
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-[#55637F]"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="grid max-h-[520px] grid-cols-1 overflow-hidden overscroll-contain md:grid-cols-[1fr_1.15fr]">
          <div className="overscroll-contain border-b border-[#ECEDF3] p-6 md:border-b-0 md:border-r">
            <div className="mb-5 text-sm font-semibold text-[#1A1E26]">
              可用列
            </div>
            <FloatingFilterField label="Search" value={search}>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className={floatingFieldInputClass}
                placeholder="Search"
              />
            </FloatingFilterField>

            <div className="mt-5 grid max-h-[336px] gap-3 overflow-y-auto overscroll-contain pr-1">
              {availableColumns.map((column) => {
                const checked = draftColumnKeys.includes(column.key);
                return (
                  <label
                    key={column.key}
                    className="flex h-7 items-center gap-3 text-sm font-medium text-[#1A1E26]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(column.key)}
                      className={checkboxClass}
                    />
                    {column.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-[#f7f8fa] p-6">
            <div className="text-sm font-semibold text-[#1A1E26]">
              已选择 {selectedColumns.length}/{columns.length}
            </div>
            <div className="mt-1 text-xs font-medium text-[#55637F]">
              拖动以重新排序
            </div>

            <div
              ref={selectedListRef}
              className="mt-5 grid max-h-[336px] gap-3 overflow-y-auto overscroll-contain pr-1"
            >
              {selectedColumns.map((column) => (
                <div
                  key={column.key}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", column.key);
                    setDragOverColumnKey(null);
                    onDragStart(column.key);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    if (dragOverColumnKey === column.key) return;
                    if (selectedListRef.current) {
                      flipStateRef.current = Flip.getState(
                        selectedListRef.current.querySelectorAll(
                          ".console-column-item"
                        )
                      );
                    }
                    setDragOverColumnKey(column.key);
                    onDragOverColumn(column.key);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverColumnKey(null);
                    onDragStart(null);
                  }}
                  onDragEnd={() => {
                    setDragOverColumnKey(null);
                    onDragStart(null);
                  }}
                  className={`console-column-item flex h-[46px] items-center gap-3 rounded-[6px] border border-[#ECEDF3] bg-white px-3 text-sm font-medium text-[#1A1E26] ${
                    draggedColumnKey === column.key ? "opacity-50" : ""
                  }`}
                >
                  <span className="cursor-grab text-base leading-none text-[#A6B0C4]">
                    ⋮⋮
                  </span>
                  <span className="min-w-0 flex-1 truncate">{column.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleColumn(column.key)}
                    className="text-lg leading-none text-[#55637F]"
                    aria-label={`移除 ${column.label}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex h-16 items-center justify-end gap-3 border-t border-[#ECEDF3] px-6">
          <button
            type="button"
            onClick={onReset}
            className="h-10 px-3 text-sm font-semibold text-[#7b2cff]"
          >
            重置为默认设置
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 rounded-[8px] bg-[#7b2cff] px-5 text-sm font-semibold text-white"
          >
            应用
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterControl({
  filter,
  value,
  onChange,
}: {
  filter: ConsoleTableFilter;
  value: string;
  onChange: (value: string) => void;
}) {
  if (filter.type === "select") {
    return (
      <FloatingFilterField label={filter.label} value={value}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${floatingFieldInputClass} appearance-none pr-9 ${
            value ? "" : "text-transparent focus:text-[#1A1E26]"
          }`}
        >
          <option value="">{filter.placeholder || filter.label}</option>
          {(filter.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#a6b0c4]">
          ↓
        </span>
      </FloatingFilterField>
    );
  }

  return (
    <FloatingFilterField label={filter.label} value={value}>
      <input
        type={filter.type === "date" ? "date" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${floatingFieldInputClass} ${
          filter.type === "date" ? "pr-9" : ""
        } ${
          filter.type === "date" && !value
            ? "text-transparent focus:text-[#1A1E26]"
            : ""
        }`}
        placeholder={filter.placeholder || filter.label}
      />
      {filter.type === "date" ? (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none text-[#a6b0c4]">
          →
        </span>
      ) : null}
    </FloatingFilterField>
  );
}

const floatingFieldInputClass =
  "peer block h-12 w-full box-border rounded-[8px] border border-[#ECEDF3] bg-white px-4 text-sm font-medium text-[#1A1E26] outline-none transition placeholder:text-transparent focus:border-2 focus:border-[#f953c6] focus:px-[15px]";

function FloatingFilterField({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <label
      className="relative block min-w-0 flex-1 sm:min-w-[240px]"
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      {children}
      <span
        className={`pointer-events-none absolute left-3 bg-white px-1 font-medium transition-all duration-150 ${
          isFloating
            ? "top-[-8px] text-xs text-[#55637F]"
            : "top-1/2 -translate-y-1/2 text-xs text-[#55637F]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "正常" || value === "已通过" || value === "已启用"
      ? "green"
      : value === "异常" || value === "已拒绝" || value === "已禁用"
        ? "red"
        : value === "处理中" || value === "待审核"
          ? "blue"
          : "gray";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusToneStyles[tone]}`}
    >
      {value}
    </span>
  );
}

function DateTimeCell({ value }: { value: string }) {
  const [date, time = ""] = value.split(" ");

  return (
    <span className="flex flex-col justify-center leading-none">
      <span className="text-sm font-medium text-[#1A1E26]">{date}</span>
      <span className="mt-1 text-xs font-medium text-[#55637F]">{time}</span>
    </span>
  );
}

function compareCellValues(left: string, right: string) {
  const leftNumber = parseNumber(left);
  const rightNumber = parseNumber(right);
  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber - rightNumber;
  }

  const leftTime = Date.parse(left.replace(" ", "T"));
  const rightTime = Date.parse(right.replace(" ", "T"));
  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime - rightTime;
  }

  return left.localeCompare(right, "zh-Hans-CN", { numeric: true });
}

function parseNumber(value: string) {
  const normalized = value.replace(/[,+\sA-Z]+/g, "");
  if (!normalized || Number.isNaN(Number(normalized))) return null;
  return Number(normalized);
}

function getRowKey(row: ConsoleTableRow, primaryKey: string, index: number) {
  return row[primaryKey] || `${primaryKey}-${index}`;
}

function reorderKeys(keys: string[], draggedKey: string, targetKey: string) {
  const draggedIndex = keys.indexOf(draggedKey);
  const targetIndex = keys.indexOf(targetKey);
  if (draggedIndex === -1 || targetIndex === -1) return keys;

  const nextKeys = [...keys];
  const [draggedItem] = nextKeys.splice(draggedIndex, 1);
  nextKeys.splice(targetIndex, 0, draggedItem);
  return nextKeys;
}
