import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("contact");
  const c = await getTranslations("contactPage");
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background matching download screen neon */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgb(226_255_0/0.2)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[rgb(226_255_0/0.18)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(226,255,0,0.12),transparent),radial-gradient(50%_40%_at_100%_100%,rgba(226,255,0,0.10),transparent)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-white/70 sm:text-base">{t("subtitle")}</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <a
            href="mailto:hello@profit.app"
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06] sm:p-5"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)] sm:h-10 sm:w-10">
                ✉️
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold sm:text-base">{c("emailTitle")}</h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">hello@profit.app</p>
                <p className="mt-2 text-xs text-white/50">{c("emailDesc")}</p>
              </div>
            </div>
            <span className="pointer-events-none absolute right-5 top-5 text-white/30 transition group-hover:translate-x-0.5">
              →
            </span>
          </a>

          <a
            href="https://t.me/yourchannel"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06] sm:p-5"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)] sm:h-10 sm:w-10">
                💬
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold sm:text-base">{c("telegramTitle")}</h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{c("telegramDesc")}</p>
                <p className="mt-2 text-xs text-white/50">
                  {c("telegramNote")}
                </p>
              </div>
            </div>
            <span className="pointer-events-none absolute right-5 top-5 text-white/30 transition group-hover:translate-x-0.5">
              →
            </span>
          </a>

          <a
            href="https://instagram.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06] sm:p-5"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)] sm:h-10 sm:w-10">
                📸
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold sm:text-base">{c("instagramTitle")}</h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{c("instagramDesc")}</p>
                <p className="mt-2 text-xs text-white/50">
                  {c("instagramNote")}
                </p>
              </div>
            </div>
            <span className="pointer-events-none absolute right-5 top-5 text-white/30 transition group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>

        <div className="mt-10 sm:mt-14">
          <h2 className="text-lg font-semibold sm:text-xl">{c("faqTitle")}</h2>
          <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
            <details className="group bg-white/[0.03] p-4 open:bg-white/[0.04] sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium sm:text-base">
                {c("faq1Q")}
                <span className="ml-4 shrink-0 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-xs text-white/70 sm:text-sm">{c("faq1A")}</p>
            </details>
            <details className="group bg-white/[0.03] p-4 open:bg-white/[0.04] sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium sm:text-base">
                {c("faq2Q")}
                <span className="ml-4 shrink-0 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-xs text-white/70 sm:text-sm">{c("faq2A")}</p>
            </details>
            <details className="group bg-white/[0.03] p-4 open:bg-white/[0.04] sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium sm:text-base">
                {c("faq3Q")}
                <span className="ml-4 shrink-0 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-xs text-white/70 sm:text-sm">{c("faq3A")}</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
