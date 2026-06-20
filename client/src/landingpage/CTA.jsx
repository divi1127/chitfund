import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle, Shield, Award } from 'lucide-react';

export const CTA = ({ onNavigate }) => (
  <section className="section-padding relative bg-section-alt">
    <div className="section-container relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-primary-blue via-dark-blue to-[#0a3d7a] rounded-3xl p-10 sm:p-14 lg:p-20 text-center shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-premium-gold/10 via-transparent to-primary-blue/20 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-premium-gold/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-white/5 blur-3xl pointer-events-none animate-pulse" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 bg-premium-gold/15 border border-premium-gold/25 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
          >
            <Award className="w-5 h-5 text-premium-gold" />
            <span className="text-sm font-bold tracking-wider uppercase text-premium-gold">Start Wealth Building</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6"
          >
            Start Your Wealth Building <span className="text-premium-gold">Journey Today</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Join our government-regulated digital chit funds. Save systematically, earn competitive dividends, and secure immediate borrowing power with absolute transparency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <button onClick={() => onNavigate('contact')} className="btn-primary text-base sm:text-lg py-4 px-10 shadow-xl shadow-premium-gold/20">
              <span>Join Now</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={() => onNavigate('contact')} className="inline-flex items-center justify-center gap-2 font-semibold text-base sm:text-lg text-white bg-white/10 border border-white/20 px-9 py-4 rounded-xl hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-premium-gold" />
              <span>Contact Advisor</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-14 pt-10 border-t border-white/15">
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 hover:border-premium-gold/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center text-success shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Govt. Regulated</span>
                <span className="text-xs text-white/50">Under Chit Act 1982</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 hover:border-premium-gold/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-secondary-blue/15 flex items-center justify-center text-secondary-blue shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">SSL Encrypted</span>
                <span className="text-xs text-white/50">256-Bit Bank Security</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 hover:border-premium-gold/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-premium-gold/15 flex items-center justify-center text-premium-gold shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Zero Interest Trap</span>
                <span className="text-xs text-white/50">100% Transparent Bidding</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
