import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Eye, ShieldAlert, Users2, TrendingDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Benefits = () => {
  const { t } = useLanguage();

  const benefits = [
    { titleKey: 'ben1_title', descKey: 'ben1_desc', icon: <TrendingUp className="w-4 h-4" />, color: 'from-blue-500 to-blue-700' },
    { titleKey: 'ben2_title', descKey: 'ben2_desc', icon: <Target className="w-4 h-4" />, color: 'from-violet-500 to-violet-700' },
    { titleKey: 'ben3_title', descKey: 'ben3_desc', icon: <Zap className="w-4 h-4" />, color: 'from-amber-500 to-yellow-600' },
    { titleKey: 'ben4_title', descKey: 'ben4_desc', icon: <Eye className="w-4 h-4" />, color: 'from-teal-500 to-teal-700' },
    { titleKey: 'ben5_title', descKey: 'ben5_desc', icon: <ShieldAlert className="w-4 h-4" />, color: 'from-rose-500 to-rose-700' },
    { titleKey: 'ben6_title', descKey: 'ben6_desc', icon: <Users2 className="w-4 h-4" />, color: 'from-emerald-500 to-emerald-700' },
  ];

  const comparisons = [
    { labelKey: 'ben_nvs', range: '8.5%–11.2% p.a.', pct: 92, highlight: true },
    { labelKey: 'ben_fd', range: '6.0%–7.5% p.a.', pct: 60, highlight: false },
    { labelKey: 'ben_savings', range: '3.0%–4.2% p.a.', pct: 32, highlight: false },
  ];

  return (
    <section className="section-padding bg-section-alt">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="section-badge"><span>{t('ben_badge')}</span></div>
            <h2 className="section-title !text-left text-3xl sm:text-4xl">
              {t('ben_title')}{' '}
              <span className="text-gradient-gold">{t('ben_title_highlight')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="flex items-start gap-3 p-4 bg-white border border-border-light rounded-xl hover:border-premium-gold/30 hover:shadow-lg hover:shadow-primary-blue/5 hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-0.5 group-hover:text-primary-blue transition-colors">{t(b.titleKey)}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{t(b.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-border-light rounded-2xl p-8 shadow-xl shadow-primary-blue/5 relative overflow-hidden"
          >
            {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-premium-gold/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-premium-gold" /> {t('ben_comparison_title')}
              </h3>
              <span className="text-xs text-text-secondary bg-bg-main border border-border-light px-3 py-1 rounded-full font-semibold">{t('ben_comparison_period')}</span>
            </div>

            <div className="space-y-7 relative z-10">
              {comparisons.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className={`font-semibold ${c.highlight ? 'text-text-primary' : 'text-text-secondary'}`}>{t(c.labelKey)}</span>
                    <span className={`font-bold flex items-center gap-1 ${c.highlight ? 'text-premium-gold' : 'text-text-secondary'}`}>
                      {c.highlight ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {c.range}
                    </span>
                  </div>
                  <div className="h-3 bg-bg-main rounded-full overflow-hidden border border-border-light">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
                      className={`h-full rounded-full ${c.highlight ? 'bg-gradient-to-r from-premium-gold to-gold-400' : i === 1 ? 'bg-primary-blue/40' : 'bg-text-secondary/25'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-success/5 border border-success/15 rounded-xl p-5 flex items-start gap-3 relative z-10">
              <Zap className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary leading-relaxed">
                <strong className="text-text-primary">{t('ben_dual_benefit')}</strong> {t('ben_dual_desc')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
