"use client";

import { useState, useEffect, useRef, CSSProperties, MouseEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Copy, Loader2, ArrowLeft, Upload, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FireworksBackground from "./FireworksBackground";
import { cn } from "@/lib/utils";
import { generateWish } from "@/ai/flows/generate-wish";
import { personalizeImage } from "@/ai/flows/personalize-image-flow";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [backgroundParallaxStyle, setBackgroundParallaxStyle] = useState<CSSProperties>({});
  
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [currentWish, setCurrentWish] = useState(wish);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [personalizedImage, setPersonalizedImage] = useState<string | null>(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);
  
  useEffect(() => {
    const isExiting = sessionStorage.getItem('isExiting');
    if (isExiting) {
      sessionStorage.removeItem('isExiting');
      setIsExiting(false);
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
      const result = await generateWish({ occasion: 'a happy occasion' });
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

  const handleCopyWish = () => {
    const textToCopy = personalizedImage || currentWish;
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({
            title: "Copied!",
            description: personalizedImage ? "Your personalized image is ready to be shared!" : "The wish has been copied to your clipboard.",
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
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setPersonalizedImage(null); // Reset personalized image if a new one is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalizeImage = async () => {
    if (!uploadedImage) {
        toast({
            variant: "destructive",
            title: "No Image",
            description: "Please upload an image first.",
        });
        return;
    }

    setIsPersonalizing(true);
    try {
        const result = await personalizeImage({ photoDataUri: uploadedImage, wish: currentWish });
        if (result.imageDataUri) {
            setPersonalizedImage(result.imageDataUri);
            toast({
                title: "Image Personalized!",
                description: "Your photo has been updated with the wish.",
            });
        }
    } catch (error) {
        console.error("Failed to personalize image:", error);
        toast({
            variant: "destructive",
            title: "AI Personalization Failed",
            description: "Could not add the wish to your image. Please try again.",
        });
    } finally {
        setIsPersonalizing(false);
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
                
                {personalizedImage ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-primary/20">
                        <Image src={personalizedImage} alt="Personalized greeting" layout="fill" objectFit="contain" />
                    </div>
                ) : uploadedImage ? (
                     <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-dashed border-accent/50">
                        <Image src={uploadedImage} alt="Uploaded preview" layout="fill" objectFit="contain" />
                    </div>
                ) : (
                    <p className="font-body text-lg leading-relaxed text-foreground min-h-[112px]">
                        {currentWish}
                    </p>
                )}


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
                        Copy
                    </Button>
                </div>
                
                <div className="w-full border-t border-border pt-6 flex flex-col gap-4">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedImage ? "Change Photo" : "Upload a Photo"}
                  </Button>
                  
                  {uploadedImage && (
                    <Button onClick={handlePersonalizeImage} disabled={isPersonalizing} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                      {isPersonalizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Personalize with AI
                    </Button>
                  )}
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
