import { motion } from 'framer-motion';
import { FileText, Scale, Stamp, Gavel, Shield, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Agreement Registration',
    desc: 'Every member signs a registered chit agreement as per the Chit Funds Act, 1982. The agreement is legally binding and filed with the State Registrar.',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Government Approval',
    desc: 'All chit schemes are approved by the Tamil Nadu Registrar of Chits. NVS CHIT ENTERPRISES holds a valid registration certificate.',
  },
  {
    icon: <Stamp className="w-5 h-5" />,
    title: 'Stamp Duty & Notarization',
    desc: 'Each agreement is executed on non-judicial stamp paper of appropriate value and notarized as per legal requirements.',
  },
  {
    icon: <Gavel className="w-5 h-5" />,
    title: 'Dispute Resolution',
    desc: 'Any disputes are resolved through arbitration under the Chit Funds Act. Members have the right to approach the District Registrar.',
  },
];

export const LegalProcess = () => (
  <section className="section-padding bg-white">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">
          <Scale className="w-3.5 h-3.5 text-premium-gold" />
          <span>Legal Framework</span>
        </div>
        <h2 className="section-title">Regulated & <span className="text-gradient-gold">Legally Protected</span></h2>
        <p className="section-subtitle">All chit operations are conducted under the Chit Funds Act, 1982 — ensuring complete legal protection for every member.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group bg-white border border-border-light rounded-2xl p-6 hover:border-premium-gold/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-blue/8 text-primary-blue flex items-center justify-center mb-4 group-hover:bg-premium-gold/12 group-hover:text-premium-gold transition-colors">
              {step.icon}
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">{step.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 bg-section-alt border border-border-light rounded-2xl p-6 max-w-3xl mx-auto"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-premium-gold/10 text-premium-gold flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-1">Key Legal Protections for Members</h4>
            <ul className="space-y-2 mt-3">
              {[
                '100% bank guarantee deposited with government before group formation',
                'Transparent auction process recorded and audited monthly',
                'Member funds held in separate escrow accounts',
                'Right to inspect all ledgers and group accounts',
                'Priority over company assets in case of default',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
