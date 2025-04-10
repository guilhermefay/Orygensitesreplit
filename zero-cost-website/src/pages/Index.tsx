
import React from "react";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Offer from "@/components/Offer";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PriceComparison from "@/components/PriceComparison";
import FloatingChat from "@/components/FloatingChat";
import FloatingContactForm, { FormProvider } from "@/components/contact/FloatingContactForm";
import { Toaster } from "@/components/ui/toaster";
import { PricingConfiguration } from "@/lib/config/pricing";

interface IndexProps {
  pricingConfig?: PricingConfiguration;
}

const Index: React.FC<IndexProps> = ({ pricingConfig }) => {
  return (
    <FormProvider>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Offer />
        <Benefits />
        <PriceComparison />
        <section id="pricing-section">
          <Pricing pricingConfig={pricingConfig} />
        </section>
        <Footer />
        <FloatingChat />
        <Toaster />
      </main>
    </FormProvider>
  );
};

export default Index;
