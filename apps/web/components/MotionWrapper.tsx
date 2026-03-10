"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  staggerDelay?: number;
  initial?: import("framer-motion").Target | import("framer-motion").VariantLabels | boolean;
  onViewportEnter?: () => void;
  margin?: string;
  transition?: any; // Added for flexible overrides
};

export const FadeIn = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  initial,
  onViewportEnter,
}: MotionProps) => (
  <motion.div
    initial={initial !== undefined ? initial : { opacity: 0, y: 20, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once, amount, margin: "0px 0px -50px 0px" }}
    transition={{ 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1], 
      delay,
    }}
    onViewportEnter={onViewportEnter}
    className={cn(className, "transform-gpu")}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  initial,
}: MotionProps) => (
  <motion.div
    initial={initial !== undefined ? initial : { opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, amount, margin: "0px 0px -50px 0px" }}
    transition={{ 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
      delay,
    }}
    className={cn(className, "transform-gpu")}
  >
    {children}
  </motion.div>
);

export const SlideInLeft = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  initial,
}: MotionProps) => (
  <motion.div
    initial={initial !== undefined ? initial : { opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once, amount, margin: "0px 0px -50px 0px" }}
    transition={{ 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
      delay,
    }}
    className={cn(className, "transform-gpu")}
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
  initial,
}: MotionProps) => (
  <motion.div
    initial={initial !== undefined ? initial : { opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once, amount, margin: "0px 0px -50px 0px" }}
    transition={{ duration: 0.4, delay, ease: [0.33, 1, 0.68, 1] }}
    className={cn(className, "transform-gpu")}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  staggerDelay = 0.1,
  margin = "0px 0px -50px 0px",
}: MotionProps) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once, amount, margin }}
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }}
    className={cn(className, "transform-gpu")}
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
      hidden: { opacity: 0, y: 15 },
      show: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
    className={cn(className, "transform-gpu")}
  >
    {children}
  </motion.div>
);

export const BlurIn = ({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  initial,
}: MotionProps) => (
  <motion.div
    initial={initial !== undefined ? initial : { opacity: 0, scale: 0.98, y: 15 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once, amount, margin: "0px 0px -50px 0px" }}
    transition={{ 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1], 
      delay,
    }}
    className={cn(className, "transform-gpu")}
  >
    {children}
  </motion.div>
);
