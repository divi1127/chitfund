import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'What is a Chit Fund and how does it operate?',
    answer: 'A chit fund is a traditional savings and credit instrument regulated by law. A group of members contributes a fixed amount monthly. Each month, a digital auction is held, and the member willing to accept the highest discount wins the lump sum pool. The discount bid is distributed back to all remaining members as monthly dividends, lowering their effective contribution.',
  },
  {
    question: 'How do I pay my monthly installments?',
    answer: 'JOD Chits supports completely automated digital payments. You can set up UPI AutoPay, e-mandates (NACH), or pay manually using credit/debit cards, UPI, or net banking from your member dashboard. Instant receipts and ledger updates are generated immediately.',
  },
  {
    question: 'How are the monthly auctions conducted?',
    answer: 'Auctions occur online on specific dates listed in your group itinerary. Members can bid in real-time from the dashboard, or set automated parameters using our Smart Bidding tool. The bidding begins at the maximum pool value and drops by increments until the final bidder accepts.',
  },
  {
    question: 'Are my funds secure and legally registered?',
    answer: 'Absolutely. JOD Chits is fully registered under the Chit Funds Act, 1982, and operates under strict guidelines supervised by the State Registrar of Chits. Before starting any group, we deposit a 100% bank guarantee collateral with the government to ensure full member protection.',
  },
  {
    question: 'What is the process for receiving the winning bid amount?',
    answer: 'If you win the auction, you must upload basic documentation (address proof or co-signer guarantees, depending on the scheme tier). Once verified, the prize money is disbursed directly to your registered bank account within 24 working hours.',
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="section-padding relative bg-section-alt">
      <div className="section-container relative z-10 max-w-4xl">
        <div className="section-header">
          <div className="section-badge"><span>Common Enquiries</span></div>
          <h2 className="section-title">Frequently Asked <span className="text-gradient-gold">Questions</span></h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border-light rounded-2xl p-8 sm:p-10 divide-y divide-border-light shadow-sm"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full flex items-center justify-between text-left py-5 sm:py-6 font-semibold transition-colors cursor-pointer gap-4 group ${
                    isOpen ? 'text-primary-blue' : 'text-text-primary hover:text-primary-blue'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg flex items-center">
                    <HelpCircle className={`w-5 h-5 sm:w-6 sm:h-6 mr-4 shrink-0 transition-colors ${
                      isOpen ? 'text-premium-gold' : 'text-premium-gold/60 group-hover:text-premium-gold'
                    }`} />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-all duration-300 ${
                      isOpen ? 'rotate-180 text-premium-gold' : 'text-text-secondary'
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-base text-text-secondary leading-relaxed pb-6 sm:pb-7 pl-14">
                        {faq.answer}
                      </p>
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
