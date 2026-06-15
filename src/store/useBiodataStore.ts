import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { temporal } from "zundo";
import { type BiodataFormValues } from "@/types/biodata";
import { defaultBiodataValues } from "@/lib/default-biodata";

import { type TemplateConfig, getTemplateConfig, registerDynamicTemplates } from "@/lib/frame-config";
import { preloadSvg, preloadFrameImage } from "@/hooks/useColorizedFrameImage";

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
  hasLoadedAllTemplates: boolean;
  hasMoreTemplates: boolean;
  templatePage: number;
  isFetchingMoreTemplates: boolean;
  setFormData: (data: any) => void;
  updateField: (section: keyof BiodataFormValues, id: string, value: string) => void;
  updateLayout: (id: string, x: number, y: number) => void;
  addSticker: (sticker: Omit<Sticker, 'id'>) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  setSelectedTemplate: (templateId: string) => void;
  setCustomTemplates: (templates: TemplateConfig[]) => void;
  fetchCustomTemplates: (religion?: string) => Promise<void>;
  fetchMoreTemplates: (religion?: string) => Promise<void>;
  fetchInitialTemplate: (templateId?: string | null, religion?: string) => Promise<void>;
  fetchCustomStickers: () => Promise<void>;
  langFilter: string;
  priceFilter: "all" | "free" | "premium";
  setLangFilter: (lang: string) => void;
  setPriceFilter: (price: "all" | "free" | "premium") => void;
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
        hasLoadedAllTemplates: false,
        hasMoreTemplates: true,
        templatePage: 1,
        isFetchingMoreTemplates: false,
        langFilter: "all",
        priceFilter: "all",
        setLangFilter: (lang) => set({ langFilter: lang }),
        setPriceFilter: (price) => set({ priceFilter: price }),
        setFormData: (data) => set((state) => ({
          formData: {
            ...state.formData,
            ...data,
            // Preserve layout and stickers as they are managed independently in the store
            layout: state.formData.layout,
            stickers: state.formData.stickers,
            // Protect community and language: never overwrite a valid stored value with empty/undefined.
            // react-hook-form doesn't register these as DOM fields, so getValues() can return them
            // as empty after a form reset, causing the persisted selection to be erased.
            community: (data.community && data.community !== "") ? data.community : state.formData.community,
            language: (data.language && data.language !== "") ? data.language : state.formData.language,
            // Protect mantra: prevent undefined (missing key from getValues()) from overwriting
            // a saved community-specific mantra. An explicit empty string IS allowed (user cleared it).
            mantra: (data.mantra !== undefined) ? data.mantra : state.formData.mantra,
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
        fetchCustomTemplates: async (religion) => {
          const state = useBiodataStore.getState();
          // If we already loaded the list of templates (not just a single template by ID), skip fetching page 1 again
          if (state.hasLoadedAllTemplates && state.customTemplates.length > 1) {
            return;
          }
          try {
            const url = religion
              ? `/api/templates?page=1&limit=10&religion=${encodeURIComponent(religion)}`
              : "/api/templates?page=1&limit=10";
            const res = await fetch(url);
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
              registerDynamicTemplates(data.templates);
              if (typeof window !== "undefined") {
                data.templates.forEach((tpl: any) => {
                  if (tpl.thumbnailUrl) {
                    const img = new window.Image();
                    img.src = tpl.thumbnailUrl;
                  }
                  if (tpl.frame?.urlTemplate) {
                    preloadSvg(tpl.frame.urlTemplate);
                  }
                });
              }
              set((state) => {
                const currentSelected = state.selectedTemplate;
                const needsSelection = !currentSelected;
                const defaultTemplate = data.templates.find((t: any) => t.isDefault === true);
                const fallbackTemplateId = defaultTemplate ? defaultTemplate.id : data.templates[0].id;

                const existingTemplates = state.customTemplates || [];
                const mergedTemplates = [...existingTemplates];
                data.templates.forEach((newTpl: any) => {
                  if (!mergedTemplates.some((t) => t.id === newTpl.id)) {
                    mergedTemplates.push(newTpl);
                  }
                });

                return {
                  customTemplates: mergedTemplates,
                  hasLoadedAllTemplates: true,
                  hasMoreTemplates: data.hasMore ?? false,
                  templatePage: 1,
                  ...(needsSelection ? { selectedTemplate: fallbackTemplateId } : {}),
                };
              });
            }
          } catch (err) {
            console.error("Store failed to fetch templates:", err);
          }
        },
        fetchMoreTemplates: async (religion) => {
          const state = useBiodataStore.getState();
          if (state.isFetchingMoreTemplates || !state.hasMoreTemplates) return;
          set({ isFetchingMoreTemplates: true });
          try {
            const nextPage = state.templatePage + 1;
            const url = religion
              ? `/api/templates?page=${nextPage}&limit=10&religion=${encodeURIComponent(religion)}`
              : `/api/templates?page=${nextPage}&limit=10`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
              registerDynamicTemplates(data.templates);
              if (typeof window !== "undefined") {
                data.templates.forEach((tpl: any) => {
                  if (tpl.thumbnailUrl) {
                    const img = new window.Image();
                    img.src = tpl.thumbnailUrl;
                  }
                  if (tpl.frame?.urlTemplate) {
                    preloadSvg(tpl.frame.urlTemplate);
                  }
                });
              }
              set((s) => ({
                customTemplates: [...s.customTemplates, ...data.templates.filter((t: any) => !s.customTemplates.some(e => e.id === t.id))],
                hasMoreTemplates: data.hasMore ?? false,
                templatePage: nextPage,
                isFetchingMoreTemplates: false,
              }));
            } else {
              set({ hasMoreTemplates: false, isFetchingMoreTemplates: false });
            }
          } catch (err) {
            console.error("Store failed to fetch more templates:", err);
            set({ isFetchingMoreTemplates: false });
          }
        },
        fetchInitialTemplate: async (templateId, religion) => {
          try {
            const currentSelected = useBiodataStore.getState().selectedTemplate;
            // If a specific template is requested via URL param, use that; otherwise keep existing selection
            const targetId = templateId || currentSelected || null;

            // Always make sure stored templates are registered in-memory on page load
            const loaded = useBiodataStore.getState().customTemplates;
            if (loaded.length > 0) {
              registerDynamicTemplates(loaded);
            }

            // If we already have templates and the target is loaded, just update selection if needed
            const isTargetLoaded = targetId ? loaded.some((t) => t.id === targetId) : loaded.length > 0;
            if (loaded.length > 0 && isTargetLoaded) {
              if (templateId) {
                set({ selectedTemplate: templateId });
              }
              // Preload target template's frame image to avoid blank flash on screen entry
              const targetTpl = targetId ? loaded.find((t) => t.id === targetId) : loaded[0];
              if (targetTpl && targetTpl.frame?.type === "image" && targetTpl.frame.urlTemplate) {
                await preloadFrameImage(
                  targetTpl.frame.urlTemplate,
                  targetTpl.defaultPrimary,
                  targetTpl.defaultPrimary,
                  targetTpl.defaultAccent || "",
                  targetTpl.defaultAccent || ""
                );
              }
              return;
            }

            // Fetch 10 templates on initial load: default first + 9 more
            let url = "/api/templates?default=true&limit=10";
            if (templateId) {
              url = `/api/templates?id=${templateId}`;
            } else if (religion) {
              url = `/api/templates?default=true&limit=10&religion=${encodeURIComponent(religion)}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
              registerDynamicTemplates(data.templates);
              
              // Find the template that will actually be selected
              const defaultTemplate = data.templates.find((t: any) => t.isDefault === true);
              const fallbackTemplateId = defaultTemplate ? defaultTemplate.id : data.templates[0].id;
              const newSelectedId = templateId ? templateId : (currentSelected || fallbackTemplateId);
              
              const targetTpl = data.templates.find((t: any) => t.id === newSelectedId);

              // Preload target template's frame image first so it renders instantly
              if (targetTpl && targetTpl.frame?.type === "image" && targetTpl.frame.urlTemplate) {
                await preloadFrameImage(
                  targetTpl.frame.urlTemplate,
                  targetTpl.defaultPrimary,
                  targetTpl.defaultPrimary,
                  targetTpl.defaultAccent || "",
                  targetTpl.defaultAccent || ""
                );
              }

              // Also preload thumbnails asynchronously
              if (typeof window !== "undefined") {
                data.templates.forEach((tpl: any) => {
                  if (tpl.thumbnailUrl) {
                    const img = new window.Image();
                    img.src = tpl.thumbnailUrl;
                  }
                  if (tpl.frame?.urlTemplate && tpl.id !== newSelectedId) {
                    preloadSvg(tpl.frame.urlTemplate);
                  }
                });
              }

              set((state) => {
                const existingSelected = state.selectedTemplate;
                const defaultTemplate = data.templates.find((t: any) => t.isDefault === true);
                const fallbackTemplateId = defaultTemplate ? defaultTemplate.id : data.templates[0].id;

                // Merge the new templates into customTemplates
                const existingTemplates = state.customTemplates || [];
                const mergedTemplates = [...existingTemplates];
                data.templates.forEach((newTpl: any) => {
                  if (!mergedTemplates.some((t) => t.id === newTpl.id)) {
                    mergedTemplates.push(newTpl);
                  }
                });

                // Priority: URL param > existing selection > default
                const newSelected = templateId
                  ? templateId
                  : (existingSelected || fallbackTemplateId);

                // If no templateId parameter was requested, we loaded the default first page
                const loadedDefaultPage = !templateId;

                return {
                  customTemplates: mergedTemplates,
                  selectedTemplate: newSelected,
                  ...(loadedDefaultPage ? {
                    hasLoadedAllTemplates: true,
                    templatePage: 1,
                    hasMoreTemplates: data.hasMore ?? false,
                  } : {})
                };
              });
            } else if (templateId) {
              set({ selectedTemplate: templateId });
            }
          } catch (err) {
            console.error("Store failed to fetch initial templates:", err);
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
              stickers: (state.formData.stickers || []).filter((s) => s.isMantra)
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
      merge: (persistedState: any, currentState: any) => {
        return {
          ...currentState,
          ...persistedState,
          formData: {
            ...currentState.formData,
            ...persistedState?.formData,
          }
        };
      },
      version: 2,
    }
  )
);
