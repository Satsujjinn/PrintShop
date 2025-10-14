# 🗂️ Vercel Blob Setup Guide

Your ArtPrints application is now configured to use Vercel Blob for artwork image storage! Here's how to complete the setup.

## 🔑 Getting Your Blob Token

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Navigate to your project (or create one)

2. **Create a Blob Store**
   - Go to the "Storage" tab in your project
   - Click "Create Database" → "Blob"
   - Give it a name like "artprints-images"
   - Click "Create"

3. **Get Your Token**
   - Once created, go to the "Settings" tab of your blob store
   - Copy the `BLOB_READ_WRITE_TOKEN`

4. **Update Environment Variables**
   - Replace `your_vercel_blob_token_here` in your `.env.local` file:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_0_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 🚀 For Vercel Deployment

When deploying to Vercel, add the environment variable:

1. **In Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `BLOB_READ_WRITE_TOKEN` with your token value

2. **For Local Development**
   - Make sure your `.env.local` has the correct token
   - The app will automatically use Vercel Blob for uploads

## ✨ What's Included

Your app now has:

- ✅ **Vercel Blob integration** for artwork uploads
- ✅ **Image validation** (JPEG, PNG, WebP, GIF up to 10MB)
- ✅ **Automatic file naming** with timestamps
- ✅ **Clean URLs** for artwork display
- ✅ **Admin upload functionality** ready to use

## 🎨 Testing the Upload

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the admin panel**:
   - Visit `http://localhost:3000/admin/login`
   - Use your admin credentials from `.env.local`

3. **Upload artwork**:
   - Go to "Add New Artwork"
   - Upload an image - it will go directly to Vercel Blob!

## 🔧 Benefits of Vercel Blob

- **Fast**: Optimized for Next.js applications
- **Secure**: Built-in access control and CDN
- **Simple**: No complex AWS configuration needed
- **Cost-effective**: Pay only for what you use
- **Scalable**: Handles traffic spikes automatically

## 🗃️ File Organization

Your images are stored with this structure:
```
artworks/
  ├── 1635789012345-my-artwork.jpg
  ├── 1635789012346-another-piece.png
  └── ...
```

Files are automatically:
- Given unique timestamps to prevent conflicts
- Organized in the `artworks/` folder
- Made publicly accessible for display
- Cached globally via Vercel's CDN

## 🧹 Migration from S3 (Optional)

If you were previously using S3:
1. Your S3 configuration is still in `.env.local` as backup
2. New uploads will go to Vercel Blob
3. Existing S3 images will continue to work
4. You can migrate old images manually if needed

---

**Your artwork storage is now powered by Vercel Blob! 🎨✨**

*Ready for seamless image uploads and lightning-fast loading!*
