import { motion } from 'framer-motion';
import { FileSignature, Users, Calendar, IndianRupee, BadgeCheck, ScrollText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const icons = [
  <Users className="w-5 h-5" />,
  <IndianRupee className="w-5 h-5" />,
  <Calendar className="w-5 h-5" />,
  <BadgeCheck className="w-5 h-5" />,
  <FileSignature className="w-5 h-5" />,
  <ScrollText className="w-5 h-5" />,
];

const iconColors = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-yellow-600',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-teal-500 to-teal-700',
];

export const AgreementDetails = () => {
  const { language } = useLanguage();

  const sections = language === 'en' ? [
    { title: 'Member Details', desc: 'Full name, address, Aadhaar, PAN, phone number, and nominee details of each member.' },
    { title: 'Chit Amount & Terms', desc: 'Total chit value, monthly subscription amount, duration (10 months), and auction schedule.' },
    { title: 'Payment Schedule', desc: 'Monthly installment due dates, grace period, late payment penalties, and payment methods.' },
    { title: 'Auction Rules', desc: 'Bidding process, maximum discount limits, tie-breaking rules, and dividend distribution method.' },
    { title: 'Foreman Rights & Duties', desc: 'Commission structure (1% per month), responsibilities, and obligations of NVS CHIT ENTERPRISES as foreman.' },
    { title: 'Default & Termination', desc: 'Consequences of default, substitute member rules, foreclosure terms, and dispute resolution process.' },
  ] : [
    { title: 'உறுப்பினர் விவரங்கள்', desc: 'ஒவ்வொரு உறுப்பினரின் முழு பெயர், முகவரி, ஆதார், PAN, தொலைபேசி எண் மற்றும் பரிந்துரைக்கப்பட்டவர் விவரங்கள்.' },
    { title: 'சீட்டு தொகை & நிபந்தனைகள்', desc: 'மொத்த சீட்டு மதிப்பு, மாதாந்திர சந்தா தொகை, காலம் (10 மாதங்கள்) மற்றும் ஏல அட்டவணை.' },
    { title: 'கட்டண அட்டவணை', desc: 'மாதாந்திர தவணை செலுத்த வேண்டிய தேதிகள், சலுகை காலம், தாமதமான கட்டணத் தண்டனைகள் மற்றும் கட்டண முறைகள்.' },
    { title: 'ஏல விதிகள்', desc: 'ஏல செயல்முறை, அதிகபட்ச தள்ளுபடி வரம்புகள், சமநிலை-உடைக்கும் விதிகள் மற்றும் ஈவுத்தொகை விநியோக முறை.' },
    { title: 'நிர்வாகி உரிமைகள் & கடமைகள்', desc: 'கமிஷன் கட்டமைப்பு (மாதத்திற்கு 1%), NVS சீட்டு நிறுவனத்தின் நிர்வாகியாக பொறுப்புகள் மற்றும் கடமைகள்.' },
    { title: 'இயல்புநிலை & நிறுத்தம்', desc: 'இயல்புநிலையின் விளைவுகள், மாற்று உறுப்பினர் விதிகள், முன்பு மூட நிபந்தனைகள் மற்றும் தகராறு தீர்வு செயல்முறை.' },
  ];

  return (
    <section className="section-padding bg-section-alt">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <FileSignature className="w-3.5 h-3.5 text-premium-gold" />
            <span>{language === 'en' ? 'Agreement Details' : 'ஒப்பந்த விவரங்கள்'}</span>
          </div>
          <h2 className="section-title">
            {language === 'en'
              ? <>What's in Your <span className="text-gradient-gold">Chit Agreement?</span></>
              : <>உங்கள் <span className="text-gradient-gold">சீட்டு ஒப்பந்தத்தில்</span> என்ன இருக்கிறது?</>}
          </h2>
          <p className="section-subtitle">
            {language === 'en'
              ? 'Every member receives a comprehensive chit agreement covering all rights, obligations, and terms of participation.'
              : 'ஒவ்வொரு உறுப்பினரும் அனைத்து உரிமைகள், கடமைகள் மற்றும் பங்கேற்பு விதிமுறைகளை உள்ளடக்கிய விரிவான சீட்டு ஒப்பந்தத்தைப் பெறுவார்.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group bg-white border border-border-light rounded-xl p-5 hover:border-premium-gold/35 hover:shadow-lg hover:shadow-primary-blue/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${iconColors[i]} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColors[i]} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                  {icons[i]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1 group-hover:text-primary-blue transition-colors">{section.title}</h3>
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
            {language === 'en'
              ? 'Agreement is executed on non-judicial stamp paper as per Tamil Nadu Stamp Act and registered with the Sub-Registrar of Assurances.'
              : 'ஒப்பந்தம் தமிழ்நாடு முத்திரைச் சட்டத்தின்படி நீதிமன்றம் சாரா முத்திரைத் தாளில் செயல்படுத்தப்பட்டு ஆய்வக பதிவாளரிடம் பதிவு செய்யப்படுகிறது.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
