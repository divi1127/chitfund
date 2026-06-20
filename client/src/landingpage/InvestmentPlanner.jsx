import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sparkles, CheckCircle2, Shield, ArrowRight, TrendingUp } from 'lucide-react';

export const InvestmentPlanner = () => {
  const [monthlyContribution, setMonthlyContribution] = useState(20000);
  const [duration, setDuration] = useState(30);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalPrincipal = monthlyContribution * duration;
  const dividendRate = 0.098;
  const estimatedDividends = Math.round(totalPrincipal * dividendRate * (duration / 12) * 0.5);
  const maturityValue = totalPrincipal + estimatedDividends;
  const effectiveCost = Math.round((totalPrincipal - estimatedDividends) / duration);

  const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <section id="planner" className="section-padding relative bg-white">
      <div className="section-container relative z-10">
        <div className="section-header">
          <div className="section-badge">
            <Calculator className="w-4 h-4 text-premium-gold" />
            <span>Interactive Planner</span>
          </div>
          <h2 className="section-title">Design Your Custom <span className="text-gradient-gold">Investment Plan</span></h2>
          <p className="section-subtitle">Use our calculator to customize your monthly goals and review estimated dividends prior to group allocation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          <div className="lg:col-span-7 bg-white border border-border-light rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-text-secondary uppercase tracking-wider flex items-center">
                  <Sparkles className="w-4 h-4 text-premium-gold mr-2" /> Live Yield Estimator
                </span>
                <span className="text-xs sm:text-sm text-success bg-success/5 border border-success/15 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold">
                  Avg. Yield: 9.8% p.a.
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-baseline">
                  <label className="text-sm sm:text-base text-text-secondary font-semibold">Monthly Savings Target</label>
                  <span className="text-xl sm:text-2xl font-extrabold text-gradient-gold">{formatCurrency(monthlyContribution)}</span>
                </div>
                <div className="relative pt-3">
                  <input
                    type="range"
                    min="5000"
                    max="150000"
                    step="5000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full"
                    aria-label="Monthly savings target"
                    style={{
                      background: `linear-gradient(to right, #D4AF37 ${((monthlyContribution - 5000) / (150000 - 5000)) * 100}%, #E2E8F0 0%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-text-secondary">
                  <span>Min: ₹5,000</span>
                  <span>Max: ₹1,50,000</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-baseline">
                  <label className="text-sm sm:text-base text-text-secondary font-semibold">Plan Duration</label>
                  <span className="text-xl sm:text-2xl font-extrabold text-primary-blue">{duration} Months</span>
                </div>
                <input type="range" min="20" max="50" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} aria-label="Plan duration in months"
                  style={{
                    background: `linear-gradient(to right, #1565C0 ${((duration - 20) / (50 - 20)) * 100}%, #E2E8F0 0%)`
                  }}
                />
                <div className="flex justify-between text-xs sm:text-sm text-text-secondary">
                  <span>Min: 20 Months</span>
                  <span>Max: 50 Months</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 mt-8 border-t border-border-light"
            >
              <div className="bg-bg-main rounded-xl p-4 sm:p-5 border border-border-light hover:border-premium-gold/30 transition-all">
                <span className="text-xs sm:text-sm text-text-secondary block uppercase font-medium">Principal</span>
                <span className="text-base sm:text-lg font-bold text-text-primary mt-1 block">{formatCurrency(totalPrincipal)}</span>
              </div>
              <div className="bg-bg-main rounded-xl p-4 sm:p-5 border border-border-light hover:border-premium-gold/30 transition-all">
                <span className="text-xs sm:text-sm text-text-secondary block uppercase font-medium">Est. Dividends</span>
                <span className="text-base sm:text-lg font-bold text-success mt-1 block">+{formatCurrency(estimatedDividends)}</span>
              </div>
              <div className="bg-bg-main rounded-xl p-4 sm:p-5 border border-border-light hover:border-premium-gold/30 transition-all">
                <span className="text-xs sm:text-sm text-text-secondary block uppercase font-medium">Maturity</span>
                <span className="text-base sm:text-lg font-bold text-gradient-gold mt-1 block">{formatCurrency(maturityValue)}</span>
              </div>
              <div className="bg-bg-main rounded-xl p-4 sm:p-5 border border-border-light hover:border-premium-gold/30 transition-all">
                <span className="text-xs sm:text-sm text-text-secondary block uppercase font-medium">Net Monthly</span>
                <span className="text-base sm:text-lg font-bold text-primary-blue mt-1 block">{formatCurrency(effectiveCost)}</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div layout className="bg-white border border-border-light rounded-2xl p-8 shadow-sm h-full flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center h-full text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-6 glow-gold">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-text-primary mb-3">Savings Blueprint Locked</h4>
                    <p className="text-sm text-text-secondary max-w-[280px] leading-relaxed mb-8">
                      Your calculations for a {duration}-month scheme at {formatCurrency(monthlyContribution)}/mo have been saved. An advisor will message you.
                    </p>
                    <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-premium-gold hover:text-primary-blue transition-colors cursor-pointer">
                      Reset planner
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 sm:space-y-6 flex flex-col h-full" noValidate>
                    <div className="pb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-premium-gold" />
                        Subscribe & Lock Rates
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">Submit to hold slots in the next upcoming group.</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="planner-name" className="text-xs font-bold text-text-secondary uppercase">Your Name</label>
                      <input id="planner-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input-base" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="planner-phone" className="text-xs font-bold text-text-secondary uppercase">Phone Number</label>
                      <input id="planner-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="input-base" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="planner-email" className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                      <input id="planner-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" className="input-base" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="planner-scheme" className="text-xs font-bold text-text-secondary uppercase">Target Scheme</label>
                      <select id="planner-scheme" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input-base">
                        <option value="20">20 Months Scheme</option>
                        <option value="25">25 Months Scheme</option>
                        <option value="30">30 Months Scheme</option>
                        <option value="40">40 Months Scheme</option>
                        <option value="50">50 Months Scheme</option>
                      </select>
                    </div>
                    <div className="flex-grow" />
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
                      {isSubmitting ? (
                        <span className="flex h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Initialize Plan</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <div className="flex items-center gap-2.5 pt-2 text-xs text-text-secondary">
                      <Shield className="w-4 h-4 text-success shrink-0" />
                      <span>Rates are estimates under current RBI guidelines.</span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
