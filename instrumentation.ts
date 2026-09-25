// Next.js instrumentation hook — runs once when the server process starts,
// before any route/module code executes. This is the correct place for
// process-wide setup (unlike setting env vars inside a route file, which
// may run after other modules have already cached HTTP agents).
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV !== "production") {
        // WARNING: Dev-only workaround for corporate VPNs/proxies that perform
        // TLS inspection with a self-signed root CA, causing
        // "unable to get local issuer certificate" / hanging connections on
        // outbound HTTPS calls (e.g. to Cloudinary). Never enable this in
        // production — it disables TLS certificate verification entirely.
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    }
}
