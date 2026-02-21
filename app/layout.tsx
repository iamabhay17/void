import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Shantell_Sans } from "next/font/google";
import { NavDock, Navigation } from "@/components/molecules/navigation";
import { Providers } from "@/components/molecules/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontHandwriting = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["400", "500", "600", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${fontHandwriting.variable} font-inter antialiased`}
      >
        <Providers>
          <div className="relative bg-background">
            <Navigation />
            {children}
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 md:hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NavDock isMobile={true} />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
