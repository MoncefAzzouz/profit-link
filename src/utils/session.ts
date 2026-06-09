// Keys this app stores in localStorage. Cleared on logout so the next account
// that logs in on the same browser never sees the previous account's cached
// user/store/landing data.
const SESSION_KEYS = [
  "token",
  "affiliate_user",
  "seller_user",
  "affiliate_store_settings",
  "landing_page_settings",
  "landing_pages",
  "expedited_order_ids",
];

/** Remove every per-user key from localStorage. Call this on logout. */
export function clearSession(): void {
  try {
    for (const key of SESSION_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore (e.g. Safari private mode) */
  }
}
