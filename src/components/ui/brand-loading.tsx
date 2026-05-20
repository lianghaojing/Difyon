import Image from "next/image";

type BrandLoadingProps = {
  label?: string;
};

export function BrandLoading({ label = "加载中" }: BrandLoadingProps) {
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <Image
        src="/icons/auth/brand-loading.svg"
        alt=""
        width={100}
        height={80}
        className="h-20 w-[100px]"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-[#55637f]">{label}</p>
    </div>
  );
}
