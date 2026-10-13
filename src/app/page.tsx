import { Hero } from "@/components/home/hero";
import { StudioHighlights } from "@/components/home/studio-highlights";
import { Features } from "@/components/home/features";
import { GallerySection } from "@/components/home/gallery-section";
import { TeachersSection } from "@/components/home/teachers-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { LocationSection } from "@/components/home/location-section";
import { CtaBand } from "@/components/home/cta-band";

export default function Home() {
  return (
    <>
      <Hero />
      <StudioHighlights />
      <Features />
      <GallerySection />
      <TeachersSection />
      <HowItWorks />
      <LocationSection />
      <CtaBand />
    </>
  );
}
