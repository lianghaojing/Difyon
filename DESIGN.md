# Difyon Design Guide

This file is the working design source for AI-assisted UI work in Difyon. Read it before changing auth, account, onboarding, payment, or settings screens.

The goal is not to copy another fintech product. Borrow the discipline of Stripe, Wise, Revolut, Linear, and Vercel: clear hierarchy, precise spacing, calm interactions, and strong trust. Difyon should feel clean, payment-grade, and slightly warm because the product handles cards and money.

## Product Feel

Difyon should feel:

- Precise, not decorative.
- Calm, not empty.
- Trustworthy, not corporate.
- Fintech-grade, not generic SaaS.
- Friendly enough for onboarding, disciplined enough for payments.

Avoid:

- Purple default AI/SaaS styling.
- Heavy shadows.
- Button movement on hover.
- Random gradients on form surfaces.
- Overly playful icons.
- Mixing multiple visual languages on one flow.

## Core Tokens

Use these tokens unless a new feature has an explicit design reason to differ.

| Token | Value | Usage |
| --- | --- | --- |
| Brand pink | `#F953C6` | Primary actions, selected states, active language/check states |
| Brand pink hover | `#EC3ABB` | Primary hover |
| Text primary | `#1A1E26` | Headings, important text |
| Text secondary | `#55637F` | Descriptions, helper text, icon color |
| Text muted / input value | `#A6B0C4` | Input text and placeholders unless design says otherwise |
| Border default | `#ECEDF3` | Input/button default border |
| Divider | `#F0F1F5` | Separator lines |
| Disabled bg | `#ECEDF3` | Disabled buttons |
| Error | `#FF4337` | Error border and text |
| White | `#FFFFFF` | Form background |

## Typography

Current app stack:

```css
font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
```

Use:

- Auth page titles: `36px`, bold, tight line height on desktop.
- Auth page titles on mobile: `30px`, bold.
- Auth subtitles: `18px` desktop, `16px` mobile, `#55637F`, relaxed line height.
- Form controls: `14px`, semibold/medium depending on context.
- Error text: `12px`, medium.

Do not increase auth titles above `36px`; long Russian and Chinese labels must fit gracefully.

## Layout

Auth pages are left-aligned within a centered column, not visually centered text blocks.

Current auth shell:

- Page max width: `1440px`.
- Form max width: `420px`.
- Desktop top offset: around `58px` from header area to content.
- Page padding: responsive, roughly `20px` mobile, `32px-64px` larger screens.
- Support desktop, iPad/tablet, and mobile. The original design may be `1440 x 960`, but implementation must be adaptive.

Auth spacing:

- Title to subtitle: `12px`.
- Subtitle to Google button/form start: `30px`.
- Google button to separator: `30px`.
- Separator to first field: `30px`.
- Field group vertical gap: currently `8px`.
- Error/helper line is reserved to prevent layout jump.

Avoid:

- Adding a divider under the auth subtitle unless the design explicitly asks for it.
- Center-aligning auth text unless the specific page is a status page.
- Creating page scroll when the content visually fits. Prefer tightening vertical spacing first.

## Inputs

Default auth input:

- Height: `48px`.
- Radius: `8px`.
- Default border: `1px #ECEDF3`.
- Focus border: `2px #F953C6`.
- Error border: `1px #FF4337`.
- Background: white.
- Text: `#A6B0C4`, medium.
- Error text: `12px`, `#FF4337`.

When focus border becomes `2px`, compensate padding so text does not jump.

Floating labels:

- Label floats when focused, when the field has a value, or when an error exists.
- Label background should be white so it cuts cleanly through the border.
- Focused label uses brand pink.
- Error label uses red.

Password fields:

- Eye icon is visible from the start.
- Default password icon state is closed/hidden.
- Use the shared auth icon assets under `public/icons/auth`.
- Password requirements appear as a checklist while the password field is focused.
- Do not show contradictory red password error while the checklist is actively guiding the user.

## Buttons

Primary buttons:

- Height: `42px`.
- Radius: `8px`.
- Background: `#F953C6`.
- Hover: `#EC3ABB`.
- Text: white, semibold.
- Disabled bg: `#ECEDF3`.
- Disabled text/icon: `#A6B0C4`.
- Disabled cursor: `not-allowed`.

Hover behavior:

- The button itself must not move.
- No button shadow.
- Only color changes and arrow motion are allowed.
- Arrow moves slightly right on hover.
- Arrow transition duration: `700ms`.
- Arrow easing: `cubic-bezier(0.22, 1, 0.36, 1)`.

Secondary / Google buttons:

- Height: `42px`.
- Radius: `12px`.
- Border: `1px #ECEDF3`.
- Background: white.
- Use subtle inset bottom border if already established.
- Hover color transition: `300ms ease-out`.
- No large shadow.

## Links

Links should feel soft but clear.

- Primary link color: `#F953C6`.
- Hover: `#EC3ABB`.
- Transition: `300ms ease-out`.
- Inline arrows follow the `700ms` arrow motion rule.

Terms and privacy links must be independent links. The checkbox itself should only toggle from the square target, not from clicking legal links.

## Checkbox

Use a custom checkbox, not the browser default.

- Size: around `18px`.
- Radius: `4px`.
- Default border: neutral grey.
- Checked background: `#F953C6`.
- Check icon: `public/icons/auth/check.svg`.
- No heavy shadow.

The legal copy can be semibold, but keep terms/privacy clickable independently.

## Language Picker

The language picker is a font/language selector, not a generic dropdown.

- Use the custom font/language icon.
- Do not show a chevron/down arrow.
- Trigger border uses system color on focus/open.
- Selected option uses `#F953C6`.
- Selected option uses the shared check icon.
- Menu should not collapse before the click selection completes.
- Hover option background should be light and calm, not black.

Current languages:

- English: `EN`
- Chinese: `中文`
- Russian: `RU`

All auth pages should use the same language model.

## Motion

Motion should feel natural and calm, not flashy.

Use:

- Auth page entrance: fade + slight upward movement.
- Form row stagger: subtle, roughly `0.055s` between rows.
- Row entrance duration: about `0.42s`.
- Page language/content transition: about `0.6s`.
- Arrow hover: `700ms`.
- Color transitions: `300ms ease-out`.

Avoid:

- White overlay page swaps that feel like a flash.
- Fast arrow snapping.
- Moving buttons vertically on hover.
- Generic bouncy animation.

## Feedback And Errors

Error messages:

- Use `12px`.
- Reserve vertical space so fields do not jump when errors appear.
- Error copy should be specific when safe.
- Login credential errors should remain generic enough to avoid leaking account existence.
- Form-level failure alerts should feel fintech-calm, not alarming:
  - Background: `#FFF8FB`.
  - Border: `1px #FFD5EC`.
  - Text: `#FF4337`.
  - Radius: `8px`.
  - Padding: around `12px 14px`.
  - Font size: `12px`, medium, relaxed line height.
  - Dismiss icon: `public/icons/auth/cross.svg`, `14px`, `#FF4337`, placed on the right.
  - The dismiss icon should be clickable and should not appear before the message text.
- Avoid heavy red boxes for form-level errors unless the action is destructive or high-risk.

Success/status messages:

- Use calmer border/background than error states.
- Prefer concise text.
- Keep language localized.

Loading:

- Use the branded loading asset for page-level waits, refreshes, or token verification states.
- Do not overuse loading animations inside small buttons unless the action is actually pending.

## Auth Flow Standards

Pages in scope:

- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/terms`
- `/privacy`

Register:

- Display name is hidden for now by product decision.
- Email users initially fall back to their email as identity and can set a display name in `/account/profile`.
- Terms/privacy consent is required before submit.
- Google signup without a checked consent box must show an explicit `Agree and continue` dialog.
- Registration button should enable only when the form is valid and terms are accepted.
- Duplicate email should not be shown too early while the user is still typing.

Login:

- Password eye starts closed.
- Forgot password link is slightly stronger than normal helper text.
- Error and success messages must use current locale.

Forgot password:

- Response should be enumeration-safe.
- Success state should not reveal whether the email exists.

Reset password:

- Requires a token from the email link.
- No token should render an invalid-link state.
- Password rules should match register.

Verify email:

- Loading uses the branded loading asset.
- States: loading, success, expired, invalid, check-email/resend.
- Copy must be localized.
- Visual design still needs to be brought in line with the auth system.

## Account Center Direction

Future account pages should extend this system instead of inventing a new one.

Planned routes:

- `/account`
- `/account/profile`
- `/account/security`
- `/account/email`

Account center should feel a little more operational than auth pages: clearer navigation, status cards, and quick actions, but still use the same tokens, typography, button rules, and motion timing.

Do not build KYC, billing, API keys, 2FA, avatar upload, account deletion, or device lists until product scope requires them.

## Implementation Rules For AI Agents

Before editing UI:

1. Read this file.
2. Check existing auth components for established patterns.
3. Reuse `public/icons/auth` assets before adding new icons.
4. Preserve responsive behavior.
5. Run tests after changes.

When unsure:

- Prefer existing Difyon rules over external inspiration.
- Ask before changing product behavior.
- Do not introduce a new visual system for one page.
- If a page is old, migrate it toward this guide gradually but consistently.

## Current Known Gaps

- `/terms` and `/privacy` contain multilingual draft copy but still need final legal review and contact details.
- Auth form components are duplicated across pages and should eventually be extracted once the design stabilizes.
- GitHub CI and E2E auth flow tests are not yet in place.
- The branded loading component currently uses `<img>` and triggers a Next lint warning.
- Conditional Cloudflare Turnstile is planned but stays disabled until site and secret keys are configured.
