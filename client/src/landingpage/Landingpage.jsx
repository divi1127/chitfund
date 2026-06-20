
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Stats } from './Stats';
import { HowItWorks } from './HowItWorks';
import { ChitPlans } from './ChitPlans';
import { InvestmentPlanner } from './InvestmentPlanner';
import { Features } from './Features';
import { Benefits } from './Benefits';
import { Testimonials } from './Testimonials';
import { FAQ } from './FAQ';
import { ContactForm } from './ContactForm';
import { CTA } from './CTA';
import { Footer } from './Footer';

function Landingpage() {
  const handleNavigate = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-bg-main text-text-primary flex flex-col overflow-x-hidden">
      <Navbar onNavigate={handleNavigate} />

      <main id="main-content" className="relative z-[1]">
        <Hero onNavigate={handleNavigate} />
        <Stats />
        <HowItWorks />
        <ChitPlans />
        <InvestmentPlanner />
        <Features />
        <Benefits />
        <Testimonials />
        <FAQ />
        <ContactForm />
        <CTA onNavigate={handleNavigate} />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default Landingpage;
