import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type BiodataFormValues } from "@/types/biodata";
import { defaultBiodataValues } from "@/lib/default-biodata";

interface BiodataState {
  formData: BiodataFormValues;
  selectedTemplate: string;
  setFormData: (data: BiodataFormValues) => void;
  setSelectedTemplate: (templateId: string) => void;
  resetStore: () => void;
}

export const useBiodataStore = create<BiodataState>()(
  persist(
    (set) => ({
      formData: defaultBiodataValues,
      selectedTemplate: "classic1",
      setFormData: (data) => set({ formData: data }),
      setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
      resetStore: () => set({ formData: defaultBiodataValues, selectedTemplate: "classic1" }),
    }),
    {
      name: "biodata-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
