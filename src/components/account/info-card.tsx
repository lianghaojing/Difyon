import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
