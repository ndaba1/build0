import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function FormSection({
  title,
  description,
  children,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl grid grid-cols-12">
      <CardHeader className="col-span-12 sm:col-span-5">
        <CardTitle className="mb-1 text-xl">{title}</CardTitle>
        <CardDescription className="text-sm max-w-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="col-span-12 sm:col-span-7 py-6 space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
