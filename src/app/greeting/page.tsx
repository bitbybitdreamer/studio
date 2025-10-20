"use client";

import GreetingPage from "@/components/diwali/GreetingPage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GreetingContent() {
  const searchParams = useSearchParams();
  const wish = searchParams.get('wish') || "May your days be filled with joy, laughter, and endless good fortune! ✨";

  return <GreetingPage initialWish={wish} />;
}

export default function Greeting() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GreetingContent />
    </Suspense>
  );
}
