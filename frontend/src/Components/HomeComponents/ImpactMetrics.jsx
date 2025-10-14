import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { Link } from "react-router-dom";

// (Removed unused media/inner variants)

const metricParent = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delayChildren: 1.6, staggerChildren: 0.15 } }
};

const metricItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const metricsData = [
  {
    label: "Meals Rescued",
    value: 12450,
    icon: (
      <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
    ),
    desc: "Surplus meals redistributed to communities instead of landfills."
  },
  {
    label: "NGOs Supported",
    value: 32,
    icon: (
      <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg>
    ),
    desc: "Partner organizations distributing food to those in need."
  },
  {
    label: "Active Volunteers",
    value: 540,
    icon: (
      <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-4-4h-1" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 0 0-4 4v2h8v-2a4 4 0 0 0-4-4z" /></svg>
    ),
    desc: "People volunteering their time to rescue and deliver food."
  },
  {
    label: "CO₂e Saved (kg)",
    value: 18700,
    icon: (
      <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5 0a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
    ),
    desc: "Greenhouse gas emissions prevented by food rescue."
  }
];

const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const frames = Math.round((duration / 1000) * 60);
    const increment = target / frames;
    let frame = 0;
    const id = requestAnimationFrame(function update() {
      frame++;
      start += increment;
      if (frame >= frames) {
        setCount(target);
      } else {
        setCount(Math.floor(start));
        requestAnimationFrame(update);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return count;
};

const MetricCard = ({ label, value, icon, desc }) => {
  const display = useCountUp(value);
  return (
    <motion.div
      variants={metricItem}
      className="flex flex-col items-center text-center bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg px-7 py-8 min-w-[14rem] max-w-xs mx-auto"
    >
      <div className="mb-3">{icon}</div>
      <span className="text-4xl font-extrabold tracking-tight text-primary-content">{display.toLocaleString()}<span className="text-secondary">{value > 999 && display === value ? "+" : ""}</span></span>
      <span className="text-base font-semibold text-secondary mt-1 mb-2">{label}</span>
      <span className="text-sm text-gray-600 mt-1">{desc}</span>
    </motion.div>
  );
};

const ImpactMetrics = () => {
  return (
    <section id="impact" className="relative w-full overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary-content mb-12">Impact Snapshot</h2>
      <motion.div
        variants={metricParent}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
      >
        {metricsData.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </motion.div>
      <p className="text-center text-gray-600 mt-10 max-w-2xl mx-auto">
        Real-time cumulative figures showing how the ZeroWasteBite community diverts edible food from landfills and nourishes people in need.
      </p>
      <div className="flex justify-center mt-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/register"
            className="inline-block rounded-xl bg-secondary px-7 py-4 font-semibold text-primary-content shadow-md hover:shadow-lg transition-shadow"
          >
            Join As A Donor / Volunteer
          </Link>
        </motion.div>
      </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
