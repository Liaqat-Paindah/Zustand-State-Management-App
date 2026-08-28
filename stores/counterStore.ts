import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Counter {
  count: number;

  INC: () => void;
  DEC: () => void;
  RESET: () => void;
}

export const useCounterStore = create<Counter>()(
  persist(
    (set) => ({
      count: 0,

      INC: () => {
        set((state) => ({
          count: state.count + 1,
        }));
      },

      DEC: () => {
        set((state) => ({
          count: state.count - 1,
        }));
      },

      RESET: () => {
        set({
          count: 0,
        });
      },
    }),
    {
      name: "Count-LocalStorage",
    },
  ),
);
