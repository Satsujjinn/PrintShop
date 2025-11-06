# Environment Setup Guide

## Quick Setup

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Generate an AUTH_SECRET:
```bash
openssl rand -hex 32
```

3. Update `.env.local` with:
   - Your Vercel Blob token (get from https://vercel.com/dashboard/stores)
   - The generated AUTH_SECRET

## Required Environment Variables

### BLOB_READ_WRITE_TOKEN
- Get from: https://vercel.com/dashboard/stores
- Required for image storage

### ADMIN_EMAIL
- Set to: `leonjordaan10@gmail.com`
- This is your admin login email

### ADMIN_PASSWORD_HASH
- Pre-configured for password: `admin123`
- Hash: `b4e30ecdd82da986f42309a6ad028093:29b69b376c035db4efd38103a05da546bff803599dde7ad8cec7cc64f1d763a75b68fad6aaeb718e018096e93537e4e3c1182ff9dbfcc6328e898045270e94e5`
- To generate a new hash: `node scripts/hash-password.mjs "your-password"`

### AUTH_SECRET
- Generate with: `openssl rand -hex 32`
- Minimum 32 characters
- Used for session token signing

## Example .env.local

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
ADMIN_EMAIL=leonjordaan10@gmail.com
ADMIN_PASSWORD_HASH=b4e30ecdd82da986f42309a6ad028093:29b69b376c035db4efd38103a05da546bff803599dde7ad8cec7cc64f1d763a75b68fad6aaeb718e018096e93537e4e3c1182ff9dbfcc6328e898045270e94e5
AUTH_SECRET=your_generated_secret_here_minimum_32_characters
```

## Troubleshooting

If you get "Unable to process login request":
1. Check that `.env.local` exists
2. Verify all environment variables are set
3. Restart your development server after creating/updating `.env.local`
4. Check server console for specific error messages

