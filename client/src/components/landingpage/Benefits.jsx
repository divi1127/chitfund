import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Eye, ShieldAlert, Users2, TrendingDown } from 'lucide-react';

const benefits = [
  { title: 'Smart Savings', desc: 'Earn high dividend yields that outpace standard savings accounts.', icon: <TrendingUp className="w-4 h-4" /> },
  { title: 'Financial Discipline', desc: 'Monthly commitments build a strong, consistent savings habit.', icon: <Target className="w-4 h-4" /> },
  { title: 'Quick Fund Access', desc: 'Borrow from the pool instantly during emergencies, zero interest traps.', icon: <Zap className="w-4 h-4" /> },
  { title: 'Transparent Process', desc: 'Fully audited, government-registered, open-ledger operations.', icon: <Eye className="w-4 h-4" /> },
  { title: 'Secure Transactions', desc: 'Encrypted escrows ensure every member payout is fully protected.', icon: <ShieldAlert className="w-4 h-4" /> },
  { title: 'Trusted Community', desc: 'Join verified members and corporates under strict regulatory oversight.', icon: <Users2 className="w-4 h-4" /> },
];

const comparisons = [
  { label: 'JOD Chit Dividends', range: '8.5%–11.2% p.a.', pct: 92, highlight: true },
  { label: 'Fixed Deposits', range: '6.0%–7.5% p.a.', pct: 60, highlight: false },
  { label: 'Savings Accounts', range: '3.0%–4.2% p.a.', pct: 32, highlight: false },
];

export const Benefits = () => (
  <section className="section-padding bg-section-alt">
    <div className="section-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <div className="section-badge"><span>Why Chit Funds</span></div>
          <h2 className="section-title !text-left text-3xl sm:text-4xl">
            Why Choose Chit Funds Over <span className="text-gradient-gold">Traditional Banking?</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="flex items-start gap-3 p-4 bg-white border border-border-light rounded-xl hover:border-premium-gold/30 transition-all group cursor-default"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-blue/8 text-primary-blue flex items-center justify-center shrink-0 group-hover:bg-premium-gold/12 group-hover:text-premium-gold transition-colors">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-0.5 group-hover:text-primary-blue transition-colors">{b.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{b.desc}</p>
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
          className="bg-white border border-border-light rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-premium-gold" /> Savings Yield Comparison
            </h3>
            <span className="text-xs text-text-secondary bg-bg-main border border-border-light px-3 py-1 rounded-full font-semibold">2026 Index</span>
          </div>

          <div className="space-y-7">
            {comparisons.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className={`font-semibold ${c.highlight ? 'text-text-primary' : 'text-text-secondary'}`}>{c.label}</span>
                  <span className={`font-bold flex items-center gap-1 ${c.highlight ? 'text-premium-gold' : 'text-text-secondary'}`}>
                    {c.highlight ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {c.range}
                  </span>
                </div>
                <div className="h-2.5 bg-bg-main rounded-full overflow-hidden border border-border-light">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
                    className={`h-full rounded-full ${c.highlight ? 'bg-gradient-to-r from-premium-gold to-gold-400' : i === 1 ? 'bg-primary-blue/40' : 'bg-text-secondary/30'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-success/5 border border-success/15 rounded-xl p-5 flex items-start gap-3">
            <Zap className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Dual Benefit:</strong> Save systematically and borrow instantly — no credit score checks, no interest traps.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
