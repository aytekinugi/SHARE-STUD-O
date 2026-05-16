import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  applicationName: "Share Stud O",
  appleWebApp: {
    capable: true,
    title: "Share Stud O",
    statusBarStyle: "black-translucent"
  },
  formatDetection: { telephone: false }
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
