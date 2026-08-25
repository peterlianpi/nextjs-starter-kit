"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger offset in seconds — use the item's grid index. */
  delay?: number;
  className?: string;
  /** Vertical travel distance in px before settling. */
  y?: number;
};

/**
 * Scroll-reveal wrapper: fades + slides content in when it enters the
 * viewport. Respects prefers-reduced-motion by rendering a plain div
 * (no transform animation) when the user opts out of motion.
 */
export function Reveal({ children, delay = 0, className, y = 24 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -64px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
