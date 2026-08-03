import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fmt = (v) => '₹' + v.toLocaleString('en-IN');

export const InvestmentPlanner = () => {
  const { language } = useLanguage();
  const MONTHS = 10;
  const [monthly, setMonthly] = useState(20000);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const principal = monthly * MONTHS;
  const dividends = Math.round(principal * 0.098 * (MONTHS / 12) * 0.5);
  const maturity = principal + dividends;
  const netMonthly = Math.round((principal - dividends) / MONTHS);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  const pctMonthly = ((monthly - 2500) / (100000 - 2500)) * 100;

  return (
    <section id="planner" className="section-padding bg-section-alt">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <Calculator className="w-3.5 h-3.5 text-premium-gold" />
            <span>{language === 'en' ? 'Investment Planner' : 'முதலீட்டு திட்டமிடுப்பவர்'}</span>
          </div>
          <h2 className="section-title">{language === 'en' ? 'Calculate Your' : 'உங்கள்'}{' '}<span className="text-gradient-gold">{language === 'en' ? 'Returns' : 'வருமானத்தை கணக்கிடுங்கள்'}</span></h2>
          <p className="section-subtitle">{language === 'en' ? 'Adjust the sliders to estimate your dividends and maturity value before committing.' : 'உம்முடைய ஈவுத்தொகை மற்றும் முதிர்வு மதிப்பை மதிப்பிட ஸ்லைடர்களை சரிசெய்யுங்கள்.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
          {/* Calculator */}
          <div className="lg:col-span-7 bg-white border border-border-light rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{language === 'en' ? 'Live Yield Estimator' : 'நேரடி வருமான மதிப்பீடு'}</span>
              <span className="text-xs font-semibold text-success bg-success/8 border border-success/15 px-3 py-1 rounded-full">Avg. 9.8% p.a.</span>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-text-secondary">{language === 'en' ? 'Monthly Contribution' : 'மாதாந்திர முதலீட்டு'}</label>
                  <span className="text-xl font-extrabold text-gradient-gold">{fmt(monthly)}</span>
                </div>
                <input
                  type="range" min="2500" max="100000" step="2500" value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right, #D4AF37 ${pctMonthly}%, #E2E8F0 0%)` }}
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1.5">
                  <span>₹2,500</span><span>₹1,00,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-sm font-semibold text-text-secondary">{language === 'en' ? 'Plan Duration' : 'திட்ட காலம்'}</label>
                  <span className="text-xl font-extrabold text-primary-blue">10 {language === 'en' ? 'Months' : 'மாதங்கள்'}</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-primary-blue to-dark-blue" />
                <div className="flex justify-between text-xs text-text-secondary mt-1.5">
                  <span>{language === 'en' ? 'Fixed for all chit schemes' : 'அனைத்து சீட்டு திட்டங்களுக்கும் நிர்ணயிக்கப்பட்டது'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-8 border-t border-border-light">
              {[
                { label: language === 'en' ? 'Principal' : 'மூலதன்', value: fmt(principal), color: 'text-text-primary' },
                { label: language === 'en' ? 'Est. Dividends' : 'கணிக்கப்பட்ட ஈவுத்தொகை', value: '+' + fmt(dividends), color: 'text-success' },
                { label: language === 'en' ? 'Maturity' : 'முதிவு மதிப்பு', value: fmt(maturity), color: 'text-gradient-gold' },
                { label: language === 'en' ? 'Net Monthly' : 'நிகர மாதாந்திரம்', value: fmt(netMonthly), color: 'text-primary-blue' },
              ].map((item) => (
                <div key={item.label} className="bg-bg-main border border-border-light rounded-xl p-4 hover:border-premium-gold/30 transition-colors">
                  <p className="text-[10px] uppercase font-semibold text-text-secondary mb-1">{item.label}</p>
                  <p className={`text-base font-extrabold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-up form */}
          <div className="lg:col-span-5 bg-white border border-border-light rounded-2xl p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center h-full justify-center py-10">
                  <div className="w-14 h-14 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-5">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-text-primary mb-2">Plan Saved!</h4>
                  <p className="text-sm text-text-secondary mb-6 max-w-[240px] leading-relaxed">
                    Your 10-month plan at {fmt(monthly)}/mo has been recorded. An advisor will contact you.
                  </p>
                  <button onClick={() => setDone(false)} className="text-sm font-bold text-premium-gold hover:text-primary-blue transition-colors cursor-pointer">
                    Reset planner
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-premium-gold" /> Get a Custom Plan
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">Reserve your spot in the next available group.</p>
                  </div>
                  {[
                    { label: 'Your Name', type: 'text', key: 'name', placeholder: 'Amit Kumar' },
                    { label: 'Phone', type: 'tel', key: 'phone', placeholder: '+91 98765 43210' },
                    { label: 'Email', type: 'email', key: 'email', placeholder: 'amit@example.com' },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-text-secondary">{f.label}</label>
                      <input type={f.type} required value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="input-base" />
                    </div>
                  ))}
                  <div className="flex-1" />
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Initialize Plan</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Shield className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Estimates under current RBI guidelines. Data is secure.</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
