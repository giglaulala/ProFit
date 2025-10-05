import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function ProductPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("product");
  const p = await getTranslations("productPage");
  return (
    <section className="relative overflow-hidden">
      {/* Background accents (distinct pattern) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-6rem] h-80 w-80 -translate-x-1/2 rounded-full bg-[rgb(226_255_0/0.12)] blur-3xl" />
        <div className="absolute bottom-[-6rem] right-10 h-72 w-72 rounded-full bg-[rgb(226_255_0/0.08)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        {/* Split hero */}
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-xl text-white/70">{t("subtitle")}</p>

            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {p("heroBullet1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {p("heroBullet2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                  ✓
                </span>{" "}
                {p("heroBullet3")}
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-[rgb(226_255_0/0.18)] to-[rgb(226_255_0/0.1)] blur-2xl" />
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
              <div className="overflow-hidden rounded-xl border border-white/10">
                <video
                  src="/assets/videos/bench.mp4"
                  controls
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Zig-zag features */}
        <div className="mt-20 space-y-16">
          {/* Feature 1 */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/assets/images/gym.png"
                  alt="Programs"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold">{p("programsTitle")}</h3>
              <p className="mt-2 text-white/70">{p("programsDesc")}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("programsBullet1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("programsBullet2")}
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">{p("insightsTitle")}</h3>
              <p className="mt-2 text-white/70">{p("insightsDesc")}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("insightsBullet1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("insightsBullet2")}
                </li>
              </ul>
            </div>
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/assets/images/muscles.png"
                  alt="Insights"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/assets/images/shoulder.png"
                  alt="Form"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold">{p("formTitle")}</h3>
              <p className="mt-2 text-white/70">{p("formDesc")}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("formBullet1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                    ✓
                  </span>{" "}
                  {p("formBullet2")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Steps strip */}
        <div className="mt-20 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <ol className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
            <li className="rounded-xl bg-white/[0.03] p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                1
              </div>
              {p("step1")}
            </li>
            <li className="rounded-xl bg-white/[0.03] p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                2
              </div>
              {p("step2")}
            </li>
            <li className="rounded-xl bg-white/[0.03] p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                3
              </div>
              {p("step3")}
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
