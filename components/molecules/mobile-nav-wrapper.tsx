"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NavDock } from "./navigation";

export const MobileNavWrapper = memo(() => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const updateVisibility = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Show nav when scrolling up or at top of page
    if (scrollDelta < -8 || currentScrollY < 50) {
      setIsVisible(true);
    }
    // Hide nav when scrolling down past threshold
    else if (scrollDelta > 15 && currentScrollY > 80) {
      setIsVisible(false);
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(updateVisibility);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateVisibility]);

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 16,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
            }
      }
      className="fixed bottom-5 left-1/2 -translate-x-1/2 md:hidden z-50 will-change-transform"
      style={{ transform: "translateX(-50%)" }}
    >
      <NavDock isMobile={true} />
    </motion.div>
  );
});

MobileNavWrapper.displayName = "MobileNavWrapper";
