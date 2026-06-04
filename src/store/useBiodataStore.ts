import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { temporal } from "zundo";
import { type BiodataFormValues } from "@/types/biodata";
import { defaultBiodataValues } from "@/lib/default-biodata";

import { type TemplateConfig, getTemplateConfig, registerDynamicTemplates } from "@/lib/frame-config";

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

export interface Sticker {
  id: string;
  type: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation?: number;
  isMantra?: boolean;
}

interface BiodataState {
  formData: BiodataFormValues & {
    layout: Layout;
    stickers: Sticker[];
  };
  selectedTemplate: string;
  customTemplates: TemplateConfig[];
  customStickers: any[];
  setFormData: (data: any) => void;
  updateField: (section: keyof BiodataFormValues, id: string, value: string) => void;
  updateLayout: (id: string, x: number, y: number) => void;
  addSticker: (sticker: Omit<Sticker, 'id'>) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  setSelectedTemplate: (templateId: string) => void;
  setCustomTemplates: (templates: TemplateConfig[]) => void;
  fetchCustomTemplates: () => Promise<void>;
  fetchInitialTemplate: (templateId?: string | null) => Promise<void>;
  fetchCustomStickers: () => Promise<void>;
  resetStore: () => void;
  resetFormDataOnly: () => void;
  resetDesignOnly: () => void;
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
          },
          stickers: []
        },
        selectedTemplate: "",
        customTemplates: [],
        customStickers: [],
        setFormData: (data) => set((state) => ({
          formData: {
            ...state.formData,
            ...data,
            // Preserve layout and stickers as they are managed independently in the store
            layout: state.formData.layout,
            stickers: state.formData.stickers,
          }
        })),
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
        addSticker: (sticker) => set((state) => ({
          formData: {
            ...state.formData,
            stickers: [
              ...(state.formData.stickers || []),
              { ...sticker, id: `sticker-${Date.now()}` }
            ]
          }
        })),
        updateSticker: (id, updates) => set((state) => ({
          formData: {
            ...state.formData,
            stickers: (state.formData.stickers || []).map(s => s.id === id ? { ...s, ...updates } : s)
          }
        })),
        removeSticker: (id) => set((state) => ({
          formData: {
            ...state.formData,
            stickers: (state.formData.stickers || []).filter(s => s.id !== id)
          }
        })),
        setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
        setCustomTemplates: (templates) => set({ customTemplates: templates }),
        fetchCustomTemplates: async () => {
          try {
            const res = await fetch("/api/templates");
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
              registerDynamicTemplates(data.templates);
              
              set((state) => {
                const currentSelected = state.selectedTemplate;
                const hasSelected = data.templates.some((t: any) => t.id === currentSelected);
                const defaultTemplate = data.templates.find((t: any) => t.isDefault === true);
                const fallbackTemplateId = defaultTemplate ? defaultTemplate.id : data.templates[0].id;
                return {
                  customTemplates: data.templates,
                  selectedTemplate: hasSelected ? currentSelected : fallbackTemplateId,
                };
              });
            }
          } catch (err) {
            console.error("Store failed to fetch templates:", err);
          }
        },
        fetchInitialTemplate: async (templateId) => {
          try {
            const currentSelected = useBiodataStore.getState().selectedTemplate;
            const targetId = templateId || currentSelected;

            // Check if we already have this template loaded or if it's static built-in
            const isBuiltIn = targetId ? !!getTemplateConfig(targetId) : false;

            if (targetId) {
              const alreadyLoaded = useBiodataStore.getState().customTemplates.some(t => t.id === targetId);
              const hasLoadedDatabaseTemplates = useBiodataStore.getState().customTemplates.length > 0;
              if (alreadyLoaded || (isBuiltIn && hasLoadedDatabaseTemplates)) {
                // Skip if already loaded, or if it is built-in AND we already have database templates loaded
                if (templateId) {
                  set({ selectedTemplate: templateId });
                }
                return;
              }
            } else {
              // If no specific template target, check if a default template is already loaded
              const hasDefault = useBiodataStore.getState().customTemplates.some(t => t.isDefault === true);
              if (hasDefault) {
                return;
              }
            }

            const url = (targetId && !isBuiltIn)
              ? `/api/templates?id=${encodeURIComponent(targetId)}`
              : `/api/templates?default=true`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
              registerDynamicTemplates(data.templates);
              
              set((state) => {
                const fetchedTpl = data.templates[0];
                const exists = state.customTemplates.some(t => t.id === fetchedTpl.id);
                const updatedTemplates = exists
                  ? state.customTemplates
                  : [...state.customTemplates, fetchedTpl];
                
                // Only overwrite the selectedTemplate if we had no prior selection or a URL parameter override is present
                const shouldSetSelected = !currentSelected || !!templateId;

                return {
                  customTemplates: updatedTemplates,
                  selectedTemplate: shouldSetSelected ? targetId : currentSelected,
                };
              });
            }
          } catch (err) {
            console.error("Store failed to fetch initial template:", err);
          }
        },
        fetchCustomStickers: async () => {
          try {
            const res = await fetch("/api/stickers?limit=1000");
            const data = await res.json();
            if (data.stickers && data.stickers.length > 0) {
              const { registerDynamicStickers } = await import("@/lib/sticker-assets");
              registerDynamicStickers(data.stickers);
              set({ customStickers: data.stickers });
            }
          } catch (err) {
            console.error("Store failed to fetch stickers:", err);
          }
        },
        resetStore: () => set((state) => {
          const defaultTemplate = state.customTemplates.find((t) => t.isDefault === true);
          return {
            formData: {
              ...defaultBiodataValues,
              layout: {
                header: { x: 0, y: 80 },
                personalDetails: { x: 60, y: 280 },
                education: { x: 320, y: 280 },
                footer: { x: 0, y: 1023 },
              },
              stickers: []
            },
            selectedTemplate: defaultTemplate ? defaultTemplate.id : "royal"
          };
        }),
        resetFormDataOnly: () => set((state) => ({
          formData: {
            ...defaultBiodataValues,
            layout: {
              header: { x: 0, y: 80 },
              personalDetails: { x: 60, y: 280 },
              education: { x: 320, y: 280 },
              footer: { x: 0, y: 1023 },
            },
            stickers: []
          }
        })),
        resetDesignOnly: () => set((state) => {
          const currentSelected = state.selectedTemplate;
          const defaultTemplate = state.customTemplates.find((t) => t.isDefault === true);
          return {
            formData: {
              ...state.formData,
              layout: {
                header: { x: 0, y: 80 },
                personalDetails: { x: 60, y: 280 },
                education: { x: 320, y: 280 },
                footer: { x: 0, y: 1023 },
              },
              stickers: []
            },
            selectedTemplate: currentSelected || (defaultTemplate ? defaultTemplate.id : "royal")
          };
        }),
      })
    ),
    {
      name: "biodata-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formData: state.formData,
      }),
    }
  )
);
