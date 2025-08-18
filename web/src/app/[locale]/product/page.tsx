import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function ProductPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations("product");
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {["bench.mp4", "dumbbellfly.mp4", "pushups.mp4"].map((video, idx) => (
          <div className="card" key={idx}>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg ring-1 ring-white/10">
              <video
                src={`/assets/videos/${video}`}
                controls
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3 text-sm text-white/70">
              Guided workout demo
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {["gym.png", "muscles.png", "shoulder.png"].map((image, idx) => (
          <div className="card" key={idx}>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image
                src={`/assets/images/${image}`}
                alt="Feature"
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 text-sm text-white/70">Feature highlight</div>
          </div>
        ))}
      </div>
    </div>
  );
}
