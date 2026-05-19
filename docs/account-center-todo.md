# Account Center Product + Engineering Plan

This document is the working blueprint for the post-auth account center. It combines product logic and implementation logic so each feature can be reviewed by product intent, user flow, data state, backend behavior, and acceptance criteria.

## 0. Positioning

Core auth answers: can this person create an account, log in, recover access, and keep a valid session?

Account center answers: after login, can this user understand and manage their account identity, profile, security, and email?

KYC is not the same as login, and it is not part of the account center first version. Add KYC only when the business actually needs real-name verification, regulated access, payouts, trading, high-risk actions, or other identity-gated features.

## 1. First-Version Decision

Recommended first version:

1. `/account`: account overview.
2. `/account/profile`: edit display name.
3. `/account/security`: change password, logout, logout all devices.
4. `/account/email`: view email status, resend verification, later change email.

Version one should not include full KYC document upload, 2FA, billing, API keys, device list, data export, or account deletion unless the business urgently needs them.

## 2. Route Map

| Route | Product purpose | First version |
| --- | --- | --- |
| `/account` | Account overview and quick actions | Yes |
| `/account/profile` | Edit user-facing profile | Yes |
| `/account/security` | Password and session security | Yes |
| `/account/email` | Email identity and verification | Yes |
| `/account/verification` | KYC/account verification status | Later only if business needs KYC |
| `/account/notifications` | Notification preferences | Later |
| `/account/privacy` | Privacy, export, deletion | Later |
| `/account/billing` | Plan, payment, invoices | Later if paid product |
| `/account/developer` | API keys and webhooks | Later if developer product |

Recommended canonical route: `/account`.

Reason: `/account` is user-facing and broad enough for profile, security, email, KYC, billing. `/settings` can still exist later as an alias or nested settings area, but it is less explicit.

## 3. User Journey

### Normal User Flow

1. User registers.
2. User verifies email.
3. User logs in.
4. User enters `/account`.
5. User sees account status, email verification, and quick actions.
6. User edits display name.
7. User changes password when needed.
8. User manages email verification.

### Unverified Email Flow

1. User logs in before verifying email.
2. Middleware redirects protected pages to `/verify-email`.
3. User can resend verification email.
4. After email verification succeeds, user can access `/account`.

### Password Security Flow

1. User opens `/account/security`.
2. User enters current password.
3. User enters and confirms new password.
4. Backend verifies current password.
5. Backend hashes new password.
6. Backend increments `tokenVersion`.
7. Old sessions become invalid.
8. User sees success message and may need to log in again depending on final UX decision.

### Email Management Flow

First version:

1. User opens `/account/email`.
2. User sees current email and verification status.
3. If unverified, user can resend verification email.

Later version:

1. User requests email change.
2. Backend verifies current password.
3. Backend checks new email is unused.
4. Backend stores pending email change.
5. Backend sends verification link to new email.
6. User verifies new email.
7. Backend switches account email.
8. Backend notifies old email.

### KYC Flow

KYC is out of scope for the first account center version.

Add it later only when the product has a concrete identity-gated requirement:

1. User starts KYC.
2. User submits identity information.
3. User uploads document/selfie or goes through third-party vendor.
4. Status becomes pending.
5. Admin/vendor approves or rejects.
6. Approved users unlock gated features.

## 4. State Model

Existing user fields:

| Field | Meaning | Current status |
| --- | --- | --- |
| `id` | User ID | Exists |
| `email` | Primary account identity | Exists |
| `name` | Auth/session display name | Exists |
| `displayName` | Product display name | Exists |
| `hashedPassword` | Credential login password hash | Exists, nullable for OAuth |
| `emailVerified` | Email verification timestamp | Exists |
| `image` | Avatar/provider image | Exists |
| `tokenVersion` | Session revocation version | Exists |
| `createdAt` / `updatedAt` | Audit timestamps | Exists |

Recommended new fields later:

| Field | Suggested type | Priority | Why |
| --- | --- | --- | --- |
| `accountStatus` | enum: `active`, `disabled`, `deletion_pending`, `deleted` | P1 | Needed before admin disable/delete flows. |
| `kycStatus` | enum: `not_started`, `pending`, `approved`, `rejected`, `expired` | P3 | Add only when KYC-gated business rules exist. |
| `pendingEmail` | string nullable or separate model | P1 | Needed for safe email change. |
| `pendingEmailToken` | hashed token in separate table | P1 | Needed to verify new email before switching. |
| `lastPasswordChangedAt` | DateTime nullable | P2 | Useful for security audit. |

Suggested separate models later:

| Model | Purpose | When to add |
| --- | --- | --- |
| `EmailChangeToken` | Verify pending email changes | When implementing change email. |
| `SecurityEvent` | Login, password change, email change, logout all | Before login history/security emails. |
| `KycProfile` | Store KYC submission and review state | Only when KYC becomes a real product requirement. |
| `UserSession` or device model | Device/session list | If moving beyond JWT-only sessions. |

## 5. Feature Checklist

Status:

- Todo: not implemented.
- Partial: partially available elsewhere.
- Done: implemented and validated.
- Later: explicitly out of first version.

Priority:

- P0: first version required.
- P1: important next.
- P2: mature product/security feature.
- P3: business-dependent.

## 6. Account Shell

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-SHELL-01 | User needs one consistent place to manage account. | Create `/account` route group. | P0 | Todo | Visiting `/account` renders account center for logged-in verified user. |
| AC-SHELL-02 | Only valid users should manage accounts. | Reuse middleware protection and verified-email enforcement. | P0 | Todo | Anonymous users redirect to `/login`; unverified users redirect to `/verify-email`. |
| AC-SHELL-03 | User needs clear navigation. | Add account layout nav: Overview, Profile, Security, Email. | P0 | Todo | Desktop and mobile navigation work without layout shift. |
| AC-SHELL-04 | User should return to product. | Add back-to-app/dashboard link. | P1 | Todo | Link routes to the main app page. |

## 7. Account Overview

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-OVR-01 | User needs a quick account summary. | Build `/account` page using `auth()` and Prisma user lookup if needed. | P0 | Todo | Page shows display name, email, verification status, and quick actions. |
| AC-OVR-02 | User should know if email is verified. | Read `emailVerified`. | P0 | Todo | Shows verified/unverified state accurately. |
| AC-OVR-03 | User should know available next steps. | Add quick action links. | P0 | Todo | Links to profile, security, and email. |
| AC-OVR-04 | User should see account metadata. | Show created date from `createdAt`. | P1 | Todo | Date displays in stable readable format. |
| AC-OVR-05 | Product needs account lifecycle readiness. | Add account status only after schema exists. | P1 | Later | Not shown until `accountStatus` exists. |

## 8. Profile

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-PRO-01 | User can update public/display identity. | Build `/account/profile`. | P0 | Todo | Page loads existing display name. |
| AC-PRO-02 | User can change display name. | Server action validates `displayNameSchema`; updates `name` and `displayName`. | P0 | Todo | Invalid names fail; valid name persists and appears in session after refresh. |
| AC-PRO-03 | User gets clear save feedback. | Add pending/success/error UI. | P0 | Todo | Submit button has loading state; result message is visible. |
| AC-PRO-04 | User can see avatar. | Display `image` or fallback initials. | P1 | Todo | Existing OAuth image displays if available. |
| AC-PRO-05 | User can upload avatar. | Requires storage provider and image validation. | P1 | Later | Defer until file storage decision. |

## 9. Security

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-SEC-01 | User needs password control. | Build `/account/security`. | P0 | Todo | Page has password section and logout actions. |
| AC-SEC-02 | User can change password safely. | Require current password, new password, confirm password. | P0 | Todo | Current password must be correct; new password follows `passwordSchema`. |
| AC-SEC-03 | Old sessions should be invalidated after password change. | Increment `tokenVersion`. | P0 | Todo | Existing JWTs with old tokenVersion become invalid. |
| AC-SEC-04 | OAuth-only users need correct UX. | If `hashedPassword` is null, show set-password flow later. | P1 | Todo | Google-only users do not see broken current-password form. |
| AC-SEC-05 | User can logout current session. | Reuse existing logout action. | P0 | Partial | Logout action is reachable from security page. |
| AC-SEC-06 | User can logout all devices. | Increment `tokenVersion`; redirect to login. | P1 | Todo | Current and old sessions are invalidated. |
| AC-SEC-07 | User can enable Google Authenticator 2FA. | Add TOTP secret, QR code, challenge, recovery codes. | P2 | Later | Defer until basic account center is stable. |
| AC-SEC-08 | User sees recent security activity. | Requires `SecurityEvent` model. | P2 | Later | Defer until event logging exists. |

## 10. Email

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-EMAIL-01 | Email is the core account identity. | Build `/account/email`. | P0 | Todo | Page shows current email and verification status. |
| AC-EMAIL-02 | Unverified users can recover. | Reuse resend verification endpoint/action. | P0 | Todo | Clicking resend sends a verification email and shows result. |
| AC-EMAIL-03 | Verified users should not see unnecessary resend CTA. | Hide or disable resend when `emailVerified` exists. | P0 | Todo | Verified account does not encourage redundant verification. |
| AC-EMAIL-04 | User can change email safely. | Add pending-email flow. | P1 | Todo | Email does not change until new email is verified. |
| AC-EMAIL-05 | Old email owner should be informed. | Send notification to old email after change. | P1 | Todo | Old email gets account-change notification. |

## 11. Verification / KYC

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-KYC-01 | Some future products may need real-name verification. | Do not build until business rules require KYC. | P3 | Later | No KYC route, schema, or placeholder in first version. |
| AC-KYC-02 | Product may need future KYC gating. | Add `kycStatus` only when a gated feature exists. | P3 | Later | Status is tied to a real business permission. |
| AC-KYC-03 | User may need to submit KYC later. | Identity form + document upload or third-party vendor. | P3 | Later | Defer until KYC vendor/scope is chosen. |
| AC-KYC-04 | Admin/vendor may need to review KYC later. | KYC review backend/admin. | P3 | Later | Required only for real KYC. |

## 12. Notifications

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-NOTIF-01 | User should receive important security events. | Send security emails for password/email changes. | P1 | Todo | Security emails are always sent and not opt-out in first version. |
| AC-NOTIF-02 | User may control marketing/product emails. | Add notification settings later. | P2 | Later | Defer until such emails exist. |

## 13. Privacy and Lifecycle

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-PRIV-01 | User may need account deletion later. | Requires lifecycle policy, data cleanup/anonymization. | P2 | Later | Do not ship until product/legal policy is clear. |
| AC-PRIV-02 | User may need data export later. | Requires export pipeline. | P3 | Later | Business/compliance-dependent. |

## 14. Billing and Developer Settings

| ID | Product logic | Program logic | Priority | Status | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| AC-BILL-01 | Paid users manage plan and invoices. | Add billing provider integration. | P3 | Later | Only if product has paid plans. |
| AC-DEV-01 | Developer users manage API keys. | Add hashed API key model and UI. | P3 | Later | Only if product exposes APIs. |

## 15. First Implementation Order

This is the recommended one-by-one build order:

1. Create `/account` route group and layout.
2. Build `/account` overview from current authenticated user.
3. Add account navigation.
4. Build `/account/profile`.
5. Implement display-name update.
6. Add tests for display-name validation and persistence.
7. Build `/account/security`.
8. Implement change password.
9. Increment `tokenVersion` after password change.
10. Implement logout all devices.
11. Build `/account/email`.
12. Add resend verification from account email page.
13. Implement change-email flow after profile/security/email basics are stable.
14. Add KYC only when product needs KYC-gated features.

## 16. First-Version Out of Scope

Explicitly not in the first account-center version:

1. Full KYC document upload.
2. Face/liveness verification.
3. KYC status placeholder or `/account/verification` page.
4. Google Authenticator 2FA.
5. Device/session list.
6. Billing.
7. API keys.
8. Account deletion.
9. Data export.
10. Avatar upload, unless storage is already decided.

## 17. Review Questions

Before implementation, confirm:

1. Use `/account` as the canonical route?
2. First profile version: display name only, or avatar too?
3. Change password: after success, should the current session stay logged in or redirect to login?
4. Logout all devices: should it also immediately log out the current device?
5. Change email: should it be P1 after password/profile, or do you want it in the first batch?
6. Is there any concrete business requirement for KYC now? If not, keep it out.
