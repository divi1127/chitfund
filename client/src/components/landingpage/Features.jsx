import { motion } from 'framer-motion';
import { CreditCard, FileCheck, Gavel, LayoutDashboard, CalendarDays, BellRing, Fingerprint, LineChart } from 'lucide-react';

const features = [
  { title: 'Secure Payments', desc: 'UPI, net banking, and cards with bank-grade encryption.', icon: <CreditCard className="w-5 h-5" /> },
  { title: 'Digital Receipts', desc: 'Instant receipts and ledger links after every transaction.', icon: <FileCheck className="w-5 h-5" /> },
  { title: 'Live Auctions', desc: 'Bid in real-time or set auto-bids from your dashboard.', icon: <Gavel className="w-5 h-5" /> },
  { title: 'Member Dashboard', desc: 'Track dividends, bids, and savings in one visual panel.', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Smart Reminders', desc: 'Automated WhatsApp, email and push notifications.', icon: <CalendarDays className="w-5 h-5" /> },
  { title: 'Real-Time Alerts', desc: 'Instant updates for auctions, payouts, and dividends.', icon: <BellRing className="w-5 h-5" /> },
  { title: 'Paperless KYC', desc: 'Quick digital onboarding with secure e-agreements.', icon: <Fingerprint className="w-5 h-5" /> },
  { title: 'Analytics & Reports', desc: 'Download dividend sheets, tax statements, and yield tables.', icon: <LineChart className="w-5 h-5" /> },
];

export const Features = () => (
  <section id="features" className="section-padding bg-white">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge"><span>Platform Features</span></div>
        <h2 className="section-title">Everything You Need for <span className="text-gradient-gold">Smart Saving</span></h2>
        <p className="section-subtitle">Next-gen tools keeping your chit investments secure, transparent, and effortless.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="group bg-white border border-border-light rounded-2xl p-5 sm:p-6 hover:border-premium-gold/40 hover:shadow-xl hover:shadow-primary-blue/4 hover:-translate-y-1 transition-all cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-blue/8 text-primary-blue flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-premium-gold group-hover:to-gold-600 group-hover:text-white transition-all duration-300">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-1.5 group-hover:text-primary-blue transition-colors">{f.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
