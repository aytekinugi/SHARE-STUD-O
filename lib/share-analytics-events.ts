/** dataLayer `share_ux` event alanları — PII yok. */
export const SHARE_DATALAYER_EVENT_SCHEMA = {
  event: "share_ux",
  fields: {
    channels: "number — seçili kanal sayısı",
    url_count: "number — benzersiz sekme URL",
    open_tabs: "number — açılan ilk sekme",
    remainder_count: "number — kalan URL",
    defer_remainder_clipboard: "boolean",
    assembled_chars: "number — birleşik metin uzunluğu"
  }
} as const;

export const SHARE_UX_LOG_EVENTS = [
  "batch_execute",
  "clipboard_copy_button_failed",
  "clipboard_sync_exec_command_false",
  "clipboard_write_api_failed_main",
  "clipboard_write_api_failed_remainder",
  "clipboard_read_denied_or_unsupported",
  "clipboard_verify_mismatch",
  "href_list_empty_after_selection",
  "draft_restored",
  "draft_saved",
  "pack_exported",
  "pack_imported",
  "data_cleared",
  "template_applied",
  "campaign_imported",
  "channel_order_reset",
  "qr_opened"
] as const;
