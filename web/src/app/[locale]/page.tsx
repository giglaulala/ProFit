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
  return (
    <section className="grid gap-8 md:grid-cols-2 items-center">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-white/80">{t("subtitle")}</p>
        <div className="flex gap-4">
          <Link href={`/${params.locale}/download`} className="btn-primary">
            {t("cta")}
          </Link>
        </div>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10">
        <Image
          src="/assets/images/fitness-equipment.jpg"
          alt="Fitness"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
