'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const NUM_CONFETTI = 70;
const COLORS = ['#64B5F6', '#81C784', '#FFD54F', '#FF8A65', '#9575CD'];

export function Confetti() {
  const confetti = useMemo(() => {
    return Array.from({ length: NUM_CONFETTI }).map((_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random(),
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 1.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map(({ id, color, x, y, rotate, scale, duration, delay }) => (
        <motion.div
          key={id}
          initial={{ x: `${x}vw`, y: `${y}vh`, rotate, scale, opacity: 1 }}
          animate={{
            y: `110vh`,
            rotate: rotate + Math.random() * 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration,
            delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '20px',
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
