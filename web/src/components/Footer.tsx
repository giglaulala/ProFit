import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-6 text-sm text-white/60">
        © {year} ProFit. {t("rights")}
      </div>
    </footer>
  );
}
