import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cx = cn;

export function getInitials(name: string | undefined) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .filter((_, idx) => idx < 2)
      .join("") ?? "S"
  );
}
