"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";

import { useFormContext, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { MantraAutocomplete } from "./MantraAutocomplete";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, ArrowUp, ArrowDown, Sparkles, Loader2, X, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { BiodataFormValues } from "@/types/biodata";
import { LANGUAGES, translations, translateDynamicOption, LANGUAGE_DISPLAY_NAMES, translateUI } from "@/lib/translations";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useShallow } from "zustand/react/shallow";
import { Slider } from "@/components/ui/slider";
import { TEMPLATE_CONFIGS } from "@/lib/frame-config";
import { cn } from "@/lib/utils";

export function BiodataForm({ asDiv = false, hideSliders = false }: { asDiv?: boolean; hideSliders?: boolean } = {}) {
  const { register, setValue, getValues, control } = useFormContext<BiodataFormValues>();
  const watchLang = useWatch({ control, name: "language" });
  const watchPhoto = useWatch({ control, name: "photo" });
  const currentLang = watchLang || "English";

  const [isMantraDialogOpen, setIsMantraDialogOpen] = useState(false);
  const { addSticker, removeSticker, formData, selectedTemplate, customTemplates } = useBiodataStore(useShallow(s => ({
    addSticker: s.addSticker,
    removeSticker: s.removeSticker,
    formData: s.formData,
    selectedTemplate: s.selectedTemplate,
    customTemplates: s.customTemplates,
  })));
  const currentMantraSticker = formData?.stickers?.find((s: any) => s.isMantra);

  const templateConfig = customTemplates.find((t: any) => t.id === selectedTemplate) || TEMPLATE_CONFIGS[selectedTemplate] || TEMPLATE_CONFIGS["royal"];
  const defaultCornerRadius = templateConfig?.photo?.cornerRadius ?? 8;
  const defaultBorderSize = templateConfig?.photo?.showBorder !== false ? 2 : 0;

  const { data: mantraStickers, isLoading: isLoadingMantras } = useQuery({
    queryKey: ["mantraStickers"],
    queryFn: async () => {
      const res = await fetch(`/api/stickers?type=Mantra&limit=100`);
      if (!res.ok) throw new Error("Failed to load mantras");
      const data = await res.json();
      return (data.stickers || []) as { id: string; name: string; url: string }[];
    },
    enabled: isMantraDialogOpen,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60,    // Keep garbage collection time at 1 hour
  });

  const { data: dbMantras } = useQuery({
    queryKey: ["dbMantras"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/mantras`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.mantras || []) as { id: string; text: string; nativeText: string | null; religion: string }[];
    },
    staleTime: 1000 * 60 * 30,
  });

  // One-time cleanup: remove any stray non-standard occupation/profession fields
  // from familyDetails that may have been added by a previous session
  useEffect(() => {
    const standardFamilyIds = new Set([
      "fatherName", "fatherOccupation", "motherName", "motherOccupation",
      "totalBrothers", "totalSisters", "nativePlace"
    ]);
    const family = getValues("familyDetails") || [];
    const cleaned = family.filter(f => {
      // Keep standard fields always
      if (standardFamilyIds.has(f.id)) return true;
      // Keep fields with a value (user typed something)
      if (f.value && f.value.trim()) return true;
      // Remove stray occupation/profession select fields with no value
      const labelLower = (f.label || "").toLowerCase();
      if (f.type === "select" && (labelLower.includes("occupation") || labelLower.includes("profession") || labelLower.includes("व्यवसाय") || labelLower.includes("पेशा"))) {
        return false;
      }
      return true;
    });
    if (cleaned.length !== family.length) {
      setValue("familyDetails", cleaned as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const personal = getValues("personalDetails") || [];
    const hasKuldaivat = personal.some(f => f.id === "kuldaivat");

    const kuldaivatLangs: Record<string, string> = {
      "मराठी": "कुलदैवत",
      "हिंदी": "कुलदेवता",
    };

    const kuldaivatLabel = kuldaivatLangs[currentLang];

    if (kuldaivatLabel) {
      if (!hasKuldaivat) {
        const gotraIdx = personal.findIndex(f => f.id === "gotra");
        const newField = { id: "kuldaivat", label: kuldaivatLabel, value: "", type: "text" as const, isDefault: true };
        const newPersonal = [...personal];
        if (gotraIdx !== -1) {
          newPersonal.splice(gotraIdx + 1, 0, newField);
        } else {
          newPersonal.push(newField);
        }
        setValue("personalDetails", newPersonal);
      }
    } else {
      if (hasKuldaivat) {
        const field = personal.find(f => f.id === "kuldaivat");
        if (field && !field.value) {
          const newPersonal = personal.filter(f => f.id !== "kuldaivat");
          setValue("personalDetails", newPersonal);
        }
      }
    }
  }, [currentLang, setValue, getValues]);

  const handleLanguageChange = (newLang: string | null) => {
    if (!newLang) return;
    setValue("language", newLang);
    const t = translations[newLang];
    if (!t) return;

    // Translate main titles if they match standard
    const currentMantra = getValues("mantra");
    const currentTitle = getValues("title");

    // Check if they are standard (or just overwrite them if default)
    // For simplicity, we just safely overwrite if it's currently a default mantra of ANY language
    // But it's safer to just set it always to the language's default
    setValue("mantra", t.mantra);
    setValue("title", t.title);

    // Translate default fields
    (["personalDetails", "educationDetails", "familyDetails", "contactDetails"] as const).forEach(section => {
      const sectionFields = getValues(section);
      sectionFields?.forEach((field, index) => {
        const fieldKey = field.id || (field.label?.toLowerCase() === "company name" ? "companyName" : "");
        if (fieldKey && t[fieldKey]) {
          setValue(`${section}.${index}.label`, t[fieldKey]);
        } else if (field.isDefault && t[field.id]) {
          setValue(`${section}.${index}.label`, t[field.id]);
        }
      });
    });
  };

  const t = translations[currentLang] || translations["English"];

  const FormComponent = asDiv ? "div" : "form";

  return (
    <FormComponent
      className="space-y-6 pb-0"
      onSubmit={asDiv ? (e: any) => { e.preventDefault(); e.stopPropagation(); } : undefined}
    >
      {/* Language Selector */}
      <div className="bg-card p-4 rounded-lg border flex items-center justify-between mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Globe className="w-5 h-5" />
          <span>Language</span>
        </div>
        <Select value={currentLang} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]" aria-label="Select Language">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang} value={lang}>{LANGUAGE_DISPLAY_NAMES[lang] || lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="privacy-note">
        🔒 {translateUI("privacyNote", currentLang)}
      </p>

      <Accordion type="multiple" defaultValue={["customization", "personal"]} className="w-full">

        {/* CUSTOMIZATION */}
        <AccordionItem id="photo-customization-section" value="customization" className="bg-card px-4 rounded-lg border-0 mb-4 shadow-sm hover:shadow-md transition-shadow premium-gold-border">
          <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Palette className="w-5 h-5" />
              </div>
              {t.photoCustom || "Photo & Customization"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Profile Photo</Label>
              <Controller
                name="photo"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    aspect={3 / 4}
                  />
                )}
              />

              {/* Photo Styling Options */}
              {!hideSliders && (
                <PhotoCustomizationSliders
                  watchPhoto={watchPhoto}
                  defaultCornerRadius={defaultCornerRadius}
                  defaultBorderSize={defaultBorderSize}
                />)}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Mantra / Heading</span>
                  <span className="text-xs font-normal text-muted-foreground">Appears at top of page</span>
                </Label>

                <div className="flex items-stretch gap-3">
                  {/* Premium Sign Selector Thumbnail Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMantraDialogOpen(true)}
                      className={cn(
                        "relative group w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden p-1 shadow-sm",
                        currentMantraSticker
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-dashed border-border/80 bg-muted/20 hover:bg-muted/30 hover:border-primary/40"
                      )}
                      title={currentMantraSticker ? "Change Sign" : "Add Sign"}
                    >
                      {currentMantraSticker ? (
                        <>
                          <img
                            src={currentMantraSticker.type}
                            alt="Selected religious mantra sign"
                            className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Pencil className="w-3.5 h-3.5 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary tracking-tight mt-0.5 text-center leading-none">Add Sign</span>
                        </>
                      )}
                    </button>
                    {currentMantraSticker && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(currentMantraSticker.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 z-20 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer border border-background"
                        title="Remove Sign"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Mantra Input */}
                  <div className="flex-1 flex flex-col justify-center relative">
                    <Controller
                      name="mantra"
                      control={control}
                      render={({ field }) => (
                        <MantraAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g. Shree Ganeshay Namah"
                          mantras={dbMantras || []}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-foreground">Biodata Title</Label>
                <Input id="title" placeholder="e.g. Biodata, Resume" {...register("title")} className="border-border/80 focus-visible:ring-primary/20 bg-card font-semibold" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <FieldSection name="personalDetails" title={t.personal || "Personal Details"} currentLang={currentLang} icon={<User className="w-5 h-5" />} />
        <FieldSection name="educationDetails" title={t.educationSec || "Education & Career"} currentLang={currentLang} icon={<Briefcase className="w-5 h-5" />} />
        <FieldSection name="familyDetails" title={t.family || "Family Background"} currentLang={currentLang} icon={<Users className="w-5 h-5" />} />
        <FieldSection name="contactDetails" title={t.contact || "Contact Details"} currentLang={currentLang} icon={<Phone className="w-5 h-5" />} />

      </Accordion>

      <Dialog open={isMantraDialogOpen} onOpenChange={setIsMantraDialogOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-stitch-outline/20">
          <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-border/50 sticky top-0 bg-card z-10">
            <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Mantra Sign
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Available Signs
                {isLoadingMantras && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </Label>

              {!isLoadingMantras && mantraStickers?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                  No signs available yet.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mantraStickers?.map((sticker) => {
                    const isSelected = currentMantraSticker?.type === sticker.url;
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() => {
                          if (currentMantraSticker) {
                            removeSticker(currentMantraSticker.id);
                          }
                          if (!isSelected) {
                            addSticker({ type: sticker.url, x: 250, y: 50, scaleX: 1, scaleY: 1, isMantra: true });
                          }
                          setIsMantraDialogOpen(false);
                        }}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-xl border-2 bg-white transition-all group overflow-hidden p-2 relative cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border/50 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md"
                        )}
                      >
                        <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-black">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 border-t border-border/50 sticky bottom-0 bg-card z-10 flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-28 rounded-xl border-border/60 hover:bg-muted/50 font-bold transition-all text-muted-foreground hover:text-foreground shadow-sm">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormComponent>
  );
}

const FieldSection = memo(function FieldSection({ name, title, currentLang, icon }: { name: "personalDetails" | "educationDetails" | "familyDetails" | "contactDetails", title: string, currentLang: string, icon: React.ReactNode }) {
  const { control, register } = useFormContext<BiodataFormValues>();
  const { fields, append, remove, swap, update } = useFieldArray({
    control,
    name,
  });

  // Watch ONLY the labels of the fields to prevent typing in values from causing re-renders
  const labelNames = React.useMemo(() => fields.map((_, idx) => `${name}.${idx}.label` as const), [fields.length, name]);
  const watchedLabels = useWatch({
    control,
    name: labelNames
  });

  // Watch ONLY the options of the fields to prevent typing in values from causing re-renders
  const optionNames = React.useMemo(() => fields.map((_, idx) => `${name}.${idx}.options` as const), [fields.length, name]);
  const watchedOptions = useWatch({
    control,
    name: optionNames
  });

  const [dialogState, setDialogState] = useState<{ isOpen: boolean; index: number; options: string[]; label: string } | null>(null);
  const [customInput, setCustomInput] = useState("");
  const { setValue, getValues } = useFormContext<BiodataFormValues>();

  const t = translations[currentLang] || translations["English"];
  const customFieldLabel = t.customField || "Custom Field";
  const addMoreFieldLabel = t.addMoreField || "Add More Field";

  return (
    <AccordionItem value={name.replace('Details', '')} className="bg-card px-4 rounded-lg border-0 mb-4 shadow-sm hover:shadow-md transition-shadow premium-gold-border">
      <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2 overflow-hidden">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4">
          {fields.map((field, index) => {
            if (field.type === "hidden") {
              return (
                <input
                  key={field.id}
                  type="hidden"
                  {...register(`${name}.${index}.value` as const)}
                />
              );
            }
            const isAnnualIncome = field.id === "annualIncome" ||
              field.label?.trim().toLowerCase() === "annual income" ||
              field.label?.trim() === "वार्षिक आय" ||
              field.label?.trim() === "वार्षिक उत्पन्न" ||
              field.label?.trim() === "વાર્ષિક આવક" ||
              field.label?.trim() === "বার্ষিক আয়" ||
              field.label?.trim() === "ஆண்டு வருமானம்" ||
              field.label?.trim() === "వార్షిక ఆదాయం" ||
              field.label?.trim() === "ವಾರ್ಷಿಕ ಆದಾಯ" ||
              field.label?.trim() === "ਸਾਲਾਨਾ ਆਮਦਨ" ||
              field.label?.trim() === "سالانہ آمدنی";
            const isParentOccupation = field.id === "fatherOccupation" || field.id === "motherOccupation" ||
              field.label?.trim().toLowerCase() === "father's occupation" ||
              field.label?.trim().toLowerCase() === "mother's occupation" ||
              (t.fatherOccupation && field.label?.trim() === t.fatherOccupation) ||
              (t.motherOccupation && field.label?.trim() === t.motherOccupation);

            let fieldType = isAnnualIncome ? "text" : field.type;
            // Force select for parent occupation fields even if type got lost
            if (isParentOccupation) {
              fieldType = "select";
            }

            const liveLabel = watchedLabels[index] || field.label;
            return (
              <motion.div key={field.id} className="flex flex-col gap-1 relative group px-1 py-0.5 bg-card z-10">
                <div className="flex items-center justify-between mb-1">
                  <EditableLabel name={`${name}.${index}.label`} value={liveLabel} />

                  <div className="flex items-center gap-0.5">
                    <button type="button" disabled={index === 0} onClick={() => swap(index, index - 1)} className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-30 disabled:hover:text-muted-foreground cursor-pointer" title="Move Up">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" disabled={index === fields.length - 1} onClick={() => swap(index, index + 1)} className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-30 disabled:hover:text-muted-foreground cursor-pointer" title="Move Down">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(index)} className="text-destructive/70 hover:text-destructive transition-colors p-1 shrink-0 cursor-pointer" title="Remove Field">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {fieldType === "select" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: selectField }) => {
                      const parentOccupationOptions = [
                        "Software Engineer", "Doctor", "Teacher / Professor", "Government Job", "Business",
                        "Self Employed", "Banker", "CA / Accountant", "Lawyer", "Engineer (Non-IT)",
                        "Defense / Police", "Private Job", "Retired", "Homemaker", "Not Working", "Other"
                      ];
                      const liveOptions = (watchedOptions[index] as string[] | undefined) 
                        || field.options 
                        || (isParentOccupation ? parentOccupationOptions : []);
                      return (
                        <Select onValueChange={(val) => {
                          if (val === "Other") {
                            setDialogState({ isOpen: true, index, options: liveOptions || [], label: liveLabel });
                            selectField.onChange("Other");
                          } else {
                            selectField.onChange(val);
                          }
                        }} value={selectField.value}>
                          <SelectTrigger aria-label={`Select ${liveLabel}`}>
                            <SelectValue placeholder={currentLang === "English" ? `${t.select || "Select"} ${liveLabel}` : `${liveLabel} ${t.select || "Select"}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {liveOptions?.map((opt: string) => {
                              const isOther = opt === "Other";
                              return (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className={isOther ? "text-primary font-semibold italic border-t border-border/40 mt-1 pt-1 bg-primary/10 rounded-sm" : ""}
                                >
                                  {isOther ? (
                                    <span className="flex items-center gap-1.5">
                                      <Pencil className="w-3 h-3" />
                                      {translateDynamicOption(opt, t, field.id)}
                                    </span>
                                  ) : translateDynamicOption(opt, t, field.id)}
                                </SelectItem>
                              );
                            })}
                            {selectField.value && !liveOptions?.includes(selectField.value) && (
                              <SelectItem key={selectField.value} value={selectField.value}>{translateDynamicOption(selectField.value, t, field.id)}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                ) : fieldType === "company" ? (
                  <>
                    <input type="hidden" {...register(`${name}.${index}.logo` as any)} />
                    <Controller
                      name={`${name}.${index}.value` as const}
                      control={control}
                      render={({ field: compField }) => {
                        return (
                          <CompanyAutocomplete
                            value={compField.value}
                            logo={getValues(`${name}.${index}.logo` as any)}
                            onChange={(val, logo) => {
                              compField.onChange(val);
                              setValue(`${name}.${index}.logo` as any, logo || "");

                              // Backwards compatibility sync for separate hidden logo field
                              const logoIndex = fields.findIndex(f => f.id === "companyLogo");
                              if (logoIndex !== -1) {
                                setValue(`${name}.${logoIndex}.value`, logo || "");
                              } else {
                                setValue(`${name}.${fields.length}`, {
                                  id: "companyLogo",
                                  label: "Company Logo",
                                  value: logo || "",
                                  type: "hidden",
                                  isDefault: false
                                } as any);
                              }
                            }}
                            placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`}
                          />
                        );
                      }}
                    />
                  </>
                ) : fieldType === "time12" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: timeField }) => (
                      <TimePickerPopover
                        value={timeField.value || "10:00 (Morning)"}
                        onChange={timeField.onChange}
                        t={t}
                      />
                    )}
                  />
                ) : fieldType === "date" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: dateField }) => (
                      <DatePickerPopover
                        value={dateField.value}
                        onChange={dateField.onChange}
                        currentLang={currentLang}
                        t={t}
                      />
                    )}
                  />
                ) : fieldType === "textarea" ? (
                  <Textarea {...register(`${name}.${index}.value` as const)} placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`} />
                ) : (
                  <Input type={fieldType} {...register(`${name}.${index}.value` as const)} placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`} />
                )}
              </motion.div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-full border-dashed text-muted-foreground hover:text-primary"
          onClick={() => append({ id: Date.now().toString(), label: customFieldLabel, value: "", type: "text" })}
        >
          <Plus className="w-4 h-4 mr-2" /> {addMoreFieldLabel}
        </Button>
      </AccordionContent>

      <Dialog open={!!dialogState?.isOpen} onOpenChange={(open) => {
        if (!open && dialogState) {
          const currentValue = getValues(`${name}.${dialogState.index}.value` as any);
          if (currentValue === "Other") {
            setValue(`${name}.${dialogState.index}.value` as any, "");
          }
          setDialogState(null);
          setCustomInput("");
        }
      }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t.addNew || "Add New"} {dialogState?.label}</DialogTitle>
          </DialogHeader>
          <Input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${dialogState?.label || ""}` : `${dialogState?.label || ""} ${t.enter || "Enter"}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('add-custom-option-btn')?.click();
              }
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" variant="outline" onClick={() => {
                if (dialogState) {
                  const currentValue = getValues(`${name}.${dialogState.index}.value` as any);
                  if (currentValue === "Other") {
                    setValue(`${name}.${dialogState.index}.value` as any, "");
                  }
                }
                setDialogState(null);
                setCustomInput("");
              }} className="w-full sm:w-24 rounded-xl border-border/60 hover:bg-muted/50 font-bold transition-all text-muted-foreground hover:text-foreground shadow-sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" id="add-custom-option-btn" onClick={() => {
              if (customInput.trim() && dialogState) {
                const newOptions = [...dialogState.options];
                const otherIdx = newOptions.indexOf("Other");
                if (otherIdx !== -1) {
                  newOptions.splice(otherIdx, 0, customInput.trim());
                } else {
                  newOptions.push(customInput.trim());
                }

                // Use useFieldArray's update to correctly modify the field's options and selected value in sync
                update(dialogState.index, {
                  ...fields[dialogState.index],
                  options: newOptions,
                  value: customInput.trim()
                });

                setCustomInput("");
                setDialogState(null);
              }
            }} className="w-full sm:w-24 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
});

const EditableLabel = memo(function EditableLabel({ name, value }: { name: string, value: string }) {
  const { register } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { ref: formRef, ...rest } = register(name);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        {...rest}
        ref={(e) => {
          formRef(e);
          inputRef.current = e;
        }}
        onBlur={(e) => {
          rest.onBlur(e);
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setIsEditing(false);
          }
        }}
        className="h-7 px-1 py-0 text-sm font-semibold border-transparent focus-visible:ring-1 focus-visible:ring-ring bg-transparent shadow-none truncate w-[150px]"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 cursor-pointer group/label"
      onClick={() => setIsEditing(true)}
      title="Click to edit label"
    >
      <span className="text-sm font-semibold truncate text-foreground">{value || "Label"}</span>
      <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover/label:text-primary transition-colors shrink-0" />
    </div>
  );
});

const COMPANY_OPTIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "TCS (Tata Consultancy Services)",
  "Infosys",
  "Wipro",
  "Cognizant",
  "Accenture",
  "Capgemini",
  "Tech Mahindra",
  "HCL Technologies",
  "IBM",
  "Oracle",
  "Cisco",
  "Adobe",
  "Salesforce",
  "Deloitte",
  "PwC",
  "EY (Ernst & Young)",
  "KPMG",
  "J.P. Morgan",
  "Morgan Stanley",
  "Goldman Sachs",
  "Other"
];

interface PremiumSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

function PremiumSelect({ value, onChange, options, placeholder }: PremiumSelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-input text-sm rounded-md h-9 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%237C726C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat transition-all text-foreground"
      >
        <option value="" disabled className="text-muted-foreground">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-sm text-foreground bg-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const PhotoCustomizationSliders = memo(function PhotoCustomizationSliders({ watchPhoto, defaultCornerRadius, defaultBorderSize }: { watchPhoto: any, defaultCornerRadius: number, defaultBorderSize: number }) {
  const photoCornerRadius = useThemeStore(s => s.photoCornerRadius);
  const photoBorderSize = useThemeStore(s => s.photoBorderSize);
  const setPhotoCornerRadius = useThemeStore(s => s.setPhotoCornerRadius);
  const setPhotoBorderSize = useThemeStore(s => s.setPhotoBorderSize);
  const photoScale = useThemeStore(s => s.photoScale);
  const setPhotoScale = useThemeStore(s => s.setPhotoScale);

  const photoXOffset = useThemeStore(s => s.photoXOffset);
  const photoYOffset = useThemeStore(s => s.photoYOffset);
  const setPhotoXOffset = useThemeStore(s => s.setPhotoXOffset);
  const setPhotoYOffset = useThemeStore(s => s.setPhotoYOffset);

  if (!watchPhoto) return null;

  const hasOffset = (photoXOffset !== 0) || (photoYOffset !== 0);

  return (
    <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase">Corner Radius</Label>
        <Slider
          value={[photoCornerRadius ?? defaultCornerRadius]}
          min={0}
          max={100}
          step={1}
          onValueChange={([val]) => setPhotoCornerRadius(val)}
          className="w-full"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase">Border Size {photoBorderSize}</Label>
        <Slider
          value={[photoBorderSize ?? defaultBorderSize]}
          min={0}
          max={5}
          step={0.5}
          onValueChange={([val]) => setPhotoBorderSize(val)}
          className="w-full"
        />
      </div>
      <div className="space-y-3 col-span-2 pt-2 border-t border-border/50">
        <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
          <span>Photo Scale</span>
          <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">{photoScale ?? 100}%</span>
        </Label>
        <Slider
          value={[photoScale ?? 100]}
          min={50}
          max={200}
          step={1}
          onValueChange={([val]) => setPhotoScale(val)}
          className="w-full"
        />
      </div>
      <div className="col-span-2 pt-2 border-t border-border/50 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Drag photo on preview to reposition
          </span>
          {hasOffset && (
            <button
              type="button"
              onClick={() => {
                setPhotoXOffset(0);
                setPhotoYOffset(0);
              }}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-2 py-1 rounded transition-colors"
            >
              Reset Position
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const TimePickerPopover = ({ value, onChange, t }: { value: string; onChange: (val: string) => void; t: Record<string, string> }) => {
  const parts = value.match(/(\d{1,2}):(\d{2})\s*(?:\((.*)\))?/i);
  const hhPart = parts?.[1] ?? "10";
  const mmPart = parts?.[2] ?? "00";
  const periodPart = parts?.[3] ?? "Morning";

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const updateValue = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} (${p})`);
  };

  const hourScrollContainerRef = useRef<HTMLDivElement>(null);
  const minuteScrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const activeHourElem = hourScrollContainerRef.current?.querySelector('[data-active="true"]');
        activeHourElem?.scrollIntoView({ block: "center", behavior: "auto" });

        const activeMinuteElem = minuteScrollContainerRef.current?.querySelector('[data-active="true"]');
        activeMinuteElem?.scrollIntoView({ block: "center", behavior: "auto" });
      }, 50);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10 border-input/30 bg-card hover:bg-muted/40 shadow-sm rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground opacity-70 shrink-0" />
            <span>{translateDynamicOption(value, t) || "Select Time..."}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-popover text-popover-foreground rounded-xl border shadow-lg flex flex-col gap-3 z-[9999]" align="start">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Period / Time of Day</span>
          <div className="grid grid-cols-5 gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border/20">
            {["Early Morning", "Morning", "Afternoon", "Evening", "Night"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateValue(hhPart, mmPart, p)}
                className={cn(
                  "text-[9px] py-1.5 rounded-md font-bold transition-all truncate px-0.5 text-center",
                  periodPart === p
                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                {t[p] || p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-3 border-border/40">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">Hour</span>
            <div
              ref={hourScrollContainerRef}
              className="h-44 overflow-y-auto border border-border/30 rounded-lg p-1 bg-muted/10 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-muted"
            >
              {hours.map((h) => {
                const isActive = hhPart === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => updateValue(h, mmPart, periodPart)}
                    className={cn(
                      "py-1.5 px-3 rounded-md text-sm font-semibold transition-all text-center",
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/20 scale-[1.02]"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">Minute</span>
            <div
              ref={minuteScrollContainerRef}
              className="h-44 overflow-y-auto border border-border/30 rounded-lg p-1 bg-muted/10 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-muted"
            >
              {minutes.map((m) => {
                const isActive = mmPart === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => updateValue(hhPart, m, periodPart)}
                    className={cn(
                      "py-1.5 px-3 rounded-md text-sm font-semibold transition-all text-center",
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/20 scale-[1.02]"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const DatePickerPopover = ({ value, onChange, currentLang, t }: { value: string; onChange: (val: string) => void; currentLang: string; t: Record<string, string> }) => {
  const parts = value ? value.split("-") : [];
  const selectedYear = parts[0] ? parseInt(parts[0], 10) : null;
  const selectedMonth = parts[1] ? parseInt(parts[1], 10) - 1 : null;
  const selectedDay = parts[2] ? parseInt(parts[2], 10) : null;

  const [viewYear, setViewYear] = useState(selectedYear || 1995);
  const [viewMonth, setViewMonth] = useState(selectedMonth !== null ? selectedMonth : 0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedYear) setViewYear(selectedYear);
    if (selectedMonth !== null) setViewMonth(selectedMonth);
  }, [value, isOpen]);

  const getLocaleCode = (lang: string) => {
    const map: Record<string, string> = {
      "English": "en",
      "हिंदी": "hi",
      "मराठी": "mr",
      "ગુજરાતી": "gu",
      "বাংলা": "bn",
      "தமிழ்": "ta",
      "తెలుగు": "te",
      "ಕನ್ನಡ": "kn",
      "ਪੰਜਾਬੀ": "pa",
      "اردو": "ur"
    };
    return map[lang] || "en";
  };

  const getNumberingSystem = (lang: string) => {
    const map: Record<string, string> = {
      "हिंदी": "deva",
      "मराठी": "deva",
      "ગુજરાતી": "gujr",
      "বাংলা": "beng",
      "ಕನ್ನಡ": "knda",
      "ਪੰਜਾਬੀ": "guru",
      "اردو": "arabext"
    };
    return map[lang] || "latn";
  };

  const locale = getLocaleCode(currentLang);
  const numSys = getNumberingSystem(currentLang);

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: monthFormatter.format(new Date(2000, i, 1))
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => 1940 + i).reverse();

  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    return dayFormatter.format(new Date(2026, 5, 7 + i));
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const cells: { dayNum: number | null; isCurrent: boolean }[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dayNum: null, isCurrent: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ dayNum: i, isCurrent: true });
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = (viewMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(prev => prev - 1);
      } else {
        setViewMonth(prev => prev - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(prev => prev + 1);
      } else {
        setViewMonth(prev => prev + 1);
      }
    }
  };

  const formatDateLabel = (val: string) => {
    if (!val) return t.selectDate || "Select Date...";
    const [y, m, d] = val.split("-");
    if (!y || !m || !d) return val;
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(dateObj.getTime())) return val;

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      numberingSystem: numSys
    } as any).format(dateObj);
  };

  const dayNumberFormatter = new Intl.NumberFormat(locale, { numberingSystem: numSys });
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false, numberingSystem: numSys });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10 border-input/30 bg-card hover:bg-muted/40 shadow-sm rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground opacity-70 shrink-0" />
            <span>{formatDateLabel(value)}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3 bg-popover text-popover-foreground rounded-xl border shadow-lg flex flex-col gap-3 z-[9999]" align="start">
        <div className="flex items-center justify-between gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1 flex-1 justify-center">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="h-8 py-0 px-2 text-xs font-semibold bg-muted/60 border border-border/20 rounded-lg outline-none focus:ring-1 focus:ring-primary w-[110px] cursor-pointer"
            >
              {months.map(m => (
                <option key={m.value} value={m.value} className="bg-popover text-popover-foreground">
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="h-8 py-0 px-2 text-xs font-semibold bg-muted/60 border border-border/20 rounded-lg outline-none focus:ring-1 focus:ring-primary w-[80px] cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-popover text-popover-foreground">
                  {yearFormatter.format(y)}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-7 text-center">
            {weekdays.map((wd, i) => (
              <span key={i} className="text-[10px] font-bold text-muted-foreground py-0.5">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, idx) => {
              if (cell.dayNum === null) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }

              const isSelected = selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === cell.dayNum;
              const isToday = new Date().getDate() === cell.dayNum && new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear;

              return (
                <button
                  key={`day-${cell.dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(cell.dayNum!)}
                  className={cn(
                    "h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all mx-auto",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm scale-105"
                      : isToday
                        ? "border border-primary text-primary font-bold"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  {dayNumberFormatter.format(cell.dayNum)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


