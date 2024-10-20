"use client";

import { Loader } from "@/components/loader";

export default function loading() {
  return (
    <div className="relative w-full h-96">
      <Loader fullScreen={false} showLogo={false} />;
    </div>
  );
}
