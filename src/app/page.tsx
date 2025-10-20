
import { generateWish } from '@/ai/flows/generate-wish';
import { Button } from '@/components/ui/button';
import FireworksBackground from '@/components/diwali/FireworksBackground';
import { ArrowRight } from 'lucide-react';
import LandingPageClient from '@/components/diwali/LandingPageClient';

export default async function LandingPage() {
  let wish = "May the divine light of Diwali spread into your life and bring peace, prosperity, happiness, and good health.";
  try {
    const result = await generateWish({ occasion: 'Diwali' });
    if (result.wish) {
      wish = result.wish;
    }
  } catch (error) {
    console.error("Failed to generate wish for landing page:", error);
    // Fallback wish is already set
  }

  return (
    <LandingPageClient>
        <FireworksBackground />
        <h1 className="font-headline text-6xl md:text-8xl text-primary tracking-wider animate-fade-in-down">
          Happy Diwali
        </h1>
        <p className="font-body text-lg md:text-xl leading-relaxed text-foreground max-w-2xl animate-fade-in-up">
          {wish}
        </p>
        <Button
          size="lg"
          className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse"
        >
          Time for a Surprise!
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
    </LandingPageClient>
  );
}
