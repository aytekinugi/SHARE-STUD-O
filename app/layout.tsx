import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Vanguard AI — Turn Life Into an RPG",
  description: "A premium AI productivity RPG where real-life quests level up your digital avatar.",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} min-h-screen font-sans`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster theme="dark" richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
