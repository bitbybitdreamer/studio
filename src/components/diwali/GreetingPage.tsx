
"use client";

import { useState, useEffect, useRef, CSSProperties, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Copy, Loader2, ArrowLeft, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FireworksBackground from "./FireworksBackground";
import { generateWish } from "@/ai/flows/generate-wish";


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


export default function GreetingPage({ initialWish }: { initialWish: string }) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [isMobile, setIsMobile] = useState(false);

  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties>({});
  const [backgroundParallaxStyle, setBackgroundParallaxStyle] = useState<CSSProperties>({});
  
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [currentWish, setCurrentWish] = useState(initialWish);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
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
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
    });
    
    setBackgroundParallaxStyle({
      transform: `translateX(${xPos * -20}px) translateY(${yPos * -20}px)`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };
  
  const handleMouseLeave = () => {
    setParallaxStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg)`,
      transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    });
    setBackgroundParallaxStyle({
      transform: `translateX(0px) translateY(0px)`,
      transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
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
      } else {
        throw new Error("AI did not return a wish.");
      }
    } catch (error) {
      console.error("Failed to generate new wish:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Wish generation failed.",
        description: "The AI couldn't create a new wish. Please try again.",
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

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'instagram') => {
    const text = encodeURIComponent(currentWish);
    const appUrl = encodeURIComponent('https://your-app-url.com'); // Replace with your actual app URL
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${text}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'instagram':
        if (navigator.share) {
            navigator.share({
                title: 'Diwali Wish',
                text: currentWish,
            })
            .catch((error) => console.error('Error sharing:', error));
        } else {
            handleCopyWish();
            toast({
                title: "Wish Copied!",
                description: "You can now paste it into Instagram.",
            });
        }
        break;
    }
  };

  const handleBackClick = () => {
    router.push('/');
  };
  
  const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.875-.546-5.597-1.528L.057 24zM12.002 2.169c-5.42 0-9.817 4.396-9.817 9.817 0 1.839.505 3.593 1.418 5.099L2.04 21.96l5.204-1.358a9.757 9.757 0 0 0 4.758 1.251h.001c5.42 0 9.818-4.397 9.818-9.818 0-5.42-4.398-9.817-9.818-9.817zm4.832 7.54c-.27-.135-1.596-.786-1.844-.876-.248-.09-.43-.135-.612.135-.182.27-.696.876-.854 1.056-.158.18-.316.202-.594.067-.278-.135-1.173-.434-2.234-1.378-.827-.736-1.38-1.649-1.538-1.928-.158-.279-.016-.43.118-.564.12-.12.27-.315.404-.42.135-.105.18-.18.27-.315.09-.135.045-.248-.023-.344-.067-.09-.612-1.476-.838-2.022-.225-.546-.45-.47-.612-.478-.158-.01-.344-.01-.53-.01s-.473.068-.72.344c-.248.276-.94.91-1.166 2.206-.226 1.296.248 2.548.27 2.728.02.18.575 1.232 1.39 1.83.93.705 1.636.93 2.205 1.155.88.345 1.396.315 1.844.225.51-.104 1.597-.65 1.82-1.274.224-.624.224-1.155.158-1.274-.067-.12-.182-.18-.344-.27z"/>
    </svg>
  );

  const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );


  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden relative"
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
            className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/30 shadow-2xl shadow-primary/10"
            style={parallaxStyle}
        >
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={handleBackClick}>
              <ArrowLeft />
          </Button>
            <CardContent className="p-8 text-center flex flex-col items-center gap-6">
                <h1 className="font-headline text-4xl text-primary tracking-wider mt-8">
                    Your Surprise Wish! ✨
                </h1>
                
                <p className="font-body text-lg leading-relaxed text-foreground min-h-[112px] flex items-center justify-center p-4">
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
                        New Wish
                    </Button>
                    <Button onClick={handleCopyWish} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Wish
                    </Button>
                </div>
                
                <div className="flex flex-col items-center gap-3 w-full mt-2">
                    <p className="text-sm text-muted-foreground">Share this wish:</p>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50 hover:bg-secondary" onClick={() => handleShare('whatsapp')}>
                           <WhatsAppIcon className="w-6 h-6 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50 hover:bg-secondary" onClick={() => handleShare('twitter')}>
                            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50 hover:bg-secondary" onClick={() => handleShare('facebook')}>
                            <Facebook className="w-6 h-6 text-[#1877F2]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50 hover:bg-secondary" onClick={() => handleShare('instagram')}>
                           <InstagramIcon className="w-6 h-6" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)', borderRadius: '6px', color: 'white', stroke: 'none', padding: '2px' }} />
                        </Button>
                    </div>
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

