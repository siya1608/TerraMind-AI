"""
TerraMind AI — Security Headers Middleware
==========================================
Injects industry-standard secure HTTP response headers into every response.
These headers protect against common web vulnerabilities:

- X-Content-Type-Options     → Prevents MIME-sniffing attacks
- X-Frame-Options            → Prevents clickjacking via iframe embedding
- Content-Security-Policy    → Restricts allowed content sources
- Referrer-Policy            → Limits referrer information leakage
- Permissions-Policy         → Disables unnecessary browser features
- X-XSS-Protection           → Legacy XSS filter header (IE/older Chrome)
- Strict-Transport-Security  → Forces HTTPS in production

Reference: https://owasp.org/www-project-secure-headers/
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Starlette/FastAPI middleware that adds secure response headers to every
    HTTP response. Safe for both development and production environments.
    """

    # Content Security Policy: allow self + trusted CDNs for fonts/styles only
    CSP_POLICY = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' http://localhost:* http://127.0.0.1:*; "
        "frame-ancestors 'none';"
    )

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        )
        response.headers["Content-Security-Policy"] = self.CSP_POLICY
        # Only add HSTS in production (HTTPS) contexts
        # Uncomment for production: response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
