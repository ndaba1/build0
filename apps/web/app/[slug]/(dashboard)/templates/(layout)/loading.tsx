"use client";

import { Loader } from "@/components/loader";

export default function Loading() {
  return (
    <div className="relative w-full h-96">
      <Loader fullScreen={false} showLogo={false} />;
    </div>
  );
}
