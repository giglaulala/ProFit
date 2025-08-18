import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export default async function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("pricing");
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold">{t("monthly")}</h2>
          <p className="mt-2 text-white/80">$7.99 / mo</p>
          <button className="btn-primary mt-4">Choose</button>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">{t("yearly")}</h2>
          <p className="mt-2 text-white/80">$59.99 / yr</p>
          <button className="btn-primary mt-4">Choose</button>
        </div>
      </div>
    </div>
  );
}
