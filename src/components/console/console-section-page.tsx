import {
  ConsoleDataTable,
  type ConsoleTableFilter,
  type ConsoleTableColumn,
  type ConsoleTableRow,
} from "@/components/console/console-data-table";

type Metric = {
  label: string;
  value: string;
  tone?: "blue" | "green" | "red" | "gray";
};

export function ConsoleSectionPage({
  title,
  description,
  metrics,
  columns,
  rows,
  filters,
  showSummary = true,
}: {
  title: string;
  description: string;
  metrics: Metric[];
  columns: ConsoleTableColumn[];
  rows: ConsoleTableRow[];
  filters?: ConsoleTableFilter[];
  showSummary?: boolean;
}) {
  return (
    <>
      {showSummary ? (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="m-0 text-[18px] font-bold leading-tight text-[#14171a]">
                {title}
              </h1>
              <p className="mt-1 text-xs leading-tight text-[#878e99]">
                {description}
              </p>
            </div>
            <button className="h-9 rounded-md bg-[#3b80f7] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(59,128,247,0.22)] transition hover:bg-[#2f6fe0]">
              新建
            </button>
          </div>

          <section className="mb-[18px] grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg bg-white px-4 py-4 shadow-[0_0_20px_rgba(0,0,0,0.06)]"
              >
                <div className="text-xs font-medium text-[#878e99]">
                  {metric.label}
                </div>
                <div className="mt-2 text-2xl font-bold leading-none text-[#14171a]">
                  {metric.value}
                </div>
              </div>
            ))}
          </section>
        </>
      ) : null}

      <ConsoleDataTable
        title={title}
        columns={columns}
        rows={rows}
        filters={filters}
      />
    </>
  );
}
