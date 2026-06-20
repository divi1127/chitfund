import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Amit Sharma',
    role: 'Founding Director',
    company: 'Vibrant Textiles Ltd.',
    avatar: 'AS',
    avatarBg: 'from-primary-blue to-dark-blue',
    text: 'I needed ₹5,00,000 urgently to restock raw material inventory before the festival season. By participating in our Gold Chit group auction, I obtained the entire fund pool within 24 hours at a rate far below personal bank loans. Highly recommended!',
    rating: 5,
    badge: 'Business Member',
  },
  {
    name: 'Priya Nair',
    role: 'Principal Engineer',
    company: 'TechNovus Solutions',
    avatar: 'PN',
    avatarBg: 'from-premium-gold to-gold-600',
    text: 'JOD Chits has helped me establish a disciplined savings schedule. Since I don\'t need immediate liquidity, my monthly dividends keep rolling over, effectively boosting my overall yield to 11% annually. It outperforms traditional fixed deposits.',
    rating: 5,
    badge: 'Savings Member',
  },
  {
    name: 'Vikram Seth',
    role: 'Co-Founder & CEO',
    company: 'Seth Realty Partners',
    avatar: 'VS',
    avatarBg: 'from-secondary-blue to-dark-blue',
    text: 'Absolutely seamless operations. Onboarding and KYC verification were completed digitally in 10 minutes. The automated dashboard makes monitoring auctions, dividend distribution, and monthly deadlines extremely simple. Outstanding execution.',
    rating: 5,
    badge: 'Platinum Corporate',
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setProgress(0);
  };
  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const t = testimonials[activeIndex];

  return (
    <section className="section-padding relative bg-section-alt">
      <div className="section-container relative z-10 max-w-5xl">
        <div className="section-header">
          <div className="section-badge"><span>Client Reviews</span></div>
          <h2 className="section-title">Trusted by Thousands of <span className="text-gradient-gold">Savers & Businesses</span></h2>
        </div>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-white border border-border-light rounded-2xl p-8 sm:p-10 shadow-xl relative"
            >
              <Quote className="absolute right-8 top-8 w-20 h-20 text-primary-blue/5 pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${t.avatarBg} flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-xl shrink-0`}>
                  {t.avatar}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-premium-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg text-text-secondary italic leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary">{t.name}</h4>
                      <p className="text-sm text-text-secondary mt-0.5">{t.role} &mdash; <span className="text-text-secondary/70">{t.company}</span></p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success bg-success/5 border border-success/15 px-4 py-2 rounded-full w-fit mx-auto sm:mx-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t.badge}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-10">
          <div className="flex gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setProgress(0); }}
                className={`relative h-2.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                  i === activeIndex ? 'w-10 bg-border-light' : 'w-2.5 bg-border-light hover:bg-premium-gold/30'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              >
                {i === activeIndex && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-gold rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrev} className="p-3 rounded-xl bg-white border border-border-light text-text-secondary hover:text-primary-blue hover:border-premium-gold/30 transition-all cursor-pointer" aria-label="Previous testimonial">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="p-3 rounded-xl bg-white border border-border-light text-text-secondary hover:text-primary-blue hover:border-premium-gold/30 transition-all cursor-pointer" aria-label="Next testimonial">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
