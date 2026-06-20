import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', plan: 'gold', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', plan: 'gold', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" className="section-padding relative bg-white">
      <div className="section-container relative z-10">
        <div className="section-header">
          <div className="section-badge"><span>Inquiry Desk</span></div>
          <h2 className="section-title">Connect With a <span className="text-gradient-gold">Chit Fund Advisor</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-border-light rounded-2xl p-8 shadow-sm flex flex-col flex-1"
            >
                <div className="space-y-8 flex-1">
                <div>
                  <span className="text-xs font-bold text-success uppercase tracking-widest block mb-2.5">Direct Assistance</span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-text-primary">Let Us Design Your Savings Plan</h3>
                  <p className="text-base text-text-secondary mt-3 leading-relaxed">
                    Have questions about auction processes, dividends, or need help selecting the right pool? Contact our advisors directly.
                  </p>
                </div>
                <div className="space-y-5">
                  <a href="tel:+918049528200" className="flex items-center gap-4 group p-4 -m-4 rounded-xl hover:bg-bg-main transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0 group-hover:border-premium-gold/30 group-hover:bg-premium-gold/5 transition-all">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-semibold uppercase">Call Helpline</p>
                      <p className="text-base font-semibold text-text-primary group-hover:text-primary-blue transition-colors">+91 80 4952 8200</p>
                    </div>
                  </a>
                  <a href="mailto:advisor@jodchits.com" className="flex items-center gap-4 group p-4 -m-4 rounded-xl hover:bg-bg-main transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0 group-hover:border-premium-gold/30 group-hover:bg-premium-gold/5 transition-all">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-semibold uppercase">Email Support</p>
                      <p className="text-base font-semibold text-text-primary group-hover:text-primary-blue transition-colors">advisor@jodchits.com</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 p-4 -mx-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-semibold uppercase">Business Hours</p>
                      <p className="text-base font-semibold text-text-primary">Mon &ndash; Sat, 9:00 AM &ndash; 6:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-border-light flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/15 flex items-center justify-center text-success shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Secured Regulatory Escrow</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Registration Number: KA-REG/CHIT/839/2026</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-border-light rounded-2xl p-8 shadow-sm h-full relative overflow-hidden"
            >
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-14">
                  <div className="w-20 h-20 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold mb-6 glow-gold">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">Request Submitted Successfully</h3>
                  <p className="text-base text-text-secondary max-w-sm leading-relaxed mb-8">
                    Thank you! One of our wealth management advisors will review your goals and contact you within the next 2 hours.
                  </p>
                  <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold text-premium-gold hover:text-primary-blue underline cursor-pointer">
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Amit Kumar" className="input-base" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Phone Number</label>
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 99000 XXXXX" className="input-base" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="amit.kumar@example.com" className="input-base" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Target Chit Scheme</label>
                      <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="input-base">
                        <option value="silver">Silver Scheme &mdash; ₹2.5L pool</option>
                        <option value="gold">Gold Scheme &mdash; ₹10.0L pool</option>
                        <option value="platinum">Platinum Scheme &mdash; ₹25.0L pool</option>
                        <option value="other">Need Advisor Advice</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Your Goal / Message</label>
                    <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-base resize-none" placeholder="Specify your investment targets or questions..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
                    {isSubmitting ? (
                      <span className="flex h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Request Callback</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
