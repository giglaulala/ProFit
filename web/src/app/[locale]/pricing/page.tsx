import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export default async function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("pricing");
  const pr = await getTranslations("pricingPage");
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgb(226_255_0/0.16)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[rgb(226_255_0/0.10)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Monthly */}
          <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur sm:p-6">
            <div className="absolute right-4 top-4 rounded-full bg-[rgb(226_255_0/0.15)] px-2 py-1 text-xs font-medium text-[rgb(226_255_0)] sm:right-6 sm:top-6 sm:px-3">
              {t("monthly")}
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">{pr("starterTitle")}</h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base">{pr("starterDesc")}</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-3xl font-extrabold sm:text-4xl">$7.99</span>
              <span className="mb-1 text-sm text-white/60 sm:text-base">{pr("perMonth")}</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-white/80 sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("starterBullet1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("starterBullet2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("starterBullet3")}
              </li>
            </ul>
            <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(226_255_0)] px-5 py-3 text-sm font-medium text-black shadow-lg transition hover:translate-y-[-1px] hover:bg-[rgb(226_255_0/0.9)] focus:outline-none focus:ring-2 focus:ring-[rgb(226_255_0/0.35)] sm:w-auto sm:text-base">
              {pr("chooseStarter")}
            </button>
          </div>

          {/* Yearly - highlighted */}
          <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur sm:p-6">
            <div className="absolute -top-3 left-4 inline-flex items-center rounded-full bg-[rgb(226_255_0)] px-2 py-1 text-xs font-semibold text-black shadow sm:left-6 sm:px-3">
              {pr("bestValue")}
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">{pr("proTitle")}</h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base">{pr("proDesc")}</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-3xl font-extrabold sm:text-4xl">$59.99</span>
              <span className="mb-1 text-sm text-white/60 sm:text-base">{pr("perYear")}</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-white/80 sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("proBullet1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("proBullet2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("proBullet3")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {pr("proBullet4")}
              </li>
            </ul>
            <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(226_255_0)] px-5 py-3 text-sm font-medium text-black shadow-lg transition hover:translate-y-[-1px] hover:bg-[rgb(226_255_0/0.9)] focus:outline-none focus:ring-2 focus:ring-[rgb(226_255_0/0.35)] sm:w-auto sm:text-base">
              {pr("choosePro")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
