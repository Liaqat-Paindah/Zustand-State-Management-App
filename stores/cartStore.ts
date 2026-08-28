import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
export interface CartType {
  cartItems: Product[];
  addProducts: (Product: Product) => void;
  removeProduct: (id: number) => void;
  clear: () => void;
}

export const useCart = create<CartType>()(
  persist(
    (set) => ({
      cartItems: [],
      addProducts: (Product) => {
        set((state) => ({
          cartItems: [...state.cartItems, Product],
        }));
      },
      removeProduct: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((Product) => Product.id != id),
        }));
      },
      clear: () => {
        set(() => ({
          cartItems: [],
        }));
      },
    }),
    {
      name: "cart-storage", // Name of the storage key
    },
  ),
);
