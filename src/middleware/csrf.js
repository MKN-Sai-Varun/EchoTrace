export function csrfProtection(req, res, next) {
  // Safe methods don't mutate state — skip CSRF check
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) return next();

  const tokenFromHeader = req.headers["x-csrf-token"];
  const tokenFromCookie = req.headers.cookie
    ?.split("; ")
    .find(r => r.startsWith("csrfToken="))
    ?.split("=")[1];

  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next();
}
