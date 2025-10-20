import { generateWish } from "@/ai/flows/generate-wish";
import GreetingPage from "@/components/diwali/GreetingPage";

export default async function Home() {
  let wish = "May the divine light of Diwali spread into your life and bring peace, prosperity, happiness, and good health.";
  try {
    const result = await generateWish({});
    if (result.wish) {
      wish = result.wish;
    }
  } catch (error) {
    console.error("Failed to generate wish:", error);
    // Fallback wish is already set
  }

  return <GreetingPage wish={wish} />;
}
