import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyUs from "@/components/landing/WhyUs";
import Stats from "@/components/landing/Stats";
import TopAffiliates from "@/components/landing/TopAffiliates";
import LevelSystem from "@/components/landing/LevelSystem";
import CTA from "@/components/landing/CTA";
import JoinAsSeller from "@/components/landing/JoinAsSeller";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="why-us">
          <WhyUs />
        </section>
        <Stats />
        <TopAffiliates />
        <section id="levels">
          <LevelSystem />
        </section>
        <CTA />
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
