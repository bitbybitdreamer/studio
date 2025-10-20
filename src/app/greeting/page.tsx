
import { generateWish } from "@/ai/flows/generate-wish";
import GreetingPage from "@/components/diwali/GreetingPage";

export default async function Greeting() {
  let wish = "May your day be as bright and beautiful as you are. ✨";
  try {
    const result = await generateWish({ occasion: 'a happy occasion' });
    if (result.wish) {
      wish = result.wish;
    }
  } catch (error) {
    console.error("Failed to generate wish:", error);
    // Fallback wish is already set
  }

  return <GreetingPage wish={wish} />;
}
