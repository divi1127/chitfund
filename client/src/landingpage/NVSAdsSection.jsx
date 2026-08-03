import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Building2, Car, Gem, Briefcase, MapPin, Phone, CheckCircle2,
  FileText, Shield, Star, ChevronLeft, ChevronRight, Clock, Percent,
  BadgeCheck, TrendingUp, Landmark, Eye, X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────────── DATA ─────────────────────────── */

const LOAN_TYPES = [
  {
    icon: Home,
    color: 'from-blue-600 to-blue-800',
    glow: 'rgba(37,99,235,0.35)',
    en: { title: 'Home Loan', subtitle: 'New Purchase', interest: '8.5% p.a.', desc: 'Buy your dream home with easy EMI & minimal documentation.' },
    ta: { title: 'வீட்டு கடன்', subtitle: 'புதிய வாங்குதல்', interest: '8.5% ஆண்டு', desc: 'எளிய EMI மூலம் உங்கள் கனவு வீட்டை வாங்குங்கள்.' },
  },
  {
    icon: Home,
    color: 'from-emerald-600 to-emerald-800',
    glow: 'rgba(5,150,105,0.35)',
    en: { title: 'Resale Home Loan', subtitle: 'Resale Purchase', interest: '9% p.a.', desc: 'Hassle-free finance for resale property with quick approval.' },
    ta: { title: 'வீட்டு கடன் (மறுவிற்பனை)', subtitle: 'மறுவிற்பனை', interest: '9% ஆண்டு', desc: 'மறுவிற்பனை சொத்திற்கு விரைவான கடன் அனுமதி.' },
  },
  {
    icon: TrendingUp,
    color: 'from-rose-600 to-rose-800',
    glow: 'rgba(225,29,72,0.35)',
    en: { title: 'Balance Transfer', subtitle: 'Top-Up Loan', interest: '8% p.a.', desc: 'Transfer your existing loan balance & get additional top-up funds.' },
    ta: { title: 'வீட்டு கடன் நிலுவை இடமாற்றம்', subtitle: 'கூடுதல் தொகை', interest: '8% ஆண்டு', desc: 'தற்போதைய கடனை இடமாற்றி கூடுதல் நிதி பெறுங்கள்.' },
  },
  {
    icon: MapPin,
    color: 'from-amber-500 to-orange-700',
    glow: 'rgba(245,158,11,0.35)',
    en: { title: 'Plot / Land Loan', subtitle: 'Self Construction', interest: '9.5% p.a.', desc: 'Buy land or build your own house with tailored loan solutions.' },
    ta: { title: 'மனை / நிலம் கடன்', subtitle: 'சுய கட்டுமானம்', interest: '9.5% ஆண்டு', desc: 'நிலம் வாங்குதல் மற்றும் வீடு கட்டுவதற்கான சிறப்பு கடன்.' },
  },
  {
    icon: Building2,
    color: 'from-violet-600 to-purple-800',
    glow: 'rgba(124,58,237,0.35)',
    en: { title: 'Loan Against Property', subtitle: 'Residential / Commercial', interest: '10% p.a.', desc: 'Unlock the value of your property for personal or business needs.' },
    ta: { title: 'சொத்து மீதான கடன்', subtitle: 'வீடு மற்றும் வணிகம்', interest: '10% ஆண்டு', desc: 'உங்கள் சொத்தின் மதிப்பை பயன்படுத்தி நிதி பெறுங்கள்.' },
  },
  {
    icon: Briefcase,
    color: 'from-sky-600 to-cyan-800',
    glow: 'rgba(2,132,199,0.35)',
    en: { title: 'Business Loan', subtitle: 'MSME / Commercial', interest: '11% p.a.', desc: 'Grow your business with fast, collateral-free business loans.' },
    ta: { title: 'வணிக கடன்', subtitle: 'MSME / வணிகம்', interest: '11% ஆண்டு', desc: 'உங்கள் வணிகத்தை விரைவாக வளர்க்க பிணை இல்லா கடன்.' },
  },
  {
    icon: Car,
    color: 'from-teal-600 to-teal-800',
    glow: 'rgba(13,148,136,0.35)',
    en: { title: 'Vehicle Loan', subtitle: 'Car / Two Wheeler', interest: '9.8% p.a.', desc: 'Drive your dream vehicle with competitive rates & fast disbursal.' },
    ta: { title: 'வாகன கடன்', subtitle: 'கார் / இரு சக்கரம்', interest: '9.8% ஆண்டு', desc: 'போட்டியான வட்டியில் விரைவாக வாகன கடன் பெறுங்கள்.' },
  },
  {
    icon: Gem,
    color: 'from-pink-600 to-fuchsia-800',
    glow: 'rgba(219,39,119,0.35)',
    en: { title: 'Jewel Loan', subtitle: 'Gold / Silver', interest: '7.5% p.a.', desc: 'Get instant funds against your gold jewellery at low interest.' },
    ta: { title: 'நகை கடன்', subtitle: 'தங்கம் / வெள்ளி', interest: '7.5% ஆண்டு', desc: 'உங்கள் நகைகளை வைத்து உடனடி பணம் பெறுங்கள்.' },
  },
];

const DOCUMENTS = {
  en: [
    'Aadhaar Card & PAN Card',
    'Bank Statements (6 months)',
    'Salary Slips / IT Returns',
    'Property Documents',
    'Photo & Signature',
    'CIBIL Score Report',
  ],
  ta: [
    'ஆதார் அட்டை & பான் அட்டை',
    'வங்கி அறிக்கை (6 மாதம்)',
    'சம்பள சீட்டு / IT வருமான அறிக்கை',
    'சொத்து ஆவணங்கள்',
    'புகைப்படம் & கையொப்பம்',
    'CIBIL மதிப்பெண் அறிக்கை',
  ],
};

const LAND_LISTINGS = [
  {
    badge: { en: 'DTCP Approved', ta: 'DTCP அங்கீகாரம்' },
    en: {
      title: 'Prime Residential Plot',
      location: 'Avaniyapuram, Madurai',
      price: '₹18 Lakh',
      area: '3 Cents',
      type: 'Residential Plot',
      desc: 'DTCP approved residential plot in fast-growing Avaniyapuram. Clear title, Patta ready.',
    },
    ta: {
      title: 'சிறப்பு குடியிருப்பு மனை',
      location: 'அவனியாபுரம், மதுரை',
      price: '₹18 லட்சம்',
      area: '3 சென்ட்',
      type: 'குடியிருப்பு மனை',
      desc: 'வேகமாக வளரும் அவனியாபுரத்தில் DTCP அங்கீகரிக்கப்பட்ட மனை. பட்டா தயார்.',
    },
    gradient: 'from-blue-900 via-blue-950 to-slate-900',
    accent: '#f59e0b',
    emoji: '🏠',
  },
  {
    badge: { en: 'RERA Approved', ta: 'RERA அங்கீகாரம்' },
    en: {
      title: 'House & Land for Sale',
      location: 'Brahma Nagar, Avaniyapuram',
      price: '₹45 Lakh',
      area: '3 BHK House',
      type: 'Independent House',
      desc: '3-floor independent house, GPS tagged, Brahma Nagar. Immediate registration possible.',
    },
    ta: {
      title: 'வீடு & நிலம் விற்பனை',
      location: 'பிரம்மா நகர், அவனியாபுரம்',
      price: '₹45 லட்சம்',
      area: '3 BHK வீடு',
      type: 'தனி வீடு',
      desc: '3 தள தனி வீடு, GPS குறி, பிரம்மா நகர். உடனடி பதிவு சாத்தியம்.',
    },
    gradient: 'from-emerald-900 via-emerald-950 to-slate-900',
    accent: '#10b981',
    emoji: '🏡',
  },
  {
    badge: { en: 'Agricultural Land', ta: 'விவசாய நிலம்' },
    en: {
      title: 'Agricultural Land',
      location: 'Simmakkal, Madurai',
      price: '₹8 Lakh / Cent',
      area: '10 Cents',
      type: 'Agriculture / Plot',
      desc: 'Fertile agricultural land with patta & chitta. Suitable for farming or gated community development.',
    },
    ta: {
      title: 'விவசாய நிலம்',
      location: 'சிம்மக்கல், மதுரை',
      price: '₹8 லட்சம் / சென்ட்',
      area: '10 சென்ட்',
      type: 'விவசாயம் / மனை',
      desc: 'பட்டா & சிட்டா உள்ள வளமான விவசாய நிலம். farming அல்லது திட்டமிட்ட மனை உருவாக்கத்திற்கு ஏற்றது.',
    },
    gradient: 'from-amber-900 via-amber-950 to-slate-900',
    accent: '#f59e0b',
    emoji: '🌾',
  },
];

// API base for fetching live land listings
const API_BASE = import.meta.env.VITE_API_BASE || 'https://chitfund-cxnp.onrender.com/api';

const resolveImg = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = API_BASE.replace(/\/api$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
};

const FEATURES = {
  en: [
    { icon: Percent, label: 'Low Interest Rates' },
    { icon: Clock, label: 'Quick Approval' },
    { icon: FileText, label: 'Min. Documentation' },
    { icon: BadgeCheck, label: 'Customer Satisfaction' },
  ],
  ta: [
    { icon: Percent, label: 'குறைந்த வட்டி விகிதம்' },
    { icon: Clock, label: 'விரைவான அனுமதி' },
    { icon: FileText, label: 'குறைந்த ஆவணங்கள்' },
    { icon: BadgeCheck, label: 'வாடிக்கையாளர் திருப்தி' },
  ],
};

/* ─────────────────────────── SUB COMPONENTS ─────────────────────────── */

const LoanCard = ({ loan, lang, index }) => {
  const Icon = loan.icon;
  const data = loan[lang];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative group flex-shrink-0 w-64 md:w-72 rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/40 transition-all duration-300 hover:-translate-y-2 cursor-default"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        boxShadow: `0 4px 24px ${loan.glow}`,
      }}
    >
      {/* Top glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${loan.color} opacity-80`} />
      {/* Icon */}
      <div className="p-5">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${loan.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-white font-bold text-base leading-snug mb-0.5">{data.title}</h4>
        <p className="text-yellow-400 text-xs font-semibold mb-2">{data.subtitle}</p>
        <p className="text-slate-300 text-xs leading-relaxed mb-3">{data.desc}</p>

        {/* Interest badge */}
        <div className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-lg px-3 py-1.5 w-fit">
          <Percent className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-300 text-xs font-bold">{data.interest}</span>
        </div>
      </div>
    </motion.div>
  );
};

const LandCard = ({ listing, lang, index, onView }) => {
  // Support both API-fetched listings and legacy hardcoded listings
  const isApi = !listing.en; // API listings have flat fields
  const title    = isApi ? listing.name        : listing[lang]?.title;
  const location = isApi ? listing.location    : listing[lang]?.location;
  const price    = isApi ? (() => {
    const n = listing.amount;
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + ' Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(2) + ' L';
    return '₹' + Number(n).toLocaleString('en-IN');
  })() : listing[lang]?.price;
  const area    = isApi ? listing.area        : listing[lang]?.area;
  const type    = isApi ? listing.type        : listing[lang]?.type;
  const desc    = isApi ? listing.description : listing[lang]?.desc;
  const badge   = isApi ? listing.badge       : listing.badge?.[lang] || listing.badge;
  const accent  = listing.accent || '#f59e0b';
  const phone   = isApi ? (listing.phone || '9600924752') : '9600924752';

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45 }}
      className="relative rounded-2xl overflow-hidden border border-white/10 h-full"
      style={{ background: `linear-gradient(135deg, #0f172a, #1e293b)` }}
    >
      {/* Property image or placeholder */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0d1b2a 0%, #1a2744 50%, #0d1b2a 100%)` }}
      >
        {listing.image ? (
          <img src={resolveImg(listing.image)} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        ) : (
          <>
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0,#f59e0b 1px, transparent 0,transparent 50%)',
                backgroundSize: '20px 20px',
              }}
            />
            <span className="text-7xl relative z-10 drop-shadow-2xl">{listing.emoji || '🏠'}</span>
          </>
        )}

        {/* Badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-slate-900"
          style={{ background: accent, zIndex: 2 }}
        >
          {badge}
        </div>

        {/* Location pin */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-full px-3 py-1" style={{ zIndex: 2 }}>
          <MapPin className="w-3 h-3 text-yellow-400" />
          <span className="text-white text-xs font-medium">{location}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-white font-bold text-base">{title}</h4>
            <p className="text-slate-400 text-xs">{type}</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-extrabold text-lg leading-none">{price}</p>
            <p className="text-slate-400 text-xs">{area}</p>
          </div>
        </div>
        {desc && <p className="text-slate-300 text-xs leading-relaxed mb-4">{desc}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => onView && onView(listing)}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-bold text-white border border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Eye className="w-4 h-4" style={{ color: accent }} />
            {lang === 'en' ? 'View' : 'பார்க்க'}
          </button>
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-900 transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
          >
            <Phone className="w-4 h-4" />
            {lang === 'en' ? 'Enquire Now' : 'இப்போது விசாரிக்கவும்'}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────── LAND DETAIL MODAL ─────────────────────────── */

const LandDetailModal = ({ listing, lang, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const isApi = !listing.en;
  const title    = isApi ? listing.name        : listing[lang]?.title;
  const location = isApi ? listing.location    : listing[lang]?.location;
  const price    = isApi ? (() => {
    const n = listing.amount;
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + ' Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(2) + ' L';
    return '₹' + Number(n).toLocaleString('en-IN');
  })() : listing[lang]?.price;
  const area    = isApi ? listing.area        : listing[lang]?.area;
  const type    = isApi ? listing.type        : listing[lang]?.type;
  const desc    = isApi ? listing.description : listing[lang]?.desc;
  const address = isApi ? listing.address     : null;
  const badge   = isApi ? listing.badge       : listing.badge?.[lang] || listing.badge;
  const accent  = listing.accent || '#f59e0b';
  const phone   = isApi ? (listing.phone || '9600924752') : '9600924752';
  const image   = listing.image;

  const infoRows = [
    { label: lang === 'en' ? 'Type' : 'வகை', value: type },
    { label: lang === 'en' ? 'Area' : 'பரப்பளவு', value: area },
    { label: lang === 'en' ? 'Location' : 'இடம்', value: location },
    { label: lang === 'en' ? 'Address' : 'முகவரி', value: address },
  ].filter(r => r.value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(4,10,20,0.88)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, cursor: 'pointer',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860, maxHeight: '92vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          cursor: 'default',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ background: accent, color: '#0f172a', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, flexShrink: 0 }}>{badge}</span>
            <h3 style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image — portrait & landscape friendly (contain, no cropping) */}
        <div style={{ background: '#0a0f1c', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260, maxHeight: '55vh', overflow: 'hidden' }}>
          {image ? (
            <img src={resolveImg(image)} alt={title} style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', display: 'block' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
              <span style={{ fontSize: 88, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}>{listing.emoji || '🏠'}</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 100, padding: '6px 12px' }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{location}</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: 24, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
            <span style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900 }}>{price}</span>
            {area && <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>{area}</span>}
            {type && <span style={{ color: '#cbd5e1', fontSize: 13, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 100 }}>{type}</span>}
          </div>

          {desc && <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>{desc}</p>}

          {infoRows.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 22 }}>
              {infoRows.map((r) => (
                <div key={r.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{r.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={`tel:${phone}`} style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: `linear-gradient(90deg, ${accent}, ${accent}cc)`, color: '#0f172a', fontWeight: 800, fontSize: 14, padding: '12px 20px', borderRadius: 12, textDecoration: 'none' }}>
              <Phone className="w-4 h-4" /> {phone}
            </a>
            <a href={`tel:${phone}`} style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f5f9', fontWeight: 700, fontSize: 14, padding: '12px 20px', borderRadius: 12, textDecoration: 'none' }}>
              {lang === 'en' ? 'Enquire Now' : 'இப்போது விசாரிக்கவும்'}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

export const NVSAdsSection = () => {
  const { language } = useLanguage();
  const lang = language === 'ta' ? 'ta' : 'en';

  // Auto-scroll for loan cards
  const scrollRef = useRef(null);
  const [landIndex, setLandIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Land detail modal
  const [viewListing, setViewListing] = useState(null);

  // Live land listings from backend
  const [liveListings, setLiveListings] = useState([]);
  const [listingsLoaded, setListingsLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/lands/public`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setLiveListings(data); setListingsLoaded(true); })
      .catch(() => setListingsLoaded(true));
  }, []);

  // Use live listings if available, fallback to static
  const displayListings = listingsLoaded && liveListings.length > 0 ? liveListings : LAND_LISTINGS;

  // Infinite auto-scroll for loan cards
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame;
    let pos = 0;
    const speed = 0.6;
    const scroll = () => {
      if (!isPaused) {
        pos += speed;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [isPaused]);

  // Auto-advance land carousel
  useEffect(() => {
    if (displayListings.length === 0) return;
    const timer = setInterval(() => {
      setLandIndex((i) => (i + 1) % displayListings.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [displayListings.length]);

  const features = FEATURES[lang];
  const docs = DOCUMENTS[lang];

  const headingContent = lang === 'en'
    ? { badge: 'Partner Services', title: 'NVS Loans', highlight: '& Promoter', subtitle: 'Trusted financial solutions — Home Loans, Property Sales & Legal Documentation. Your trust, our priority.' }
    : { badge: 'கூட்டாளர் சேவைகள்', title: 'NVS கடன்கள்', highlight: '& புரமோட்டர்', subtitle: 'நம்பகமான நிதி தீர்வுகள் — வீட்டு கடன், சொத்து விற்பனை மற்றும் சட்ட ஆவணப்படுத்தல். உங்கள் நம்பிக்கை, எங்கள் முன்னுரிமை.' };

  return (
    <section
      id="nvs-ads"
      style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1b2a 40%, #0a0f1e 100%)',
        padding: '72px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative stars */}
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: '#f59e0b',
            opacity: 0.15 + (i % 4) * 0.15,
            top: `${5 + (i * 17) % 90}%`,
            left: `${3 + (i * 23) % 95}%`,
            animation: `starPulse ${2 + (i % 3)}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      <style>{`
        @keyframes starPulse { from { opacity: 0.1; } to { opacity: 0.5; } }
        .nvs-scroll-track::-webkit-scrollbar { display: none; }
        .nvs-scroll-track { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 100, padding: '6px 18px', marginBottom: 16,
            }}
          >
            <Star className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
              {headingContent.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff',
              lineHeight: 1.15, marginBottom: 14,
            }}
          >
            {headingContent.title}{' '}
            <span style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {headingContent.highlight}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ color: '#94a3b8', fontSize: 15, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}
          >
            {headingContent.subtitle}
          </motion.p>

          {/* 4 feature pills */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 100, padding: '8px 18px',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: '#f59e0b' }} />
                <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── LOAN TYPES SCROLLING STRIP ── */}
        <div style={{ marginBottom: 60 }}>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ color: '#fbbf24', fontSize: 20, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Landmark className="w-5 h-5" />
            {lang === 'en' ? 'Loan Products' : 'கடன் வகைகள்'}
          </motion.h3>

          <div
            ref={scrollRef}
            className="nvs-scroll-track"
            style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, cursor: 'grab' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Duplicate for infinite scroll */}
            {[...LOAN_TYPES, ...LOAN_TYPES].map((loan, i) => (
              <LoanCard key={i} loan={loan} lang={lang} index={i % LOAN_TYPES.length} />
            ))}
          </div>
        </div>

        {/* ── DOCUMENTS + LAND LISTINGS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

          {/* Documents Required */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg,#0f172a,#1e293b)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 20, padding: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText className="w-5 h-5" style={{ color: '#0f172a' }} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>
                  {lang === 'en' ? 'Documents Required' : 'தேவையான ஆவணங்கள்'}
                </h3>
                <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
                  {lang === 'en' ? 'For all loan types' : 'அனைத்து கடன் வகைகளுக்கும்'}
                </p>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {docs.map((doc, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
                  <span style={{ color: '#cbd5e1', fontSize: 14 }}>{doc}</span>
                </motion.li>
              ))}
            </ul>

            {/* Legal badges */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              {['RERA', 'DTCP', 'Patta'].map((badge) => (
                <div key={badge} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 8, padding: '4px 12px',
                }}>
                  <Shield className="w-3 h-3" style={{ color: '#10b981' }} />
                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Land / Property Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#fbbf24', fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <MapPin className="w-5 h-5" />
                {lang === 'en' ? 'Properties for Sale' : 'விற்பனைக்கு சொத்துகள்'}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setLandIndex((i) => (i - 1 + displayListings.length) % displayListings.length)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLandIndex((i) => (i + 1) % displayListings.length)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', minHeight: 380 }}>
              <AnimatePresence mode="wait">
                {displayListings.length > 0 ? (
                  <LandCard
                    key={landIndex}
                    listing={displayListings[landIndex % displayListings.length]}
                    lang={lang}
                    index={landIndex}
                    isActive
                    onView={setViewListing}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                    No properties listed yet.
                  </div>
                )}
              </AnimatePresence>

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {displayListings.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLandIndex(i)}
                    style={{
                      width: i === landIndex ? 22 : 8, height: 8,
                      borderRadius: 100,
                      background: i === landIndex ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CTA STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            marginTop: 52,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 20, padding: '28px 32px',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: 20,
          }}
        >
          <div>
            <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: 20, margin: 0 }}>
              {lang === 'en' ? '📞 Call Us for Best Loan Solutions!' : '📞 சிறந்த கடன் தீர்வுகளுக்கு அழைக்கவும்!'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>
              {lang === 'en'
                ? '153S North Veli Street, Simmakkal, Madurai – 625001'
                : '153S நார்த் வெலி தெரு, சிம்மக்கல், மதுரை – 625001'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="tel:9600924752"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(90deg,#f59e0b,#d97706)',
                color: '#0f172a', fontWeight: 800, fontSize: 15,
                padding: '12px 24px', borderRadius: 12,
                textDecoration: 'none', transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Phone className="w-4 h-4" /> 96009 24752
            </a>
            <a
              href="mailto:svnloans@gmail.com"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0', fontWeight: 700, fontSize: 14,
                padding: '12px 24px', borderRadius: 12,
                textDecoration: 'none', transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              svnloans@gmail.com
            </a>
          </div>
        </motion.div>

      </div>

      {/* ── Land detail modal ── */}
      <AnimatePresence>
        {viewListing && (
          <LandDetailModal
            listing={viewListing}
            lang={lang}
            onClose={() => setViewListing(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
