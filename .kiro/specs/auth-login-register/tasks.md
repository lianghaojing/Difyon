# Implementation Plan: Auth Login & Register

## Overview

本实现计划将认证系统设计分解为可增量执行的编码任务。每个任务构建在前一个任务之上，确保没有孤立代码。技术栈：Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Auth.js v5 + Prisma + PostgreSQL + Vitest + fast-check。

## Tasks

- [x] 1. Project setup and core dependencies
  - [x] 1.1 Initialize project structure and install dependencies
    - Install core dependencies: next-auth@5, @auth/prisma-adapter, prisma, @prisma/client, bcrypt, zod, react-hook-form, @hookform/resolvers
    - Install dev dependencies: vitest, fast-check, @testing-library/react, @types/bcrypt
    - Create directory structure: src/lib/, src/components/auth/, src/components/ui/, src/actions/, src/app/(auth)/, src/app/api/
    - Create environment variables template (.env.example) with AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL, NEXT_PUBLIC_APP_URL, EMAIL_FROM
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 1.2 Create Prisma schema and generate client
    - Define User model with id (UUID), email (UNIQUE), hashedPassword, displayName, emailVerified, image, tokenVersion (Int, default 0), createdAt, updatedAt
    - Define Account model for OAuth account linking with provider + providerAccountId unique constraint
    - Define VerificationToken model with identifier, token (hashed), expires, and composite unique on [identifier, token]
    - Define PasswordResetToken model with identifier, token (hashed), expires, and composite unique on [identifier, token]
    - Create Prisma client singleton at src/lib/prisma.ts
    - Run prisma generate
    - _Requirements: 1.8, 4.2, 5.6, 9.8_

- [x] 2. Core library modules
  - [x] 2.1 Implement validation schemas (src/lib/validations.ts)
    - Create emailSchema: RFC 5322 format, max 254 chars
    - Create displayNameSchema: 2-50 chars, no leading/trailing whitespace
    - Create passwordSchema: 8-128 chars, at least one uppercase, one lowercase, one digit
    - Create registerSchema: email + displayName + password + confirmPassword with cross-field match validation
    - Create loginSchema: email (non-empty, valid format) + password (non-empty)
    - Create forgotPasswordSchema: email validation
    - Create resetPasswordSchema: password + confirmPassword with match validation
    - Implement calculatePasswordStrength function returning "weak" | "medium" | "strong" | "very-strong"
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 5.3, 5.8, 7.5_

  - [x]* 2.2 Write property test for field validation correctness
    - **Property 1: Field validation correctness**
    - Test email schema accepts valid emails ≤254 chars and rejects invalid ones
    - Test displayName schema accepts 2-50 char strings without leading/trailing whitespace
    - Test password schema accepts 8-128 char strings with uppercase, lowercase, and digit
    - Use fast-check string generators with various lengths and character compositions
    - **Validates: Requirements 1.2, 1.3, 1.4, 2.2, 5.3, 5.8**

  - [x]* 2.3 Write property test for cross-field schema validation
    - **Property 2: Cross-field schema validation**
    - Test registration schema rejects when password !== confirmPassword
    - Test registration schema rejects when any required field is empty/whitespace-only
    - Use fast-check to generate random password pairs (matching and non-matching)
    - **Validates: Requirements 1.5, 1.6**

  - [x]* 2.4 Write property test for password strength calculation
    - **Property 10: Password strength calculation**
    - Test strings < 8 chars return "weak"
    - Test strings ≥ 8 with upper+lower+digit return "strong"
    - Test strings ≥ 12 with upper+lower+digit+special return "very-strong"
    - Test all other strings ≥ 8 return "medium"
    - **Validates: Requirements 7.5**

  - [x] 2.5 Implement password service (src/lib/password.ts)
    - Implement hashPassword using bcrypt with cost factor 10
    - Implement verifyPassword using bcrypt.compare
    - _Requirements: 1.7, 2.4, 9.5_

  - [x]* 2.6 Write property test for password hashing round-trip
    - **Property 3: Password hashing round-trip with unique salts**
    - For any valid password, hash then compare returns true
    - Hashing same password twice produces different hash strings (unique salts)
    - Use fast-check to generate random valid password strings
    - **Validates: Requirements 1.7, 2.4, 5.9, 9.5**

  - [x] 2.7 Implement token service (src/lib/tokens.ts)
    - Implement generateToken using crypto.randomUUID
    - Implement hashToken using SHA-256
    - Implement createVerificationToken (24h expiry, deletes previous tokens for same email)
    - Implement createPasswordResetToken (1h expiry, deletes previous tokens for same email)
    - Implement verifyToken (checks existence and expiry)
    - Implement consumeToken (deletes token after use)
    - _Requirements: 4.2, 4.7, 4.8, 5.6, 9.9_

  - [x]* 2.8 Write property test for SHA-256 token hashing
    - **Property 4: SHA-256 token hashing determinism and uniqueness**
    - Same token hashed twice produces identical results (determinism)
    - Two distinct tokens produce distinct hashes (collision resistance)
    - Use fast-check to generate random UUID-like strings
    - **Validates: Requirements 9.9**

  - [x]* 2.9 Write property test for token generation uniqueness and expiry
    - **Property 5: Token generation uniqueness and correct expiry**
    - All generated tokens in a sequence are unique
    - Verification tokens have 24h expiry from creation
    - Password reset tokens have 1h expiry from creation
    - **Validates: Requirements 4.2, 5.6**

  - [x]* 2.10 Write property test for token expiry detection
    - **Property 6: Token expiry detection**
    - Tokens with current time > expiry return expired status
    - Tokens with current time < expiry return valid status
    - Use fast-check to generate random timestamps (past and future)
    - **Validates: Requirements 4.5, 5.11**

  - [x]* 2.11 Write property test for token one-time consumption
    - **Property 7: Token one-time consumption**
    - After consuming a valid token, re-verifying returns invalid/not-found
    - Use fast-check to generate random tokens and verify consume-then-verify pattern
    - **Validates: Requirements 4.7**

  - [x] 2.12 Implement rate limiter (src/lib/rate-limit.ts)
    - Implement sliding window rate limiter with configurable windowMs, maxAttempts, lockoutMs
    - Implement checkRateLimit function returning { allowed, retryAfterMs }
    - Define LOGIN_RATE_LIMIT: 5 attempts per 15 min, 15 min lockout
    - Define FORGOT_PASSWORD_RATE_LIMIT: 3 attempts per 15 min
    - Define RESEND_VERIFICATION_RATE_LIMIT: 3 attempts per 5 min
    - _Requirements: 4.9, 5.13, 9.1, 9.2_

  - [x]* 2.13 Write property test for rate limiter sliding window
    - **Property 8: Rate limiter sliding window enforcement**
    - Allows requests when count < maxAttempts within window
    - Rejects requests when count >= maxAttempts
    - Restores access after lockout period elapses
    - Use fast-check to generate random request sequences with varying timestamps
    - **Validates: Requirements 4.9, 5.13, 9.1, 9.2**

  - [x] 2.14 Implement email service (src/lib/email.ts)
    - Implement sendEmail base function (Resend or Nodemailer)
    - Implement sendVerificationEmail with verification URL template
    - Implement sendPasswordResetEmail with reset URL template
    - _Requirements: 1.11, 4.1, 4.3, 5.5_

- [x] 3. Checkpoint - Core libraries complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Auth.js v5 configuration and middleware
  - [x] 4.1 Configure Auth.js v5 (src/auth.ts + src/auth.config.ts)
    - Configure PrismaAdapter with prisma client
    - Set JWT session strategy with 7-day maxAge
    - Configure Google OAuth provider with openid, email, profile scopes
    - Configure Credentials provider with loginSchema validation and bcrypt comparison
    - Implement signIn callback (allow all credentials users, auto-verify Google users)
    - Implement jwt callback to include id, email, name, tokenVersion in token; on every request, verify tokenVersion against database and mark token invalid if mismatched
    - Implement session callback to expose id, email, name in session; return empty session if token is marked invalid (forces re-auth)
    - Implement linkAccount event to set emailVerified on OAuth account link
    - Set custom pages: signIn → /login, error → /login
    - Create route handler at src/app/api/auth/[...nextauth]/route.ts
    - _Requirements: 2.3, 2.4, 2.5, 3.3, 3.4, 3.5, 3.6, 3.7, 6.1, 6.2, 6.3, 6.8, 6.9_

  - [x]* 4.2 Write property test for JWT payload completeness and tokenVersion revocation
    - **Property 11: JWT payload completeness**
    - For any authenticated user, JWT contains id, email, name, and tokenVersion fields
    - None of these fields are null or undefined
    - **Property 12: Session revocation via tokenVersion**
    - When user's DB tokenVersion is incremented, jwt callback marks token as invalid
    - Session callback returns empty session for invalid tokens
    - When tokenVersion matches, session remains valid
    - Use fast-check to generate random user data and tokenVersion pairs
    - **Validates: Requirements 5.10, 6.1, 6.3, 6.8, 6.9**

  - [x] 4.3 Implement middleware for route protection (src/middleware.ts)
    - Define publicRoutes: /login, /register, /verify-email, /forgot-password, /reset-password
    - Define authRoutes: /login, /register
    - Allow all /api/auth/* routes unconditionally
    - Redirect logged-in users from authRoutes to /
    - Redirect unauthenticated users from protected routes to /login with callbackUrl
    - Configure matcher to exclude static assets
    - _Requirements: 6.3, 6.4, 6.7, 8.8_

- [x] 5. Registration flow
  - [x] 5.1 Implement register API route (src/app/api/register/route.ts)
    - Validate request body with registerSchema
    - Check for existing user by email (return 409 if exists)
    - Hash password with bcrypt
    - Create user record in database
    - Generate verification token and send verification email
    - Return 201 with userId on success
    - Apply rate limiting
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_

  - [x] 5.2 Implement registration form component (src/components/auth/register-form.tsx)
    - Create form with email, displayName, password, confirmPassword fields using React Hook Form + Zod resolver
    - Add Google OAuth "使用 Google 注册" button
    - Implement real-time field validation on blur with green checkmark / red error display
    - Integrate password strength indicator component
    - Show loading spinner on submit, disable button during submission
    - Handle 30s timeout with error message
    - Preserve form data on error responses
    - Add link to login page (/login)
    - _Requirements: 1.1, 1.6, 3.2, 7.1, 7.2, 7.4, 7.5, 7.7, 8.2_

  - [x] 5.3 Create registration page (src/app/(auth)/register/page.tsx)
    - Render RegisterForm component
    - Set up auth layout (src/app/(auth)/layout.tsx) with centered card design
    - _Requirements: 8.4_

- [x] 6. Login flow
  - [x] 6.1 Implement login form component (src/components/auth/login-form.tsx)
    - Create form with email and password fields using React Hook Form + Zod resolver
    - Add Google OAuth "使用 Google 登录" button
    - Add "忘记密码？" link pointing to /forgot-password
    - Add show/hide password toggle button
    - Show loading spinner on submit, disable button during submission
    - Handle 30s timeout with error message
    - Preserve email on error, clear password
    - Handle callbackUrl from URL query params for redirect after login
    - Add link to register page (/register)
    - _Requirements: 2.1, 2.6, 2.7, 3.1, 5.1, 7.3, 7.6, 7.7, 8.1_

  - [x] 6.2 Create login page (src/app/(auth)/login/page.tsx)
    - Render LoginForm component
    - Handle OAuth error query params and display error messages
    - _Requirements: 3.8, 8.3_

  - [x] 6.3 Implement login server action (src/actions/login.ts)
    - Validate credentials with loginSchema
    - Apply rate limiting (LOGIN_RATE_LIMIT by IP)
    - Call signIn("credentials") with email and password
    - Handle redirect to callbackUrl or default home page
    - Return appropriate error messages for invalid credentials
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 9.1, 9.2_

- [x] 7. Google OAuth integration
  - [x] 7.1 Wire Google OAuth sign-in flow
    - Implement social-button component (src/components/auth/social-button.tsx) for Google sign-in
    - Call signIn("google") with appropriate redirect options
    - Handle OAuth error callbacks and display on login page
    - Ensure new Google users get emailVerified set automatically via linkAccount event
    - Ensure existing email users get Google account linked (Account record created)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 8. Email verification flow
  - [x] 8.1 Implement verify-email API route (src/app/api/verify-email/route.ts)
    - Accept token from query params
    - Hash token with SHA-256 and look up in database
    - Check token expiry (return 410 if expired)
    - Update user's emailVerified to current timestamp
    - Consume (delete) the token after successful verification
    - Return appropriate success/error responses
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

  - [x] 8.2 Implement resend-verification API route (src/app/api/resend-verification/route.ts)
    - Apply RESEND_VERIFICATION_RATE_LIMIT (3 per 5 min)
    - Delete all existing verification tokens for the email
    - Generate new token and send verification email
    - _Requirements: 4.8, 4.9_

  - [x] 8.3 Create verify-email page (src/app/(auth)/verify-email/page.tsx)
    - If token param present: call verify API and show success/error/expired state
    - If no token: show "check your email" prompt with resend button
    - Show "重新发送" button when token is expired
    - On success, redirect to login with success message
    - _Requirements: 4.4, 4.5, 4.6, 4.8_

- [x] 9. Checkpoint - Core auth flows complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Forgot password and reset password flow
  - [x] 10.1 Implement forgot-password API route (src/app/api/forgot-password/route.ts)
    - Validate email with forgotPasswordSchema
    - Apply FORGOT_PASSWORD_RATE_LIMIT (3 per 15 min by IP)
    - Always return same success response regardless of email existence (prevent enumeration)
    - If email exists: generate password reset token and send reset email
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.13_

  - [x]* 10.2 Write property test for forgot password response uniformity
    - **Property 9: Forgot password response uniformity**
    - For any email (existing or non-existing), response status and body structure are identical
    - Use fast-check to generate random email strings
    - **Validates: Requirements 5.4**

  - [x] 10.3 Implement reset-password API route (src/app/api/reset-password/route.ts)
    - Accept token from query/body, validate new password with resetPasswordSchema
    - Hash token, verify in database, check expiry
    - Hash new password with bcrypt
    - Update user's hashedPassword in database
    - Increment user's tokenVersion by 1 (invalidates all existing JWT sessions)
    - Delete all password reset tokens for that user
    - Return success with redirect to login
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 6.9_

  - [x] 10.4 Create forgot-password page and form (src/app/(auth)/forgot-password/page.tsx + src/components/auth/forgot-password-form.tsx)
    - Email input field with Zod validation
    - Submit button with loading state
    - Always show success message after submit (uniform response)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.6_

  - [x] 10.5 Create reset-password page and form (src/app/(auth)/reset-password/page.tsx + src/components/auth/reset-password-form.tsx)
    - Read token from URL query params
    - New password + confirm password fields with Zod validation
    - Password strength indicator
    - Show expired/invalid token error states
    - On success, redirect to login with success message
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 8.7_

- [x] 11. Shared UI components and UX polish
  - [x] 11.1 Implement shared UI components
    - Create Button component (src/components/ui/button.tsx) with loading/disabled states
    - Create Input component (src/components/ui/input.tsx) with error/success styling
    - Create Spinner component (src/components/ui/spinner.tsx)
    - Create FormField component (src/components/auth/form-field.tsx) with label, input, error message, success checkmark
    - Create PasswordStrength component (src/components/auth/password-strength.tsx) with 4-level indicator
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.2 Implement logout functionality
    - Add logout button/action that calls signOut()
    - Clear session cookie and redirect to /login
    - _Requirements: 6.5, 6.6_

- [x] 12. Integration wiring and final verification
  - [x] 12.1 Wire all components together and verify routing
    - Ensure client-side navigation between /login and /register (no full page reload)
    - Verify middleware redirects work correctly (logged-in → /, not-logged-in → /login)
    - Verify callbackUrl preservation through login flow
    - Verify CSRF protection is active on all auth API routes (handled by Auth.js)
    - _Requirements: 8.8, 8.9, 8.10, 9.3, 9.4, 9.6, 9.7_

  - [x]* 12.2 Write integration tests for auth flows
    - Test complete registration flow: form submit → DB user created → verification email sent
    - Test complete login flow: form submit → session created → redirect
    - Test Google OAuth account creation and linking
    - Test email verification token consumption
    - Test password reset complete flow
    - Test rate limiting enforcement on login and forgot-password endpoints
    - Test UNIQUE constraint error handling on duplicate email registration
    - _Requirements: 1.8, 1.9, 2.3, 2.4, 3.5, 3.6, 4.4, 4.7, 5.9, 5.10, 9.1_

- [x] 13. Final checkpoint - All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code is TypeScript, targeting Next.js 15 App Router with React 19
- Prisma migrations should be run manually by the developer against their local PostgreSQL instance
- Environment variables must be configured before running the application

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.5", "2.12", "2.14"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.6", "2.7", "2.13"] },
    { "id": 4, "tasks": ["2.8", "2.9", "2.10", "2.11"] },
    { "id": 5, "tasks": ["4.1", "4.3"] },
    { "id": 6, "tasks": ["4.2", "5.1", "11.1"] },
    { "id": 7, "tasks": ["5.2", "6.1", "6.3", "7.1"] },
    { "id": 8, "tasks": ["5.3", "6.2", "8.1", "8.2"] },
    { "id": 9, "tasks": ["8.3", "10.1"] },
    { "id": 10, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 11, "tasks": ["10.5", "11.2"] },
    { "id": 12, "tasks": ["12.1"] },
    { "id": 13, "tasks": ["12.2"] }
  ]
}
```
