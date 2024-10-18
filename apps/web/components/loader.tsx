import logo from "@/assets/logo.png";
import Image from "next/image";
import { Spinner } from "./ui/spinner";

export function Loader() {
  return (
    <main className="w-full h-full min-h-screen flex flex-col gap-12 items-center justify-center">
      <Image src={logo} alt="Logo" className="-mt-16" width={36} height={36} />
      <div className="relative flex items-center justify-center">
        <Spinner className="text-[28px] text-foreground" />
      </div>
    </main>
  );
}
