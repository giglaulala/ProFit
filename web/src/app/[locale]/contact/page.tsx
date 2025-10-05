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
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-white/70">{t("subtitle")}</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="mailto:hello@profit.app"
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)]">
                ✉️
              </div>
              <div>
                <h3 className="font-semibold">{c("emailTitle")}</h3>
                <p className="text-sm text-white/70">hello@profit.app</p>
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
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)]">
                💬
              </div>
              <div>
                <h3 className="font-semibold">{c("telegramTitle")}</h3>
                <p className="text-sm text-white/70">{c("telegramDesc")}</p>
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
            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(226_255_0/0.15)] text-[rgb(226_255_0)]">
                📸
              </div>
              <div>
                <h3 className="font-semibold">{c("instagramTitle")}</h3>
                <p className="text-sm text-white/70">{c("instagramDesc")}</p>
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

        <div className="mt-14">
          <h2 className="text-xl font-semibold">{c("faqTitle")}</h2>
          <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
            <details className="group bg-white/[0.03] p-5 open:bg-white/[0.04]">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {c("faq1Q")}
                <span className="ml-4 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm text-white/70">{c("faq1A")}</p>
            </details>
            <details className="group bg-white/[0.03] p-5 open:bg-white/[0.04]">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {c("faq2Q")}
                <span className="ml-4 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm text-white/70">{c("faq2A")}</p>
            </details>
            <details className="group bg-white/[0.03] p-5 open:bg-white/[0.04]">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {c("faq3Q")}
                <span className="ml-4 text-white/40 transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm text-white/70">{c("faq3A")}</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
