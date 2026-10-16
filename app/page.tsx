import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { Features, FinalCta, HowItWorks, Introduction, SiteFooter, SubjectsSection } from "@/components/marketing/sections";
import { AiShowcase, AnalyticsShowcase, ExamShowcase, TryAQuestion } from "@/components/marketing/showcases";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Introduction />
        <Features />
        <SubjectsSection />
        <TryAQuestion />
        <AiShowcase />
        <AnalyticsShowcase />
        <ExamShowcase />
        <HowItWorks />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
