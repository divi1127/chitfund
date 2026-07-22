import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=85',
    title: 'Trusted Community Savings',
    subtitle: 'Join 10,000+ members in India\'s most transparent chit fund platform',
  },
  {
    image: 'https://images.financialexpressdigital.com/2022/10/saving3.jpg',
    title: 'Grow Your Wealth',
    subtitle: 'Earn up to 11% annual dividends with systematic savings',
  },
  {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=85',
    title: 'Digital Transparency',
    subtitle: 'Real-time tracking, instant payouts, and full regulatory compliance',
  },
];

const ticker = [
  { label: 'Active Members', value: '10,000+' },
  { label: 'Funds Managed', value: '₹100 Cr+' },
  { label: 'Active Groups', value: '500+' },
  { label: 'Avg. Dividend Yield', value: '9.8% p.a.' },
  { label: 'Satisfaction Rate', value: '98%' },
];

export const Ticker = () => (
  <div className="bg-primary-blue/4 border-y border-primary-blue/8 py-3 overflow-hidden">
    <div className="flex gap-16 animate-[ticker_20s_linear_infinite] whitespace-nowrap w-max">
      {[...ticker, ...ticker].map((item, i) => (
        <span key={i} className="text-sm font-semibold text-text-secondary inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-premium-gold" />
          {item.label}: <span className="text-primary-blue">{item.value}</span>
        </span>
      ))}
    </div>
  </div>
);

export const Hero = ({ onNavigate }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let count = 0;
    slides.forEach((s) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        count++;
        if (count === slides.length) setLoaded(true);
      };
      img.src = s.image;
    });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(next, 4500);
    return () => clearInterval(intervalRef.current);
  }, [isHovered, next]);

  return (
    <section id="home" className="relative flex items-center pt-20 pb-16 overflow-hidden bg-white" style={{ minHeight: '100svh' }}>
      <div className="absolute inset-0 pointer-events-none" />

      <div className="section-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center relative">
          <div className="flex flex-col items-start">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-[2.2rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.08] tracking-tight text-text-primary mb-6 mt-10"
            >
              Grow Your Wealth with{' '}
              <span className="text-gradient-blue">Trusted</span>{' '}
              <span className="relative text-gradient-gold">
                Chit Funds
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" preserveAspectRatio="none">
                  <path d="M0 5 Q100 0 200 5" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-lg text-text-secondary leading-relaxed mb-9 max-w-lg"
            >
              Save systematically, access funds instantly, and earn competitive dividends. NVS CHIT ENTERPRISES brings next-gen digital transparency to India's most trusted savings tradition.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <button
                onClick={() => onNavigate('contact')}
                className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-premium-gold/20"
              >
                Start Saving Today <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('plans')}
                className="btn-secondary px-7 py-3.5 text-base"
              >
                View Plans
              </button>
            </motion.div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>

      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="absolute top-0 left-0 w-full h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {slides.map((slide, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0"
              style={{ pointerEvents: i === current ? 'auto' : 'none' }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/60 sm:bg-gradient-to-r sm:from-white/95 sm:via-white/70 sm:to-white/10" />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 sm:bottom-8 flex items-center gap-2.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative flex items-center justify-center p-1.5"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-premium-gold shadow-sm'
                      : 'w-2 h-2 bg-white/60 hover:bg-white/90'
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
};
