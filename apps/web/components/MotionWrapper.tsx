"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  staggerDelay?: number;
};

export const FadeIn = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.1,
}: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
    viewport={{ once, amount }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.1,
}: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
    viewport={{ once, amount }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.5,
}: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
    viewport={{ once, amount }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.1,
  staggerDelay = 0.1,
}: MotionProps) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once, amount }}
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
      exit: { opacity: 0, transition: { duration: 0.3 } },
    }}
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);
