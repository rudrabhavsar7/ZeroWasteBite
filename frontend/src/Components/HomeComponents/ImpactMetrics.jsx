import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

// Variants reused to match heading style
const mediaVariants = {
  initial: { opacity: 0, filter: "blur(10px)", scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.5 }
  }
};

const innerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 1.0 } }
};

const metricParent = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delayChildren: 1.6, staggerChildren: 0.15 } }
};

const metricItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const metricsData = [
  { label: "Meals Rescued", value: 12450 },
  { label: "NGOs Supported", value: 32 },
  { label: "Active Volunteers", value: 540 },
  { label: "CO₂e Saved (kg)", value: 18700 }
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

const MetricCard = ({ label, value }) => {
  const display = useCountUp(value);
  return (
    <motion.div variants={metricItem} className="flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-4 min-w-[12rem]">
      <span className="text-3xl font-bold tracking-tight text-white">{display.toLocaleString()}<span className="text-secondary">{value > 999 && display === value ? "+" : ""}</span></span>
      <span className="text-sm uppercase tracking-wide text-white/70 mt-1">{label}</span>
    </motion.div>
  );
};

const ImpactMetrics = () => {
  return (
    <motion.div
      variants={mediaVariants}
      initial="initial"
      animate="animate"
      className="w-[calc(100vw-20vw)] bg-black rounded-2xl flex flex-col lg:flex-row items-stretch justify-between overflow-hidden"
    >
      {/* Image / visual side */}
      <motion.div
        variants={innerVariants}
        initial="initial"
        animate="animate"
        className="relative w-full lg:w-1/2 h-64 lg:h-auto"
      >
        <img
          src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=60"
          alt="Food rescue in action"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white max-w-xs">
          <p className="text-sm font-medium tracking-wide">Surplus meals redistributed to communities instead of landfills.</p>
        </div>
      </motion.div>

      {/* Metrics & CTA */}
      <motion.div
        variants={innerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center lg:items-start justify-center gap-8 px-10 py-12 w-full lg:w-1/2 text-white"
      >
        <h2 className="text-3xl font-semibold tracking-tight">Impact Snapshot</h2>
        <motion.div
          variants={metricParent}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl"
        >
          {metricsData.map(m => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </motion.div>
        <p className="text-sm text-white/60 max-w-md">Real-time cumulative figures showing how the ZeroWasteBite community diverts edible food from landfills and nourishes people in need.</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/register"
            className="inline-block rounded-lg bg-secondary px-6 py-3 font-semibold text-black shadow-md hover:shadow-lg transition-shadow"
          >
            Join As A Donor / Volunteer
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ImpactMetrics;
