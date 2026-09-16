import React from "react";
import {
  Navbar,
  Hero,
  AboutSection,
  ServicesSection,
  RegulationsSection,
  EducationSection,
  CareerSection,
  ContactSection,
  Footer,
  FloatingWhatsAppCTA,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      {/* 1. Header / Navigation */}
      <Navbar />

      {/* 2. Main Landing Page Sections */}
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <ServicesSection />
        <RegulationsSection />
        <EducationSection />
        <CareerSection />
        <ContactSection />
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA />
    </div>
  );
}
