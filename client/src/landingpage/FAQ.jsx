import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FAQ = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(-1);

  const faqs = [
    { qKey: 'faq1_q', aKey: 'faq1_a' },
    { qKey: 'faq2_q', aKey: 'faq2_a' },
    { qKey: 'faq3_q', aKey: 'faq3_a' },
    { qKey: 'faq4_q', aKey: 'faq4_a' },
    { qKey: 'faq5_q', aKey: 'faq5_a' },
  ];

  return (
    <section id="faq" className="section-padding bg-section-alt">
      <div className="section-container max-w-3xl">
        <div className="section-header">
          <div className="section-badge"><span>{t('faq_badge')}</span></div>
          <h2 className="section-title">
            {t('faq_title')}{' '}
            <span className="text-gradient-gold">{t('faq_title_highlight')}</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-border-light rounded-2xl divide-y divide-border-light shadow-sm overflow-hidden"
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="group">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className={`w-full flex items-center justify-between text-left px-7 py-5 gap-4 cursor-pointer transition-colors ${isOpen ? 'bg-primary-blue/[0.03] text-primary-blue' : 'text-text-primary hover:bg-gray-50 hover:text-primary-blue'}`}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold leading-snug">{t(faq.qKey)}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-premium-gold' : 'text-text-secondary'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-text-secondary leading-relaxed px-7 pb-6 border-l-2 border-premium-gold/30 ml-7">{t(faq.aKey)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
