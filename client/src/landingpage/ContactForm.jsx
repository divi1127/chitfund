import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

export const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'gold', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); setForm({ name: '', email: '', phone: '', plan: 'gold', message: '' }); }, 1500);
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>Get In Touch</span></div>
          <h2 className="section-title">Connect With a <span className="text-gradient-gold">Chit Advisor</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-primary-blue rounded-2xl p-8 text-white flex flex-col"
          >
            <h3 className="text-xl font-bold mb-2">Let Us Design Your Savings Plan</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-8">
              Questions about auctions, dividends, or selecting the right scheme? Our advisors are here to help.
            </p>

            <div className="space-y-5 flex-1">
              {[
                { icon: <Phone className="w-4 h-4" />, label: 'Call Us', value: '+91 80 4952 8200', href: 'tel:+918049528200' },
                { icon: <Mail className="w-4 h-4" />, label: 'Email Us', value: 'advisor@jodchits.com', href: 'mailto:advisor@jodchits.com' },
                { icon: <Calendar className="w-4 h-4" />, label: 'Office Hours', value: 'Mon–Sat, 9 AM–6:30 PM', href: null },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-white hover:text-premium-gold transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center text-success shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Secured Regulatory Escrow</p>
                <p className="text-[10px] text-white/50">Reg No: KA-REG/CHIT/839/2026</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3 bg-white border border-border-light rounded-2xl p-8 shadow-sm"
          >
            {done ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-12">
                <div className="w-16 h-16 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Request Submitted!</h3>
                <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">An advisor will review your inquiry and contact you within 2 hours.</p>
                <button onClick={() => setDone(false)} className="text-sm font-bold text-premium-gold hover:text-primary-blue cursor-pointer transition-colors">
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">Full Name</label>
                    <input type="text" required value={form.name} onChange={set('name')} placeholder="Amit Kumar" className="input-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">Phone</label>
                    <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="+91 99000 XXXXX" className="input-base" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">Email</label>
                    <input type="email" required value={form.email} onChange={set('email')} placeholder="amit@example.com" className="input-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">Interested Plan</label>
                    <select value={form.plan} onChange={set('plan')} className="input-base">
                      <option value="silver">Silver — ₹2.5L Pool</option>
                      <option value="gold">Gold — ₹10L Pool</option>
                      <option value="platinum">Platinum — ₹25L Pool</option>
                      <option value="other">Need Advisor Advice</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-text-secondary">Message / Goals</label>
                  <textarea rows={4} value={form.message} onChange={set('message')} placeholder="Tell us your investment goals..." className="input-base resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Request Callback</span><Send className="w-4 h-4" /></>
                  }
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
