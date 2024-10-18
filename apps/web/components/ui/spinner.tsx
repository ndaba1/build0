import { cn } from "@/lib/utils";

export function Spinner({
  className,
  center,
}: Partial<React.PropsWithChildren<HTMLDivElement> & { center: boolean }>) {
  return (
    <div className={cn("spinner", className, { center })}>
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
      <div className="spinner-blade" />
    </div>
  );
}
