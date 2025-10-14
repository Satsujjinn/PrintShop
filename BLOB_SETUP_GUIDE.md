# Vercel Blob Setup Guide

## 🎨 How to Display Art in Your Gallery

Your project is already configured to use Vercel Blob storage! Follow these steps to get your artworks displaying:

### 1. Get Your Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob** (or create a new Blob store)
3. Click on your Blob store
4. Go to the **Settings** tab
5. Copy your `Read-Write Token`

### 2. Configure Environment Variable

Open `.env.local` file and replace `your_token_here` with your actual token:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

⚠️ **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Start Your Development Server

```bash
npm run dev
```

### 4. Upload Your First Artwork

1. Visit the admin panel: **http://localhost:3000/admin**
2. Fill in the artwork details:
   - Title
   - Artist name
   - Description
   - Price
   - Upload an image (PNG, JPG, or WEBP)
   - Optionally mark as "Featured"
3. Click **"UPLOAD ARTWORK"**

### 5. View Your Gallery

Go back to the homepage: **http://localhost:3000**

Your uploaded artworks will now display with images from Vercel Blob! 🎉

## How It Works

1. **Upload**: Images are uploaded to Vercel Blob storage via `/api/artworks`
2. **Storage**: Artwork metadata is stored in `artworks-db.json` on Blob
3. **Display**: The homepage fetches artworks and displays images from Blob URLs
4. **Optimization**: Next.js Image component optimizes images automatically

## Troubleshooting

### Images not showing?
- ✅ Check that `BLOB_READ_WRITE_TOKEN` is set in `.env.local`
- ✅ Restart your dev server after adding the token
- ✅ Make sure you've uploaded artworks via `/admin`
- ✅ Check browser console for errors

### Upload failing?
- ✅ Verify your token is valid
- ✅ Check image file size (max 10MB recommended)
- ✅ Ensure image format is supported (PNG, JPG, WEBP)

## Deploying to Production

When deploying to Vercel:

1. Your Vercel project will automatically use the Blob store
2. Add `BLOB_READ_WRITE_TOKEN` to your project's environment variables in Vercel dashboard
3. Deploy your project

---

Created by Leon Jordaan

