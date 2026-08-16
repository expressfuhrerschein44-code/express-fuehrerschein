import { CountriesSection } from "@/components/home/countries-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { HeroSection } from "@/components/home/hero-section";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LicenseClassesSection } from "@/components/home/license-classes-section";
import { PlatformSection } from "@/components/home/platform-section";
import { Program21Section } from "@/components/home/program-21-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { SecuritySection } from "@/components/home/security-section";
import { StatsSection } from "@/components/home/stats-section";
import { WhyExpressSection } from "@/components/home/why-express-section";

/* ==========================================================================
   HOME PAGE
   ========================================================================== */

export default function HomePage() {
  return (
    <div className="ef-page">
      <HomeHeader />

      <main id="main-content">
        <HeroSection />

        <StatsSection />

        <LicenseClassesSection />

        <WhyExpressSection />

        <Program21Section />

        <HowItWorksSection />

        <PlatformSection />

        <SecuritySection />

        <ReviewsSection />

        <CountriesSection />

        <FaqSection />

        <FinalCta />
      </main>

      <HomeFooter />
    </div>
  );
}
