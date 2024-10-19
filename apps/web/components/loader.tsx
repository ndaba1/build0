import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Spinner } from "./ui/spinner";

export function Loader({
  fullScreen = true,
  showLogo = true,
  message,
}: {
  fullScreen?: boolean;
  showLogo?: boolean;
  message?: string;
}) {
  return (
    <main
      className={cn(
        "w-full h-full flex flex-col gap-12 items-center justify-center",
        fullScreen ? "min-h-screen" : ""
      )}
    >
      {showLogo ? (
        <Image
          src={logo}
          alt="Logo"
          className="-mt-16"
          width={36}
          height={36}
        />
      ) : null}

      {message ? (
        <p className="text-muted-foreground max-w-lg text-center">{message}</p>
      ) : null}

      <div className="relative flex items-center justify-center">
        <Spinner className="text-[28px] text-foreground" />
      </div>
    </main>
  );
}
