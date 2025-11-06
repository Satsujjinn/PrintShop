# Monochrome Art Gallery

A modern, minimalist art gallery website built with Next.js and Vercel Blob storage.

**Created by Leon Jordaan**

## Features

- 🎨 Beautiful artwork gallery with filtering and sorting
- 📦 Vercel Blob storage for images
- 🔍 Search and filter functionality
- 📱 Fully responsive design
- ⚡ Optimized with React Query for data fetching
- 🎯 Admin panel for easy artwork management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for Blob storage)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd monochrome
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Get your Vercel Blob token from https://vercel.com/dashboard/stores
   - Update `.env.local` with your values:
     ```
     BLOB_READ_WRITE_TOKEN=your_token_here
     ADMIN_EMAIL=leonjordaan10@gmail.com
     ADMIN_PASSWORD_HASH=b4e30ecdd82da986f42309a6ad028093:29b69b376c035db4efd38103a05da546bff803599dde7ad8cec7cc64f1d763a75b68fad6aaeb718e018096e93537e4e3c1182ff9dbfcc6328e898045270e94e5
     AUTH_SECRET=your_random_secret_here
     ```
   - Generate a secure AUTH_SECRET: `openssl rand -hex 32`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin) to upload new artworks.

**Default Admin Credentials:**
- Email: `leonjordaan10@gmail.com`
- Password: `admin123`

**Note:** Make sure to set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in your `.env.local` file. The password hash is pre-configured in `.env.example`.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `BLOB_READ_WRITE_TOKEN` environment variable in the Vercel dashboard
4. Deploy!

## Project Structure

```
monochrome/
├── app/
│   ├── api/
│   │   └── artworks/       # API routes for artwork management
│   ├── admin/              # Admin panel for uploading artworks
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ArtworkCard.tsx     # Artwork card component
│   └── Providers.tsx       # React Query provider
├── hooks/
│   └── use-artworks.ts     # React Query hook for artworks
├── lib/
│   ├── db.ts              # Database functions
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript types
└── package.json
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Vercel Blob** - Image storage
- **Lucide React** - Icons

## License

Copyright © 2025 Leon Jordaan. All rights reserved.

