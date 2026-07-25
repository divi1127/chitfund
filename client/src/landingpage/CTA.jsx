import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, Shield, Award, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CTA = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-section-alt">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-primary-blue via-dark-blue to-[#092f6b] rounded-3xl overflow-hidden"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-premium-gold/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 bg-premium-gold/15 border border-premium-gold/30 rounded-full px-5 py-2 mb-6"
            >
              <Award className="w-4 h-4 text-premium-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-premium-gold">{t('cta_badge')}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-3xl mx-auto"
            >
              {t('cta_title')} <span className="text-premium-gold">{t('cta_title_highlight')}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.14 }}
              className="text-base text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('cta_subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button onClick={() => onNavigate('contact')} className="btn-primary text-base py-3.5 px-9 shadow-xl shadow-premium-gold/20">
                {t('cta_join')} <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('contact')} className="inline-flex items-center gap-2 font-semibold text-base text-white bg-white/10 border border-white/20 px-8 py-3.5 rounded-xl hover:bg-white/18 transition-all cursor-pointer">
                <HelpCircle className="w-5 h-5 text-premium-gold" /> {t('cta_advisor')}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="mt-6"
            >
              <p className="text-white/50 text-sm">
                {t('cta_member_prompt')}{' '}
                <Link to="/login" className="text-premium-gold font-bold hover:underline">
                  {t('cta_member_link')}
                </Link>
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 pt-10 border-t border-white/12 max-w-2xl mx-auto">
              {[
                { icon: <Shield className="w-4 h-4" />, color: 'text-success bg-success/15', titleKey: 'cta_badge1_title', subKey: 'cta_badge1_sub' },
                { icon: <Lock className="w-4 h-4" />, color: 'text-secondary-blue bg-secondary-blue/15', titleKey: 'cta_badge2_title', subKey: 'cta_badge2_sub' },
                { icon: <Award className="w-4 h-4" />, color: 'text-premium-gold bg-premium-gold/15', titleKey: 'cta_badge3_title', subKey: 'cta_badge3_sub' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/6 border border-white/12 rounded-xl px-5 py-4 hover:border-premium-gold/30 hover:bg-white/10 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{t(item.titleKey)}</p>
                    <p className="text-xs text-white/45">{t(item.subKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
