import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, Shield, Award, Lock } from 'lucide-react';

export const CTA = ({ onNavigate }) => (
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
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-premium-gold/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 bg-premium-gold/15 border border-premium-gold/25 rounded-full px-5 py-2 mb-6"
          >
            <Award className="w-4 h-4 text-premium-gold" />
            <span className="text-xs font-bold uppercase tracking-widest text-premium-gold">Start Building Wealth Today</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-3xl mx-auto"
          >
            Ready to Start Your <span className="text-premium-gold">Savings Journey?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="text-base text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join 10,000+ members saving smarter with government-regulated digital chit funds. Earn competitive dividends and access funds when you need them most.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => onNavigate('contact')} className="btn-primary text-base py-3.5 px-9 shadow-xl shadow-premium-gold/20">
              Join Now <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => onNavigate('contact')} className="inline-flex items-center gap-2 font-semibold text-base text-white bg-white/10 border border-white/20 px-8 py-3.5 rounded-xl hover:bg-white/18 transition-all cursor-pointer">
              <HelpCircle className="w-5 h-5 text-premium-gold" /> Contact Advisor
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
              Already a member?{' '}
              <Link to="/login" className="text-premium-gold font-bold hover:underline">
                Login to Member Portal
              </Link>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 pt-10 border-t border-white/12 max-w-2xl mx-auto">
            {[
              { icon: <Shield className="w-4 h-4" />, color: 'text-success bg-success/15', title: 'Govt. Regulated', sub: 'Under Chit Act 1982' },
              { icon: <Lock className="w-4 h-4" />, color: 'text-secondary-blue bg-secondary-blue/15', title: 'SSL Encrypted', sub: '256-Bit Bank Security' },
              { icon: <Award className="w-4 h-4" />, color: 'text-premium-gold bg-premium-gold/15', title: 'Zero Interest Trap', sub: '100% Transparent Bids' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/6 border border-white/10 rounded-xl px-5 py-4 hover:border-premium-gold/25 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-white/45">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
