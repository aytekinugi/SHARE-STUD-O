import {
  AtSign,
  Cable,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Pin,
  Send,
  Share2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Waves,
  Youtube
} from "lucide-react";
import type { SharePayload } from "@/lib/share-links";
import {
  blueskyCompose,
  emailShare,
  facebookMarketplaceNewListing,
  facebookSharer,
  hackerNewsSubmit,
  instagramAppEntry,
  lineShare,
  linkedInShare,
  mastodonShare,
  pinterestPin,
  redditSubmit,
  skypeShare,
  smsShare,
  telegramShare,
  tumblrShare,
  twitterIntent,
  vkShare,
  weiboShare,
  whatsappSend,
  youtubeUploadPage
} from "@/lib/share-links";

export type ChannelDef = {
  id: string;
  label: string;
  icon: typeof Share2;
  tier: "primary" | "extra";
  features: string[];
  vibe: string;
  getUrls: (ctx: {
    payload: SharePayload;
    pinterestMedia?: string;
    mastodonHost: string;
  }) => string[];
};

export const PRIMARY_CHANNELS: ChannelDef[] = [
  {
    id: "ig",
    label: "Instagram",
    icon: Instagram,
    tier: "primary",
    features: ["Hikaye & gönderi", "Reels / TV açıklaması", "Metin = senin sahnende"],
    vibe: "from-pink-500/25 via-rose-500/10 to-violet-600/20",
    getUrls: () => [instagramAppEntry()]
  },
  {
    id: "wa",
    label: "WhatsApp",
    icon: MessageCircle,
    tier: "primary",
    features: ["Durum (yapıştır)", "Hazır mesaj ile sohbet", "Çoklu cihaz"],
    vibe: "from-emerald-500/25 to-teal-500/15",
    getUrls: (ctx) => [whatsappSend(ctx.payload)]
  },
  {
    id: "yt",
    label: "YouTube",
    icon: Youtube,
    tier: "primary",
    features: ["Açıklama alanı", "Yükleme akışı", "SEO dostu blok"],
    vibe: "from-red-500/30 to-rose-900/10",
    getUrls: () => [youtubeUploadPage()]
  },
  {
    id: "fb-mp",
    label: "Facebook Marketplace",
    icon: ShoppingBag,
    tier: "primary",
    features: ["Yerel keşif", "İlan + fiyat sonrası", "Mesaj kutusu"],
    vibe: "from-blue-600/25 to-indigo-500/10",
    getUrls: () => [facebookMarketplaceNewListing()]
  },
  {
    id: "li",
    label: "LinkedIn",
    icon: Linkedin,
    tier: "primary",
    features: ["Link önizlemesi", "Profesyonel görünürlük", "Yorumda derin metin"],
    vibe: "from-sky-500/25 to-blue-800/15",
    getUrls: (ctx) => [linkedInShare(ctx.payload.url)]
  }
];

export const EXTRA_CHANNELS: ChannelDef[] = [
  {
    id: "x",
    label: "X (Twitter)",
    icon: Share2,
    tier: "extra",
    features: ["Kısa vuruş", "Etiket & trend", "Anlık erişim"],
    vibe: "from-zinc-500/20 to-zinc-800/10",
    getUrls: (ctx) => [twitterIntent(ctx.payload)]
  },
  {
    id: "fb",
    label: "Facebook gönderisi",
    icon: Facebook,
    tier: "extra",
    features: ["Bağlantı paylaşımı", "Arkadaş akışı", "Önizleme"],
    vibe: "from-blue-500/20 to-blue-900/10",
    getUrls: (ctx) => [facebookSharer(ctx.payload.url)]
  },
  {
    id: "tg",
    label: "Telegram",
    icon: Send,
    tier: "extra",
    features: ["URL + metin", "Kanal / grup", "Hızlı ileti"],
    vibe: "from-sky-400/25 to-cyan-600/10",
    getUrls: (ctx) => [telegramShare(ctx.payload)]
  },
  {
    id: "rd",
    label: "Reddit",
    icon: MessageSquare,
    tier: "extra",
    features: ["Topluluk seçimi", "Başlık + link", "tartışma"],
    vibe: "from-orange-500/25 to-red-600/10",
    getUrls: (ctx) => [redditSubmit(ctx.payload.title ?? ctx.payload.text.slice(0, 80), ctx.payload.url)]
  },
  {
    id: "pi",
    label: "Pinterest",
    icon: Pin,
    tier: "extra",
    features: ["Pin açıklaması", "Görsel (isteğe bağlı)", "Keşfet trafiği"],
    vibe: "from-rose-500/20 to-red-700/10",
    getUrls: (ctx) => [pinterestPin(ctx.payload, ctx.pinterestMedia)]
  },
  {
    id: "tb",
    label: "Tumblr",
    icon: Waves,
    tier: "extra",
    features: ["Blog gönderisi", "Alıntı + başlık", "Estetik feed"],
    vibe: "from-indigo-500/20 to-slate-700/10",
    getUrls: (ctx) => [tumblrShare(ctx.payload)]
  },
  {
    id: "vk",
    label: "VK",
    icon: Globe,
    tier: "extra",
    features: ["Bağlantı + yorum", "Geniş ağ", "Medya önizleme"],
    vibe: "from-blue-700/25 to-slate-600/10",
    getUrls: (ctx) => [vkShare(ctx.payload)]
  },
  {
    id: "line",
    label: "LINE",
    icon: Cable,
    tier: "extra",
    features: ["LINE içi paylaşım", "QR / arkadaş", "Hızlı"],
    vibe: "from-green-400/20 to-emerald-700/10",
    getUrls: (ctx) => [lineShare(ctx.payload.url)]
  },
  {
    id: "hn",
    label: "Hacker News",
    icon: Megaphone,
    tier: "extra",
    features: ["Teknoloji odağı", "Başlık + URL", "yorum kültürü"],
    vibe: "from-amber-500/20 to-orange-800/10",
    getUrls: (ctx) => [hackerNewsSubmit(ctx.payload.url, ctx.payload.title ?? ctx.payload.text.slice(0, 96))]
  },
  {
    id: "wb",
    label: "Weibo",
    icon: AtSign,
    tier: "extra",
    features: ["Başlık + açıklama", "Çin ağı", "Medya"],
    vibe: "from-red-400/20 to-amber-600/10",
    getUrls: (ctx) => [weiboShare(ctx.payload)]
  },
  {
    id: "sk",
    label: "Skype",
    icon: Send,
    tier: "extra",
    features: ["Web paylaşımı", "Sohbet köprüsü", "URL"],
    vibe: "from-sky-500/15 to-blue-900/10",
    getUrls: (ctx) => [skypeShare(ctx.payload.url)]
  },
  {
    id: "bs",
    label: "Bluesky",
    icon: Sparkles,
    tier: "extra",
    features: ["AT Protocol", "Kısa gönderi", "özgür ağ"],
    vibe: "from-sky-400/30 to-blue-500/15",
    getUrls: (ctx) => [blueskyCompose(ctx.payload)]
  },
  {
    id: "em",
    label: "E-posta",
    icon: Mail,
    tier: "extra",
    features: ["Tam metin gövde", "Konu satırı", "B2B"],
    vibe: "from-violet-500/15 to-purple-900/10",
    getUrls: (ctx) => [emailShare(ctx.payload)]
  },
  {
    id: "sm",
    label: "SMS",
    icon: Smartphone,
    tier: "extra",
    features: ["Kısa mesaj", "Mobil pano", "anında"],
    vibe: "from-lime-500/15 to-green-900/10",
    getUrls: (ctx) => [smsShare(ctx.payload)]
  },
  {
    id: "md",
    label: "Mastodon",
    icon: AtSign,
    tier: "extra",
    features: ["Fediverse", "Örnek seçimi", "500+ karakter hazırlığı"],
    vibe: "from-purple-500/25 to-indigo-600/15",
    getUrls: (ctx) => [mastodonShare(ctx.mastodonHost, ctx.payload)]
  }
];

export const CHANNEL_BY_ID = Object.fromEntries(
  [...PRIMARY_CHANNELS, ...EXTRA_CHANNELS].map((c) => [c.id, c])
) as Record<string, ChannelDef>;

export const ALL_CHANNEL_IDS: readonly string[] = [...PRIMARY_CHANNELS, ...EXTRA_CHANNELS].map((c) => c.id);

export const DEFAULT_SELECTED = new Set(PRIMARY_CHANNELS.map((c) => c.id));
