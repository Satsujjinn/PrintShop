# 🎨 Getting Started - Quick Setup Guide

## ✅ What You Need

Your app is **already configured**! You just need to:

1. **Add your Vercel Blob token**
2. **Upload some artworks**
3. **See your gallery come to life!**

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Blob Token

Go to your Vercel dashboard and get your Blob storage token:

👉 **[Vercel Storage Dashboard](https://vercel.com/dashboard/stores)**

1. Click on **"Create Database"** → **"Blob"** (if you haven't already)
2. Select your blob store
3. Go to **Settings** tab
4. Copy the **Read-Write Token** (starts with `vercel_blob_rw_`)

### Step 2: Add Token to Your Project

Open `.env.local` and paste your token:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_ACTUAL_TOKEN_HERE
```

### Step 3: Start Your App

```bash
npm install  # First time only
npm run dev
```

---

## 📸 Upload Your First Artwork

1. **Open admin panel**: http://localhost:3000/admin

2. **Fill in the form**:
   - Title: "Sunset Dreams"
   - Artist: "Your Name"
   - Description: "Beautiful sunset landscape"
   - Price: 299.99
   - Upload an image (JPG, PNG, or WEBP)
   - ✅ Check "Featured" if you want it highlighted

3. **Click "UPLOAD ARTWORK"**

4. **Visit your gallery**: http://localhost:3000

---

## 🎉 Your Gallery is Live!

Your artworks will now display with:
- ✅ Images from Vercel Blob
- ✅ Optimized loading with Next.js
- ✅ Responsive design
- ✅ Search & filter functionality
- ✅ Beautiful animations

---

## 📂 Project Structure

```
PrintShop/
├── app/
│   ├── page.tsx          # Main gallery page
│   ├── admin/
│   │   └── page.tsx      # Upload artworks here
│   └── api/
│       └── artworks/     # API routes
├── components/
│   └── ArtworkCard.tsx   # Artwork display component
├── lib/
│   └── db.ts            # Database functions
└── .env.local           # Your Blob token (keep secret!)
```

---

## 🔧 How It Works

1. **Upload** → Images go to Vercel Blob storage
2. **Store** → Artwork metadata saved in JSON on Blob
3. **Display** → Homepage fetches & shows artworks
4. **Optimize** → Next.js Image optimizes everything

---

## 🐛 Troubleshooting

### "No artworks available" message?
→ Upload your first artwork at `/admin`

### Images not loading?
1. Check `.env.local` has your token
2. Restart dev server: `npm run dev`
3. Check browser console for errors

### Upload failing?
1. Verify your Blob token is correct
2. Check image size (keep under 10MB)
3. Use supported formats: PNG, JPG, WEBP

---

## 🚢 Deploy to Production

1. Push to GitHub (already done! ✅)
2. Connect to Vercel
3. Add `BLOB_READ_WRITE_TOKEN` to Vercel environment variables
4. Deploy!

---

**🎨 Created by Leon Jordaan**

Ready to build your art empire! 🚀

