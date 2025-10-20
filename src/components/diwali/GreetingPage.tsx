
"use client";

import { useState, useEffect, useRef, CSSProperties, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Copy, Loader2, ArrowLeft, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FireworksBackground from "./FireworksBackground";
import { cn } from "@/lib/utils";
import { generateWish } from "@/ai/flows/generate-wish";
import { generateImageFromWish } from "@/ai/flows/generate-image-from-wish";


type Blast = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const COLORS = ['#FFD700', '#D97706', '#FF69B4', '#00BFFF', '#FF4500'];

const BlastParticle = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (360 / 20) * i + (Math.random() - 0.5) * 10;
        const distance = Math.random() * 50 + 70;
        const rotation = Math.random() * 360;
        return (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              backgroundColor: 'currentColor',
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
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [backgroundParallaxStyle, setBackgroundParallaxStyle] = useState<CSSProperties>({});
  
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [currentWish, setCurrentWish] = useState(wish);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const exiting = sessionStorage.getItem('isExiting');
      if (exiting) {
        sessionStorage.removeItem('isExiting');
        setIsExiting(false);
      }
    }
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
      const result = await generateWish({ occasion: 'Diwali' });
      if (result.wish) {
        setCurrentWish(result.wish);
        setGeneratedImage(null); // Clear generated image when wish changes
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

  const handleCopyWish = () => {
    navigator.clipboard.writeText(currentWish).then(() => {
        toast({
            title: "Copied!",
            description: "The wish has been copied to your clipboard.",
        });
    }).catch(err => {
        console.error("Failed to copy:", err);
        toast({
            variant: "destructive",
            title: "Copy Failed",
            description: "Could not copy to your clipboard.",
        });
    });
  };

  const handleBackClick = () => {
    setIsExiting(true);
    sessionStorage.setItem('isExiting', 'true');
    setTimeout(() => {
      router.push('/');
    }, 500);
  };
  
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
        const result = await generateImageFromWish({ wish: currentWish });
        setGeneratedImage(result.imageDataUri);
        toast({
            title: "Image Generated!",
            description: "A beautiful image for your wish has been created.",
        });
    } catch (error) {
        console.error("Failed to generate image:", error);
        toast({
            variant: "destructive",
            title: "AI Image Generation Failed",
            description: "The AI failed to create an image for your wish. Please try again.",
        });
    } finally {
        setIsGeneratingImage(false);
    }
  };


  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden relative transition-opacity duration-500 ease-in-out",
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <FireworksBackground style={backgroundParallaxStyle} />
      {blasts.map((blast) => (
        <div
          key={blast.id}
          className="absolute z-20"
          style={{ left: blast.x, top: blast.y, color: blast.color, transform: 'translate(-50%, -50%)' }}
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
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={handleBackClick}>
              <ArrowLeft />
          </Button>
            <CardContent className="p-8 text-center flex flex-col items-center gap-6">
                <h1 className="font-headline text-4xl text-primary tracking-wider mt-8">
                    A Wish For You
                </h1>
                
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-primary/20 flex items-center justify-center bg-background/30">
                    {isGeneratingImage ? (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                            <p className="text-sm text-muted-foreground">Generating your image...</p>
                        </div>
                    ) : generatedImage ? (
                        <Image src={generatedImage} alt="Generated greeting image" layout="fill" objectFit="cover" />
                    ) : (
                        <p className="font-body text-lg leading-relaxed text-foreground min-h-[112px] flex items-center justify-center p-4">
                            {currentWish}
                        </p>
                    )}
                </div>


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
                        New Wish
                    </Button>
                    <Button onClick={handleCopyWish} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Wish
                    </Button>
                </div>
                
                <div className="w-full border-t border-border pt-6 flex flex-col gap-4">
                  <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                    {isGeneratingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Image from Wish
                  </Button>
                </div>

            </CardContent>
        </Card>
      </div>

       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50">
            <p>Created by - Bishnu</p>
            <p>Move your cursor for a 3D effect.</p>
        </footer>
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
    </main>
  );
}
