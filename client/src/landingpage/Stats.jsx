import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Landmark, ShieldCheck, Smile } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

export const Stats = () => {
  const { t } = useLanguage();
  const stats = [
    { icon: <Users className="w-5 h-5" />, value: 1000, suffix: '+', labelKey: 'stat_members_label', subKey: 'stat_members_sub', color: 'from-blue-500 to-blue-700' },
    { icon: <Landmark className="w-5 h-5" />, value: 50, suffix: '+', labelKey: 'stat_groups_label', subKey: 'stat_groups_sub', color: 'from-indigo-500 to-indigo-700' },
    { icon: <ShieldCheck className="w-5 h-5" />, value: 100, suffix: '%', labelKey: 'stat_legal_label', subKey: 'stat_legal_sub', color: 'from-emerald-500 to-emerald-700' },
    { icon: <Smile className="w-5 h-5" />, value: 98, suffix: '%', labelKey: 'stat_satisfaction_label', subKey: 'stat_satisfaction_sub', color: 'from-amber-500 to-yellow-600' },
  ];

  return (
    <section className="py-12 bg-white border-y border-border-light relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative bg-white border border-border-light rounded-2xl p-6 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-blue/8 hover:border-primary-blue/25 transition-all duration-300 overflow-hidden cursor-default"
            >
              {/* Background gradient blob */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-8 group-hover:opacity-15 blur-xl transition-opacity`} />
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-1">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm font-bold text-text-primary">{t(stat.labelKey)}</p>
              <p className="text-xs text-text-secondary mt-0.5">{t(stat.subKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
