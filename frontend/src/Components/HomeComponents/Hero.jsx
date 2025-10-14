import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import useUserStore from "../../app/userStore";

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

  const user = useUserStore((s) => s.user);

  return (
    <>
      {/* Hero full-viewport section */}
      <motion.section
        variants={headingParentVariants}
        initial="initial"
        animate="animate"
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24"
      >

        <div className="text-center px-4">
          <motion.h1
            variants={headingChildVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary-content"
          >
            ZeroWaste<span className="text-secondary">Bite</span>
          </motion.h1>
          <motion.p
            variants={headingChildVariants}
            className="mt-3 text-base sm:text-lg md:text-xl text-gray-700"
          >
            Empowering Generosity. Eliminating Waste.
          </motion.p>

          <motion.div
            variants={headingChildVariants}
            className="mt-8 flex items-center justify-center gap-3"
          >
            {!user ? (
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-primary-content font-semibold px-6 py-3 shadow hover:shadow-md hover:brightness-95 transition"
                >
                  Join Us
                </Link>
              </motion.div>
            ) : (
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-primary-content font-semibold px-6 py-3 shadow hover:shadow-md hover:brightness-95 transition"
                >
                  Donate Now
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

export default Hero;
