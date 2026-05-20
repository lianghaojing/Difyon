"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  authCopy,
  authLocales,
  resolveAuthLocale,
  type AuthLocale,
} from "@/lib/i18n/auth";
import { legalCopy } from "@/lib/i18n/legal";

type LegalPageClientProps = {
  page: "terms" | "privacy";
};

const authIcons = {
  check: "/icons/auth/check.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

export function LegalPageClient({ page }: LegalPageClientProps) {
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useState<AuthLocale>("en");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    setLocale(resolveAuthLocale(window.navigator.language));
  }, []);

  useEffect(() => {
    if (!isLanguageOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        languagePickerRef.current?.contains(target)
      ) {
        return;
      }
      setIsLanguageOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLanguageOpen]);

  const auth = authCopy[locale];
  const copy = legalCopy[locale];
  const isTerms = page === "terms";
  const title = isTerms ? copy.termsTitle : copy.privacyTitle;
  const intro = isTerms ? copy.termsIntro : copy.privacyIntro;
  const sections = isTerms ? copy.terms : copy.privacy;

  return (
    <main className="min-h-dvh bg-white px-5 py-8 font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif] text-[#1a1e26] sm:px-8 md:px-12">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/register"
            className="text-sm font-semibold text-[#f953c6] transition-colors duration-300 ease-out hover:text-[#ec3abb]"
          >
            {copy.backToSignUp}
          </Link>

          <div className="relative" ref={languagePickerRef}>
            <button
              type="button"
              onClick={() => setIsLanguageOpen((value) => !value)}
              className="flex h-10 min-w-[72px] items-center justify-center gap-2 rounded-[12px] border border-[#ecedf3] bg-white px-3 text-xs font-semibold text-[#1a1e26] shadow-[inset_0_-2px_0_#ecedf3] outline-none transition-colors duration-300 ease-out hover:bg-[#f9fafb] focus-visible:border-[#f953c6] focus-visible:ring-2 focus-visible:ring-[#f953c6]/20"
              aria-haspopup="listbox"
              aria-expanded={isLanguageOpen}
            >
              <IconMask src={authIcons.fontSelect} color="#55637f" />
              {auth.languages[locale]}
            </button>

            <motion.div
              className="absolute right-0 top-12 z-20 w-[132px] overflow-hidden rounded-[12px] border border-[#ecedf3] bg-white p-1 shadow-[0_18px_45px_rgba(26,30,38,0.12)]"
              role="listbox"
              initial={false}
              animate={
                isLanguageOpen
                  ? { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }
                  : { opacity: 0, y: -6, scale: 0.98, pointerEvents: "none" }
              }
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {authLocales.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLocale(item);
                    setIsLanguageOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-left text-xs font-semibold transition-colors duration-300 ease-out ${
                    locale === item
                      ? "text-[#f953c6]"
                      : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
                  }`}
                  role="option"
                  aria-selected={locale === item}
                >
                  {auth.languages[item]}
                  {locale === item && (
                    <IconMask src={authIcons.check} color="#f953c6" />
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </header>

        <motion.div
          key={`${page}-${locale}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="mt-8 text-[30px] font-bold leading-tight sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-3 text-sm font-medium text-[#a6b0c4]">
            {copy.lastUpdated}
          </p>
          <p className="mt-5 text-base leading-7 text-[#55637f]">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-[#1a1e26]">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-[#55637f]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function IconMask({ src, color }: { src: string; color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0"
      style={{
        backgroundColor: color,
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
      aria-hidden="true"
    />
  );
}
