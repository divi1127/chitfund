import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Amit Sharma',
    role: 'Founding Director, Vibrant Textiles Ltd.',
    avatar: 'AS',
    bg: 'from-primary-blue to-dark-blue',
    text: 'I needed ₹5 lakh urgently before the festival season. Through the Gold Chit auction, I obtained the full pool within 24 hours — far cheaper than any personal loan. Highly recommended!',
    rating: 5,
    badge: 'Business Member',
  },
  {
    name: 'Priya Nair',
    role: 'Principal Engineer, TechNovus Solutions',
    avatar: 'PN',
    bg: 'from-premium-gold to-gold-600',
    text: 'JOD Chits helped me build real savings discipline. Since I don\'t need immediate liquidity, my dividends roll over and effectively boost my yield to 11% annually — well above any FD.',
    rating: 5,
    badge: 'Savings Member',
  },
  {
    name: 'Vikram Seth',
    role: 'Co-Founder & CEO, Seth Realty Partners',
    avatar: 'VS',
    bg: 'from-secondary-blue to-dark-blue',
    text: 'Absolutely seamless. KYC was done in 10 minutes digitally. The dashboard makes tracking auctions, dividends, and deadlines incredibly simple. Outstanding execution by the JOD team.',
    rating: 5,
    badge: 'Platinum Member',
  },
];

export const Testimonials = () => (
  <section className="section-padding bg-white">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge"><span>Client Reviews</span></div>
        <h2 className="section-title">Trusted by Thousands of <span className="text-gradient-gold">Savers & Businesses</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white border border-border-light rounded-2xl p-7 flex flex-col hover:border-premium-gold/30 hover:shadow-xl hover:shadow-primary-blue/4 hover:-translate-y-1 transition-all"
          >
            <Quote className="w-8 h-8 text-primary-blue/10 mb-4" />
            <div className="flex gap-0.5 mb-4">
              {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-premium-gold fill-current" />)}
            </div>
            <p className="text-sm text-text-secondary italic leading-relaxed flex-1 mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-5 border-t border-border-light">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{t.name}</p>
                <p className="text-xs text-text-secondary truncate">{t.role}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/5 border border-success/15 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                <ShieldCheck className="w-3 h-3" /> {t.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
