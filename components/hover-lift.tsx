"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      className={cn("group/hover-lift inline-flex shrink-0", className)}
      initial="rest"
      whileHover="hover"
      whileTap="rest"
    >
      {/* The outer hit area stays in place while only this inner layer moves. */}
      <motion.span
        className="inline-flex w-full"
        variants={{ rest: { y: 0 }, hover: { y: reduceMotion ? 0 : -4 } }}
        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
