# ArtPrints Admin Dashboard Setup Guide

🎨 **Complete Professional Admin System with Database & File Storage**

Your ArtPrints store now includes a full-featured admin dashboard with:
- ✅ Vercel Postgres Database
- ✅ AWS S3 File Storage  
- ✅ NextAuth Authentication
- ✅ Drag & Drop Image Uploads
- ✅ Modern Admin Interface
- ✅ Order Management System

## 🚀 Quick Setup (5 minutes)

### 1. **Configure Environment Variables**

Update your `.env.local` file with your actual credentials:

```bash
# Vercel Postgres Database (Get these from Vercel Dashboard)
POSTGRES_URL="postgres://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://username:password@host:port/database"
POSTGRES_URL_NON_POOLING="postgres://username:password@host:port/database"
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password" 
POSTGRES_DATABASE="database"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-artprints-bucket

# NextAuth Configuration  
NEXTAUTH_SECRET=generate_a_random_32_character_string_here
```

### 2. **Set Up Vercel Postgres**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the connection strings to your `.env.local`

### 3. **Set Up AWS S3**

1. Create an AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Add credentials to `.env.local`

### 4. **Initialize Database**

Run this once to create all tables:

```bash
curl -X POST http://localhost:3002/api/init
```

## 🎯 **Admin Access**

### **Login to Admin Panel:**
- **URL:** http://localhost:3002/admin/login
- **Email:** admin@artprints.com  
- **Password:** admin123

### **Admin Features:**

#### **🖼️ Artwork Management**
- **Add New Artworks:** Drag & drop image upload to S3
- **Edit Existing:** Update titles, prices, descriptions
- **Manage Sizes:** Configure multiple size options with price multipliers
- **Feature Control:** Mark artworks as featured
- **Status Management:** Activate/deactivate artworks

#### **📊 Dashboard**
- **Analytics Overview:** Track artworks, orders, revenue
- **Recent Activity:** View latest additions
- **Quick Actions:** Fast access to common tasks

#### **🛍️ Order Management**
- **Order Tracking:** View all customer orders
- **Status Updates:** Update order fulfillment status
- **Customer Details:** Access shipping and billing information

## 🛠️ **Development Workflow**

### **Adding Artworks:**
1. Go to `/admin/artworks/new`
2. Drag & drop your image (auto-uploads to S3)
3. Fill in artwork details
4. Configure available sizes and pricing
5. Save - instantly available on your store!

### **Managing Orders:**
1. Visit `/admin/orders`
2. View customer orders from Stripe
3. Update fulfillment status
4. Track revenue and sales

### **Database Structure:**

```sql
Tables Created:
- artworks (titles, descriptions, images, pricing)
- artwork_sizes (size configurations per artwork)  
- orders (customer order data)
- order_items (individual items per order)
- users (admin authentication)
```

## 🎨 **Modern UI Features**

### **2025 Design Standards:**
- **Glass Morphism Effects:** Backdrop blur and transparency
- **Micro-Animations:** Smooth hover states and transitions
- **Dark Mode Support:** Automatic system preference detection
- **Mobile-First:** Responsive across all devices
- **Advanced Typography:** Gradient text and modern font stacks

### **Admin Dashboard:**
- **Drag & Drop Uploads:** Intuitive file management
- **Real-time Updates:** Live data without page refresh  
- **Advanced Filtering:** Search and filter artworks
- **Batch Operations:** Manage multiple items at once

## 🔧 **API Endpoints**

All admin functionality is powered by REST APIs:

```
POST /api/artworks          - Create new artwork
GET  /api/artworks          - List all artworks  
PUT  /api/artworks/[id]     - Update artwork
DELETE /api/artworks/[id]   - Delete artwork
POST /api/upload            - Upload images to S3
POST /api/init              - Initialize database
```

## 🚨 **Important Notes**

### **Environment Security:**
- Never commit `.env.local` to version control
- Use strong passwords and rotate secrets regularly
- Restrict AWS IAM permissions to minimum required

### **Production Deployment:**
- Set all environment variables in Vercel dashboard
- Configure your domain in NextAuth settings
- Set up proper CORS and security headers

### **Backup Strategy:**
- Vercel Postgres includes automatic backups
- Consider additional S3 versioning for images
- Export artwork data regularly

## 🎉 **You're All Set!**

Your professional art store admin system is now ready! 

**Next Steps:**
1. Configure your environment variables
2. Initialize the database  
3. Login to admin panel
4. Start uploading your artwork!

**Need Help?** 
- Check the console for any error messages
- Ensure all environment variables are correctly set
- Verify AWS S3 bucket permissions

---

**🚀 Happy Selling! Your modern art store is ready to showcase beautiful artwork to the world.**
