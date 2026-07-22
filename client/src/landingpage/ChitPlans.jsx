import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Sparkles, Trophy, Gem, Diamond, X, Shield, ArrowRight, CheckCircle2, Star, Zap, Sun } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'For beginners',
    monthlyShare: '₹2,500',
    poolValue: '₹25,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Sparkles className="w-5 h-5" />,
    benefits: ['Perfect for first-time savers', 'Low monthly commitment', 'Transparent monthly bidding', 'Digital receipts & statements'],
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'For steady savers',
    monthlyShare: '₹5,000',
    poolValue: '₹50,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Star className="w-5 h-5" />,
    benefits: ['Ideal for personal savings', 'Higher dividend potential', 'Instant auction access', 'Flexible payment options'],
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Most popular choice',
    monthlyShare: '₹10,000',
    poolValue: '₹1,00,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Trophy className="w-5 h-5" />,
    featured: true,
    benefits: ['Perfect for business goals', 'Optimised dividend ratios', 'Priority payout processing', 'Dedicated support', 'Flexible deposit values'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'For serious investors',
    monthlyShare: '₹20,000',
    poolValue: '₹2,00,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Gem className="w-5 h-5" />,
    benefits: ['Higher savings capacity', 'Premium dividend returns', 'Custom payout schedules', 'Collateral credit eligibility', 'Dedicated relationship manager'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    tagline: 'For wealth builders',
    monthlyShare: '₹30,000',
    poolValue: '₹3,00,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Diamond className="w-5 h-5" />,
    benefits: ['Maximum savings potential', 'Top-tier dividend yields', 'Priority auction access', 'Exclusive member benefits', 'Zero bidding constraints', 'Premium support 24/7'],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For high-value goals',
    monthlyShare: '₹50,000',
    poolValue: '₹5,00,000',
    duration: '10 Months',
    commission: '1.0%',
    icon: <Sun className="w-5 h-5" />,
    benefits: ['Ultimate savings plan', 'Highest dividend earnings', 'Instant payout processing', 'VIP relationship manager', 'Customized investment strategy', 'Exclusive networking events'],
  },
];

const Modal = ({ plan, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-main text-text-secondary cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        {done ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Application Received!</h3>
            <p className="text-sm text-text-secondary mb-6">You applied for <strong className="text-premium-gold">{plan.name}</strong> ({plan.poolValue}). An advisor will reach out shortly.</p>
            <button onClick={onClose} className="btn-primary px-8 py-3">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-premium-gold mb-0.5">{plan.name} Plan</p>
              <h3 className="text-xl font-extrabold text-text-primary">{plan.poolValue} Pool</h3>
              <p className="text-sm text-text-secondary mt-1">{plan.monthlyShare}/mo · {plan.duration} · {plan.commission} commission</p>
            </div>
            <div className="h-px bg-border-light" />
            {[
              { label: 'Full Name', type: 'text', key: 'name', placeholder: 'Amit Kumar' },
              { label: 'Phone', type: 'tel', key: 'phone', placeholder: '+91 99000 XXXXX' },
              { label: 'Email', type: 'email', key: 'email', placeholder: 'amit@example.com' },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-text-secondary">{f.label}</label>
                <input type={f.type} required value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="input-base" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Shield className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Registered under Chit Funds Act, 1982. 100% Secure.</span>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export const ChitPlans = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section id="plans" className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>Investment Plans</span></div>
          <h2 className="section-title">Choose Your <span className="text-gradient-gold">Chit Scheme</span></h2>
          <p className="section-subtitle">Structured mutual credit schemes designed for every savings goal and budget.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl flex flex-col transition-all duration-300 ${
                plan.featured
                  ? 'bg-gradient-to-b from-primary-blue to-dark-blue shadow-2xl shadow-primary-blue/20 ring-2 ring-premium-gold/50'
                  : 'bg-white border border-border-light hover:border-premium-gold/40 hover:shadow-xl'
              }`}
            >
              {/* Card body — uniform padding on all cards */}
              <div className="p-8 flex flex-col flex-1">

                {/* Most Popular badge — only Gold, inside padding */}
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 bg-premium-gold/25 border border-premium-gold/50 text-premium-gold text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-widest rounded-full mb-6 self-start">
                    <Flame className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                  plan.featured ? 'bg-white/15 text-premium-gold' : 'bg-primary-blue/8 text-primary-blue'
                }`}>
                  {plan.icon}
                </div>

                {/* Name & pool value */}
                <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${
                  plan.featured ? 'text-white/55' : 'text-text-secondary'
                }`}>{plan.tagline}</p>
                <h3 className={`text-2xl font-extrabold ${
                  plan.featured ? 'text-white' : 'text-text-primary'
                }`}>{plan.name}</h3>
                <p className={`text-4xl font-extrabold mt-3 ${
                  plan.featured ? 'text-premium-gold' : 'text-primary-blue'
                }`}>{plan.poolValue}</p>
                <p className={`text-xs mt-1 ${
                  plan.featured ? 'text-white/45' : 'text-text-secondary'
                }`}>Chit Value Pool</p>

                {/* Divider */}
                <div className={`h-px my-6 ${
                  plan.featured ? 'bg-white/15' : 'bg-border-light'
                }`} />

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
                  {[
                    { label: 'Monthly Share', value: plan.monthlyShare },
                    { label: 'Duration', value: plan.duration },
                    { label: 'Commission', value: plan.commission },
                    { label: 'Max Members', value: plan.duration.split(' ')[0] },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className={`text-[10px] uppercase font-bold tracking-wider ${
                        plan.featured ? 'text-white/45' : 'text-text-secondary'
                      }`}>{item.label}</p>
                      <p className={`text-sm font-bold mt-1 ${
                        plan.featured ? 'text-white' : 'text-text-primary'
                      }`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className={`h-px mb-6 ${
                  plan.featured ? 'bg-white/15' : 'bg-border-light'
                }`} />

                {/* Benefits — flex-1 pushes button to bottom */}
                <ul className="space-y-3 flex-1">
                  {plan.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.featured ? 'bg-premium-gold/25 text-premium-gold' : 'bg-primary-blue/10 text-primary-blue'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={`text-sm leading-snug ${
                        plan.featured ? 'text-white/80' : 'text-text-secondary'
                      }`}>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => setSelected(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer mt-8 ${
                    plan.featured
                      ? 'bg-premium-gold text-white hover:bg-gold-600 shadow-lg shadow-premium-gold/25'
                      : 'border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white'
                  }`}
                >
                  Join {plan.name} Scheme
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <Modal plan={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};
