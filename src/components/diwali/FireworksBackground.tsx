
"use client";

import { useState, useEffect, type CSSProperties } from 'react';
import { cn } from "@/lib/utils";

const FIREWORK_COUNT = 30;
const COLORS = ['#FFD700', '#D97706', '#FF69B4', '#00BFFF'];

type Firework = {
  id: number;
  style: CSSProperties;
  particleStyles: CSSProperties[];
};

const Firework = ({ style, particleStyles }: { style: CSSProperties, particleStyles: CSSProperties[] }) => {
  return (
    <div className="absolute top-0 left-0" style={style}>
      <div className="firework-rocket absolute h-1 w-1 rounded-full bg-white/70" style={{ animation: 'rise 2s cubic-bezier(0.5, 0, 0.75, 0.5) forwards' }} />
      <div className="firework-explosion absolute top-0 left-0 w-20 h-20 opacity-0" style={{ animation: 'explode-wrapper 1.5s 2s ease-out forwards' }}>
        {particleStyles.map((pStyle, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={pStyle}
          />
        ))}
      </div>
    </div>
  );
};

const createFirework = (id: number): Firework => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const duration = Math.random() * 2 + 3; // 3-5 seconds
  const delay = Math.random() * 5;
  const particleCount = 25;
  const particleStyles = Array.from({ length: particleCount }).map(() => {
    const angle = Math.random() * 360;
    const distance = Math.random() * 40 + 20;
    const particleDelay = Math.random() * 0.3;
    return {
      backgroundColor: color,
      transform: `rotate(${angle}deg) translateX(${distance}px) scale(0)`,
      animation: `explode 0.8s ${particleDelay}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
      animationDelay: `${2 + particleDelay}s`
    };
  });

  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      bottom: '0',
      animation: `fade-in 0.5s ${delay}s ease-out forwards`,
      animationDelay: `${delay}s`,
      opacity: 0,
    },
    particleStyles,
  };
};

export default function FireworksBackground({ style }: { style?: CSSProperties }) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialFireworks = Array.from({ length: FIREWORK_COUNT }).map((_, i) => createFirework(i));
      setFireworks(initialFireworks);

      const interval = setInterval(() => {
        setFireworks(currentFireworks => {
          const newFireworks = [...currentFireworks];
          const indexToReplace = Math.floor(Math.random() * currentFireworks.length);
          newFireworks[indexToReplace] = createFirework(Date.now() + indexToReplace);
          return newFireworks;
        });
      }, 1800); // Replace a firework every 1.8 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden -z-10 transition-transform duration-500 ease-out"
      style={style}
    >
        <style jsx>{`
            @keyframes explode-wrapper {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }
            @keyframes fade-in {
                to { opacity: 1; }
            }
        `}</style>
      {fireworks.map((fw) => (
        <Firework key={fw.id} style={fw.style} particleStyles={fw.particleStyles} />
      ))}
    </div>
  );
}
