import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("contact");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </header>
      <a
        href="mailto:hello@profit.app"
        className="btn-primary inline-flex w-max"
      >
        {t("email")}
      </a>
    </div>
  );
}
