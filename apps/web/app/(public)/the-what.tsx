import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BicepsFlexedIcon,
  DatabaseZapIcon,
  FileText,
  FilesIcon,
  FingerprintIcon,
  ImageIcon,
  PlugZapIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

const features = [
  {
    title: "Quick PDF Generation",
    description:
      "Create on-demand PDFs in seconds. It's super easy, barely an inconvenience!",
    icon: <ZapIcon className="text-yellow-500" />,
  },
  {
    title: "Secure file downloads",
    description:
      "The security of pre-signed urls, without the hassle of having to manage them",
    icon: <FingerprintIcon className="text-red-500" />,
  },
  {
    title: "Easy-to-use Templates",
    description:
      "We use pdfmake, so easy is relative, but we make it even easier for you.",
    icon: <FilesIcon className="text-cyan-500" />,
  },
  {
    title: "Live Preview",
    description: "See your PDFs come to life as you make changes in real-time.",
    icon: <SparklesIcon className="text-purple-500" />,
  },
  {
    title: "API Integration",
    description:
      "Integrate BuildZero with your existing tools and workflows via the API/SDKs",
    icon: <PlugZapIcon className="text-green-500" />,
  },
  {
    title: "PDF Image Previews",
    description:
      "We generate image previews of your PDFs so you can see them before downloading.",
    icon: <ImageIcon className="text-pink-500" />,
  },
  {
    title: "Robust Validation",
    description:
      "Automatic zod validation for payloads passed to your templates.",
    icon: <BicepsFlexedIcon className="text-orange-500" />,
  },
  {
    title: "Self-hosting",
    description:
      "BuildZero is built to be self-hosted with 100% feature parity.",
    icon: <DatabaseZapIcon className="text-teal-500" />,
  },
  {
    title: "And more...",
    description:
      "We ran out of features, but really wanted the grid to be even!",
    icon: <FileText className="text-foreground" />,
  },
];

export function TheWhat() {
  return (
    <section className="my-20 max-w-6xl mx-auto">
      <h3 className="font-cal text-center text-4xl font-medium">The what</h3>
      <p className="text-muted-foreground text-center mt-4 text-lg">
        Here&apos;s what BuildZero has to offer
      </p>

      <div className="grid gap-8 mt-16 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col rounded-2xl shadow-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-xl font-semibold">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="my-44 max-w-2xl mx-auto space-y-8">
        <h3 className="font-cal text-center text-4xl">
          PDF for developers. We&apos;re here to help you focus on what matters
          most.
        </h3>
        <p className="text-muted-foreground text-center text-lg max-w-xl mx-auto">
          By using BuildZero, you and your team can focus on building your
          product and let us handle the rest -- As long as the rest is PDF
          generation. You can even self-host on your own infrastructure
        </p>
      </div>
    </section>
  );
}
