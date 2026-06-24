import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Landmark, ShieldCheck, Smile } from 'lucide-react';

const stats = [
  { icon: <Users className="w-5 h-5" />, value: 10000, suffix: '+', label: 'Active Members', sub: 'Across India' },
  { icon: <Landmark className="w-5 h-5" />, value: 100, suffix: ' Cr+', label: 'Funds Managed', sub: 'Securely Rotating' },
  { icon: <ShieldCheck className="w-5 h-5" />, value: 500, suffix: '+', label: 'Active Groups', sub: 'Fully Regulated' },
  { icon: <Smile className="w-5 h-5" />, value: 98, suffix: '%', label: 'Satisfaction Rate', sub: 'Verified Reviews' },
];

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

export const Stats = () => (
  <section className="py-10 bg-white border-y border-border-light">
    <div className="section-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-light rounded-2xl overflow-hidden border border-border-light">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white px-8 py-8 flex flex-col items-center text-center group hover:bg-primary-blue/2 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-blue/8 text-primary-blue flex items-center justify-center mb-4 group-hover:bg-premium-gold/12 group-hover:text-premium-gold transition-colors">
              {stat.icon}
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-1">
              <Counter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-sm font-bold text-text-primary">{stat.label}</p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
