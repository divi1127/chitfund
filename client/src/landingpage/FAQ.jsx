import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is a Chit Fund and how does it work?',
    a: 'A chit fund is a regulated savings and credit instrument where a group of members each contribute a fixed monthly amount. Each month, a transparent auction determines who receives the full lump-sum pool. The discount bid is distributed back to all members as monthly dividends.',
  },
  {
    q: 'How do I pay my monthly installments?',
    a: 'JOD Chits supports UPI AutoPay, NACH e-mandates, credit/debit cards, and net banking. Payments are fully automated with instant receipts and ledger updates after every transaction.',
  },
  {
    q: 'How are the monthly auctions conducted?',
    a: 'Auctions are held online on the scheduled date. Members bid in real-time from the dashboard or set automated bid parameters using our Smart Bidding tool. The bidding starts at the full pool value and decreases until a member accepts.',
  },
  {
    q: 'Are my funds safe and legally protected?',
    a: 'Yes. JOD Chits is registered under the Chit Funds Act 1982, supervised by the State Registrar of Chits. We deposit a 100% bank guarantee collateral with the government before starting any group.',
  },
  {
    q: 'When and how do I receive the winning bid payout?',
    a: 'After winning an auction and submitting basic documentation (address proof or guarantor details), the prize amount is deposited directly to your registered bank account within 24 working hours.',
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState(-1);

  return (
    <section id="faq" className="section-padding bg-section-alt">
      <div className="section-container max-w-3xl">
        <div className="section-header">
          <div className="section-badge"><span>FAQ</span></div>
          <h2 className="section-title">Frequently Asked <span className="text-gradient-gold">Questions</span></h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-border-light rounded-2xl divide-y divide-border-light shadow-sm"
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className={`w-full flex items-center justify-between text-left px-7 py-5 gap-4 cursor-pointer transition-colors ${isOpen ? 'text-primary-blue' : 'text-text-primary hover:text-primary-blue'}`}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-premium-gold' : 'text-text-secondary'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-text-secondary leading-relaxed px-7 pb-6">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
