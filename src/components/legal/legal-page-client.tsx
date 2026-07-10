"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import {
  authCopy,
  authLocales,
  type AuthLocale,
} from "@/lib/i18n/auth";
import { getInitialAuthLocale, persistAuthLocale } from "@/lib/auth-locale-client";
import { legalCopy } from "@/lib/i18n/legal";

type LegalPageClientProps = {
  page: "terms" | "privacy";
};

const authIcons = {
  brandLogo: "/icons/auth/brand-logo.svg",
  check: "/icons/auth/check.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

export function LegalPageClient({ page }: LegalPageClientProps) {
  const pathname = usePathname();
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useState<AuthLocale>("en");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    setLocale(getInitialAuthLocale());
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
  const documentLinks = [
    {
      href: "/terms",
      label: copy.termsTitle,
      active: pathname === "/terms",
    },
    {
      href: "/privacy",
      label: copy.privacyTitle,
      active: pathname === "/privacy",
    },
  ];

  return (
    <main className="min-h-dvh bg-white font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif] text-[#1a1e26]">
      <header className="border-b border-[#ecedf3]">
        <div className="mx-auto flex h-[78px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 md:px-12">
          <Link
            href="/register"
            className="inline-flex items-center"
            aria-label="Difyon"
          >
            <Image
              src={authIcons.brandLogo}
              alt="Difyon"
              width={595}
              height={162}
              className="h-6 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
                      persistAuthLocale(item);
                      setIsLanguageOpen(false);
                    }}
                    className={`flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-left text-xs font-semibold transition-colors duration-300 ease-out ${
                      locale === item
                        ? "text-[#f953c6]"
                        : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
                    }`}
                    role="option"
                    aria-selected={locale === item}
                    tabIndex={isLanguageOpen ? 0 : -1}
                  >
                    {auth.languages[item]}
                    {locale === item && (
                      <IconMask src={authIcons.check} color="#f953c6" />
                    )}
                  </button>
                ))}
              </motion.div>
            </div>

            <AuthHeaderLink href="/login">{auth.login}</AuthHeaderLink>
            <AuthHeaderLink href="/register" primary>
              {auth.signUp}
            </AuthHeaderLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 md:px-12 md:py-14">
        <motion.div
          key={`${page}-${locale}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        >
          <LayoutGroup id="legal-document-switch">
            <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <aside>
              <div className="sticky top-8 border-l border-[#ecedf3] pl-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#a6b0c4]">
                  {copy.legalLabel}
                </p>
                <nav className="grid gap-2 sm:max-w-[420px] lg:block lg:space-y-2">
                  {documentLinks.map((item) => (
                    <LegalDocumentLink
                      key={item.href}
                      href={item.href}
                      active={item.active}
                    >
                      {item.label}
                    </LegalDocumentLink>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="max-w-[820px]">
              <section className="border-b border-[#ecedf3] pb-10 md:pb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f953c6]">
                  {copy.legalLabel}
                </p>
                <h1 className="mt-4 text-[40px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[52px]">
                  {title}
                </h1>
                <p className="mt-5 text-[17px] font-medium leading-8 text-[#55637f]">
                  {intro}
                </p>
                <p className="mt-6 text-sm font-semibold text-[#a6b0c4]">
                  {copy.lastUpdated}
                </p>
              </section>

              <div className="mt-10 space-y-11">
                {sections.map((section) => (
                  <section
                    key={section.title}
                    id={toSectionId(section.title)}
                    className="scroll-mt-8 border-b border-[#f0f1f5] pb-10 last:border-b-0"
                  >
                    <h2 className="text-[22px] font-bold leading-tight tracking-[-0.025em] text-[#1a1e26]">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-[15px] font-medium leading-8 text-[#55637f]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
            </div>
          </LayoutGroup>
        </motion.div>
      </div>
    </main>
  );
}

function AuthHeaderLink({
  href,
  primary = false,
  children,
}: {
  href: string;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`hidden h-10 items-center justify-center rounded-[12px] px-4 text-sm font-bold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f953c6]/20 sm:inline-flex ${
        primary
          ? "bg-[#f953c6] text-white hover:bg-[#e949b6]"
          : "text-[#55637f] hover:text-[#f953c6]"
      }`}
    >
      {children}
    </Link>
  );
}

function LegalDocumentLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative block overflow-hidden rounded-[10px] px-3 py-2 text-sm font-semibold leading-5 transition-colors duration-300 ease-out ${
        active
          ? "text-[#f953c6]"
          : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="legal-document-active"
          className="absolute inset-0 rounded-[10px] bg-[#ffedf9]"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
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

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}
