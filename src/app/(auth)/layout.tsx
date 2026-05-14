export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-[#1a1e26]">
      {children}
    </main>
  );
}
