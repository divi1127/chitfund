import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Sparkles, Trophy, Gem, X, Shield, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const planIcons = [<Sparkles className="w-5 h-5" />, <Trophy className="w-5 h-5" />, <Gem className="w-5 h-5" />];
const planTaglines = ['For individual savers', 'Most popular choice', 'For large investments'];
const defaultBenefits = [
  ['Ideal for personal savings goals', 'Transparent monthly bidding', '24-hour payout processing', 'Digital receipts & statements'],
  ['Perfect for business goals', 'Optimised dividend ratios', 'Instant auction access', 'Priority withdrawal processing', 'Dedicated support hotline', 'Flexible deposit values'],
  ['Tailored corporate schemes', 'Dedicated relationship manager', 'Custom payout schedules', 'Collateral credit eligibility', 'Zero bidding constraints'],
];

const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN');

const fallbackPlans = [
  { id: 'silver', name: 'Silver', tagline: 'For individual savers', monthlyShare: '₹10,000', poolValue: '₹2,50,000', duration: '25 Months', commission: '3.0%', icon: planIcons[0], benefits: defaultBenefits[0] },
  { id: 'gold', name: 'Gold', tagline: 'Most popular choice', monthlyShare: '₹25,000', poolValue: '₹10,00,000', duration: '40 Months', commission: '2.5%', icon: planIcons[1], featured: true, benefits: defaultBenefits[1] },
  { id: 'platinum', name: 'Platinum', tagline: 'For large investments', monthlyShare: '₹50,000', poolValue: '₹25,00,000', duration: '50 Months', commission: '2.0%', icon: planIcons[2], benefits: defaultBenefits[2] },
];

const Modal = ({ plan, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          plan: plan.name,
          message: `Interested in ${plan.name} scheme — ${plan.poolValue} pool at ${plan.monthlyShare}/mo`
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Submission failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
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

const PlanCard = ({ plan, onJoin }) => (
  <div className={`rounded-2xl flex flex-col h-full transition-all duration-300 ${
    plan.featured
      ? 'bg-gradient-to-b from-primary-blue to-dark-blue shadow-2xl shadow-primary-blue/20 ring-2 ring-premium-gold/50'
      : 'bg-white border border-border-light hover:border-premium-gold/40 hover:shadow-xl'
  }`}>
    <div className="p-8 flex flex-col flex-1">
      {plan.featured && (
        <div className="inline-flex items-center gap-1.5 bg-premium-gold/25 border border-premium-gold/50 text-premium-gold text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-widest rounded-full mb-6 self-start">
          <Flame className="w-3 h-3 fill-current" /> Most Popular
        </div>
      )}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
        plan.featured ? 'bg-white/15 text-premium-gold' : 'bg-primary-blue/8 text-primary-blue'
      }`}>
        {plan.icon}
      </div>
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
      <div className={`h-px my-6 ${plan.featured ? 'bg-white/15' : 'bg-border-light'}`} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
        {[
          { label: 'Monthly Share', value: plan.monthlyShare },
          { label: 'Duration', value: plan.duration },
          { label: 'Commission', value: plan.commission },
          { label: 'Max Members', value: plan.members || plan.duration?.split(' ')[0] },
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
      <div className={`h-px mb-6 ${plan.featured ? 'bg-white/15' : 'bg-border-light'}`} />
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
      <button
        onClick={() => onJoin(plan)}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer mt-8 ${
          plan.featured
            ? 'bg-premium-gold text-white hover:bg-gold-600 shadow-lg shadow-premium-gold/25'
            : 'border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white'
        }`}
      >
        Join {plan.name} Scheme
      </button>
    </div>
  </div>
);

export const ChitPlans = () => {
  const [selected, setSelected] = useState(null);
  const [apiSchemes, setApiSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setApiSchemes(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plans = apiSchemes.length > 0
    ? apiSchemes.filter(s => s.status === 'Active').map((s, i) => ({
        id: s.id,
        name: s.name,
        tagline: planTaglines[i] || 'Chit scheme',
        monthlyShare: fmt(s.monthlyInstallment),
        poolValue: fmt(s.amount),
        duration: s.duration + ' Months',
        commission: s.commission + '%',
        members: s.members,
        icon: planIcons[i % planIcons.length],
        featured: i === 1,
        benefits: defaultBenefits[i % defaultBenefits.length],
      }))
    : fallbackPlans;

  const maxIndex = Math.max(0, plans.length - visibleCards);
  const clampedIndex = Math.min(currentIndex, maxIndex);

  const goTo = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const goNext = () => goTo(clampedIndex + 1);
  const goPrev = () => goTo(clampedIndex - 1);

  if (loading) {
    return (
      <section id="plans" className="section-padding bg-white">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge"><span>Investment Plans</span></div>
            <h2 className="section-title">Choose Your <span className="text-gradient-gold">Chit Scheme</span></h2>
            <p className="section-subtitle">Structured mutual credit schemes designed for every savings goal and budget.</p>
          </div>
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>Investment Plans</span></div>
          <h2 className="section-title">Choose Your <span className="text-gradient-gold">Chit Scheme</span></h2>
          <p className="section-subtitle">Structured mutual credit schemes designed for every savings goal and budget.</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {clampedIndex > 0 && (
            <button onClick={goPrev}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border-light shadow-lg flex items-center justify-center hover:bg-bg-main transition-all cursor-pointer">
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
          )}

          <div ref={trackRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{ transform: `translateX(-${clampedIndex * (100 / visibleCards)}%)` }}
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / visibleCards}% - ${(visibleCards - 1) * 12 / visibleCards}px)` }}
                >
                  <PlanCard plan={plan} onJoin={setSelected} />
                </motion.div>
              ))}
            </div>
          </div>

          {clampedIndex < maxIndex && (
            <button onClick={goNext}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border-light shadow-lg flex items-center justify-center hover:bg-bg-main transition-all cursor-pointer">
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </button>
          )}
        </div>

        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all cursor-pointer ${
                  i === clampedIndex
                    ? 'w-7 h-2.5 bg-primary-blue'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <Modal plan={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};
