import { motion } from 'framer-motion';
import { UserCheck, FolderPlus, CreditCard, Gavel, HandCoins } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const stepIcons = [
  <UserCheck className="w-5 h-5" />,
  <FolderPlus className="w-5 h-5" />,
  <CreditCard className="w-5 h-5" />,
  <Gavel className="w-5 h-5" />,
  <HandCoins className="w-5 h-5" />,
];

const stepColors = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-yellow-600',
  'from-rose-500 to-rose-700',
  'from-emerald-500 to-emerald-700',
];

export const HowItWorks = () => {
  const { t } = useLanguage();
  const steps = [
    { number: '01', titleKey: 'step1_title', descKey: 'step1_desc' },
    { number: '02', titleKey: 'step2_title', descKey: 'step2_desc' },
    { number: '03', titleKey: 'step3_title', descKey: 'step3_desc' },
    { number: '04', titleKey: 'step4_title', descKey: 'step4_desc' },
    { number: '05', titleKey: 'step5_title', descKey: 'step5_desc' },
  ];

  return (
    <section id="about" className="section-padding bg-section-alt">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>{t('hiw_badge')}</span></div>
          <h2 className="section-title">
            {t('hiw_title')}{' '}
            <span className="text-gradient-gold">{t('hiw_title_highlight')}</span>
          </h2>
          <p className="section-subtitle">{t('hiw_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.09 }}
              className="relative bg-white border border-border-light rounded-2xl p-6 hover:border-premium-gold/40 hover:shadow-xl hover:shadow-premium-gold/8 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              {/* Subtle gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stepColors[i]} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-2.5 w-5 h-px bg-border-light z-10" />
              )}
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stepColors[i]} text-white flex items-center justify-center mb-4 shadow-md shadow-blue-500/15 group-hover:scale-110 transition-transform`}>
                {stepIcons[i]}
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-premium-gold uppercase mb-2 block">
                {t('step_label')} {step.number}
              </span>
              <h3 className="text-sm font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors leading-snug">{t(step.titleKey)}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
