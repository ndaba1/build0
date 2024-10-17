import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({
  title,
  description,
  Icon,
  iconClassName,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">{description}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl sm:text-4xl font-bold">{title}</div>
      </CardContent>
    </Card>
  );
}
