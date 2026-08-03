import { AboutPreviewSection } from "@/components/sections/about-preview-section";
import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { EducationExperienceSection } from "@/components/sections/education-experience-section";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section";
import { HeroSection } from "@/components/sections/hero-section";
import { TechnicalSkillsSection } from "@/components/sections/technical-skills-section";
import { Reveal } from "@/components/ui/reveal";

type HomePageContentProps = {
  locale: string;
};

export function HomePageContent({ locale }: HomePageContentProps) {
  return (
    <>
      <HeroSection locale={locale} />
      <Reveal>
        <FeaturedProjectsSection locale={locale} />
      </Reveal>
      <Reveal>
        <AboutPreviewSection locale={locale} />
      </Reveal>
      <Reveal delay="short">
        <TechnicalSkillsSection />
      </Reveal>
      <Reveal>
        <EducationExperienceSection />
      </Reveal>
      <Reveal delay="short">
        <ContactCtaSection locale={locale} />
      </Reveal>
    </>
  );
}
