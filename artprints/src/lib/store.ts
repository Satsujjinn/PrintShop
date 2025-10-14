import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ArtworkItem {
  id: string
  title: string
  artist: string
  price: number
  image: string
  description: string
  category?: string
  tags?: string[]
  isFeatured?: boolean
  isActive?: boolean
  sizes: Array<{
    id?: number
    name: string
    dimensions: string
    priceMultiplier?: number
    price_multiplier?: number
  }>
}

export interface CartItem extends ArtworkItem {
  selectedSize: string
  quantity: number
}

interface StoreState {
  cart: CartItem[]
  isCartOpen: boolean
  addToCart: (item: ArtworkItem, selectedSize: string, quantity?: number) => void
  removeFromCart: (id: string, selectedSize: string) => void
  updateQuantity: (id: string, selectedSize: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      
      addToCart: (item, selectedSize, quantity = 1) => {
        const size = item.sizes.find(s => s.name === selectedSize)
        if (!size) return
        
        // Handle both priceMultiplier and price_multiplier for backwards compatibility
        const multiplier = size.priceMultiplier || size.price_multiplier || 1
        
        const cartItem: CartItem = {
          ...item,
          selectedSize,
          quantity,
          price: item.price * multiplier
        }
        
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (i) => i.id === item.id && i.selectedSize === selectedSize
          )
          
          if (existingIndex >= 0) {
            const newCart = [...state.cart]
            newCart[existingIndex].quantity += quantity
            return { cart: newCart }
          } else {
            return { cart: [...state.cart, cartItem] }
          }
        })
      },
      
      removeFromCart: (id, selectedSize) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.id === id && item.selectedSize === selectedSize)
          )
        }))
      },
      
      updateQuantity: (id, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id, selectedSize)
          return
        }
        
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id && item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => set({ cart: [] }),
      
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'artprints-store'
    }
  )
)
