# Difyon

Full-stack authentication system built with Next.js 15, Auth.js v5, Prisma & PostgreSQL.

## Features

- 📧 Email/password registration with email verification
- 🔐 Secure login with bcrypt password hashing
- 🌐 Google OAuth social login
- 🔑 Forgot password / reset password flow
- 🛡️ Rate limiting & CSRF protection
- 📱 Responsive UI with real-time form validation
- 🔄 JWT session management with token revocation
- 👤 Account Center for profile, password, and email status
- 📜 Versioned terms/privacy consent records

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| Auth | Auth.js v5 (Credentials + Google OAuth) |
| Database | Prisma ORM + PostgreSQL |
| Validation | Zod + React Hook Form |
| Testing | Vitest + fast-check |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for social login)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL (PostgreSQL connection string)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# - NEXT_PUBLIC_APP_URL
# - RESEND_API_KEY & EMAIL_FROM

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register, verify-email, etc.)
│   ├── api/             # API routes (register, verify-email, forgot/reset password)
│   └── page.tsx         # Home page (protected)
├── actions/             # Server actions (login, logout)
├── auth.ts              # Auth.js v5 configuration
├── middleware.ts        # Route protection
├── lib/                 # Core libraries (validation, tokens, password, rate-limit, email)
└── components/
    ├── auth/            # Auth form components
    └── ui/              # Shared UI components (Button, Input, Spinner)
```

## License

MIT
