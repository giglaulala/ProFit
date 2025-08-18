"use client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href={base} className="font-semibold">
          ProFit
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href={`${base}`} className={linkClass(pathname === `${base}`)}>
            {t("home")}
          </Link>
          <Link
            href={`${base}/product`}
            className={linkClass(pathname?.startsWith(`${base}/product`))}
          >
            {t("product")}
          </Link>
          <Link
            href={`${base}/pricing`}
            className={linkClass(pathname?.startsWith(`${base}/pricing`))}
          >
            {t("pricing")}
          </Link>
          <Link
            href={`${base}/contact`}
            className={linkClass(pathname?.startsWith(`${base}/contact`))}
          >
            {t("contact")}
          </Link>
          <Link
            href={`${base}/download`}
            className={linkClass(pathname?.startsWith(`${base}/download`))}
          >
            {t("download")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

function linkClass(active?: boolean) {
  return `hover:text-primary transition ${
    active ? "text-primary" : "text-white/80"
  }`;
}
