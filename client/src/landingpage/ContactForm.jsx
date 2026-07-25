import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, MapPin, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ContactForm = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'gold', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDone(true);
        setForm({ name: '', email: '', phone: '', plan: 'gold', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: <Phone className="w-4 h-4" />, labelKey: 'contact_call', value: '96009 24752', href: 'tel:9600924752', color: 'bg-blue-500/20 text-blue-200' },
    { icon: <Mail className="w-4 h-4" />, labelKey: 'contact_email', value: 'nvschit@gmail.com', href: 'mailto:nvschit@gmail.com', color: 'bg-amber-500/20 text-amber-200' },
    { icon: <Calendar className="w-4 h-4" />, labelKey: 'contact_hours', valueKey: 'contact_hours_val', href: null, color: 'bg-emerald-500/20 text-emerald-200' },
    { icon: <MapPin className="w-4 h-4" />, labelKey: 'contact_visit', valueKey: 'contact_address', href: null, color: 'bg-rose-500/20 text-rose-200' },
  ];

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge"><span>{t('contact_badge')}</span></div>
          <h2 className="section-title">
            {t('contact_title')}{' '}
            <span className="text-gradient-gold">{t('contact_title_highlight')}</span>
          </h2>
          <p className="section-subtitle">{t('contact_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-gradient-to-br from-primary-blue via-dark-blue to-[#092f6b] rounded-2xl p-8 text-white flex flex-col relative overflow-hidden"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-premium-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-xl font-bold mb-2 relative z-10">Let Us Design Your Savings Plan</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-8 relative z-10">
              Questions about auctions, dividends, or selecting the right scheme? Our advisors are here to help.
            </p>

            <div className="space-y-5 flex-1 relative z-10">
              {contactItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 mb-0.5">{t(item.labelKey)}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-white hover:text-premium-gold transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{item.valueKey ? t(item.valueKey) : item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Secured Regulatory Escrow</p>
                <p className="text-[10px] text-white/50">Reg No: TN-REG/CHIT/2026</p>
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
                <h3 className="text-xl font-bold text-text-primary mb-2">{t('form_success_title')}</h3>
                <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">{t('form_success_desc')}</p>
                <button onClick={() => setDone(false)} className="text-sm font-bold text-premium-gold hover:text-primary-blue cursor-pointer transition-colors">
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">{t('form_name')}</label>
                    <input type="text" required value={form.name} onChange={set('name')} placeholder="Amit Kumar" className="input-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">{t('form_phone')}</label>
                    <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="+91 96009 24752" className="input-base" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">{t('form_email')}</label>
                    <input type="email" required value={form.email} onChange={set('email')} placeholder="amit@example.com" className="input-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-text-secondary">{t('form_plan')}</label>
                    <select value={form.plan} onChange={set('plan')} className="input-base">
                      <option value="basic">Basic — ₹25K Pool</option>
                      <option value="silver">Silver — ₹50K Pool</option>
                      <option value="gold">Gold — ₹1L Pool</option>
                      <option value="platinum">Platinum — ₹2L Pool</option>
                      <option value="diamond">Diamond — ₹3L Pool</option>
                      <option value="premium">Premium — ₹5L Pool</option>
                      <option value="other">Need Advisor Advice</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-text-secondary">{t('form_message')}</label>
                  <textarea rows={4} value={form.message} onChange={set('message')} placeholder="Tell us your investment goals..." className="input-base resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>{t('form_submit')}</span><Send className="w-4 h-4" /></>
                  }
                </button>
                {error && (
                  <p className="text-sm text-red-500 text-center font-medium">{error}</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
