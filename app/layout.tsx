import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import {
  Sora,
  Lexend,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import { Navigation } from "@/components/molecules/navigation";
import { Providers } from "@/components/molecules/providers";
import { MobileNavWrapper } from "@/components/molecules/mobile-nav-wrapper";

// Heading font - modern geometric with soft curves
const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Body font - designed for optimal reading with built-in spacing
const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Code font - optimized for programming
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Accent serif for special elements
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export const metadata: Metadata = {
  title: "Abhay Bhardwaj - Software Engineer",
  description:
    "Software Engineer based in Uttarakhand, India. Experienced in full-stack development, platform engineering, and building scalable software solutions.",
  keywords: [
    "Software Engineer",
    "Full Stack Developer",
    "React",
    "Node.js",
    "TypeScript",
    "Platform Engineering",
  ],
  authors: [{ name: "Abhay Bhardwaj" }],
  metadataBase: new URL("https://abhaybhardwaj.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${lexend.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="relative bg-background">
            <Navigation />
            {children}
            <MobileNavWrapper />
          </div>
        </Providers>
      </body>
    </html>
  );
}
