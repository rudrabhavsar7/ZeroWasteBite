import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";
import { IconLogout, IconX } from "@tabler/icons-react";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const hydrate = useUserStore((state) => state.hydrate);
  const logout = useUserStore((state) => state.logout);

  useEffect(() => {
    const fetchUser = async () => {
      const success = await hydrate();
      if (!success) {
        console.error("Failed to hydrate user");
      }
    };
    fetchUser();
  }, [hydrate]);

  const Items = [
    { name: "Home", path: "/" },
    { name: "Donate", path: "/donate" },
    { name: "Donations", path: "/donations" },
  ];
  const [isOpen, setIsOpen] = useState(false);

  const parentVariants = {
    initial: {
      height: 0,
      width: 0,
    },
    animate: {
      height: "calc(100vh - 5.5vh)",
      width: "calc(100% - 32px)",
      transition: {
        duration: 0.3,
        delay: 0, // No delay when opening
      },
    },
    exit: {
      height: 0,
      width: 0,
      transition: {
        duration: 0.3,
        delay: 0.5, // Delay only when closing
      },
    },
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <nav className="fixed top-0 right-0 px-4 py-2 w-full h-24 bg-white z-50">
      <div className="flex flex-row items-center justify-between ">
        <img
          src="logo.png"
          onClick={() => navigate("/")}
          className="h-20 w-20"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="h-16 w-15 bg-secondary rounded-tl-xl rounded-bl-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 shadow-md hover:shadow-lg ring-1 ring-secondary/40"
        >
          <AnimatePresence>
            {!isOpen ? (
              <svg
                className="w-8 h-8"
                fill="#1c8309"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.2,
                  delay: 0.2,
                }}
              >
                <IconX className="w-8 h-8 text-primary-content" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* subtle gradient divider under navbar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60" />

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={parentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-4 top-4 z-40 h-[calc(100vh-32px)] w-[calc(100%-32px)] overflow-hidden bg-primary-content rounded-lg shadow-lg"
          >
            {/* decorative gradient overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary-content/30 via-transparent to-secondary/40" />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.1,
                delay: 0,
              }}
              onClick={() => setIsOpen(false)}
              className="fixed right-3 top-3 h-16 w-15 items-center justify-center flex text-black text-2xl hover:text-gray-300 transition-colors"
            >
              <IconX />
            </motion.button>
            {user && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.1,
                  delay: 0.5,
                }}
                onClick={() => {
                  logout();
                  toast.success("Logout successful!");
                  navigate("/");
                  setIsOpen(false);
                }}
                className="fixed left-4 top-4 h-16 w-15 rounded-tr-xl rounded-br-xl items-center justify-center flex text-primary-content bg-secondary text-2xl hover:text-red-900 transition-colors"
              >
                <IconLogout />
              </motion.button>
            )}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.1,
                  duration: 0.3,
                  staggerChildren: 0.1,
                  staggerDirection: 1,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.3,
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                },
              }}
              className="flex flex-col items-start justify-center gap-10 h-full text-white px-10"
            >
              {user &&
                Items.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link
                      to={item.path}
                      className="text-5xl md:text-8xl text-secondary hover:text-secondary-dark hover:font-bold transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <span className="block h-2 w-0 bg-secondary-dark rounded-full mt-2 transition-all duration-300 group-hover:w-1/2" />
                  </motion.li>
                ))}
              {!user && (
                <>
                  <motion.li
                    variants={itemVariants}
                    transition={{ duration: 0.5, delay: Items.length * 0.1 }}
                    className="group"
                  >
                    <Link
                      to="/login"
                      className="text-5xl md:text-8xl text-secondary hover:text-secondary-dark hover:font-bold transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <span className="block h-2 w-0 bg-secondary-dark rounded-full mt-3 ml-2 transition-all duration-300 group-hover:w-2/3" />
                  </motion.li>
                </>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
