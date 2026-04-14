const i = "f77d755058064537b83bbab673ce5721", d = "user-follow-read user-read-private";
function h(r = 128) {
  const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", e = new Uint8Array(r);
  return crypto.getRandomValues(e), Array.from(e, (o) => t[o % t.length]).join("");
}
async function g(r) {
  const t = new TextEncoder().encode(r), e = await crypto.subtle.digest("SHA-256", t);
  return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
async function p() {
  const r = h(), t = await g(r), e = chrome.identity.getRedirectURL();
  await chrome.storage.local.set({ pkce_verifier: r });
  const o = new URLSearchParams({
    response_type: "code",
    client_id: i,
    scope: d,
    redirect_uri: e,
    code_challenge_method: "S256",
    code_challenge: t,
    show_dialog: "true"
  });
  let a;
  try {
    a = await chrome.identity.launchWebAuthFlow({
      url: `https://accounts.spotify.com/authorize?${o}`,
      interactive: !0
    });
  } catch {
    throw new Error("AUTH_CANCELLED");
  }
  const n = new URL(a).searchParams.get("code");
  if (!n) throw new Error("AUTH_CANCELLED");
  const { pkce_verifier: l } = await chrome.storage.local.get("pkce_verifier"), s = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: n,
      redirect_uri: e,
      client_id: i,
      code_verifier: l
    })
  });
  if (!s.ok) throw new Error("TOKEN_ERROR");
  const c = await s.json();
  await chrome.storage.local.set({
    access_token: c.access_token,
    refresh_token: c.refresh_token,
    expires_at: Date.now() + c.expires_in * 1e3
  });
}
console.log("[Spotcalendar] Background service worker started");
console.log("[Spotcalendar] Redirect URL:", chrome.identity.getRedirectURL());
chrome.runtime.onMessage.addListener((r, t, e) => {
  if (console.log("[Spotcalendar] Message received:", r.type), r.type === "LOGIN")
    return p().then(() => e({ success: !0 })).catch((o) => {
      console.error("[Spotcalendar] Login error:", o), e({ success: !1, error: o.message });
    }), !0;
});
