import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { temporal } from "zundo";
import { type BiodataFormValues } from "@/types/biodata";
import { defaultBiodataValues } from "@/lib/default-biodata";

interface LayoutPosition {
  x: number;
  y: number;
}

interface Layout {
  header: LayoutPosition;
  personalDetails: LayoutPosition;
  education: LayoutPosition;
  footer: LayoutPosition;
  [key: string]: LayoutPosition | undefined;
}

interface BiodataState {
  formData: BiodataFormValues & {
    layout: Layout;
  };
  selectedTemplate: string;
  setFormData: (data: any) => void;
  updateField: (section: keyof BiodataFormValues, id: string, value: string) => void;
  updateLayout: (id: string, x: number, y: number) => void;
  setSelectedTemplate: (templateId: string) => void;
  resetStore: () => void;
}

export const useBiodataStore = create<BiodataState>()(
  persist(
    temporal(
      (set) => ({
        formData: {
          ...defaultBiodataValues,
          layout: {
            header: { x: 0, y: 80 },
            personalDetails: { x: 60, y: 280 },
            education: { x: 320, y: 280 },
            footer: { x: 0, y: 1023 },
          }
        },
        selectedTemplate: "royal",
        setFormData: (data) => set({ formData: data }),
        updateField: (section, id, value) => set((state) => {
          const sectionData = state.formData[section];
          if (Array.isArray(sectionData)) {
            return {
              formData: {
                ...state.formData,
                [section]: sectionData.map((field: any) => 
                  field.id === id ? { ...field, value } : field
                )
              }
            };
          }
          return state;
        }),
        updateLayout: (id, x, y) => set((state) => ({
          formData: {
            ...state.formData,
            layout: {
              ...state.formData.layout,
              [id]: { x, y }
            }
          }
        })),
        setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
        resetStore: () => set({ 
          formData: {
            ...defaultBiodataValues,
            layout: {
              header: { x: 0, y: 80 },
              personalDetails: { x: 60, y: 280 },
              education: { x: 320, y: 280 },
              footer: { x: 0, y: 1023 },
            }
          }, 
          selectedTemplate: "royal" 
        }),
      })
    ),
    {
      name: "biodata-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
