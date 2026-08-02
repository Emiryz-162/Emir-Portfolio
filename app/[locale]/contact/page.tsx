import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      eyebrow="Contact"
      title="Connection surface"
      description="A future contact form and social links area with a calm, focused layout."
    />
  );
}
