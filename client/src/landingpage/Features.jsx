import { motion } from 'framer-motion';
import { CreditCard, FileCheck, Gavel, LayoutDashboard, CalendarDays, BellRing, Fingerprint, LineChart } from 'lucide-react';

const featuresData = [
  { title: 'Secure Online Payments', description: 'Deposit monthly installments instantly through UPI, net banking, or cards with bank-grade encryption.', icon: <CreditCard className="w-6 h-6" /> },
  { title: 'Digital Receipts', description: 'Receive instant digital receipts and secure statement links directly in your app ledger.', icon: <FileCheck className="w-6 h-6" /> },
  { title: 'Live Auction System', description: 'Participate in secure monthly biddings online. Set auto-bids and follow results in real-time.', icon: <Gavel className="w-6 h-6" /> },
  { title: 'Member Dashboard', description: 'Track returns, outstanding durations, bid wins, and dividends through a visual dashboard.', icon: <LayoutDashboard className="w-6 h-6" /> },
  { title: 'Automated Reminders', description: 'Never miss an installment. Get smart customizable reminders via WhatsApp, email, and push.', icon: <CalendarDays className="w-6 h-6" /> },
  { title: 'Real-Time Notifications', description: 'Stay updated with live alerts for auction triggers, winning payouts, and dividend declarations.', icon: <BellRing className="w-6 h-6" /> },
  { title: 'KYC Verification', description: 'Complete onboarding with quick, paperless automated KYC and secure digital agreements.', icon: <Fingerprint className="w-6 h-6" /> },
  { title: 'Analytics & Reports', description: 'Download detailed yearly dividend performance sheets, tax statements, and yield tracking tables.', icon: <LineChart className="w-6 h-6" /> },
];

const FeatureCard = ({ title, description, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="bg-white border border-border-light rounded-2xl p-6 sm:p-7 lg:p-8 relative group cursor-default shadow-sm hover:shadow-xl hover:shadow-primary-blue/5 hover:border-premium-gold/30 transition-all duration-300"
  >
    <div className="relative z-10">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:bg-gradient-to-br group-hover:from-premium-gold group-hover:to-gold-600 group-hover:text-white group-hover:border-premium-gold/30 group-hover:shadow-xl group-hover:shadow-premium-gold/20 transition-all duration-300 mb-4 sm:mb-5">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors duration-300">{title}</h3>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">{description}</p>
    </div>
  </motion.div>
);

export const Features = () => (
  <section className="section-padding relative bg-section-alt" id="features">
    <div className="section-container relative z-10">
      <div className="section-header">
        <div className="section-badge"><span>Platform Features</span></div>
        <h2 className="section-title">A SaaS Experience for <span className="text-gradient-gold">Smart Saving</span></h2>
        <p className="section-subtitle">Next-generation tools designed to keep your chit investments secure, transparent, and effortless.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
      </div>
    </div>
  </section>
);
