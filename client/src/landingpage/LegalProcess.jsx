import { motion } from 'framer-motion';
import { FileText, Scale, Stamp, Gavel, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const iconColors = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-yellow-600',
  'from-rose-500 to-rose-700',
];

const icons = [
  <FileText className="w-5 h-5" />,
  <Scale className="w-5 h-5" />,
  <Stamp className="w-5 h-5" />,
  <Gavel className="w-5 h-5" />,
];

export const LegalProcess = () => {
  const { t, language } = useLanguage();

  const steps = language === 'en' ? [
    { title: 'Agreement Registration', desc: 'Every member signs a registered chit agreement as per the Chit Funds Act, 1982. The agreement is legally binding and filed with the State Registrar.' },
    { title: 'Government Approval', desc: 'All chit schemes are approved by the Tamil Nadu Registrar of Chits. NVS CHIT ENTERPRISES holds a valid registration certificate.' },
    { title: 'Stamp Duty & Notarization', desc: 'Each agreement is executed on non-judicial stamp paper of appropriate value and notarized as per legal requirements.' },
    { title: 'Dispute Resolution', desc: 'Any disputes are resolved through arbitration under the Chit Funds Act. Members have the right to approach the District Registrar.' },
  ] : [
    { title: 'ஒப்பந்தப் பதிவு', desc: 'சீட்டு நிதிச் சட்டம், 1982-ன் படி ஒவ்வொரு உறுப்பினரும் பதிவு செய்யப்பட்ட சீட்டு ஒப்பந்தத்தில் கையொப்பமிடுகிறார். இந்த ஒப்பந்தம் சட்டரீதியாக பிணைக்கப்பட்டு மாநில பதிவாளரிடம் தாக்கல் செய்யப்படுகிறது.' },
    { title: 'அரசு அனுமதி', desc: 'அனைத்து சீட்டு திட்டங்களும் தமிழ்நாடு சீட்டு பதிவாளரால் அங்கீகரிக்கப்பட்டுள்ளன. NVS சீட்டு நிறுவனம் செல்லுபடியாகும் பதிவு சான்றிதழை வைத்துள்ளது.' },
    { title: 'முத்திரைத் தீர்வு & நோட்டரைசேஷன்', desc: 'ஒவ்வொரு ஒப்பந்தமும் பொருத்தமான மதிப்பிலான நீதிமன்றம் சாரா முத்திரைத் தாளில் செயல்படுத்தப்பட்டு சட்ட தேவைகளின்படி நோட்டரி செய்யப்படுகிறது.' },
    { title: 'தகராறு தீர்வு', desc: 'எந்தவொரு தகராறும் சீட்டு நிதிச் சட்டத்தின் கீழ் நடுவர் மன்றம் மூலம் தீர்க்கப்படும். உறுப்பினர்களுக்கு மாவட்ட பதிவாளரை அணுகும் உரிமை உண்டு.' },
  ];

  const protections = language === 'en' ? [
    '100% bank guarantee deposited with government before group formation',
    'Transparent auction process recorded and audited monthly',
    'Member funds held in separate escrow accounts',
    'Right to inspect all ledgers and group accounts',
    'Priority over company assets in case of default',
  ] : [
    'குழு உருவாவதற்கு முன்பு 100% வங்கி உத்தரவாடம் அரசாங்கத்திடம் கட்டணமாக செலுத்தப்படுகிறது',
    'வெளிப்படையான ஏல செயல்முறை பதிவு செய்யப்பட்டு மாதாந்திர தணிக்கை செய்யப்படுகிறது',
    'உறுப்பினர் நிதிகள் தனி நம்பிக்கை கணக்குகளில் வைக்கப்படுகின்றன',
    'அனைத்து கணக்கேடுகள் மற்றும் குழு கணக்குகளை ஆய்வு செய்யும் உரிமை',
    'இயல்புநிலை ஏற்பட்டால் நிறுவனத்தின் சொத்துகளில் முன்னுரிமை',
  ];

  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <Scale className="w-3.5 h-3.5 text-premium-gold" />
            <span>{language === 'en' ? 'Legal Framework' : 'சட்ட கட்டமைப்பு'}</span>
          </div>
          <h2 className="section-title">
            {language === 'en' ? <>Regulated & <span className="text-gradient-gold">Legally Protected</span></> : <>ஒழுங்குபடுத்தப்பட்ட & <span className="text-gradient-gold">சட்டரீதியாக பாதுகாக்கப்பட்ட</span></>}
          </h2>
          <p className="section-subtitle">
            {language === 'en'
              ? 'All chit operations are conducted under the Chit Funds Act, 1982 — ensuring complete legal protection for every member.'
              : 'அனைத்து சீட்டு செயல்பாடுகளும் சீட்டு நிதிச் சட்டம், 1982-ன் கீழ் நடத்தப்படுகின்றன — ஒவ்வொரு உறுப்பினருக்கும் முழுமையான சட்ட பாதுகாப்பை உறுதி செய்கின்றன.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-white border border-border-light rounded-2xl p-6 hover:border-premium-gold/40 hover:shadow-xl hover:shadow-primary-blue/6 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${iconColors[i]} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconColors[i]} text-white flex items-center justify-center mb-4 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                {icons[i]}
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">{step.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed relative z-10">{step.desc}</p>
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
              <h4 className="text-sm font-bold text-text-primary mb-1">
                {language === 'en' ? 'Key Legal Protections for Members' : 'உறுப்பினர்களுக்கான முக்கிய சட்ட பாதுகாப்புகள்'}
              </h4>
              <ul className="space-y-2 mt-3">
                {protections.map((item, i) => (
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
};
