import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function DownloadPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("download");
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgb(226_255_0/0.2)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[rgb(226_255_0/0.18)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(226,255,0,0.12),transparent),radial-gradient(50%_40%_at_100%_100%,rgba(226,255,0,0.10),transparent)]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        {/* Text + CTA card */}
        <div className="space-y-6">
          <header className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-wider text-white/70 backdrop-blur sm:px-3">
              APK Download
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-sm text-white/70 sm:text-base">
              {t("subtitle")}
            </p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs text-white/70 sm:text-sm">
                  Android .apk • ~190MB
                </p>
                <p className="text-xs text-white/50">
                  If prompted, allow installs from your browser.
                </p>
              </div>

              <a
                href="https://github.com/giglaulala/ProFit/releases/download/v1.0.1/ProFit-v1.apk"
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(226_255_0)] px-5 py-2.5 text-sm font-medium text-black shadow-lg transition hover:translate-y-[-1px] hover:bg-[rgb(226_255_0/0.9)] focus:outline-none focus:ring-2 focus:ring-[rgb(226_255_0/0.35)] sm:w-auto sm:text-base"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-90"
                >
                  <path
                    d="M12 3v12m0 0 4-4m-4 4-4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 20h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {t("cta")}
              </a>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-3 text-xs text-white/80 sm:grid-cols-2 sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                ✓
              </span>
              Track workouts and progress
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                ✓
              </span>
              Guided plans with video demos
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                ✓
              </span>
              Offline-friendly APK installation
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(226_255_0/0.2)] text-[rgb(226_255_0)]">
                ✓
              </span>
              No Play Store required
            </li>
          </ul>
        </div>

        {/* Hero image */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-[rgb(226_255_0/0.2)] to-[rgb(226_255_0/0.15)] blur-2xl" />
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <Image
                src="/assets/images/fitness-equipment.jpg"
                alt="ProFit app preview"
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
