import { AboutPreviewSection } from "@/components/sections/about-preview-section";
import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { EducationExperienceSection } from "@/components/sections/education-experience-section";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section";
import { HeroSection } from "@/components/sections/hero-section";
import { TechnicalSkillsSection } from "@/components/sections/technical-skills-section";
import { ValueStripSection } from "@/components/sections/value-strip-section";

type HomePageContentProps = {
  locale: string;
};

export function HomePageContent({ locale }: HomePageContentProps) {
  return (
    <>
      <HeroSection locale={locale} />
      <ValueStripSection />
      <FeaturedProjectsSection locale={locale} />
      <AboutPreviewSection locale={locale} />
      <TechnicalSkillsSection />
      <EducationExperienceSection />
      <ContactCtaSection locale={locale} />
    </>
  );
}
