import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConfiguratorState = {
  strapId: string | null;
  dialColorId: string | null;
  caseFinishId: string | null;
  watchSizeId: string | null;
  warrantyId: string | null;
  engravingText: string;
  giftPackaging: boolean;
  set: (patch: Partial<Omit<ConfiguratorState, "set" | "reset">>) => void;
  reset: () => void;
};

export const useConfigurator = create<ConfiguratorState>()(
  persist(
    (set) => ({
      strapId: null,
      dialColorId: null,
      caseFinishId: null,
      watchSizeId: null,
      warrantyId: null,
      engravingText: "",
      giftPackaging: false,
      set: (patch) => set(patch),
      reset: () =>
        set({
          strapId: null,
          dialColorId: null,
          caseFinishId: null,
          watchSizeId: null,
          warrantyId: null,
          engravingText: "",
          giftPackaging: false,
        }),
    }),
    { name: "horologie-config" },
  ),
);