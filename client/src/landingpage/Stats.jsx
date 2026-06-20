import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

const StatCounter = ({ icon, value, suffix, label, description, index }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const incrementTime = Math.max(Math.floor(duration / end), 20);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / incrementTime));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatNumber = (num) => num.toLocaleString('en-IN');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6 }}
      className="bg-white border border-border-light rounded-2xl p-7 sm:p-8 md:p-10 relative group cursor-default shadow-sm hover:shadow-xl hover:shadow-primary-blue/5 hover:border-premium-gold/40 transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-blue/5 border border-primary-blue/10 flex items-center justify-center text-premium-gold group-hover:bg-gradient-to-br group-hover:from-premium-gold group-hover:to-gold-600 group-hover:text-white group-hover:border-premium-gold/30 group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <span className="text-xs md:text-sm text-text-secondary uppercase tracking-wider font-semibold">Live</span>
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 flex items-baseline">
          <span className="text-primary-blue">
            {formatNumber(count)}
          </span>
          <span className="text-premium-gold ml-1.5 text-xl md:text-2xl lg:text-3xl">{suffix}</span>
        </h3>
        <h4 className="text-base md:text-lg font-bold text-text-primary mb-1.5">{label}</h4>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export const Stats = () => {
  const statsData = [
    { icon: <Users size={26} />, value: 10000, suffix: '+', label: 'Active Members', description: 'Trusted by verified savers & borrowers nationwide.' },
    { icon: <Award size={26} />, value: 100, suffix: ' Cr+', label: 'Managed Funds', description: 'Capital securely rotating through Chit auctions.' },
    { icon: <ShieldCheck size={26} />, value: 500, suffix: '+', label: 'Active Chit Groups', description: 'Fully regulated groups running concurrently.' },
    { icon: <HeartHandshake size={26} />, value: 98, suffix: '%', label: 'Satisfaction Rate', description: 'Customers praising our transparency & payout speed.' },
  ];

  return (
    <section className="section-padding bg-section-alt">
      <div className="section-container relative z-10">
        <div className="section-header">
          <div className="section-badge"><span>Platform Highlights</span></div>
          <h2 className="section-title">Trusted by <span className="text-gradient-blue">10,000+ Members</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, index) => (
            <StatCounter key={index} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
