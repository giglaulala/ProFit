import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("hero");
  const h = await getTranslations("home");
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background for a distinct look */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        {/* Hero */}
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-lg text-white/80">{t("subtitle")}</p>
            <div className="flex gap-4">
              <Link
                href={`/${params.locale}/download`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(226_255_0)] px-5 py-3 font-medium text-black shadow-lg transition hover:translate-y-[-1px] hover:bg-[rgb(226_255_0/0.9)] focus:outline-none focus:ring-2 focus:ring-[rgb(226_255_0/0.35)]"
              >
                {t("cta")}
              </Link>
              <Link
                href={`/${params.locale}/product`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 font-medium text-white/90 backdrop-blur transition hover:bg-white/[0.06]"
              >
                {h("learnMore")}
              </Link>
            </div>
          </div>
          <div className="relative w-full">
            <div className="mx-auto w-full max-w-xl rotate-1 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
              <Image
                src="/assets/images/fitness-equipment.jpg"
                alt="Fitness"
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm sm:text-base">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-2xl font-extrabold">200k+</div>
            <div className="text-white/60">{h("statsWorkouts")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-2xl font-extrabold">500+</div>
            <div className="text-white/60">{h("statsVideos")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-2xl font-extrabold">4.9★</div>
            <div className="text-white/60">{h("statsRating")}</div>
          </div>
        </div>

        {/* Staggered feature cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:translate-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="font-semibold">{h("featurePlanTitle")}</h3>
            <p className="mt-1 text-sm text-white/70">{h("featurePlanDesc")}</p>
          </div>
          <div className="sm:-translate-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="font-semibold">{h("featureFormTitle")}</h3>
            <p className="mt-1 text-sm text-white/70">{h("featureFormDesc")}</p>
          </div>
          <div className="sm:translate-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <h3 className="font-semibold">{h("featureProgressTitle")}</h3>
            <p className="mt-1 text-sm text-white/70">
              {h("featureProgressDesc")}
            </p>
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur">
          <p className="text-white/80">{h("ctaStripText")}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href={`/${params.locale}/download`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(226_255_0)] px-5 py-2.5 font-medium text-black shadow-lg transition hover:translate-y-[-1px] hover:bg-[rgb(226_255_0/0.9)] focus:outline-none focus:ring-2 focus:ring-[rgb(226_255_0/0.35)]"
            >
              {h("ctaDownload")}
            </Link>
            <Link
              href={`/${params.locale}/pricing`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 font-medium text-white/90 backdrop-blur transition hover:bg-white/[0.06]"
            >
              {h("ctaPricing")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
