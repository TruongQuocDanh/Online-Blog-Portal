"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface HeroCarouselProps {
  images: string[]
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const IMAGES = images.length > 0 ? images : ["/fallback-banner.jpg"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [IMAGES.length])

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">

      <AnimatePresence>
        <motion.img
          key={index}
          src={IMAGES[index]}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 text-left">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-white font-extrabold text-4xl sm:text-5xl md:text-6xl drop-shadow-xl max-w-2xl"
        >
          Welcome to Our Blog Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-white/90 text-lg sm:text-xl max-w-xl mt-4 drop-shadow"
        >
          Inspiring stories, practical tutorials — crafted with passion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-8"
        >
          <a
            href="#posts"
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground shadow-lg font-semibold hover:scale-[1.05] active:scale-95 transition"
          >
            Start Reading
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? "bg-white w-6" : "bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  )
}
