"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 2,
  className = "",
  separator = ",",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration: duration * 1000,
  });
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(to);
      }, delay * 1000);
    }
  }, [isInView, motionValue, to, delay]);

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest)
          .toLocaleString("en-US")
          .replace(/,/g, separator);
      }
    });
    return () => unsubscribe();
  }, [springValue, separator]);

  return <span className={className} ref={ref} />;
}
