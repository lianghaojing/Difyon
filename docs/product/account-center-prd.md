# PRD: Account Center

## 1. Summary

Account Center is the personal center for Difyon users. It gives verified users one place to view account identity, update display name, manage password security, log out, revoke older sessions, and check email verification status.

The first version focuses on essential self-service account management. It does not include KYC, billing, API keys, account deletion, device lists, 2FA, or avatar upload.

## 2. Contacts

| Name | Role | Comment |
| --- | --- | --- |
| Product owner | Product | Owns scope, priority, and release decisions. |
| Engineering owner | Engineering | Owns implementation, tests, and technical tradeoffs. |
| Security reviewer | Security/engineering | Reviews password, session, email, and route protection behavior. |

## 3. Background

Difyon already supports the core authentication lifecycle:

- Email/password registration.
- Email verification.
- Credential login.
- Google OAuth.
- Forgot password and reset password.
- Logout.
- Protected routes.
- JWT sessions.
- Token-version session revocation.
- Rate limiting.
- Validation.
- Unit tests for core auth services and API routes.

The current product gap is what happens after login. A user can create and recover an account, but cannot manage account identity and security from a dedicated personal center. The home page only shows basic identity data, and the remaining account settings are tracked as engineering tasks in `docs/account-center-todo.md`.

### Gaps Fixed in This PRD Revision

The previous PRD was useful, but it was too close to a feature list. This revision makes these changes:

| Previous gap | Adjustment |
| --- | --- |
| Success metrics were broad | Added measurable product, security, and quality targets |
| User segments were too generic | Split normal password users, OAuth-only users, and unverified users |
| MVP boundary was not strict enough | Defined explicit MVP, P1, and out-of-scope decisions |
| Password/session behavior had open ambiguity | Set a default policy for password change and logout all devices |
| OAuth-only behavior was underspecified | Added a clear MVP rule: no broken password form for OAuth-only users |
| Acceptance criteria were spread across docs | Added feature-level acceptance criteria in the PRD |
| Risks and assumptions were light | Added risk table with validation method |

## 4. Objective

Ship a first usable Account Center that lets verified users manage essential account details without developer or support intervention.

### Product Objective

Give users confidence that their account identity and security state are understandable and controllable.

### Business Objective

Create a stable account foundation for future product surfaces such as billing, privacy settings, developer settings, and regulated identity checks if the business later needs them.

### Key Results

| Key result | Target |
| --- | --- |
| Verified users can open `/account`, `/account/profile`, `/account/security`, and `/account/email` | 100% of account routes work for verified users |
| Anonymous users cannot access account routes | Redirects to `/login` with callback behavior preserved |
| Unverified users cannot access account routes | Redirects to `/verify-email` |
| Display name update works for valid names | Valid name persists in database and appears after refresh |
| Invalid display names are rejected | Existing `displayNameSchema` rules are enforced |
| Password change requires the current password | Wrong current password fails without changing state |
| Password change invalidates older sessions | `tokenVersion` is incremented |
| Logout all devices invalidates all existing JWT sessions | `tokenVersion` is incremented and current user is sent to login |
| Email page accurately shows verification state | Verified and unverified states render correctly |
| Unverified users can resend verification email | Existing resend verification behavior is reused |

## 5. Market Segments

### Segment 1: Password Users

These users registered with email and password.

Job story:

> When I use Difyon with a password account, I want to update my profile and password myself, so I can keep my account accurate and secure.

Needs:

- View current account identity.
- Change display name.
- Change password after entering current password.
- Log out current session.
- Log out all sessions.
- Check email verification state.

### Segment 2: OAuth-Only Users

These users signed in with Google and may not have a local password.

Job story:

> When I use Difyon with Google login, I want the account center to show only actions that apply to my account, so I do not see broken or confusing password controls.

Needs:

- View current account identity.
- View provider image if available.
- Change display name if allowed.
- Log out.
- Avoid current-password forms when no local password exists.

MVP decision:

- OAuth-only users should not see a current-password change form.
- Setting a local password for OAuth-only users is P1 or later.

### Segment 3: Unverified Users

These users created an account but have not verified email.

Job story:

> When my email is not verified, I want to understand what is blocking me and resend verification email, so I can finish account setup.

Needs:

- Be routed to verification flow before protected account pages.
- Resend verification email.
- Understand verified/unverified state once allowed into account pages.

## 6. Value Propositions

| User need | Account Center value |
| --- | --- |
| Know which account is active | Shows display name, email, verification state, and account creation date |
| Keep public identity accurate | Allows display name update with existing validation rules |
| Keep account secure | Supports password change and session revocation |
| Recover from missed verification email | Reuses resend verification from a relevant account area |
| Avoid support for basic tasks | Moves simple account updates into self-service flows |
| Grow without route churn | Establishes `/account` as the canonical personal center route |

## 7. Solution

### 7.1 UX and Routes

First-version route map:

| Route | Purpose | MVP |
| --- | --- | --- |
| `/account` | Overview, identity summary, quick actions | Yes |
| `/account/profile` | Edit display name and view avatar/provider image | Yes |
| `/account/security` | Change password, logout, logout all devices | Yes |
| `/account/email` | View email status and resend verification when needed | Yes |
| `/account/verification` | KYC or real-name verification | No |
| `/account/notifications` | Notification preferences | No |
| `/account/privacy` | Data export and account deletion | No |
| `/account/billing` | Plan, payment, invoices | No |
| `/account/developer` | API keys and webhooks | No |

Canonical route decision:

- Use `/account`.
- Do not introduce `/settings` for the first version.
- A `/settings` alias can be added later only if product navigation needs it.

### 7.2 MVP Scope

#### Account Shell

Requirements:

- Add account route group.
- Add account layout with navigation: Overview, Profile, Security, Email.
- Add a back-to-app link.
- Protect all account routes with current auth and verification policy.
- Keep desktop and mobile navigation stable.

Acceptance criteria:

- Anonymous users are redirected to `/login`.
- Unverified users are redirected to `/verify-email`.
- Verified users can navigate between all MVP account pages.
- Current navigation item is visually clear.

#### Account Overview

Requirements:

- Show display name.
- Show email.
- Show email verification status.
- Show account creation date if available.
- Show quick actions for Profile, Security, and Email.

Acceptance criteria:

- Missing display name falls back to email or a readable placeholder.
- Verification state matches `emailVerified`.
- Dates render in a stable, readable format.

#### Profile

Requirements:

- Show current display name.
- Show avatar/provider image or fallback initials.
- Allow display name edit.
- Validate with existing `displayNameSchema`.
- Update both `name` and `displayName` to keep Auth.js session and product profile aligned.
- Show loading, success, and error states.

Acceptance criteria:

- Empty, too-short, too-long, or whitespace-padded names fail validation.
- Valid display name persists after refresh.
- Save button cannot double-submit while pending.

#### Security

Requirements:

- Show password section for users with `hashedPassword`.
- Require current password for password change.
- Validate new password with existing `passwordSchema`.
- Require confirm password match.
- Hash new password with existing password helper.
- Increment `tokenVersion` after password change.
- Offer logout current session.
- Offer logout all devices.
- Hide current-password form for OAuth-only users without `hashedPassword`.

Default product decision:

- After password change, keep the current browser session usable if the implementation can refresh the JWT safely.
- If JWT refresh is not reliable, redirect to `/login` with a clear success message.
- Logout all devices should immediately log out the current device too.

Acceptance criteria:

- Wrong current password returns a generic error.
- Weak new password is rejected.
- Reusing the current password should be rejected if implementation can check it cheaply; otherwise defer as P1.
- Successful password change increments `tokenVersion`.
- Logout all devices increments `tokenVersion` and sends user to login.
- OAuth-only users see provider-aware security copy and no broken password form.

#### Email

Requirements:

- Show current email.
- Show verified/unverified state.
- Show resend verification action only when email is unverified.
- Reuse existing resend verification API or equivalent server action.
- Do not allow email change in MVP.

Acceptance criteria:

- Verified users do not see a misleading resend prompt.
- Unverified users can request a new verification email.
- Resend success and failure states are visible.
- Email change is clearly absent from MVP, not half-implemented.

### 7.3 P1 Scope After MVP

P1 work should start only after the four MVP account pages are usable and tested.

| Feature | Why P1 |
| --- | --- |
| Change email with pending verification | Important, but needs careful token and notification behavior |
| Set local password for OAuth-only users | Useful, but separate from password change |
| Security event log | Valuable for trust and auditability |
| Durable rate limiting | Needed for production scale beyond single instance |
| Email retry or queue | Needed for production reliability |
| GitHub CI | Needed before serious release workflow |

### 7.4 Out of Scope

Do not build these in the first version:

- KYC document upload.
- Face or liveness verification.
- Placeholder KYC page.
- Billing.
- API keys.
- Device/session list.
- 2FA.
- Avatar upload.
- Account deletion.
- Data export.
- Notification preference center.

Reason:

These features require business, legal, infrastructure, or storage decisions that are not required for a first usable personal center.

### 7.5 Technology

Use the existing stack:

- Next.js App Router pages.
- Server actions for account mutations where practical.
- API routes only when reuse or request semantics make them clearer.
- Auth.js `auth()` for current session.
- Prisma for user reads and writes.
- Existing validation schemas from `src/lib/validations.ts`.
- Existing password helpers from `src/lib/password.ts`.
- Existing session revocation through `tokenVersion`.
- Existing resend verification logic from `src/app/api/resend-verification/route.ts`.

Data policy:

- Do not add new schema fields for MVP unless implementation proves they are required.
- Use existing `User` fields first: `email`, `name`, `displayName`, `hashedPassword`, `emailVerified`, `image`, `tokenVersion`, `createdAt`, `updatedAt`.

### 7.6 Analytics and Metrics

Track these product events later when analytics exists:

| Event | Why it matters |
| --- | --- |
| `account_viewed` | Measures account center adoption |
| `profile_name_updated` | Measures successful self-service profile edits |
| `password_change_started` | Identifies security intent |
| `password_change_completed` | Measures successful security completion |
| `password_change_failed` | Helps detect UX or abuse issues |
| `logout_all_devices_clicked` | Measures high-risk security usage |
| `verification_resend_requested` | Measures verification friction |
| `verification_resend_failed` | Detects email delivery or API issues |

Guardrail metrics:

- Password change failure rate.
- Resend verification failure rate.
- Account route error rate.
- Account mutation latency.
- Support requests about account changes.

### 7.7 Assumptions and Risks

| Assumption or risk | Impact | Decision or validation |
| --- | --- | --- |
| `/account` is the right route | Low | Use it as canonical route in MVP |
| Updating both `name` and `displayName` is acceptable | Medium | Keeps session and product display aligned |
| Current JWT can remain valid after password change | Medium | Validate during implementation; otherwise redirect to login |
| OAuth-only users do not need local password in MVP | Medium | Avoid broken UI; add set-password later |
| Change email can wait | Medium | Keep MVP smaller; revisit after profile/security/email basics |
| KYC is not currently needed | Medium | Do not build until a real gated feature requires it |
| In-memory rate limit is acceptable for MVP | Medium | Track as production hardening, not account-center blocker |

## 8. Release

### MVP Release

Ship in this order:

1. Account route group and layout.
2. Account overview.
3. Account navigation.
4. Profile page.
5. Display-name update action.
6. Profile tests.
7. Security page.
8. Change password action.
9. Token-version revocation after password change.
10. Logout all devices.
11. Email page.
12. Resend verification from account email page.
13. Focused tests for account access and mutations.

### MVP Release Criteria

MVP is done when:

- All four MVP routes exist.
- Route protection works for anonymous, unverified, and verified users.
- Display name can be updated.
- Password can be changed for password users.
- OAuth-only users do not see a broken password form.
- Logout all devices revokes sessions.
- Email verification state is visible.
- Unverified users can resend verification email.
- Unit or integration tests cover critical mutations.
- Manual browser pass confirms navigation and responsive layout.

### Future Releases

Consider after MVP:

- Change email with pending-email verification.
- Set password for OAuth-only accounts.
- Security event log.
- Device/session list.
- 2FA.
- Account deletion and data export.
- Billing.
- API keys.
- KYC only when a real product rule requires identity verification.

