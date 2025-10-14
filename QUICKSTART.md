# Quick Start Guide - Monochrome Art Gallery

**Created by Leon Jordaan**

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Get Your Vercel Blob Token

You need a Vercel Blob token to store images:

1. Go to https://vercel.com/dashboard
2. Create a new project (or select existing)
3. Click on the **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Copy the `BLOB_READ_WRITE_TOKEN` from the `.env.local` tab

### Step 3: Add Token to Environment

Create a `.env.local` file in your project root:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxx
```

**Important:** Replace with your actual token!

---

## ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

Your site is now running at:
- **Gallery:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

---

## 📸 Upload Your First Artwork

1. Go to http://localhost:3000/admin
2. Fill in the form:
   - **Title:** "Mountain Landscape"
   - **Artist:** "Your Name"
   - **Description:** "A beautiful mountain scene"
   - **Price:** 299.99
   - **Image:** Upload any image
3. Click **"UPLOAD ARTWORK"**
4. View it at http://localhost:3000

---

## 🌐 Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Then on Vercel:
# 1. Import your GitHub repository
# 2. Add BLOB_READ_WRITE_TOKEN environment variable
# 3. Deploy!
```

### Option 2: Build for Production

```bash
npm run build
npm start
```

---

## 🎨 Features

✅ Beautiful minimalist design  
✅ Fully responsive  
✅ Search & filter artworks  
✅ Sort by price, date, title, or artist  
✅ Image storage with Vercel Blob  
✅ Easy admin panel for uploads  
✅ No database required  

---

## 📁 Project Structure

```
monochrome/
├── app/
│   ├── page.tsx          # Main gallery page
│   ├── admin/page.tsx    # Admin upload page
│   └── api/artworks/     # API routes
├── components/           # React components
├── hooks/               # React Query hooks
├── lib/                 # Database & utilities
└── types/               # TypeScript types
```

---

## 💡 Tips

- **First time?** Start by uploading 3-5 artworks to see the gallery in action
- **Need help?** Check `SETUP.md` for detailed documentation
- **Customization?** Edit Tailwind classes in the components

---

## 🐛 Troubleshooting

**"Failed to fetch artworks"**  
→ Make sure `BLOB_READ_WRITE_TOKEN` is set in `.env.local`

**Images not showing**  
→ Check that the Next.js server is running (`npm run dev`)

**Build errors**  
→ Run `npm install` to ensure all dependencies are installed

---

**Copyright © 2025 Leon Jordaan. All rights reserved.**

