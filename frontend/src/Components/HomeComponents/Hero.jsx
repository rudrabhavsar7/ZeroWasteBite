import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import ImpactMetrics from "./ImpactMetrics";

const Hero = () => {
  const headingParentVariants = {
    initial: { opacity: 0, filter: "blur(10px)", scale: 0.95 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.5,
        staggerChildren: 0.2,
        staggerDirection: 1,
        ease: "easeInOut",
      },
    },
  };

  const headingChildVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  return (
    <motion.div
      variants={headingParentVariants}
      className="h-screen flex flex-col items-center justify-center bg-white overflow-x-hidden overflow-y-visible mt-20"
    >
      <motion.div
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.h1
          variants={headingChildVariants}
          className="text-3xl mt-6 mb-1 sm:text-4xl font-bold sm:mt-5 sm:mb-2 text-primary-content "
        >
          ZeroWaste<span className="text-secondary">Bite</span>
        </motion.h1>
        <motion.p
          variants={headingChildVariants}
          className="text-md sm:text-lg text-gray-700 mb-4"
        >
          Empowering Generosity. Eliminating Waste.
        </motion.p>
      </motion.div>
      <ImpactMetrics />
    </motion.div>
  );
};

export default Hero;
