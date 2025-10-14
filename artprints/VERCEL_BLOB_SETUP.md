# 🗂️ Artwork Management with Vercel Blob

Your ArtPrints gallery uses Vercel Blob for hosting artwork images. Here's how to manage your artwork collection.

## 🎨 Adding Artwork to Your Gallery

### Method 1: Direct Database Insert (Recommended for Demo)
Upload your images to Vercel Blob and add artwork data directly to your database.

1. **Upload Images to Vercel Blob**:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" → Your Blob store
   - Upload your artwork images
   - Copy the public URLs

2. **Add Artwork to Database**:
   Use SQL commands in your Vercel Postgres dashboard:

   ```sql
   -- Add a new artwork
   INSERT INTO artworks (
     title, artist, description, base_price, image_url, 
     category, tags, is_featured, is_active
   ) VALUES (
     'Sunset Dreams', 
     'Leon Jordaan', 
     'A vibrant digital artwork capturing the essence of a summer sunset',
     25.00,
     'https://your-blob-url.vercel-storage.com/artwork1.jpg',
     'Digital Art',
     ARRAY['sunset', 'digital', 'colorful'],
     true,
     true
   );

   -- Add sizes for the artwork (get the artwork ID from above)
   INSERT INTO artwork_sizes (artwork_id, name, dimensions, price_multiplier) VALUES
   (1, 'Small', '8x10 inches', 1.0),
   (1, 'Medium', '12x16 inches', 1.5),
   (1, 'Large', '16x20 inches', 2.0);
   ```

### Method 2: Bulk Import (For Multiple Artworks)
Create a SQL script with multiple artworks:

```sql
-- Artwork 1
INSERT INTO artworks (title, artist, description, base_price, image_url, category, tags, is_featured, is_active) 
VALUES ('Digital Dreams', 'Leon Jordaan', 'Abstract digital composition', 30.00, 'https://your-blob-url.vercel-storage.com/art1.jpg', 'Abstract', ARRAY['digital', 'abstract'], true, true);

-- Artwork 2  
INSERT INTO artworks (title, artist, description, base_price, image_url, category, tags, is_featured, is_active)
VALUES ('Urban Landscape', 'Leon Jordaan', 'Modern cityscape interpretation', 35.00, 'https://your-blob-url.vercel-storage.com/art2.jpg', 'Landscape', ARRAY['urban', 'landscape'], false, true);

-- Add sizes for all artworks
INSERT INTO artwork_sizes (artwork_id, name, dimensions, price_multiplier) VALUES
-- For artwork 1
(1, 'Small', '8x10 inches', 1.0),
(1, 'Medium', '12x16 inches', 1.5), 
(1, 'Large', '16x20 inches', 2.0),
-- For artwork 2
(2, 'Small', '8x10 inches', 1.0),
(2, 'Medium', '12x16 inches', 1.5),
(2, 'Large', '16x20 inches', 2.0);
```

## 🗃️ Database Schema

Your artwork data structure:

```sql
-- Artworks table
artworks:
  id (serial primary key)
  title (varchar 255)
  artist (varchar 255) 
  description (text)
  base_price (decimal 10,2)
  image_url (varchar 500) -- Your Vercel Blob URL
  category (varchar 100)
  tags (text[])
  is_featured (boolean)
  is_active (boolean)
  created_at (timestamp)
  updated_at (timestamp)

-- Artwork sizes table  
artwork_sizes:
  id (serial primary key)
  artwork_id (references artworks.id)
  name (varchar 100) -- e.g., "Small", "Medium", "Large"
  dimensions (varchar 100) -- e.g., "8x10 inches"
  price_multiplier (decimal 3,2) -- e.g., 1.0, 1.5, 2.0
```

## 🔧 Managing Your Collection

### View All Artworks
```sql
SELECT * FROM artworks WHERE is_active = true ORDER BY created_at DESC;
```

### Update Artwork Details
```sql
UPDATE artworks 
SET title = 'New Title', description = 'Updated description'
WHERE id = 1;
```

### Feature/Unfeature Artwork
```sql
UPDATE artworks SET is_featured = true WHERE id = 1;
```

### Deactivate Artwork (Hide from gallery)
```sql
UPDATE artworks SET is_active = false WHERE id = 1;
```

## 🎯 Simplified Workflow

1. **Create your artwork** (Photoshop, Figma, etc.)
2. **Upload to Vercel Blob** via dashboard
3. **Copy the public URL** 
4. **Add to database** with SQL insert
5. **Your gallery updates** automatically!

## ✨ Benefits of This Approach

- **No admin authentication** needed
- **Direct control** over your database
- **Fast uploads** via Vercel dashboard
- **Clean separation** between storage and application
- **Easy bulk operations** with SQL
- **Perfect for demo/portfolio** usage

---

**Your artwork management is now streamlined and simple! 🎨**

*Upload images to Blob, add data via SQL - your gallery displays automatically!*
