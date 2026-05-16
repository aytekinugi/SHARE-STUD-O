"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import type { ShareMessages } from "@/lib/share-trust-copy";
import { shareUxLog } from "@/lib/share-observability";

type Props = {
  sc: ShareMessages;
  open: boolean;
  text: string;
  online: boolean;
  onClose: () => void;
};

export function ShareQrDialog({ sc, open, text, online, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDataUrl(null);
      return;
    }
    shareUxLog("qr_opened", { len: text.length });
    if (!online) return;
    const payload = text.slice(0, 1200);
    void QRCode.toDataURL(payload, { width: 240, margin: 2, color: { dark: "#e5b868", light: "#08080aff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [open, text, online]);

  if (!open) return null;

  return (
    <dialog open className="z-[200] mx-auto w-[min(100%-1.5rem,22rem)] rounded-2xl border border-white/15 bg-[#08080a] p-5 text-white shadow-2xl backdrop:bg-black/80" aria-modal="true" aria-labelledby="share-qr-title">
      <h2 id="share-qr-title" className="text-lg font-black">
        {sc.qr.title}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">{sc.qr.hint}</p>
      <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-xl border border-white/10 bg-black/50 p-4">
        {!online ? (
          <p className="text-center text-sm text-amber-100/90">{sc.qr.offline}</p>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="" width={240} height={240} className="rounded-lg" />
        ) : (
          <p className="text-xs text-zinc-500">…</p>
        )}
      </div>
      <Button type="button" className="mt-4 w-full rounded-xl" onClick={onClose}>
        {sc.qr.close}
      </Button>
    </dialog>
  );
}
