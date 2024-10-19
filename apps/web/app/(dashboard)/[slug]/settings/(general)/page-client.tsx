"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/use-project";

export function GeneralProjectSettings() {
  const { slug, isAdmin, ...project } = useProject();

  return (
    <main className="flex flex-col space-y-12">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Project Name</CardTitle>
          <CardDescription>
            This is the name of your project on BuildZero.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Input disabled value={project.name} className="w-[320px]" />
        </CardContent>

        <CardFooter className="border-t p-0 py-4 px-6 bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Max 32 characters</p>

          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Project Slug</CardTitle>
          <CardDescription>
            Your project slug is a unique identifier for your project.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Input disabled value={slug} className="w-[320px]" />
        </CardContent>

        <CardFooter className="border-t p-0 py-4 px-6 bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Only lowercase letters, numbers, and dashes are allowed
          </p>

          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Project ID</CardTitle>
          <CardDescription>
            The ID used to identify your project internally.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Input disabled value={project.id} className="w-[320px]" />
        </CardContent>

        <CardFooter className="border-t p-0 py-4 px-6 bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This value cannot be changed
          </p>

          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
