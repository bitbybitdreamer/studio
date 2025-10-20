
"use client";

import { useState, useEffect, useRef, CSSProperties, MouseEvent } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Share2, Copy, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FireworksBackground from "./FireworksBackground";
import { cn } from "@/lib/utils";
import { generateWish } from "@/ai/flows/generate-wish";

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


export default function GreetingPage({ wish }: { wish: string }) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [backgroundParallaxStyle, setBackgroundParallaxStyle] = useState<CSSProperties>({});
  
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const [currentWish, setCurrentWish] = useState(wish);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;

    const xPos = (clientX / offsetWidth - 0.5) * 2;
    const yPos = (clientY / offsetHeight - 0.5) * 2;

    const rotateY = xPos * 12;
    const rotateX = yPos * -12;

    setParallaxStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    });
    
    setBackgroundParallaxStyle({
      transform: `translateX(${xPos * -20}px) translateY(${yPos * -20}px)`
    });
  };
  
  const handleMouseLeave = () => {
    setParallaxStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg)`,
    });
    setBackgroundParallaxStyle({
      transform: `translateX(0px) translateY(0px)`
    });
  };

  const handleBlastClick = async (e: MouseEvent<HTMLButtonElement>) => {
    const newBlast: Blast = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setBlasts(prev => [...prev, newBlast]);

    setIsGenerating(true);
    try {
      const result = await generateWish({});
      if (result.wish) {
        setCurrentWish(result.wish);
      }
    } catch (error) {
      console.error("Failed to generate new wish:", error);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "Could not generate a new wish. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeBlast = (id: number) => {
    setBlasts(prev => prev.filter(b => b.id !== id));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'A Special Wish For You!',
      text: `Sharing a special wish with you:`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        toast({
            title: "Link Copied!",
            description: "You can now share the link with your friends and family.",
        });
        setTimeout(() => setIsCopied(false), 2000);
    }
  };


  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx>{`
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
      <FireworksBackground style={backgroundParallaxStyle} />
      {blasts.map((blast) => (
        <div
          key={blast.id}
          className="absolute"
          style={{ left: blast.x, top: blast.y, color: blast.color }}
        >
          <BlastParticle onComplete={() => removeBlast(blast.id)} />
        </div>
      ))}
      
      <div style={{ perspective: '1200px' }}>
        <Card
            ref={cardRef}
            className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/30 shadow-2xl shadow-primary/10 transition-transform duration-500 ease-out"
            style={parallaxStyle}
        >
          <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="absolute top-4 left-4">
                  <ArrowLeft />
              </Button>
          </Link>
            <CardContent className="p-8 text-center flex flex-col items-center gap-6">
            <h1 className="font-headline text-4xl text-primary tracking-wider">
                A Wish For You
            </h1>
            <p className="font-body text-lg leading-relaxed text-foreground min-h-[112px]">
                {currentWish}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                <Button
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                    onClick={handleBlastClick}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <PartyPopper className="mr-2 h-4 w-4" />
                    )}
                    Tap for a Surprise!
                </Button>
                <Button onClick={handleShare} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    {isCopied ? (
                        <>
                            <Copy className="mr-2 h-4 w-4" /> Copied!
                        </>
                    ) : (
                        <>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </>
                    )}
                </Button>
            </div>
            </CardContent>
        </Card>
      </div>

       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50">
            <p>Built with love.</p>
            <p>Move your cursor for a 3D effect.</p>
        </footer>
    </main>
  );
}
