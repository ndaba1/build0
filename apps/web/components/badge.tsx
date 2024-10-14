import { cn } from "@/lib/utils";

export function SmallBadge(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-0.5 w-fit border  text-xs px-1.5 rounded-sm",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
