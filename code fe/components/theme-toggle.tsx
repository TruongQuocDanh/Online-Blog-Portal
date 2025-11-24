"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const isDark = theme === "dark"

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="
        relative inline-flex items-center justify-center
        h-9 w-9 rounded-full
        border border-border
        bg-background/90
        shadow-sm overflow-hidden
        hover:bg-muted transition-colors
      "
        >
            <motion.span
                className="absolute inset-0 rounded-full"
                initial={false}
                animate={{
                    background: isDark
                        ? "radial-gradient(circle at 30% 0%, rgba(255,255,255,0.25), transparent 60%)"
                        : "radial-gradient(circle at 10% 0%, rgba(56,189,248,0.3), transparent 60%)"
                }}
                transition={{ duration: 0.5 }}
            />

            <div className="relative z-10 flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                        <motion.span
                            key="sun"
                            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="flex items-center justify-center"
                        >
                            <motion.svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]"
                                animate={{
                                    scale: [1, 1.06, 1],
                                    rotate: [0, 8, 0]
                                }}
                                transition={{
                                    duration: 2.2,
                                    ease: "easeInOut",
                                    repeat: Infinity
                                }}
                            >
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </motion.svg>
                        </motion.span>
                    ) : (
                        <motion.span
                            key="moon"
                            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="flex items-center justify-center"
                        >
                            <motion.svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-sky-300"
                                style={{ translateX: "-2px" }}
                                animate={{
                                    scale: [1, 1.08, 1],
                                    rotate: [0, -4, 0],
                                    filter: [
                                        "drop-shadow(0 0 4px rgba(56,189,248,0.4))",
                                        "drop-shadow(0 0 10px rgba(56,189,248,0.9))",
                                        "drop-shadow(0 0 4px rgba(56,189,248,0.4))"
                                    ]
                                }}
                                transition={{
                                    duration: 2.4,
                                    ease: "easeInOut",
                                    repeat: Infinity
                                }}
                            >
                                <path d="M21 12.79A9 9 0 0 1 12.21 3 6.5 6.5 0 1 0 21 12.79z" />
                            </motion.svg>
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </button>
    )
}
