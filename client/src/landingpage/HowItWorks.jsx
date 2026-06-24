import { motion } from 'framer-motion';
import { UserCheck, FolderPlus, CreditCard, Gavel, HandCoins } from 'lucide-react';

const steps = [
  { number: '01', title: 'Register & Verify KYC', description: 'Sign up in minutes. Complete paperless KYC and get your member profile verified digitally.', icon: <UserCheck className="w-5 h-5" /> },
  { number: '02', title: 'Choose a Chit Scheme', description: 'Pick from Silver, Gold, or Platinum schemes that match your savings goal and budget.', icon: <FolderPlus className="w-5 h-5" /> },
  { number: '03', title: 'Pay Monthly Installments', description: 'Auto-pay via UPI, NACH, or net banking. Get instant receipts every month.', icon: <CreditCard className="w-5 h-5" /> },
  { number: '04', title: 'Bid in Monthly Auctions', description: 'Participate in transparent digital auctions. Borrow early or earn dividends by passing.', icon: <Gavel className="w-5 h-5" /> },
  { number: '05', title: 'Receive Your Payout', description: 'Winning amount hits your bank within 24 hours. Dividends are credited to all members.', icon: <HandCoins className="w-5 h-5" /> },
];

export const HowItWorks = () => (
  <section id="about" className="section-padding bg-section-alt">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge"><span>How It Works</span></div>
        <h2 className="section-title">Your Path from <span className="text-gradient-gold">Signup to Savings</span></h2>
        <p className="section-subtitle">Five simple steps to start building wealth with India's most trusted savings system.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative bg-white border border-border-light rounded-2xl p-6 hover:border-premium-gold/40 hover:shadow-lg hover:shadow-premium-gold/6 transition-all group"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-border-light z-10" />
            )}
            <div className="w-10 h-10 rounded-xl bg-primary-blue/8 text-primary-blue flex items-center justify-center mb-4 group-hover:bg-premium-gold/12 group-hover:text-premium-gold transition-colors">
              {step.icon}
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-premium-gold uppercase mb-2 block">Step {step.number}</span>
            <h3 className="text-sm font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">{step.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
