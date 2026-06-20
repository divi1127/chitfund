import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trophy, Gem, Sparkles, X, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

const plansData = [
  {
    name: 'Silver Standard',
    monthly: '₹10,000 / mo',
    duration: '25 Months',
    totalValue: '₹2,50,000',
    commission: '3.0% Commission',
    badge: 'Starter Savings',
    icon: <Sparkles className="w-7 h-7" />,
    benefits: [
      'Best for individual budget savers',
      'Transparent monthly online biddings',
      '24-Hour verification & approval',
      'Full digital statements & summaries',
      'Guaranteed minimum dividend rotation',
    ],
  },
  {
    name: 'Gold Wealth',
    monthly: '₹25,000 / mo',
    duration: '40 Months',
    totalValue: '₹10,00,000',
    commission: '2.5% Commission',
    icon: <Trophy className="w-7 h-7" />,
    featured: true,
    benefits: [
      'Perfect for business setups & goals',
      'Highly optimized dividend ratios',
      'Instant auction access from day 1',
      'Flexible custom security deposit values',
      'Priority withdrawal processing vault',
      'Dedicated customer support hotline',
    ],
  },
  {
    name: 'Platinum Premium',
    monthly: '₹50,000 / mo',
    duration: '50 Months',
    totalValue: '₹25,00,000',
    commission: '2.0% Commission',
    badge: 'HNW Elite Saver',
    icon: <Gem className="w-7 h-7" />,
    benefits: [
      'Tailored for large corporate investments',
      'Zero bidding cycle constraints',
      'Dedicated portfolio relationship manager',
      'Custom dividend payout schedule',
      'Collateralized credit eligibility booster',
    ],
  },
];

const PlanCard = ({ name, monthly, duration, totalValue, commission, badge, icon, benefits, featured = false, onSelect, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className={`rounded-2xl p-8 sm:p-9 flex flex-col relative transition-all duration-300 h-full ${
      featured
        ? 'bg-white border-2 border-premium-gold/30 shadow-xl shadow-premium-gold/10'
        : 'bg-white border border-border-light shadow-sm hover:shadow-lg'
    }`}
  >
    {featured && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-gold text-white text-xs font-extrabold px-5 py-2 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-premium-gold/20 whitespace-nowrap">
        <Flame className="w-3.5 h-3.5 fill-current" />
        <span>Most Popular Plan</span>
      </div>
    )}

    {badge && !featured && (
      <div className="absolute -top-3.5 left-6 bg-primary-blue/5 border border-primary-blue/10 text-primary-blue text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
        {badge}
      </div>
    )}

    <div className="mb-6 flex justify-between items-start">
      <div>
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-widest">{name}</span>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-blue mt-1.5">{totalValue}</h3>
        <p className="text-sm text-text-secondary mt-1">Chit Value Pool</p>
      </div>
      <div className={`p-4 rounded-xl ${featured ? 'bg-premium-gold/10 text-premium-gold shadow-sm shadow-premium-gold/10' : 'bg-primary-blue/5 text-primary-blue'}`}>
        {icon}
      </div>
    </div>

    <div className="h-px bg-border-light my-4 sm:my-5" />

    <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
      <div>
        <p className="text-xs text-text-secondary uppercase font-semibold">Monthly Share</p>
        <p className="text-lg sm:text-xl font-bold text-text-primary mt-1">{monthly}</p>
      </div>
      <div>
        <p className="text-xs text-text-secondary uppercase font-semibold">Duration</p>
        <p className="text-lg sm:text-xl font-bold text-text-primary mt-1">{duration}</p>
      </div>
      <div>
        <p className="text-xs text-text-secondary uppercase font-semibold">Commission Fee</p>
        <p className="text-base font-bold text-success mt-1">{commission}</p>
      </div>
      <div>
        <p className="text-xs text-text-secondary uppercase font-semibold">Max Members</p>
        <p className="text-base font-bold text-text-primary mt-1">{duration.split(' ')[0]} Members</p>
      </div>
    </div>

    <div className="h-px bg-border-light my-2 sm:my-3" />

    <div className="space-y-3 mt-4 flex-grow">
      {benefits.map((benefit, idx) => (
        <div key={idx} className="flex items-start gap-3 text-base text-text-secondary">
          <div className={`rounded-full p-0.5 shrink-0 mt-0.5 ${featured ? 'bg-premium-gold/15 text-premium-gold' : 'bg-primary-blue/10 text-primary-blue'}`}>
            <Check className="w-4 h-4" />
          </div>
          <span>{benefit}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onSelect}
      className={`w-full text-center py-4 rounded-xl font-bold text-base transition-all duration-300 mt-8 cursor-pointer ${
        featured
          ? 'btn-primary shadow-xl shadow-premium-gold/15'
          : 'bg-white border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white hover:shadow-lg'
      }`}
    >
      {featured ? 'Subscribe Gold Scheme' : 'Join Scheme'}
    </button>
  </motion.div>
);

export const ChitPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenModal = (plan) => {
    setSelectedPlan(plan);
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <section id="plans" className="section-padding relative bg-section-alt">
      <div className="section-container relative z-10">
        <div className="section-header">
          <div className="section-badge"><span>Tailored Schemes</span></div>
          <h2 className="section-title">Choose Your <span className="text-gradient-gold">Chit Investment Plan</span></h2>
          <p className="section-subtitle">Find a structured mutual credit scheme matching your monthly budget and long-term liquidity requirements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
          {plansData.map((plan, index) => (
            <div key={index} className={plan.featured ? 'lg:scale-[1.05] z-10' : ''}>
              <PlanCard {...plan} index={index} onSelect={() => handleOpenModal(plan)} />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-border-light rounded-2xl p-8 sm:p-9 max-w-[500px] w-full shadow-2xl relative z-10"
            >
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-bg-main border border-border-light text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {isSubmitted ? (
                <div className="flex flex-col items-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-8 glow-gold">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">Registration Complete!</h3>
                  <p className="text-base text-text-secondary max-w-sm leading-relaxed mb-8">
                    You have applied for the <strong className="text-premium-gold">{selectedPlan.name}</strong> pool ({selectedPlan.totalValue}). An advisor will contact you shortly.
                  </p>
                  <button onClick={() => setSelectedPlan(null)} className="btn-primary">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-premium-gold uppercase tracking-widest">Selected Subscription</span>
                    <h3 className="text-2xl font-extrabold text-text-primary mt-1">{selectedPlan.name}</h3>
                    <p className="text-sm text-text-secondary mt-1.5">
                      Pool: <strong className="text-text-primary">{selectedPlan.totalValue}</strong> &bull; Share: <strong className="text-text-primary">{selectedPlan.monthly}</strong> &bull; Term: <strong className="text-text-primary">{selectedPlan.duration}</strong>
                    </p>
                  </div>

                  <div className="h-px bg-border-light" />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amit Kumar" className="input-base" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Phone Number</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99000 XXXXX" className="input-base" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amit.kumar@example.com" className="input-base" />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
                    {isSubmitting ? (
                      <span className="flex h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Subscription</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2.5 pt-2 text-xs text-text-secondary">
                    <Shield className="w-4 h-4 text-success shrink-0" />
                    <span>Registered under Central Act 1982. 100% Secure.</span>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
