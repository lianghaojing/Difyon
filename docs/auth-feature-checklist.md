# Auth Feature Checklist

This document is the source of truth for tracking registration, login, account recovery, and session/security work.

Status:

- Done: implemented and covered by current code.
- Partial: implemented but has an important gap or policy decision pending.
- Todo: should be implemented before treating auth as production-complete.
- Later: useful, but not required for the first usable auth release.

## Current Scope Summary

The current app already includes email/password registration, email verification, credential login, Google OAuth, password reset, logout, route protection, JWT sessions, token revocation, rate limiting, validation, and unit tests around the core auth services and API routes.

The remaining work is mostly product hardening: explicit verified-email access policy, account/security settings, stronger abuse protection, operational email behavior, and GitHub/release hygiene.

## 1. Registration

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| REG-01 | Registration page | Done | `src/app/(auth)/register/page.tsx`, `src/components/auth/register-form.tsx` | UI exists. |
| REG-02 | Email input | Done | `registerSchema.email` | Validates required email and max length. |
| REG-03 | Display name input | Later | Hidden during registration | Email users manage the display name from Account Center after signup; Google users use their provider name. |
| REG-04 | Password input | Done | `passwordSchema` | Requires 8-128 chars, uppercase, lowercase, digit. |
| REG-05 | Confirm password input | Done | `registerSchema.refine` | Requires match. |
| REG-06 | Password strength indicator | Done | `PasswordStrength`, `calculatePasswordStrength` | UI exists. |
| REG-07 | Client-side validation | Done | React Hook Form + Zod resolver | UI validates before submit. |
| REG-08 | Registration API | Done | `src/app/api/register/route.ts` | Creates users. |
| REG-09 | Duplicate email check | Done | `prisma.user.findUnique` | Returns 409. |
| REG-10 | Password hashing | Done | `src/lib/password.ts` | Uses bcrypt. |
| REG-11 | Verification token creation | Done | `createVerificationToken` | Deletes previous token first. |
| REG-12 | Verification email send | Done | `sendVerificationEmail` + Resend HTTP API | Production requires `RESEND_API_KEY` and a verified `EMAIL_FROM`. |
| REG-13 | Registration rate limit | Done | `register:${ip}` | 5 attempts per 15 minutes. |
| REG-14 | Terms/privacy consent | Done | Checkbox, Google confirmation dialog, `ConsentRecord` | Records user, timestamp, policy versions, and registration method. |
| REG-15 | Registration email send failure policy | Done | User creation remains successful and API returns `emailSent: false` if delivery fails | User can recover through resend verification. |

## 2. Login

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| LOG-01 | Login page | Done | `src/app/(auth)/login/page.tsx`, `src/components/auth/login-form.tsx` | UI exists. |
| LOG-02 | Email/password login form | Done | `loginSchema` | Validates required email and password. |
| LOG-03 | Show/hide password | Done | `login-form.tsx` | UI exists. |
| LOG-04 | Login server action | Done | `src/actions/login.ts` | Calls Auth.js credentials sign-in. |
| LOG-05 | Credential provider | Done | `src/auth.ts` | Looks up user and verifies bcrypt password. |
| LOG-06 | Login rate limit | Done | `login:${ip}` | Implemented. |
| LOG-07 | Callback URL redirect | Done | `callbackUrl` supported | Preserves destination for protected pages. |
| LOG-08 | Login error handling | Done | Returns generic credential error | Avoids excessive detail. |
| LOG-09 | Verified-email enforcement for protected app access | Done | `src/middleware.ts` redirects unverified users to `/verify-email` | Applies to protected routes. |
| LOG-10 | Account lockout after repeated failures | Todo | Not present | Stronger than IP-only rate limiting. |
| LOG-11 | Remember-me duration choice | Later | Session max age fixed at 7 days | Not required for MVP. |

## 3. Email Verification

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| VER-01 | Verify email page | Done | `src/app/(auth)/verify-email/page.tsx` | Handles check-email, loading, success, expired, invalid states. |
| VER-02 | Verify email API | Done | `src/app/api/verify-email/route.ts` | Validates token and updates user. |
| VER-03 | Token expiry handling | Done | `verifyToken` | Expired token returns dedicated state. |
| VER-04 | Token invalid/used handling | Done | `verifyToken`, `consumeToken` | Invalid or consumed token is rejected. |
| VER-05 | Resend verification API | Done | `src/app/api/resend-verification/route.ts` | Creates and sends a new token. |
| VER-06 | Resend verification UI | Done | `verify-email/page.tsx` | User can request another email. |
| VER-07 | OAuth email auto-verification | Done | `events.linkAccount` | Google-linked users are marked verified. |
| VER-08 | Global unverified-user route guard | Done | `src/middleware.ts` | Middleware enforces verification for protected routes. |

## 4. Password Recovery

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| PWD-01 | Forgot password page | Done | `src/app/(auth)/forgot-password/page.tsx` | UI exists. |
| PWD-02 | Forgot password API | Done | `src/app/api/forgot-password/route.ts` | Sends reset email for existing users. |
| PWD-03 | Enumeration-safe response | Done | Same response for existing and missing emails | Good security baseline. |
| PWD-04 | Forgot password rate limit | Done | `forgot-password:${ip}` | Implemented. |
| PWD-05 | Reset password page | Done | `src/app/(auth)/reset-password/page.tsx` | UI exists. |
| PWD-06 | Reset password API | Done | `src/app/api/reset-password/route.ts` | Validates token and updates password. |
| PWD-07 | Password reset token expiry | Done | `createPasswordResetToken`, `verifyToken` | Reset token expires after 1 hour. |
| PWD-08 | Revoke sessions after password reset | Done | `tokenVersion` increment | Existing JWT sessions are invalidated. |
| PWD-09 | Prevent resetting to same password | Later | Not present | Nice to have, not required. |

## 5. Social Login

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| SOC-01 | Google login button | Done | `register-form.tsx`, `login-form.tsx`, `social-button.tsx` | UI exists. |
| SOC-02 | Google OAuth provider | Done | `src/auth.ts` | Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. |
| SOC-03 | Auth callback route | Done | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js handles callbacks. |
| SOC-04 | Account linking storage | Done | `Account` Prisma model | Auth.js adapter persists provider accounts. |
| SOC-05 | OAuth error UX | Partial | Auth error page is `/login` | Need ensure visible user-facing provider error messages. |
| SOC-06 | Additional providers | Later | Google only | Add only if product needs them. |

## 6. Session, Logout, and Route Protection

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| SES-01 | JWT session strategy | Done | `session.strategy = "jwt"` | Max age is 7 days. |
| SES-02 | Session user fields | Done | `session` callback | Adds id, email, name, emailVerified. |
| SES-03 | Token version revocation | Done | `jwt` callback + `tokenVersion` | Invalidates old sessions. |
| SES-04 | Logout action | Done | `src/actions/logout.ts` | Redirects to `/login`. |
| SES-05 | Logout button | Done | `src/components/auth/logout-button.tsx` | UI exists. |
| SES-06 | Protected routes | Done | `src/middleware.ts` | Redirects unauthenticated users to login. |
| SES-07 | Public auth routes | Done | `publicRoutes` | Allows auth pages and APIs. |
| SES-08 | Redirect logged-in users away from login/register | Done | `authRoutes` middleware logic | Redirects to `/`. |
| SES-09 | Role/permission model | Later | Not present | Not needed unless app has multiple roles. |

## 7. Security and Abuse Protection

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| SEC-01 | Bcrypt password hashing | Done | `src/lib/password.ts` | Uses salted hashes. |
| SEC-02 | Hashed email/reset tokens at rest | Done | `hashToken` | Raw tokens are not stored. |
| SEC-03 | CSRF protection for auth | Done | Auth.js | Credentials sign-in uses Auth.js flow. |
| SEC-04 | IP-based rate limiting | Done | `src/lib/rate-limit.ts` | In-memory limit. |
| SEC-05 | Durable/distributed rate limiting | Done | Database-backed in production; in-memory in development/tests | Shared across production instances. |
| SEC-06 | Captcha/Turnstile on abuse-heavy forms | Todo | Not present | Add for login/register/forgot if exposed publicly. |
| SEC-07 | Audit log for security events | Todo | Not present | Track login, logout, reset, verification, failed attempts. |
| SEC-08 | Session/device management | Later | Not present | Useful for account settings. |
| SEC-09 | Two-factor authentication | Later | Not present | Add if security requirements demand it. |

## 8. Account Settings

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| ACC-01 | View current account identity | Done | `/account` | Shows display name fallback, email, verification, and creation date. |
| ACC-02 | Change display name | Done | `/account/profile` | Validates and updates account/session display name. |
| ACC-03 | Change password while logged in | Done | `/account/security` | Requires current password and revokes old sessions. |
| ACC-04 | Change email | Todo | Not present | Should require re-verification. |
| ACC-05 | Delete account | Later | Not present | Needs product/legal decision. |
| ACC-06 | Link/unlink Google account | Later | Not present | Useful after settings page exists. |

## 9. Email and Operations

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| OPS-01 | Verification email template | Done | `src/lib/email.ts` | Existing implementation. |
| OPS-02 | Password reset email template | Done | `src/lib/email.ts` | Existing implementation. |
| OPS-03 | Environment-driven app URL | Done | `NEXT_PUBLIC_APP_URL` fallback | Used in email links. |
| OPS-04 | Email provider configuration check | Partial | Production delivery fails explicitly when Resend config is missing | Deployment still needs real Resend credentials and verified sender domain. |
| OPS-05 | Email retry/queue | Todo | Sends inline during request | Production should queue or retry failures. |
| OPS-06 | Token cleanup job | Todo | Expired tokens remain until replaced/used | Add scheduled cleanup for old verification/reset tokens. |

## 10. Testing and Release Hygiene

| ID | Feature | Status | Current implementation | Notes |
| --- | --- | --- | --- | --- |
| TST-01 | Validation tests | Done | `src/lib/validations.test.ts` | Covers schemas and password strength. |
| TST-02 | Password hashing tests | Done | `src/lib/password.test.ts` | Covers hash/verify. |
| TST-03 | Token tests | Done | `src/lib/tokens.test.ts` | Covers token generation, hashing, expiry, consume. |
| TST-04 | Email tests | Done | `src/lib/email.test.ts` | Covers generated links and send behavior. |
| TST-05 | Register API tests | Done | `src/app/api/register/route.test.ts` | Covers success and common failures. |
| TST-06 | Verify email API tests | Done | `src/app/api/verify-email/route.test.ts` | Covers expired/invalid/success cases. |
| TST-07 | Forgot/reset API tests | Done | API route tests exist | Current repo includes tests. |
| TST-08 | End-to-end auth flow tests | Todo | Not present | Add Playwright or equivalent for browser flows. |
| TST-09 | GitHub CI | Todo | Not confirmed in current tree | Add CI for lint/typecheck/test before merge. |

## Priority Order

1. P0: Enforce verified-email access policy globally if the app requires verified users. Done.
2. P0: Confirm registration email failure policy and make it explicit. Done.
3. P0: Run lint/typecheck/test cleanly and upload this checklist to GitHub.
4. P1: Finish account settings: change email remains.
5. P1: Configure Cloudflare Turnstile and trigger it only after suspicious activity.
6. P1: Add email retry/queue and expired token cleanup.
7. P1: Add GitHub CI.
8. P2: Add captcha/Turnstile if abuse appears or public traffic is expected.
9. P2: Add security audit logs.
10. P3: Add 2FA, device management, more OAuth providers, account deletion, and account linking UX as product scope grows.

## Next One-by-One Execution Plan

Use this order when continuing implementation:

1. Verify current test suite and baseline status.
2. Fix any failing tests without changing product behavior.
3. Add global verified-email middleware policy or document why only the home page requires verification. Done.
4. Decide and implement registration email failure behavior. Done.
5. Configure Resend credentials and verified sender domain.
6. Add change email with verification.
7. Configure conditional Cloudflare Turnstile.
8. Add CI.
9. Add E2E tests for register, consent, verify email, login, forgot password, reset password, logout, and account settings.

## 2026-07-01 Acceptance Triage

Use this section as the continuation checklist for the `codex/auth-pages-ui` branch. Do not recreate a new list next time; continue from the first unchecked P0/P1 item here.

Baseline verified on 2026-07-01:

- Branch: `codex/auth-pages-ui`
- Working tree: clean before this checklist update.
- `npm test`: passed, 10 files / 134 tests.
- `npm run lint`: passed with warnings for raw `<img>` usage in auth/legal pages.
- `npm run build`: passed with the same `<img>` warnings.

### P0 - Must Confirm Before Merge

| ID | Area | Item | Why it matters | Verification / next action | Status |
| --- | --- | --- | --- | --- | --- |
| AUTH-P0-01 | Security | Sanitize login `callbackUrl` before passing it to Auth.js `redirectTo` | Prevents any open-redirect or cross-origin redirect behavior after login/OAuth | Implemented `sanitizeCallbackUrl` and regression tests for internal paths, absolute URLs, protocol-relative URLs, backslashes, and control chars | Done |
| AUTH-P0-02 | Backend | Confirm production Prisma migration exists for `displayName`, `tokenVersion`, `ConsentRecord`, `PasswordResetToken`, and `RateLimitEntry` | Schema changes compile locally, but deployment needs an explicit migration path | `displayName`, `tokenVersion`, and `PasswordResetToken` already exist in `origin/main` schema; added migration `20260701000000_add_auth_consent_and_rate_limits` for `ConsentRecord` and `RateLimitEntry` | Done |
| AUTH-P0-03 | Backend/Ops | Confirm Resend sender domain, `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL` in the target environment | Registration and reset flows depend on real email delivery and correct links | Blocked locally on 2026-07-01 and rechecked on 2026-07-02: `.env` has `EMAIL_FROM` and `NEXT_PUBLIC_APP_URL`, but no `RESEND_API_KEY`; still needs real Resend sender-domain verification and live verification/reset email test | Blocked |
| AUTH-P0-04 | Frontend/Interaction | Browser-test the full happy path: register -> consent -> verification email -> verify -> login -> logout | Unit tests pass, but the actual user flow still needs end-to-end confirmation | Done on 2026-07-02 with Chrome against `localhost:3002`: filled register form, accepted terms, created account, used dev email token, verified email, landed on `/login?verified=true`, logged in with credentials, reached home as verified user, and logged out to `/login`. Also fixed stale unverified registration sessions by signing out after successful email verification before redirecting to login. | Done |
| AUTH-P0-05 | Frontend/Interaction | Browser-test recovery path: forgot password -> reset email -> reset password -> old session invalidated -> login with new password | This is high-risk auth behavior and touches token/session revocation | Done on 2026-07-02 with Chrome against `localhost:3002`: submitted forgot-password form, used dev reset token, reset password, confirmed old password shows invalid-credentials error, and confirmed new password logs in successfully. | Done |
| AUTH-P0-06 | Frontend/Interaction | Confirm unverified-user behavior across protected routes | Middleware blocks protected pages, but the user experience must be understandable | Done on 2026-07-01: created unverified email user, credentials login succeeded, `/`, `/account`, `/account/profile`, and `/account/security` all returned 307 to `/verify-email?email=...`; `/verify-email?email=...` returned 200 | Done |

### P1 - Should Confirm Before Calling The Feature Polished

| ID | Area | Item | Why it matters | Verification / next action | Status |
| --- | --- | --- | --- | --- | --- |
| AUTH-P1-01 | Visual | Review login/register/forgot/reset/verify/legal pages at mobile, tablet, and desktop widths | Auth is a trust surface; layout overflow or weak responsive behavior hurts conversion | Capture screenshots for 390px, 768px, 1440px and fix visible issues | Todo |
| AUTH-P1-02 | Visual | Confirm brand assets and icon filenames, including Chinese filename assets under `public/icons/auth` | Non-ASCII asset names can be awkward in tooling/CDN workflows | Done on 2026-07-02: renamed Chinese auth asset filenames to ASCII (`brand-logo`, `brand-logo.png`, `app-icon`, `base-logo`) and updated auth/legal references. This also fixed the `/register` `ByteString` header error from preloading `/icons/auth/组 41642.svg`. | Done |
| AUTH-P1-03 | Visual/Performance | Replace raw logo `<img>` tags or explicitly document why they remain | Lint/build warn about possible LCP/bandwidth impact | Done on 2026-07-02: replaced repeated auth/legal brand logo `<img>` tags with `next/image` using explicit intrinsic dimensions from `brand-logo.svg`. | Done |
| AUTH-P1-04 | Interaction | Confirm loading, disabled, error, success, resend cooldown, and repeated-submit states on every auth form | Prevents duplicate requests and confusing failures | Done on 2026-07-02 with Chrome: confirmed invalid forms start disabled, valid register/login/forgot/reset submissions enable and submit, forgot/reset success states render, old-password login failure renders an error, verify-email resend entry is reachable, and repeated submit controls disable while pending where implemented. | Done |
| AUTH-P1-05 | Interaction | Confirm language switch behavior across auth/legal pages | i18n copy exists, but persistence and route-to-route consistency need UX validation | Done on 2026-07-02: added shared auth locale persistence and verified language choice carries across login, register, forgot-password, terms, and privacy pages. | Done |
| AUTH-P1-06 | Accessibility | Keyboard-only and screen-reader label pass for all forms | Auth forms need strong accessibility basics | Done on 2026-07-02 with Chrome: confirmed auth inputs have labels or aria labels, buttons have accessible names, keyboard tab reaches form controls, and fixed hidden language-menu options so they are not tabbable while closed. | Done |
| AUTH-P1-07 | Frontend | Confirm account center UX: profile update, password update, resend verification, unavailable change-email page | Account pages were added but need workflow-level acceptance | Done on 2026-07-02 with Chrome for verified email/password user: profile display name update succeeded, email page showed verified state, security page password update succeeded, and latest password could log in afterward. Unverified users are intentionally routed to verify-email for resend instead of account center. | Done |
| AUTH-P1-08 | Backend/Security | Decide whether registration duplicate-email response should remain explicit | Explicit 409 improves UX but reveals whether an email is registered | Done on 2026-07-02: changed duplicate-email registration to return the same generic success shape as normal registration without creating another user or sending a new token, preventing account enumeration through the registration API. | Done |
| AUTH-P1-09 | Backend/Security | Add account-level lockout or suspicious-activity handling beyond IP rate limits | IP-only throttling is easy to bypass and can punish shared networks | Done on 2026-07-02: added account-level failed-password tracking for existing credential users with a 5-failure/15-minute window and 30-minute lockout; successful login clears the account failure counter. | Done |
| AUTH-P1-10 | Backend/Ops | Add expired token cleanup job or scheduled maintenance task | Verification/reset tokens otherwise accumulate | Done on 2026-07-02: added `deleteExpiredAuthTokens` and protected `POST /api/cron/cleanup-auth-tokens`, requiring `Authorization: Bearer $CRON_SECRET`. | Done |
| AUTH-P1-11 | Release | Add CI for test/build/lint or confirm existing GitHub workflow status | Local checks pass, but merge safety needs automated verification | Done on 2026-07-02: added GitHub Actions CI for `npm ci`, `npm test`, `npm run lint`, and `npm run build` on PRs and main/dev/codex branch pushes. | Done |

### P2 - Later Hardening

| ID | Area | Item | Why it matters | Verification / next action | Status |
| --- | --- | --- | --- | --- | --- |
| AUTH-P2-01 | Testing | Add Playwright E2E for critical auth paths | Prevents regressions in flows unit tests cannot cover | Add only after manual flow stabilizes | Todo |
| AUTH-P2-02 | Security | Add security audit log for login, logout, failed login, reset, verification, and account changes | Useful for abuse investigation and user support | Define event schema first | Todo |
| AUTH-P2-03 | Account | Implement change-email with re-verification | Current account email page exists but does not provide the full flow | Product decision and backend implementation needed | Todo |
| AUTH-P2-04 | Account | Decide on delete account, OAuth link/unlink, 2FA, and device/session management | These are useful but not required for initial auth release | Prioritize only after core auth is accepted | Later |

### Continuation Rule

Next session should start with:

1. `git status --short --branch`
2. Open this section in `docs/auth-feature-checklist.md`.
3. Continue from the first unchecked, partial, or blocked P0 item, currently `AUTH-P0-03`.
4. After each item is handled, update its status and add a short result note.
