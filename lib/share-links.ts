export type SharePayload = {
  title?: string;
  /** Main copy */
  text: string;
  /** Link to share (campaign, product, post) */
  url: string;
};

/** Human-readable block for native share + open networks. */
export function composeShareBody(p: SharePayload): string {
  const chunks = [p.title?.trim(), p.text.trim(), p.url.trim()].filter(Boolean);
  return chunks.join("\n\n");
}

function enc(s: string) {
  return encodeURIComponent(s);
}

export function twitterIntent(p: SharePayload) {
  return `https://twitter.com/intent/tweet?text=${enc(composeShareBody(p))}`;
}

export function facebookMarketplaceNewListing(): string {
  return "https://www.facebook.com/marketplace/create/item";
}

/** YouTube video yükleme — açıklamayı sahada panodan yapıştırın */
export function youtubeUploadPage(): string {
  return "https://www.youtube.com/upload";
}

export function instagramAppEntry(): string {
  return "https://www.instagram.com/";
}

export function facebookSharer(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
}

export function linkedInShare(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
}

export function whatsappSend(p: SharePayload) {
  return `https://api.whatsapp.com/send?text=${enc(composeShareBody(p))}`;
}

export function telegramShare(p: SharePayload) {
  return `https://t.me/share/url?url=${enc(p.url.trim())}&text=${enc([p.title, p.text].filter(Boolean).join(" — ").trim())}`;
}

export function redditSubmit(title: string, url: string) {
  return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title.trim() || url)}`;
}

export function pinterestPin(p: SharePayload, media?: string) {
  const q = new URLSearchParams({
    url: p.url.trim(),
    description: composeShareBody(p)
  });
  if (media) q.set("media", media);
  return `https://pinterest.com/pin/create/button/?${q}`;
}

export function tumblrShare(p: SharePayload) {
  const title = (p.title ?? "").trim() || "Share";
  return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${enc(p.url.trim())}&title=${enc(title)}&caption=${enc(p.text.trim())}`;
}

export function vkShare(p: SharePayload) {
  return `https://vk.com/share.php?url=${enc(p.url.trim())}&title=${enc((p.title ?? "").trim())}&comment=${enc(p.text.trim())}`;
}

export function lineShare(url: string) {
  return `https://social-plugins.line.me/lineit/share?url=${enc(url.trim())}`;
}

export function hackerNewsSubmit(url: string, title: string) {
  return `https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title.trim() || url)}`;
}

export function emailShare(p: SharePayload) {
  const subject = (p.title ?? "Paylaşım").trim().slice(0, 998);
  const body = composeShareBody(p);
  return `mailto:?subject=${enc(subject)}&body=${enc(body)}`;
}

export function smsShare(p: SharePayload) {
  return `sms:?body=${enc(composeShareBody(p))}`;
}

export function blueskyCompose(p: SharePayload) {
  return `https://bsky.app/intent/compose?text=${enc(composeShareBody(p).slice(0, 290))}`;
}

/** @param instanceHost e.g. mastodon.social (no scheme) */
export function mastodonShare(instanceHost: string, p: SharePayload) {
  const host = instanceHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}/share?text=${enc(composeShareBody(p).slice(0, 470))}`;
}

export function weiboShare(p: SharePayload) {
  return `https://service.weibo.com/share/share.php?url=${enc(p.url.trim())}&title=${enc((p.title ?? "").trim())}&description=${enc(p.text.trim())}`;
}

export function skypeShare(url: string) {
  return `https://web.skype.com/share?url=${enc(url.trim())}`;
}
