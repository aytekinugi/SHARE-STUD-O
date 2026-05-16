# Vanguard — veri akışı ve güvenlik kontrol listesi

Bu belge paylaşım stüdyosu, Supabase ve ödeme webhook’ları için RLS ve gizlilik varsayımlarını özetler. Yeni tablo veya API eklerken bu listeyi güncelleyin.

## Paylaşım stüdyosu (istemci)

- Metin, şablon ve kanal seçimi **tarayıcıda** tutulur (`localStorage`, otomatik taslak).
- Görsel dosyalar **sunucuya yüklenmez**; Pinterest vb. için yalnızca URL alanı kullanılır.
- Toplu açılış ve pano kopyalama kullanıcı eylemiyle tetiklenir; analytics `dataLayer` / debug modu isteğe bağlıdır.

## Supabase tabloları

| Tablo | Erişim | Not |
|-------|--------|-----|
| `profiles`, `quests` | Kullanıcı RLS (`auth.uid()`) | Dashboard ve kampanya import |
| `short_links` | Insert/select kendi kaydı; `clicks` RPC ile artar | `/s/[id]`, `/api/short` |
| `share_templates` | CRUD yalnızca `user_id = auth.uid()`; payload Zod | `/api/share/templates` |
| `guild_share_templates` | Üye okur; yazar siler | `/api/share/templates/guild` |

Şema: `supabase/schema.sql`. Mevcut projede SQL editöründe yeni tabloları uygulayın.

## API rotaları

- `/api/share/campaign` — oturum gerekir; yalnızca kullanıcının quest verisi.
- `/api/short` — oturum gerekir; hedef URL doğrulanır.
- `/api/share/templates` — oturum gerekir; payload Zod ile doğrulanır; free/pro limitleri.
- `/api/share/templates/guild` — guild üyeliği gerekir; Pro guild şablon limiti.
- `/api/share/limits` — plan ve kullanım özeti.
- `/api/short`, `/api/share/campaign` — rate limit (IP + kullanıcı).
- `/api/og/share` — yalnızca başlık/seviye ile görsel üretir; PII yok.
- Stripe webhook — `STRIPE_WEBHOOK_SECRET` zorunlu; ham gövde imza ile doğrulanır.

## Ortam değişkenleri

- `NEXT_PUBLIC_*` yalnızca istemcide güvenle açılabilecek değerler (Supabase anon key, Sentry DSN).
- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*` secret’ları **yalnızca sunucuda**.

## Kontrol listesi (release öncesi)

- [ ] Yeni tabloda RLS açık ve `auth.uid()` politikaları tanımlı
- [ ] Service role yalnızca admin işlemlerinde (ör. short link insert)
- [ ] Webhook route’ta secret parse + imza doğrulama
- [ ] Paylaşım sayfasında gizlilik metni güncel
- [ ] E2E: `/share` yüklenir, locale ve query prefill smoke
