# PRD: Authentication

## 1. Summary

Authentication lets a user create an account, verify email, sign in, recover access, use Google login, stay in a protected session, and log out safely.

The current implementation already covers the main auth lifecycle. This PRD turns the existing checklist into product requirements, clarifies the remaining gaps, and separates core authentication from Account Center work.

## 2. Contacts

| Name | Role | Comment |
| --- | --- | --- |
| Product owner | Product | Owns auth scope, user flows, and launch readiness. |
| Engineering owner | Engineering | Owns implementation, tests, and technical tradeoffs. |
| Security reviewer | Security/engineering | Reviews password, token, rate limit, and session behavior. |

## 3. Background

Difyon is a full-stack authentication system built with Next.js, Auth.js, Prisma, and PostgreSQL. The auth foundation already includes:

- Email/password registration.
- Email verification.
- Credential login.
- Google OAuth login.
- Forgot password and reset password.
- Logout.
- Protected routes.
- Verified-email route enforcement.
- JWT session management.
- Token-version session revocation.
- Bcrypt password hashing.
- Hashed verification and reset tokens.
- IP-based rate limiting.
- Zod and React Hook Form validation.
- Unit tests for validation, tokens, password, email, and core auth API routes.

The remaining work is mostly production hardening and product polish, not basic auth capability.

## 4. Objective

Ship an authentication experience that is secure enough for a real product MVP and clear enough for users to complete account setup without support.

### Product Objective

Users should be able to register, verify email, log in, recover access, and understand blocked states.

### Security Objective

Protect account access through password hashing, token expiry, route protection, generic auth errors, rate limits, and session revocation.

### Key Results

| Key result | Target |
| --- | --- |
| Users can register with valid email, display name, and password | Covered by UI and API tests |
| Duplicate registration is blocked | API returns conflict without creating another user |
| Verification email is created and sent after registration | Token exists and email send result is handled |
| Users can verify email through token link | Valid token marks user verified |
| Expired or invalid verification tokens show correct state | No account corruption |
| Users can log in with credentials | Valid credentials create session |
| Login errors avoid account enumeration | Generic invalid-credential messaging |
| Unverified users cannot access protected app routes | Redirects to `/verify-email` |
| Users can request password reset without account enumeration | Same response for known and unknown emails |
| Password reset invalidates old sessions | `tokenVersion` increments |
| Google OAuth users are marked verified after account link | `emailVerified` is set |

## 5. Market Segments

### Segment 1: New Email/Password Users

Job story:

> When I decide to use Difyon, I want to create an account and verify my email, so I can safely access protected product features.

Needs:

- Clear registration form.
- Strong password rules.
- Password confirmation.
- Email verification.
- Resend verification if needed.

### Segment 2: Returning Users

Job story:

> When I come back to Difyon, I want to sign in quickly and safely, so I can return to my work.

Needs:

- Email/password login.
- Google login.
- Callback URL support.
- Clear but secure error states.

### Segment 3: Users Who Lost Access

Job story:

> When I forget my password, I want to reset it without exposing whether my email has an account, so I can recover access safely.

Needs:

- Forgot password flow.
- Reset link.
- Token expiry.
- New password validation.
- Old session revocation.

### Segment 4: Unverified Users

Job story:

> When I have not verified email yet, I want to understand what action is required, so I can complete setup and continue.

Needs:

- Redirect to verification page.
- Resend verification.
- Clear expired or invalid token states.

## 6. Value Propositions

| User need | Authentication value |
| --- | --- |
| Create account safely | Validated registration, hashed passwords, duplicate email protection |
| Prove email ownership | Verification token flow and resend verification |
| Sign in with less friction | Credential login and Google OAuth |
| Recover access | Forgot/reset password flow with token expiry |
| Trust protected areas | Route protection and verified-email enforcement |
| Stay secure after sensitive changes | Token-version session revocation |

## 7. Solution

### 7.1 Current Auth Scope

| Area | MVP status | Notes |
| --- | --- | --- |
| Registration | Done | Email, display name, password, confirm password, validation |
| Login | Done | Credential login, Google login, callback URL |
| Email verification | Done | Verify token, expired/invalid states, resend |
| Password recovery | Done | Forgot password, reset password, revoke sessions |
| Session protection | Done | JWT sessions, protected routes, verified-email enforcement |
| Logout | Done | Existing logout action |
| Core auth tests | Done | Validation, token, password, email, API route tests |

### 7.2 Registration

Requirements:

- Collect email, display name, password, and password confirmation.
- Validate email format and length.
- Validate display name with existing `displayNameSchema`.
- Validate password with existing `passwordSchema`.
- Require password confirmation match.
- Block duplicate email registration.
- Hash passwords with bcrypt.
- Create verification token.
- Send verification email.
- Keep account creation successful if email delivery fails, and return `emailSent: false`.
- Rate limit registration attempts.

Acceptance criteria:

- Valid registration creates a user and verification token.
- Duplicate email returns conflict.
- Invalid inputs fail before user creation.
- Email delivery failure does not delete the account.
- User can recover from email delivery failure by resending verification.

### 7.3 Login

Requirements:

- Support email/password login.
- Support Google OAuth login.
- Preserve callback URL for protected pages.
- Show generic login errors.
- Rate limit login attempts.
- Redirect logged-in users away from login and register pages.
- Enforce verified-email policy for protected app routes.

Acceptance criteria:

- Correct credentials create a session.
- Wrong password returns generic error.
- Unknown email returns same generic error style.
- Logged-in users do not stay on login/register pages.
- Unverified users are redirected to `/verify-email`.

### 7.4 Email Verification

Requirements:

- Verification page supports check-email, loading, success, expired, and invalid states.
- Verification API validates token.
- Expired tokens return expired state.
- Invalid or already used tokens are rejected.
- Resend verification creates and sends a new token.
- Google-linked accounts are marked verified.

Acceptance criteria:

- Valid token marks email verified.
- Expired token does not verify user.
- Used token cannot be reused.
- Resend verification works for unverified users.
- Verified users are not encouraged to resend unnecessarily.

### 7.5 Password Recovery

Requirements:

- Forgot password page accepts email.
- Forgot password API returns enumeration-safe response.
- Existing users receive reset token email.
- Reset password page validates token and new password.
- Reset token expires after 1 hour.
- Successful reset hashes new password.
- Successful reset increments `tokenVersion`.

Acceptance criteria:

- Known and unknown emails receive the same public response.
- Valid reset token allows password update.
- Expired or invalid token cannot update password.
- Existing JWT sessions are invalidated after reset.

### 7.6 Sessions and Route Protection

Requirements:

- Use JWT session strategy.
- Include user id, email, name, and email verification state in session.
- Compare JWT `tokenVersion` to user `tokenVersion`.
- Protect app routes.
- Allow public auth routes and auth APIs.
- Redirect unauthenticated users to `/login`.
- Redirect unverified users to `/verify-email`.

Acceptance criteria:

- Anonymous users cannot access protected pages.
- Unverified users cannot access protected pages.
- Old JWTs fail after token version changes.
- Public auth routes remain reachable.

### 7.7 Production Hardening Gaps

These are not blockers for local MVP behavior, but they matter before public production launch.

| Gap | Priority | Why |
| --- | --- | --- |
| Durable/distributed rate limiting | Done | Production uses shared database-backed rate-limit entries |
| Account lockout or risk-based throttling | P1 | Stronger abuse defense than IP-only limits |
| Email retry or queue | P1 | Inline email sending is fragile |
| Expired token cleanup job | P1 | Prevents old token buildup |
| GitHub CI | P1 | Ensures lint/typecheck/test before merge |
| End-to-end auth flow tests | P1 | Catches browser flow regressions |
| Captcha or Turnstile | P2 | Useful if public abuse appears |
| Security event audit log | P2 | Needed for mature account security |
| 2FA | P3 | Add only when product security needs justify it |

## 8. Release

### MVP Auth Release

Current MVP auth is functionally complete when:

- Registration works.
- Email verification works.
- Resend verification works.
- Login works.
- Google OAuth works.
- Forgot/reset password works.
- Logout works.
- Protected routes block anonymous users.
- Protected routes block unverified users.
- Password reset revokes old sessions.
- Core auth tests pass.

### Before Public Production

Add or confirm:

1. Configure production Resend credentials and verified sender domain.
2. Email provider health and retry behavior.
3. Expired token cleanup.
4. E2E tests for registration, verification, login, reset password, and logout.
5. CI for lint, typecheck, and tests.
6. Confirm the final legal copy and contact details; consent recording is implemented.
7. OAuth error UX polish.

### Relationship to Account Center

Authentication owns:

- Register.
- Verify email.
- Login.
- OAuth login.
- Forgot/reset password.
- Session creation and revocation.
- Route protection.

Account Center owns:

- Viewing account identity after login.
- Editing display name.
- Changing password while logged in.
- Logging out all devices.
- Viewing email status from personal center.
- Changing email later.
