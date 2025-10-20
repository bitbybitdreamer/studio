
"use client";

import { ReactNode, useState, useEffect, useRef, CSSProperties, MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function LandingPageClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [isExiting, setIsExiting] = useState(false);

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

  const handleSurpriseClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/greeting');
    }, 500); // Corresponds to the animation duration
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
        <div
          ref={contentRef}
          style={parallaxStyle}
          className="transition-transform duration-500 ease-out"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            if (link && link.href.endsWith('/greeting')) {
                handleSurpriseClick(e as any);
            }
          }}
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
      `}</style>
    </main>
  );
}
