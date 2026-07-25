import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const testimonials = [
  {
    name: 'Amit Sharma',
    role: 'Founding Director, Vibrant Textiles Ltd.',
    avatar: 'AS',
    bg: 'from-primary-blue to-dark-blue',
    text: 'I needed ₹5 lakh urgently before the festival season. Through the Gold Chit auction, I obtained the full pool within 24 hours — far cheaper than any personal loan. Highly recommended!',
    rating: 5,
    badgeKey: 'test_badge1',
  },
  {
    name: 'Priya Nair',
    role: 'Principal Engineer, TechNovus Solutions',
    avatar: 'PN',
    bg: 'from-premium-gold to-gold-600',
    text: "NVS CHIT ENTERPRISES helped me build real savings discipline. Since I don't need immediate liquidity, my dividends roll over and effectively boost my yield to 11% annually — well above any FD.",
    rating: 5,
    badgeKey: 'test_badge2',
  },
  {
    name: 'Vikram Seth',
    role: 'Co-Founder & CEO, Seth Realty Partners',
    avatar: 'VS',
    bg: 'from-secondary-blue to-dark-blue',
    text: 'Absolutely seamless. KYC was done in 10 minutes digitally. The dashboard makes tracking auctions, dividends, and deadlines incredibly simple. Outstanding execution by the NVS team.',
    rating: 5,
    badgeKey: 'test_badge3',
  },
];

export const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>{t('test_badge')}</span></div>
          <h2 className="section-title">
            {t('test_title')}{' '}
            <span className="text-gradient-gold">{t('test_title_highlight')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative bg-white border border-border-light rounded-2xl p-7 flex flex-col hover:border-premium-gold/35 hover:shadow-2xl hover:shadow-primary-blue/6 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group"
            >
              {/* Gradient accent corner */}
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${test.bg} opacity-5 group-hover:opacity-10 rounded-bl-3xl transition-opacity`} />
              <Quote className="w-9 h-9 text-primary-blue/12 mb-4 relative z-10" />
              <div className="flex gap-0.5 mb-4 relative z-10">
                {[...Array(test.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-premium-gold fill-current" />)}
              </div>
              <p className="text-sm text-text-secondary italic leading-relaxed flex-1 mb-6 relative z-10">"{test.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border-light relative z-10">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${test.bg} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md`}>
                  {test.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{test.name}</p>
                  <p className="text-xs text-text-secondary truncate">{test.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/5 border border-success/15 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                  <ShieldCheck className="w-3 h-3" /> {t(test.badgeKey)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
