import { motion } from 'framer-motion';
import { UserCheck, FolderPlus, CreditCard, Gavel, HandCoins } from 'lucide-react';

const steps = [
  { number: 1, title: 'Register Account', description: 'Sign up securely, verify your KYC, and create your premium member profile in minutes.', icon: <UserCheck className="w-6 h-6" /> },
  { number: 2, title: 'Join Chit Group', description: 'Choose a chit fund scheme that matches your savings goal — Silver, Gold, or Platinum.', icon: <FolderPlus className="w-6 h-6" /> },
  { number: 3, title: 'Pay Monthly Installments', description: 'Contribute your monthly share via automated online payment methods. Get instant receipts.', icon: <CreditCard className="w-6 h-6" /> },
  { number: 4, title: 'Participate in Auction', description: 'Bid in the monthly transparent digital auction. Borrow when you need or earn dividends.', icon: <Gavel className="w-6 h-6" /> },
  { number: 5, title: 'Receive Chit Amount', description: 'Get the winning bid amount deposited directly to your bank within 24 hours of finalization.', icon: <HandCoins className="w-6 h-6" /> },
];

const StepNumber = ({ number }) => (
  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-gold text-white text-sm font-extrabold shrink-0">
    {number}
  </div>
);

export const HowItWorks = () => (
  <section id="about" className="section-padding relative bg-white">
    <div className="section-container relative z-10">
      <div className="section-header">
        <div className="section-badge"><span>Step-By-Step Process</span></div>
        <h2 className="section-title">How Does a <span className="text-gradient-gold">Chit Fund Work?</span></h2>
        <p className="section-subtitle">A perfect combination of systematic savings and credit facilities designed to give you maximum financial control.</p>
      </div>

      <div className="relative hidden md:block max-w-5xl mx-auto">
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-premium-gold via-primary-blue to-secondary-blue"
          style={{ opacity: 0.2 }}
        />
        <div className="space-y-20">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="flex items-center justify-between w-full">
                <div className="w-[38%] flex justify-end">
                  {isEven && (
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.5 }}
                      className="bg-white border border-border-light rounded-2xl p-8 text-right shadow-sm hover:shadow-xl hover:shadow-premium-gold/5 hover:border-premium-gold/30 transition-all group"
                    >
                      <span className="text-xs font-bold text-premium-gold uppercase tracking-widest flex items-center justify-end gap-2 mb-3">
                        <StepNumber number={step.number} />
                        Step 0{step.number}
                      </span>
                      <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">{step.title}</h3>
                      <p className="text-base text-text-secondary leading-relaxed">{step.description}</p>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-[3px] border-premium-gold flex items-center justify-center text-premium-gold z-10 shadow-xl shadow-premium-gold/15 shrink-0"
                >
                  {step.icon}
                </motion.div>

                <div className="w-[38%] flex justify-start">
                  {!isEven && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.5 }}
                      className="bg-white border border-border-light rounded-2xl p-8 text-left shadow-sm hover:shadow-xl hover:shadow-premium-gold/5 hover:border-premium-gold/30 transition-all group"
                    >
                      <span className="text-xs font-bold text-premium-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                        <StepNumber number={step.number} />
                        Step 0{step.number}
                      </span>
                      <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">{step.title}</h3>
                      <p className="text-base text-text-secondary leading-relaxed">{step.description}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:hidden space-y-8 relative max-w-lg mx-auto">
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute left-7 top-2 bottom-2 w-[2px] bg-gradient-to-b from-premium-gold to-primary-blue"
          style={{ opacity: 0.25 }}
        />
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="flex gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-full bg-white border-2 border-premium-gold flex items-center justify-center text-premium-gold shrink-0 z-10 shadow-lg shadow-premium-gold/10 relative">
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-white">{step.number}</span>
              </div>
              {step.icon}
            </div>
            <div className="bg-white border border-border-light rounded-2xl p-5 flex-1 shadow-sm hover:border-premium-gold/30 transition-all">
              <h3 className="text-base font-bold text-text-primary mb-1.5">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
