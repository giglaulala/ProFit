import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

export const metadata: Metadata = {
  title: "ProFit",
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ka" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  const locales = ["en", "ka"];
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Navbar />
      <main className="container py-10">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
