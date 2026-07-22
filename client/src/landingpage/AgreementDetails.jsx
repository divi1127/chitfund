import { motion } from 'framer-motion';
import { FileSignature, Users, Calendar, IndianRupee, BadgeCheck, ScrollText } from 'lucide-react';

const sections = [
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Member Details',
    desc: 'Full name, address, Aadhaar, PAN, phone number, and nominee details of each member.',
  },
  {
    icon: <IndianRupee className="w-5 h-5" />,
    title: 'Chit Amount & Terms',
    desc: 'Total chit value, monthly subscription amount, duration (10 months), and auction schedule.',
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: 'Payment Schedule',
    desc: 'Monthly installment due dates, grace period, late payment penalties, and payment methods.',
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: 'Auction Rules',
    desc: 'Bidding process, maximum discount limits, tie-breaking rules, and dividend distribution method.',
  },
  {
    icon: <FileSignature className="w-5 h-5" />,
    title: 'Foreman Rights & Duties',
    desc: 'Commission structure (1% per month), responsibilities, and obligations of NVS CHIT ENTERPRISES as foreman.',
  },
  {
    icon: <ScrollText className="w-5 h-5" />,
    title: 'Default & Termination',
    desc: 'Consequences of default, substitute member rules, foreclosure terms, and dispute resolution process.',
  },
];

export const AgreementDetails = () => (
  <section className="section-padding bg-section-alt">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">
          <FileSignature className="w-3.5 h-3.5 text-premium-gold" />
          <span>Agreement Details</span>
        </div>
        <h2 className="section-title">What's in Your <span className="text-gradient-gold">Chit Agreement?</span></h2>
        <p className="section-subtitle">Every member receives a comprehensive chit agreement covering all rights, obligations, and terms of participation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="bg-white border border-border-light rounded-xl p-5 hover:border-premium-gold/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-premium-gold/8 text-premium-gold flex items-center justify-center shrink-0 mt-0.5">
                {section.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">{section.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{section.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-10 text-center"
      >
        <p className="text-sm text-text-secondary">
          Agreement is executed on non-judicial stamp paper as per Tamil Nadu Stamp Act and registered with the Sub-Registrar of Assurances.
        </p>
      </motion.div>
    </div>
  </section>
);
