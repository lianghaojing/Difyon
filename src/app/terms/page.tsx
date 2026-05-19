import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-white px-5 py-10 font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif] text-[#1a1e26] sm:px-8 md:px-12">
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/register"
          className="text-sm font-semibold text-[#f953c6] transition-colors duration-300 ease-out hover:text-[#ec3abb]"
        >
          Back to sign up
        </Link>

        <h1 className="mt-8 text-[30px] font-bold leading-tight sm:text-[36px]">
          Terms of Service
        </h1>
        <p className="mt-3 text-base leading-7 text-[#55637f]">
          This is a placeholder for Difyon&apos;s terms of service. Replace this
          page with the final legal copy before public launch.
        </p>
      </div>
    </main>
  );
}
