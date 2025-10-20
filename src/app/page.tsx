
import { generateWish } from '@/ai/flows/generate-wish';
import FireworksBackground from '@/components/diwali/FireworksBackground';
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
    <LandingPageClient initialWish={wish} />
  );
}
