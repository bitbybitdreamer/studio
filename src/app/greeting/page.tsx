import { generateWish } from "@/ai/flows/generate-wish";
import GreetingPage from "@/components/diwali/GreetingPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Greeting() {
  let wish = "May your days be filled with joy, laughter, and endless good fortune! ✨";
  try {
    const result = await generateWish({ occasion: 'Diwali' });
    if (result.wish) {
      wish = result.wish;
    }
  } catch (error) {
    console.error("Failed to generate initial wish:", error);
    // A fallback wish is already set, but we can show a component
    // that explains the AI feature is not available.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Oh no!</CardTitle>
            <CardDescription>
              We couldn't generate a unique wish for you right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>But here is a standard one:</p>
            <p className="font-semibold text-lg mt-4">{wish}</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Please try refreshing the page to connect to the AI wish generator.</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <GreetingPage wish={wish} />;
}
