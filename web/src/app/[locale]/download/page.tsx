import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export default async function DownloadPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("download");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </header>
      <a
        href="https://play.google.com/store/apps/details?id=com.placeholder.profit"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex w-max"
      >
        {t("cta")}
      </a>
    </div>
  );
}
