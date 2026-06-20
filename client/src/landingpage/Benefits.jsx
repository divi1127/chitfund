import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Eye, ShieldAlert, Users2, TrendingDown, Info } from 'lucide-react';

const benefitsData = [
  { title: 'Smart Savings', description: 'Systematically save and earn high dividend yields that outpace standard savings accounts.', icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { title: 'Financial Discipline', description: 'Monthly commitment keeps you focused on savings goals, building a strong financial net.', icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { title: 'Quick Fund Access', description: 'Borrow from the chit pool immediately during emergencies without loans or interest traps.', icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { title: 'Transparent Process', description: 'Fully audited operations, government registrations, and open ledger logs verify every transaction.', icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { title: 'Secure Transactions', description: 'Advanced encrypted escrows ensure that members\' monthly assets and payouts are fully secure.', icon: <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { title: 'Trusted Community', description: 'Join thousands of verified members and corporate entities under strict regulatory custody.', icon: <Users2 className="w-5 h-5 sm:w-6 sm:h-6" /> },
];

const BenefitItem = ({ title, description, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -24 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="flex items-start gap-5 p-5 sm:p-6 rounded-xl bg-white border border-border-light hover:border-premium-gold/30 hover:shadow-md hover:shadow-premium-gold/5 transition-all duration-300 group cursor-default"
  >
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0 group-hover:bg-gradient-to-br group-hover:from-premium-gold group-hover:to-gold-600 group-hover:text-white group-hover:border-premium-gold/30 transition-all duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 group-hover:text-primary-blue transition-colors">{title}</h3>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export const Benefits = () => (
  <section className="section-padding relative bg-white">
    <div className="section-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div className="flex flex-col">
        <div className="section-badge">
          <span>Financial Advantages</span>
        </div>
        <h2 className="section-title !text-left">
          Why Choose Chit Funds Over <span className="text-gradient-gold">Traditional Banking?</span>
        </h2>
        <div className="space-y-3 mt-3">
          {benefitsData.map((benefit, index) => (
            <BenefitItem key={index} {...benefit} index={index} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[520px] bg-white border border-border-light rounded-2xl p-8 sm:p-9 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-blue/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold tracking-wider uppercase text-text-secondary flex items-center">
              <Info className="w-4 h-4 text-premium-gold mr-2" /> Performance Comparison
            </span>
            <span className="text-xs text-text-secondary bg-bg-main border border-border-light px-3 py-1 rounded">Index 2026</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-premium-gold" />
            Savings Yield Efficiency
          </h3>

          <div className="space-y-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-text-primary">JOD Chit Dividends</span>
                <span className="font-bold text-premium-gold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" /> 8.5% - 11.2% p.a.
                </span>
              </div>
              <div className="w-full h-3 bg-bg-main rounded-full overflow-hidden border border-border-light relative">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '92%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-gold rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-subtle rounded-full" />
                </motion.div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-text-secondary">Traditional Fixed Deposit</span>
                <span className="font-bold text-text-secondary flex items-center">
                  <TrendingDown className="w-4 h-4 text-text-secondary mr-1" /> 6.0% - 7.5% p.a.
                </span>
              </div>
              <div className="w-full h-3 bg-bg-main rounded-full overflow-hidden border border-border-light">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-primary-blue/50 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-text-secondary">Normal Savings Accounts</span>
                <span className="font-bold text-text-secondary flex items-center">
                  <TrendingDown className="w-4 h-4 text-text-secondary mr-1" /> 3.0% - 4.2% p.a.
                </span>
              </div>
              <div className="w-full h-3 bg-bg-main rounded-full overflow-hidden border border-border-light">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '32%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  className="h-full bg-text-secondary/40 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-success/5 border border-success/15 rounded-xl p-5 sm:p-6 flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Dual Benefit Advantage:</strong> Save systematically and borrow instantly at rates lower than commercial bank personal loans. Bypasses standard credit rating checks.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
