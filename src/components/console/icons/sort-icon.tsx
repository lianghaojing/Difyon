export type SortDirection = "asc" | "desc" | null;

export function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M7.29289 1.39645C7.61948 0.867851 8.38052 0.867852 8.70711 1.39645L11.3719 5.70944C11.719 6.27126 11.3197 7 10.6648 7H5.33519C4.68025 7 4.28096 6.27126 4.62808 5.70944L7.29289 1.39645Z"
        fill={direction === "asc" ? "#55637F" : "#ECEDF3"}
      />
      <path
        d="M7.29289 14.6036C7.61949 15.1321 8.38052 15.1321 8.70711 14.6036L11.3719 10.2906C11.719 9.72874 11.3198 9 10.6648 9H5.33519C4.68025 9 4.28096 9.72874 4.62808 10.2906L7.29289 14.6036Z"
        fill={direction === "desc" ? "#55637F" : "#ECEDF3"}
      />
    </svg>
  );
}
