# Environment Configuration Setup

This frontend uses environment variables to configure the backend API URL, eliminating hardcoded localhost URLs in production.

## Environment Files

### `.env` (Default)
Contains default/fallback values for all environments:
```
NEXT_PUBLIC_API_URL=http://localhost:3303/api
NEXT_PUBLIC_PRODUCT_IMAGE_BASE=http://localhost:3303/uploads/products/
NEXT_PUBLIC_BACKEND_DOMAIN=localhost:3303
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env.local` (Local Development)
Overrides `.env` for local development. This file is ignored by git:
```
NEXT_PUBLIC_API_URL=http://localhost:3303/api
NEXT_PUBLIC_PRODUCT_IMAGE_BASE=http://localhost:3303/uploads/products/
NEXT_PUBLIC_BACKEND_DOMAIN=localhost:3303
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env.example`
Template file showing required environment variables.

## How It Works

1. **Local Development**: Uses `.env.local` (if exists) or falls back to `.env`
2. **Production**: Set environment variables in your deployment platform (Vercel, Netlify, etc.)

## Usage

### Development
```bash
npm run dev
```
Uses `.env.local` for localhost development.

### Production
Set these environment variables in your deployment platform:
- `NEXT_PUBLIC_API_URL=https://primesmell.com/api`
- `NEXT_PUBLIC_PRODUCT_IMAGE_BASE=https://primesmell.com/uploads/products/`
- `NEXT_PUBLIC_BACKEND_DOMAIN=primesmell.com`
- `NEXT_PUBLIC_SITE_URL=https://primesmell.com`

## Why This Approach?

- **Single source of truth**: `.env` contains defaults
- **Local overrides**: `.env.local` for development-specific settings
- **Production flexibility**: Environment variables set in deployment platform
- **No confusion**: Only one file to manage locally
- **Standard Next.js pattern**: Follows Next.js conventions

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_PRODUCT_IMAGE_BASE` - Base URL for product images
- `NEXT_PUBLIC_BACKEND_DOMAIN` - Backend domain for CORS and image configuration
- `NEXT_PUBLIC_SITE_URL` - Frontend site URL

All variables prefixed with `NEXT_PUBLIC_` are available in the browser.
