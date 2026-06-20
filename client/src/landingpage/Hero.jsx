import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Shield, ArrowRight } from 'lucide-react';

export const Hero = ({ onNavigate }) => {
  return (
    <section id="home" className="relative h-screen pt-28 pb-20 md:pt-36 md:pb-28 lg:pt-44 lg:pb-32 flex items-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white">
      <div className="absolute top-20 left-10 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-primary-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-premium-gold/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-secondary-blue/5 blur-[100px] pointer-events-none" />

      <div className="section-container w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20 items-center">

          <div className="flex flex-col justify-center items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-white border border-premium-gold/20 rounded-full px-5 py-2 w-fit mb-6 shadow-sm"
            >
              <span className="flex w-2.5 h-2.5 rounded-full bg-success animate-pulse-subtle" />
              <span className="text-sm font-semibold tracking-wide text-premium-gold">Govt. Registered & Secure Scheme</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold tracking-tight text-text-primary leading-[1.05] mb-6"
            >
              Secure Your Financial Future with{' '}
              <span className="text-gradient-blue">Trusted Chit Fund</span>{' '}
              <span className="gold-underline text-gradient-gold">Investments</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed"
            >
              Save systematically, borrow interest-free, and grow your wealth. JOD Chits combines the age-old wisdom of mutual credit with next-gen digital transparency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 mb-10"
            >
              <button
                onClick={() => onNavigate('contact')}
                className="btn-primary px-10 py-4 text-base sm:text-lg shadow-xl shadow-premium-gold/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => onNavigate('plans')}
                className="btn-secondary px-9 py-4 text-base sm:text-lg"
              >
                <span>Explore Plans</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-x-8 gap-y-3 pt-6 border-t border-border-light"
            >
              <div className="flex items-center gap-2.5 text-sm sm:text-base text-text-secondary">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>No Credit Score Required</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm sm:text-base text-text-secondary">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>Full Digital Transparency</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex  items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-5 -left-5 w-28 h-28 bg-premium-gold/10 rounded-3xl -rotate-12 blur-xl pointer-events-none" />
              <div className="absolute -bottom-5 -right-5 w-36 h-36 bg-primary-blue/10 rounded-3xl rotate-6 blur-xl pointer-events-none" />
              <div className="relative bg-white/90 backdrop-blur-xl border border-border-light rounded-3xl p-2 shadow-2xl shadow-primary-blue/5">
                <div className="flex items-center gap-4  mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue to-dark-blue flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary font-medium">Dashboard Preview</p>
                    <p className="text-base font-bold text-text-primary">Your Savings Growth</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Total Invested</span>
                    <span className="text-base font-bold text-text-primary">₹2,40,000</span>
                  </div>
                  <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1.2, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-primary-blue to-secondary-blue rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Earned Dividends</span>
                    <span className="text-base font-bold text-premium-gold">+₹18,720</span>
                  </div>
                  <div className="h-2.5 bg-amber-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 1.2, delay: 1 }}
                      className="h-full bg-gradient-to-r from-premium-gold to-gold-400 rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-border-light">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="text-sm text-text-secondary">Fully insured & regulated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
