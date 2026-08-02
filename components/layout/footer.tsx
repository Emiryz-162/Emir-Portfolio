import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SocialButton } from "@/components/ui/social-button";
import { profile } from "@/data/profile";
import { socialLinks } from "@/data/social-links";

export async function Footer() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/88 py-8">
      <Container className="flex flex-col gap-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p>
            © {year} {profile.shortName}
          </p>
          <p className="mt-1">
            {profile.role}. {t("builtBy")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <SocialButton
              key={link.key}
              label={t(`social.${link.key}`)}
              href={link.href}
              iconKey={link.key}
              compact
            />
          ))}
        </div>
      </Container>
    </footer>
  );
}
