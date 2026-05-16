import { redirect } from "next/navigation";

type Props = { params: { id: string } };

/** Kısa kampanya linki → paylaşım stüdyosu + görev ön doldurma */
export default function ShareCampaignShortLinkPage({ params }: Props) {
  const id = params.id?.trim();
  if (!id) redirect("/share");
  redirect(`/share?quest=${encodeURIComponent(id)}`);
}
