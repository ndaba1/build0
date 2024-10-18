"use client";

import { useAuth } from "@/components/authenticator";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  DatabaseIcon,
  FileText,
  FileTextIcon,
  GithubIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import slugify from "@sindresorhus/slugify";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { handle } from "typed-handlers";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "use-debounce";

const schema = z.object({
  name: z.string().min(6),
  slug: z.string().min(6),
});

const freePlanFeatures = [
  {
    icon: FileTextIcon,
    label: "100 PDFs/month",
  },
  {
    icon: DatabaseIcon,
    label: "1000 MB storage",
  },
  {
    icon: ZapIcon,
    label: "Full Template Library",
  },
];

export default function OnboardingForm() {
  const { userAttributes } = useAuth();
  const defaultName = `${userAttributes?.email?.split("@")[0]}'s Project`;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      slug: slugify(defaultName),
    },
  });

  const formRef = useRef(form);
  const watch = form.watch();

  useEffect(() => {
    formRef.current.setValue("slug", slugify(watch.name));
  }, [watch.name]);

  const [debounced] = useDebounce(watch.slug, 500);
  const { data: slugExists, isLoading } = useQuery({
    queryKey: ["projects", debounced],
    queryFn: async () => {
      const cfg = handle("/api/v1/projects/exists");

      const { data } = await axios.get<{ exists: boolean }>(
        `${cfg.url}?slug=${debounced}`
      );

      return data.exists;
    },
  });

  return (
    <Form {...form}>
      <form>
        <CardContent className="py-4 pb-6 space-y-6 border-b">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Project" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Slug</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder="my-awesome-project"
                    required
                    {...field}
                  />
                </FormControl>
                {isLoading ? (
                  <FormDescription className="inline-flex relative items-center gap-2">
                    <Spinner className="text-[16px]" />
                    <span className="text-sm">
                      Checking if slug is available...
                    </span>
                  </FormDescription>
                ) : null}
                {!isLoading && slugExists ? (
                  <FormDescription className="inline-flex relative items-center gap-2">
                    <XIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm">
                      Please use a different project name
                    </span>
                  </FormDescription>
                ) : null}
                {!isLoading && !slugExists ? (
                  <FormDescription className="inline-flex relative items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Your project slug is available
                    </span>
                  </FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <section className="bg-muted rounded-lg p-2 px-4 space-y-2">
            <h3 className="text-lg font-semibold">Free plan features</h3>
            <ul className="grid gap-2">
              {freePlanFeatures.map((feature) => (
                <li key={feature.label} className="flex gap-2 items-center">
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm">{feature.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </CardContent>

        <CardFooter className="py-6 flex flex-col space-y-4">
          <Button type="submit" className="w-full">
            Create Project
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need more power? Our platform is open-source and self-hostable.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Docs
              </Button>
              <Button variant="outline" size="sm">
                <GithubIcon className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
