# ArtPrints - Curated Art Print Shop

A modern e-commerce website for selling art prints, built with Next.js 15, TypeScript, Tailwind CSS, and Stripe.

## Features

- 🎨 Beautiful, responsive design with modern UI
- 🛒 Shopping cart functionality with Zustand state management
- 💳 Stripe integration for secure payments
- 📱 Mobile-first responsive design
- ⚡ Built with Next.js 15 and React 19
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 📦 Lucide React icons

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Update `.env.local` with your actual Stripe keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Customization

### Adding New Artwork

Edit `src/lib/data.ts` to add new artwork items:

```typescript
{
  id: '7',
  title: 'Your Artwork Title',
  artist: 'Artist Name',
  price: 50, // Base price in USD
  image: 'https://your-image-url.jpg',
  description: 'Description of the artwork...',
  sizes: [
    { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
    { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
    { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
  ]
}
```

### Updating Artist Bio

Modify the `artistBio` object in `src/lib/data.ts`.

### Styling

- Main styles are in `src/app/globals.css`
- Component styles use Tailwind CSS classes
- Custom utilities are available for line-clamping text

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set the environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Deploy

### Build for Production

```bash
npm run build
npm start
```

## Payment Flow

1. Users browse the gallery and add items to cart
2. Cart state is managed by Zustand and persisted to localStorage
3. Checkout redirects to Stripe Checkout
4. After successful payment, users are redirected to success page
5. Cart is automatically cleared after successful purchase

## Next Steps

Consider adding:

- **CMS Integration**: Connect to a headless CMS like Strapi, Sanity, or Contentful
- **Webhook Fulfillment**: Set up Stripe webhooks for order processing
- **User Accounts**: Add authentication for order history
- **Inventory Management**: Track stock levels
- **Email Notifications**: Send order confirmations and shipping updates
- **Analytics**: Add Google Analytics or similar tracking
- **SEO**: Add meta tags and structured data
- **Image Optimization**: Use Next.js Image optimization features

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Payments**: Stripe
- **Icons**: Lucide React
- **Validation**: Zod (ready for forms)

## Support

For questions or issues, please refer to the documentation of the respective technologies or create an issue in the repository.