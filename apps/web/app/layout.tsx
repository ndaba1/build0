import "@aws-amplify/ui-react/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import TopLoader from "nextjs-toploader";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const calFont = localFont({
  src: "./fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuildZero - Open source pdf generation tooling for focused teams",
  description: "Open source pdf generation tooling for focused teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${calFont.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <TopLoader showSpinner={false} />
      </body>
    </html>
  );
}
