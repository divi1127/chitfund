import { motion } from 'framer-motion';
import { CreditCard, FileCheck, Gavel, LayoutDashboard, CalendarDays, BellRing, Fingerprint, LineChart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const iconColors = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-green-500 to-green-700',
  'from-red-500 to-red-700',
  'from-indigo-500 to-indigo-700',
  'from-amber-500 to-yellow-600',
];

const icons = [
  <CreditCard className="w-5 h-5" />,
  <FileCheck className="w-5 h-5" />,
  <Gavel className="w-5 h-5" />,
  <LayoutDashboard className="w-5 h-5" />,
  <CalendarDays className="w-5 h-5" />,
  <BellRing className="w-5 h-5" />,
  <Fingerprint className="w-5 h-5" />,
  <LineChart className="w-5 h-5" />,
];

export const Features = () => {
  const { t } = useLanguage();
  const features = [
    { titleKey: 'feat1_title', descKey: 'feat1_desc' },
    { titleKey: 'feat2_title', descKey: 'feat2_desc' },
    { titleKey: 'feat3_title', descKey: 'feat3_desc' },
    { titleKey: 'feat4_title', descKey: 'feat4_desc' },
    { titleKey: 'feat5_title', descKey: 'feat5_desc' },
    { titleKey: 'feat6_title', descKey: 'feat6_desc' },
    { titleKey: 'feat7_title', descKey: 'feat7_desc' },
    { titleKey: 'feat8_title', descKey: 'feat8_desc' },
  ];

  return (
    <section id="features" className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>{t('feat_badge')}</span></div>
          <h2 className="section-title">
            {t('feat_title')}{' '}
            <span className="text-gradient-gold">{t('feat_title_highlight')}</span>
          </h2>
          <p className="section-subtitle">{t('feat_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group relative bg-white border border-border-light rounded-2xl p-5 sm:p-6 hover:border-premium-gold/40 hover:shadow-xl hover:shadow-primary-blue/6 hover:-translate-y-1.5 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${iconColors[i]} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconColors[i]} text-white flex items-center justify-center mb-4 shadow-md shadow-blue-500/15 group-hover:scale-110 transition-transform duration-300`}>
                {icons[i]}
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1.5 group-hover:text-primary-blue transition-colors">{t(f.titleKey)}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
