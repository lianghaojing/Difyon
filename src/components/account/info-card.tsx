import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <section className="rounded-[8px] border border-[#ecedf3] bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#1a1e26]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[#55637f]">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
