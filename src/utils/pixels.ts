// Shared Meta (Facebook) + TikTok pixel helpers, reused by landing pages,
// product pages, and the storefront. The pixel IDs come from the page owner's
// account-level settings (تعديل متجري) merged server-side, so an affiliate sets
// them once and they fire everywhere their traffic lands.

export interface PixelIds {
  facebook?: string;
  tiktok?: string;
  snapchat?: string;
}

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    TiktokAnalyticsObject?: any;
    __pixelsInjected?: Record<string, boolean>;
  }
}

const once = (key: string): boolean => {
  if (typeof window === "undefined") return false;
  window.__pixelsInjected = window.__pixelsInjected || {};
  if (window.__pixelsInjected[key]) return false;
  window.__pixelsInjected[key] = true;
  return true;
};

/** Load + init the Meta/TikTok pixels and fire a PageView. Safe to call repeatedly. */
export function injectPixels(pixels?: PixelIds | null): void {
  if (!pixels || typeof window === "undefined") return;

  // ── Meta / Facebook ──
  if (pixels.facebook && once(`fb:${pixels.facebook}`)) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", pixels.facebook);
    window.fbq("track", "PageView");
  }

  // ── TikTok ──
  if (pixels.tiktok && once(`tt:${pixels.tiktok}`)) {
    /* eslint-disable */
    (function (w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer = function (tt: any, e: any) { tt[e] = function () { tt.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (tt: any) { for (var e = ttq._i[tt] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e: any, n?: any) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
        ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0;
        o.src = i + "?sdkid=" + e + "&lib=" + t;
        var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(pixels.tiktok); ttq.page();
    })(window, document, "ttq");
    /* eslint-enable */
  }
}

/** Fire a purchase/conversion event on both pixels (call after an order succeeds). */
export function firePurchase(value: number, currency = "DZD"): void {
  if (typeof window === "undefined") return;
  try { window.fbq?.("track", "Purchase", { value, currency }); } catch { /* ignore */ }
  try { window.ttq?.track?.("CompletePayment", { value, currency }); } catch { /* ignore */ }
}
