import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { StatsBar } from "@/components/landing/StatsBar";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <ProductPreview />
      <FeatureGrid />
      <StatsBar />
      <HowItWorks />
      <FinalCta />
      <MarketingFooter />
    </>
  );
}
