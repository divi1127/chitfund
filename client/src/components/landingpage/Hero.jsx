import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, TrendingUp, Users, BadgeIndianRupee } from 'lucide-react';

const ticker = [
  { label: 'Active Members', value: '10,000+' },
  { label: 'Funds Managed', value: '₹100 Cr+' },
  { label: 'Active Groups', value: '500+' },
  { label: 'Avg. Dividend Yield', value: '9.8% p.a.' },
  { label: 'Satisfaction Rate', value: '98%' },
];

export const Hero = ({ onNavigate }) => (
  <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-white">
    {/* Background blobs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-primary-blue/4 via-transparent to-transparent" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-premium-gold/6 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary-blue/5 rounded-full blur-[80px]" />
    </div>

    <div className="section-container relative z-10 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
        {/* Left */}
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 bg-success/8 border border-success/20 rounded-full px-4 py-1.5 mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
            <span className="text-xs font-bold tracking-widest text-success uppercase">Govt. Registered &amp; Regulated</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-[2.2rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.08] tracking-tight text-text-primary mb-6"
          >
            Grow Your Wealth with{' '}
            <span className="text-gradient-blue">Trusted</span>{' '}
            <span className="relative text-gradient-gold">
              Chit Funds
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" preserveAspectRatio="none">
                <path d="M0 5 Q100 0 200 5" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg text-text-secondary leading-relaxed mb-9 max-w-lg"
          >
            Save systematically, access funds instantly, and earn competitive dividends. JOD Chits brings next-gen digital transparency to India's most trusted savings tradition.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <button
              onClick={() => onNavigate('contact')}
              className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-premium-gold/20"
            >
              Start Saving Today <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('plans')}
              className="btn-secondary px-7 py-3.5 text-base"
            >
              View Plans
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-border-light"
          >
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-success" />, text: 'No Credit Score Needed' },
              { icon: <TrendingUp className="w-4 h-4 text-premium-gold" />, text: 'Up to 11% Annual Dividend' },
              { icon: <Users className="w-4 h-4 text-primary-blue" />, text: '10,000+ Happy Members' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                {item.icon} {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Dashboard card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-blue/8 to-premium-gold/8 rounded-3xl blur-2xl" />
            <div className="relative bg-white border border-border-light rounded-2xl shadow-2xl shadow-primary-blue/8 overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-primary-blue to-dark-blue p-6 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Gold Wealth Plan</p>
                    <p className="text-white text-2xl font-extrabold">₹10,00,000 Pool</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-premium-gold/20 border border-premium-gold/30 flex items-center justify-center">
                    <BadgeIndianRupee className="w-6 h-6 text-premium-gold" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Monthly', value: '₹25,000' },
                    { label: 'Duration', value: '40 Months' },
                    { label: 'Yield', value: '9.8% p.a.' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/50 text-[10px] uppercase font-semibold mb-0.5">{stat.label}</p>
                      <p className="text-white text-sm font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Progress */}
              <div className="p-6">
                <div className="space-y-4 mb-5">
                  {[
                    { label: 'Total Invested', value: '₹2,40,000', pct: 75, color: 'from-primary-blue to-secondary-blue' },
                    { label: 'Earned Dividends', value: '+₹18,720', pct: 45, color: 'from-premium-gold to-gold-400' },
                  ].map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-secondary font-medium">{row.label}</span>
                        <span className="font-bold text-text-primary">{row.value}</span>
                      </div>
                      <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${row.pct}%` }}
                          transition={{ duration: 1.2, delay: 0.8 + i * 0.2 }}
                          className={`h-full bg-gradient-to-r ${row.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2.5 bg-success/5 border border-success/15 rounded-xl px-4 py-3">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span className="text-xs text-text-secondary">Fully insured &amp; regulated under Chit Funds Act 1982</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-white border border-border-light rounded-2xl px-4 py-2.5 shadow-xl"
            >
              <p className="text-xs text-text-secondary font-medium">Next Auction</p>
              <p className="text-sm font-bold text-primary-blue">In 3 Days</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white border border-border-light rounded-2xl px-4 py-2.5 shadow-xl"
            >
              <p className="text-xs text-text-secondary font-medium">Last Payout</p>
              <p className="text-sm font-bold text-premium-gold">₹11,250 Dividend</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Ticker */}
    <div className="absolute bottom-0 left-0 right-0 bg-primary-blue/4 border-t border-primary-blue/8 py-3 overflow-hidden">
      <div className="flex gap-16 animate-[ticker_20s_linear_infinite] whitespace-nowrap w-max">
        {[...ticker, ...ticker].map((item, i) => (
          <span key={i} className="text-sm font-semibold text-text-secondary inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-premium-gold" />
            {item.label}: <span className="text-primary-blue">{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);
