"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: string) {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      parts[0] = target;
    }
    const nextPath = (parts.length ? `/${parts.join("/")}` : `/${target}`) as Route;
    router.push(nextPath);
  }

  return (
    <div className="flex gap-1.5 text-xs sm:gap-2">
      <button onClick={() => switchTo("en")} className={btn(locale === "en")}>
        EN
      </button>
      <span className="text-white/40">/</span>
      <button onClick={() => switchTo("ka")} className={btn(locale === "ka")}>
        KA
      </button>
    </div>
  );
}

function btn(active: boolean) {
  return `px-1.5 py-0.5 rounded text-xs transition sm:px-2 sm:py-1 ${
    active ? "bg-primary text-black font-medium" : "text-white/80 hover:text-primary"
  }`;
}
