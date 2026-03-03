"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { FadeIn } from "../MotionWrapper";
import { TestimonialItem } from "@/types/home.types";

/**
 * TestimonialsSection Component
 * * Purpose: Displays curated feedback from alumni in an interactive carousel format.
 * Architecture:
 * - Slider Engine: Uses Framer Motion for hardware-accelerated slide transitions.
 * - Interaction: Supports both button-based pagination and touch/mouse drag gestures.
 * - Accessibility: Implements ARIA labels for navigation controls.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  if (!testimonials || testimonials.length === 0) return null;

  /* --- SLIDER STATE MANAGEMENT --- */
  // Manages the current slide index and the animation direction (left/right)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  /* --- ANIMATION DEFINITIONS --- */
  // Variants for the sliding effect including opacity and blur transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  /* --- SLIDER LOGIC HELPERS --- */
  // Handles gesture mathematics and index wrapping
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = testimonials.length - 1;
    if (nextIndex >= testimonials.length) nextIndex = 0;
    setCurrentIndex(nextIndex);
  };

  return (
    <section className="py-16 md:py-24 relative bg-slate-50 overflow-hidden">
      
      {/* --- CONTENT LAYOUT WRAPPER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          
          {/* --- SECTION HEADER --- */}
          <div className="mb-6 text-center relative z-10">
            <FadeIn delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-6">
                Kata <span className="text-blue-600">Alumni</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-sm md:text-base text-slate-900 max-w-xl mx-auto leading-relaxed">
                Mereka yang kini memimpin dan berkarya di berbagai sektor
                strategis, memberikan energi baru untuk negeri.
              </p>
            </FadeIn>
          </div>

          {/* --- INTERACTIVE CAROUSEL AREA --- */}
          <FadeIn delay={0.4}>
            <div className="max-w-2xl mx-auto relative">
              
              {/* SLIDE TRANSITION WINDOW */}
              <div className="relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);
                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    className="w-full cursor-grab active:cursor-grabbing"
                  >
                    {/* TESTIMONIAL CARD COMPONENT */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-7 flex flex-col items-center text-center transition-all duration-200 hover:border-blue-200 mb-6 w-full">
                      
                      {/* Quote Decorative Element */}
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 shrink-0">
                        <Quote className="w-4 h-4" fill="currentColor" />
                      </div>

                      {/* Main Quote Text */}
                      <p className="text-[15px] md:text-lg text-slate-900 font-medium mb-6 leading-relaxed max-w-lg">
                        "{testimonials[currentIndex].quote}"
                      </p>

                      {/* Author Attribution Meta */}
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 relative shrink-0 shadow-sm">
                          <Image
                            src={
                              testimonials[currentIndex].image.startsWith("/uploads")
                                ? `http://localhost:5000${testimonials[currentIndex].image}`
                                : testimonials[currentIndex].image
                            }
                            alt={testimonials[currentIndex].name}
                            fill
                            unoptimized
                            className="object-cover object-top"
                            priority
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
                            {testimonials[currentIndex].name}
                          </h3>
                          <p className="text-blue-600 font-medium text-[10px] md:text-xs mt-0.5">
                            {testimonials[currentIndex].role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* --- NAVIGATION & PAGINATION CONTROLS --- */}
              <FadeIn delay={0.5}>
                <div className="flex items-center justify-center gap-4">
                  
                  {/* Previous Button */}
                  <button
                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-900 hover:text-white hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center transition-all focus:outline-none"
                    onClick={() => paginate(-1)}
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dynamic Progress Dots */}
                  <div className="flex gap-1.5">
                    {testimonials.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? "w-5 bg-blue-600"
                            : "w-1.5 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-900 hover:text-white hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center transition-all focus:outline-none"
                    onClick={() => paginate(1)}
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}