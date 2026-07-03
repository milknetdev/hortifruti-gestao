import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Coupon, DeliveryType, Address } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  coupon: Coupon | null;
  deliveryType: DeliveryType;
  deliveryAddress: Address | null;
  deliveryFee: number;
  notes: string;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cleanInvalidItems: () => void;
  applyCoupon: (coupon: Coupon | null, code?: string) => void;
  removeCoupon: () => void;
  setDeliveryType: (type: DeliveryType) => void;
  setDeliveryAddress: (address: Address | null) => void;
  setDeliveryFee: (fee: number) => void;
  setNotes: (notes: string) => void;
  getItemQuantity: (productId: string) => number;

  // Computed
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      coupon: null,
      deliveryType: 'delivery',
      deliveryAddress: null,
      deliveryFee: 0,
      notes: '',

      addItem: (product: Product, quantity?: number) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          // Garantir que preços são números
          const salePrice = Number(product.salePrice) || 0;
          const promotionalPrice = product.promotionalPrice ? Number(product.promotionalPrice) : null;
          const unitPrice = promotionalPrice && promotionalPrice < salePrice ? promotionalPrice : salePrice;
          
          // Garantir que quantidade é válida
          const qty = Number(quantity) || Number(product.minQuantity) || 1;

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQuantity = Number(existing.quantity) + qty;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              totalPrice: newQuantity * (Number(existing.unitPrice) || 0),
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            id: `cart-${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity: qty,
            unitPrice,
            totalPrice: qty * unitPrice,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          const qty = Number(quantity) || 0;
          if (qty <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: qty,
                    totalPrice: qty * (Number(item.unitPrice) || 0),
                  }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          coupon: null,
          notes: '',
        });
      },

      cleanInvalidItems: () => {
        set((state) => ({
          items: state.items.filter((item) => {
            const price = Number(item.unitPrice);
            const qty = Number(item.quantity);
            return !isNaN(price) && price > 0 && !isNaN(qty) && qty > 0;
          }),
        }));
      },

      applyCoupon: (coupon: Coupon | null, code?: string) => {
        set({ coupon, couponCode: code || coupon?.code || null });
      },

      removeCoupon: () => {
        set({ coupon: null, couponCode: null });
      },

      setDeliveryType: (type: DeliveryType) => {
        set({ deliveryType: type });
        if (type === 'pickup') {
          set({ deliveryFee: 0 });
        }
      },

      setDeliveryAddress: (address: Address | null) => {
        set({ deliveryAddress: address });
      },

      setDeliveryFee: (fee: number) => {
        set({ deliveryFee: fee });
      },

      setNotes: (notes: string) => {
        set({ notes });
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.productId === productId);
        return item?.quantity || 0;
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = Number(item.totalPrice) || 0;
          return sum + price;
        }, 0);
      },

      discount: () => {
        const { coupon } = get();
        const sub = get().subtotal();

        if (!coupon) return 0;

        if (coupon.minOrderValue && sub < coupon.minOrderValue) return 0;

        switch (coupon.type) {
          case 'percentage':
            return sub * (coupon.value / 100);
          case 'fixed':
            return Math.min(coupon.value, sub);
          case 'free_shipping':
            return 0; // Handled via deliveryFee
          default:
            return 0;
        }
      },

      total: () => {
        const sub = get().subtotal();
        const disc = get().discount();
        const fee = get().deliveryType === 'pickup' ? 0 : get().deliveryFee;
        return Math.max(0, sub - disc + fee);
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'hortifruti-cart',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        coupon: state.coupon,
        deliveryType: state.deliveryType,
        deliveryAddress: state.deliveryAddress,
        deliveryFee: state.deliveryFee,
        notes: state.notes,
      }),
    }
  )
);
