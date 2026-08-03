# Next.js Security Checklist (`SECURITY.md`)

> A practical security guide for production-ready Next.js applications.

---

# Security Principles

This project follows these security principles:

* Never trust user input.
* Validate everything on the server.
* Use least privilege.
* Keep secrets outside the codebase.
* Keep dependencies updated.
* Secure authentication and authorization.
* Encrypt sensitive communications.
* Monitor and log suspicious activities.

---

# Environment Variables

## Never Commit

Never commit:

```
.env
.env.local
.env.production
.env.development
```

Add them to `.gitignore`.

Example:

```gitignore
.env*
!.env.example
```

Only commit:

```
.env.example
```

Example:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

---

# Secrets

Use strong secrets.

Example:

```bash
openssl rand -base64 32
```

Never hardcode:

* API Keys
* JWT Secrets
* Database Passwords
* OAuth Credentials
* Encryption Keys

---

# HTTPS

Always enable HTTPS in production.

Enable:

* HSTS
* TLS 1.2+
* Secure Cookies

Never expose the site through plain HTTP.

---

# Security Headers

Configure headers inside `next.config.ts`.

Example:

```ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

export default {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

# Content Security Policy (CSP)

Implement a CSP.

Example:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
```

Adjust only when using third-party services.

---

# Authentication

Recommended providers:

* Auth.js (NextAuth)
* Clerk
* Better Auth

Requirements:

* Secure Cookies
* HttpOnly Cookies
* SameSite=Lax or Strict
* CSRF Protection
* Session Expiration
* Session Rotation

Never store authentication tokens in localStorage.

Prefer:

```
HttpOnly Cookies
```

---

# Authorization

Never trust the frontend.

Every API route must verify:

* Authentication
* User Role
* Ownership
* Permissions

Example:

```
Admin
 ├── Users
 ├── Reports
 └── Settings

Staff
 ├── Inventory
 └── Orders
```

---

# Input Validation

Always validate server-side.

Recommended libraries:

* Zod
* Valibot

Example:

```ts
const schema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
```

Never rely only on client validation.

---

# SQL Injection

If using:

* Prisma
* Drizzle
* Sequelize

Avoid raw SQL.

Good:

```ts
await prisma.user.findUnique({
    where: {
        email,
    },
});
```

Bad:

```sql
SELECT * FROM users WHERE email='${email}'
```

---

# XSS Protection

Escape user-generated content.

Avoid:

```tsx
dangerouslySetInnerHTML
```

Unless sanitized.

Use:

* DOMPurify
* sanitize-html

---

# CSRF Protection

If using cookies:

Enable CSRF protection.

Never allow state-changing requests without verification.

---

# File Upload Security

Validate:

* MIME Type
* File Extension
* File Size

Rename uploaded files.

Never trust filenames.

Store uploads outside the public directory whenever possible.

Scan uploaded files if applicable.

---

# Password Security

Hash passwords using:

* Argon2
* bcrypt

Never store plain text passwords.

Minimum:

* 12 characters
* Strong complexity

---

# Rate Limiting

Protect:

* Login
* Register
* Forgot Password
* OTP
* APIs

Recommended:

* Upstash Rate Limit
* Arcjet
* Redis-based limiter

---

# API Security

Protect every route.

Validate:

* Authentication
* Authorization
* Request Body
* Query Parameters

Never expose:

* Stack traces
* Database errors
* Internal IDs unnecessarily

Return generic error messages.

---

# Error Handling

Bad:

```
Database password incorrect
```

Good:

```
Something went wrong.
```

Log detailed errors only on the server.

---

# Logging

Log:

* Login attempts
* Failed logins
* Password changes
* Permission changes
* Admin actions
* Suspicious requests

Never log:

* Passwords
* Tokens
* Secrets
* API Keys

---

# Database Security

Use:

* Least privilege accounts
* SSL connections
* Parameterized queries
* Regular backups

Disable:

* Public database access
* Root login from the internet

---

# Dependency Security

Regularly run:

```bash
npm audit
```

Update:

```bash
npm update
```

Check outdated packages:

```bash
npm outdated
```

Enable Dependabot or Renovate.

---

# Secure Cookies

Recommended:

```
HttpOnly
Secure
SameSite=Lax
```

Example:

```ts
cookies().set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
});
```

---

# Middleware Protection

Protect private routes.

Example:

```
/dashboard
/admin
/settings
/profile
```

Redirect unauthenticated users.

---

# CORS

Allow only trusted origins.

Bad:

```
*
```

Good:

```
https://yourdomain.com
```

---

# Image Security

Allow trusted image domains only.

Example:

```ts
images: {
    remotePatterns: [
        {
            protocol: "https",
            hostname: "images.example.com",
        },
    ],
},
```

---

# Docker Security

Run as a non-root user.

Example:

```dockerfile
USER nextjs
```

Use:

* Read-only filesystem where practical
* Minimal base image
* Multi-stage builds
* No secrets inside the image

---

# CI/CD

Before deployment:

* Run tests
* Run lint
* Run typecheck
* Scan dependencies
* Scan secrets

Example:

```bash
npm run lint
npm run typecheck
npm test
npm audit
```

---

# Production Checklist

## Server

* [ ] HTTPS enabled
* [ ] HSTS enabled
* [ ] CSP configured
* [ ] Security headers configured
* [ ] Firewall enabled
* [ ] Automatic backups

## Application

* [ ] Authentication secured
* [ ] Authorization verified
* [ ] Input validation
* [ ] Rate limiting
* [ ] Logging enabled
* [ ] CSRF protection
* [ ] XSS prevention

## Database

* [ ] SSL enabled
* [ ] Backups configured
* [ ] Least privilege user
* [ ] No public access

## Environment

* [ ] Secrets outside Git
* [ ] `.env.example` updated
* [ ] Debug mode disabled

## Dependencies

* [ ] `npm audit`
* [ ] Packages updated
* [ ] Dependabot enabled

---

# Incident Response

If a vulnerability is discovered:

1. Identify the issue.
2. Disable affected functionality if necessary.
3. Rotate secrets and API keys.
4. Patch the vulnerability.
5. Review logs for abuse.
6. Notify affected users if required.
7. Deploy the fix.
8. Monitor for recurrence.

---

# Security Tools

Recommended tools:

* ESLint Security Plugins
* npm audit
* Snyk
* Dependabot
* Renovate
* OWASP ZAP
* Trivy (Docker image scanning)
* Gitleaks (secret scanning)

---

# References

* OWASP Top 10
* OWASP ASVS
* Next.js Security Best Practices
* Auth.js Documentation
* Prisma Security Guide
* Node.js Security Best Practices

---

# License

This document is intended to serve as a baseline security standard for all Next.js projects and should be reviewed regularly as the application evolves.
