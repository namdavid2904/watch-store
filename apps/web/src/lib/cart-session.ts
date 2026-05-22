const CART_SESSION_KEY = "watch-store-cart-session";

export function getCartSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId = window.localStorage.getItem(CART_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(CART_SESSION_KEY, sessionId);
  }

  return sessionId;
}
