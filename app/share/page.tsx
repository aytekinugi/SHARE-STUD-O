import dynamic from "next/dynamic";
import type { Metadata } from "next";
import shareTr from "@/messages/tr/share.json";
import shareEn from "@/messages/en/share.json";
import { ShareSentryInit } from "@/components/share/share-sentry-init";
import { SharePageNav } from "@/components/share/share-page-nav";

export const metadata: Metadata = {
  title: `${shareTr.page.metaTitle} · ${shareEn.page.metaTitle}`,
  description: `${shareTr.page.metaDescription} / ${shareEn.page.metaDescription}`,
  openGraph: {
    title: shareTr.page.metaTitle,
    description: shareTr.page.metaDescription
  }
};

const ShareStudio = dynamic(() => import("@/components/share/share-studio").then((m) => ({ default: m.ShareStudio })), {
  ssr: true,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-zinc-500">{shareTr.loading}</div>
  )
});

export default function SharePage() {
  return (
    <>
      <ShareSentryInit />
      <SharePageNav />
      <ShareStudio />
    </>
  );
}
