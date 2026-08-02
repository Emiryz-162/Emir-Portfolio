import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { routing } from "@/i18n/routing";
import { getCvAvailability } from "@/lib/cv";
import { createPageMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return createPageMetadata({
    title: t("site.title"),
    description: t("site.description"),
    pathname: "/",
    locale,
  });
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Common" });
  const isCvAvailable = getCvAvailability();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="fixed left-4 top-4 z-[60] -translate-y-20 rounded-[6px] border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("skipToContent")}
            </a>
            <Navbar cvAvailable={isCvAvailable} />
            <main id="main-content" className="flex-1 pt-20" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
