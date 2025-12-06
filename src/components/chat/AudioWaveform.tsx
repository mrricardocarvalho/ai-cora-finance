"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AudioWaveformProps {
  isListening: boolean
}

export default function AudioWaveform({ isListening }: AudioWaveformProps) {
  if (!isListening) return null

  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2">
      {[1, 2, 3, 4, 5].map((bar) => (
        <motion.div
          key={bar}
          className="w-1 bg-[var(--primary)] rounded-full"
          animate={{
            height: [8, 16, 8],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: bar * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}
