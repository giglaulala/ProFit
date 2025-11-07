"use client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Route } from "next";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}`;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href={base as Route} className="font-semibold">
          ProFit
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href={`${base}` as Route} className={linkClass(pathname === `${base}`)}>
            {t("home")}
          </Link>
          <Link
            href={`${base}/product` as Route}
            className={linkClass(pathname?.startsWith(`${base}/product`))}
          >
            {t("product")}
          </Link>
          <Link
            href={`${base}/pricing` as Route}
            className={linkClass(pathname?.startsWith(`${base}/pricing`))}
          >
            {t("pricing")}
          </Link>
          <Link
            href={`${base}/contact` as Route}
            className={linkClass(pathname?.startsWith(`${base}/contact`))}
          >
            {t("contact")}
          </Link>
          <Link
            href={`${base}/download` as Route}
            className={linkClass(pathname?.startsWith(`${base}/download`))}
          >
            {t("download")}
          </Link>
          <LanguageSwitcher />
        </nav>
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            {isMenuOpen ? (
              <svg
                className="h-6 w-6 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      <nav
        className={`border-t border-white/10 bg-background/95 backdrop-blur transition-all duration-300 ease-in-out md:hidden ${
          isMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="container flex flex-col gap-1 py-3">
          <Link
            href={`${base}` as Route}
            className={mobileLinkClass(pathname === `${base}`)}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("home")}
          </Link>
          <Link
            href={`${base}/product` as Route}
            className={mobileLinkClass(pathname?.startsWith(`${base}/product`))}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("product")}
          </Link>
          <Link
            href={`${base}/pricing` as Route}
            className={mobileLinkClass(pathname?.startsWith(`${base}/pricing`))}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("pricing")}
          </Link>
          <Link
            href={`${base}/contact` as Route}
            className={mobileLinkClass(pathname?.startsWith(`${base}/contact`))}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("contact")}
          </Link>
          <Link
            href={`${base}/download` as Route}
            className={mobileLinkClass(pathname?.startsWith(`${base}/download`))}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("download")}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function linkClass(active?: boolean) {
  return `hover:text-primary transition ${
    active ? "text-primary" : "text-white/80"
  }`;
}

function mobileLinkClass(active?: boolean) {
  return `px-3 py-2 rounded-md text-sm transition ${
    active
      ? "bg-primary/20 text-primary font-medium"
      : "text-white/80 hover:bg-white/10 hover:text-primary"
  }`;
}
