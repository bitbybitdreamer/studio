
"use client";

import { ReactNode, useState, useEffect, useRef, CSSProperties, MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

type Blast = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const COLORS = ['#FFD700', '#D97706', '#FF69B4', '#00BFFF', '#FF4500'];

const BlastParticle = ({ onComplete }: { onComplete: () => void }) => {
  const particleCount = 20;

  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (360 / particleCount) * i + (Math.random() - 0.5) * 10;
        const distance = Math.random() * 50 + 70;
        const rotation = Math.random() * 360;
        return (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              transform: `rotate(${angle}deg) translateX(${distance}px) rotate(${rotation}deg) scale(0)`,
              animation: `blast 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards`,
            }}
          />
        );
      })}
    </>
  );
};


export default function LandingPageClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [isExiting, setIsExiting] = useState(false);
  const [blasts, setBlasts] = useState<Blast[]>([]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !contentRef.current) return;

    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;

    const xPos = (clientX / offsetWidth - 0.5) * 2;
    const yPos = (clientY / offsetHeight - 0.5) * 2;

    const rotateY = xPos * 10; // Reduced rotation for a subtler effect
    const rotateX = yPos * -10;

    setParallaxStyle({
      transform: `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
    });
  };

  const handleMouseLeave = () => {
    setParallaxStyle({
      transform: 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)',
    });
  };

  const handleSurpriseClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');

    if (button && button.innerText.includes("Time for a Surprise!")) {
        e.preventDefault();
        
        const newBlast: Blast = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
        setBlasts(prev => [...prev, newBlast]);

        setIsExiting(true);
        setTimeout(() => {
            router.push('/greeting');
        }, 500); // Corresponds to the animation duration
    }
  };

  const removeBlast = (id: number) => {
    setBlasts(prev => prev.filter(b => b.id !== id));
  };


  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden relative transition-opacity duration-500 ease-in-out",
        isExiting ? "opacity-0" : "opacity-100"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
        {blasts.map((blast) => (
            <div
              key={blast.id}
              className="absolute"
              style={{ left: blast.x, top: blast.y, color: blast.color }}
            >
              <BlastParticle onComplete={() => removeBlast(blast.id)} />
            </div>
        ))}
        <div
          ref={contentRef}
          style={parallaxStyle}
          className="transition-transform duration-500 ease-out z-10"
          onClick={handleSurpriseClick}
        >
            {children}
        </div>
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: .85;
                transform: scale(1.02);
            }
        }
        @keyframes blast {
          from {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
