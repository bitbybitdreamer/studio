
import { generateWish } from "@/ai/flows/generate-wish";
import GreetingPage from "@/components/diwali/GreetingPage";

export default async function Greeting() {
  let wish = "May the festival of lights fill your life with the glow of happiness and the sparkle of joy. ✨";
  try {
    const result = await generateWish({ occasion: 'Diwali' });
    if (result.wish) {
      wish = result.wish;
    }
  } catch (error) {
    console.error("Failed to generate wish:", error);
    // Fallback wish is already set
  }

  return <GreetingPage wish={wish} />;
}
