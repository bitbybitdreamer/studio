"use client";

import GreetingPage from "@/components/diwali/GreetingPage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GreetingContent() {
  const searchParams = useSearchParams();
  const wish = searchParams.get('wish');
  const initialWish = wish || "May this Diwali bring you endless joy, prosperity, and sparkling moments. ✨";

  return <GreetingPage initialWish={initialWish} />;
}

export default function Greeting() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GreetingContent />
    </Suspense>
  );
}
