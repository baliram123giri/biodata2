"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";

import { useFormContext, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, ArrowUp, ArrowDown, Sparkles, Loader2 } from "lucide-react";
import type { BiodataFormValues } from "@/types/biodata";
import { LANGUAGES, translations, translateDynamicOption } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { useBiodataStore } from "@/store/useBiodataStore";
import { cn } from "@/lib/utils";

export function BiodataForm({ asDiv = false }: { asDiv?: boolean } = {}) {
  const { register, setValue, getValues, control } = useFormContext<BiodataFormValues>();
  const watchLang = useWatch({ control, name: "language" });
  const currentLang = watchLang || "English";

  const [isMantraDialogOpen, setIsMantraDialogOpen] = useState(false);
  const [mantraReligion, setMantraReligion] = useState("Hindu");
  const { addSticker, removeSticker, formData } = useBiodataStore();
  const currentMantraSticker = formData?.stickers?.find((s: any) => s.isMantra);

  const { data: mantraStickers, isLoading: isLoadingMantras } = useQuery({
    queryKey: ["mantraStickers", mantraReligion],
    queryFn: async () => {
      const res = await fetch(`/api/stickers?type=Mantra&religion=${mantraReligion}&limit=50`);
      if (!res.ok) throw new Error("Failed to load mantras");
      const data = await res.json();
      return (data.stickers || []) as { id: string; name: string; url: string }[];
    },
    enabled: isMantraDialogOpen,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60,    // Keep garbage collection time at 1 hour
  });

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
        if (field.isDefault && t[field.id]) {
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
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="privacy-note">
        🔒 Your details stay on your device. We never store your biodata on our servers.
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
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Mantra / Heading</span>
                  <span className="text-xs font-normal text-muted-foreground">Appears at top of page</span>
                </Label>
                
                <div className="flex items-stretch gap-3">
                  {/* Premium Sign Selector Thumbnail Button */}
                  <button
                    type="button"
                    onClick={() => setIsMantraDialogOpen(true)}
                    className={cn(
                      "relative group w-14 h-14 shrink-0 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden p-1 shadow-sm",
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
                          alt="Selected Sign" 
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

                  {/* Mantra Input */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="relative">
                      <Input 
                        id="mantra" 
                        placeholder="e.g. Shree Ganeshay Namah" 
                        {...register("mantra")} 
                        className="h-14 pr-12 border-border/80 focus-visible:ring-primary/20 bg-card font-medium text-sm"
                      />
                      {currentMantraSticker && (
                        <button
                          type="button"
                          onClick={() => removeSticker(currentMantraSticker.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive/80 hover:text-destructive p-1.5 rounded-full hover:bg-destructive/10 transition-all"
                          title="Remove Sign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-stitch-outline/20">
          <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-border/50 sticky top-0 bg-card z-10">
            <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Mantra Sign
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Religion</Label>
              <Select value={mantraReligion} onValueChange={setMantraReligion}>
                <SelectTrigger className="w-full h-11 border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <SelectValue placeholder="Select Religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                  <SelectItem value="Sikh">Sikh</SelectItem>
                  <SelectItem value="Jain">Jain</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Buddhist">Buddhist</SelectItem>
                  <SelectItem value="All">All Religions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Available Signs
                {isLoadingMantras && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </Label>
              
              {!isLoadingMantras && mantraStickers?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                  No signs available for {mantraReligion} yet.
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
                          addSticker({ type: sticker.url, x: 250, y: 50, scaleX: 1, scaleY: 1, isMantra: true });
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
          
          <DialogFooter className="p-4 md:p-6 border-t border-border/50 sticky bottom-0 bg-card z-10 flex sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsMantraDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormComponent>
  );
}

const FieldSection = memo(function FieldSection({ name, title, currentLang, icon }: { name: "personalDetails" | "educationDetails" | "familyDetails" | "contactDetails", title: string, currentLang: string, icon: React.ReactNode }) {
  const { control, register } = useFormContext<BiodataFormValues>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name,
  });

  // Watch ONLY the labels of the fields to prevent typing in values from causing re-renders
  const watchedLabels = useWatch({
    control,
    name: fields.map((_, idx) => `${name}.${idx}.label` as const)
  });

  // Watch ONLY the options of the fields to prevent typing in values from causing re-renders
  const watchedOptions = useWatch({
    control,
    name: fields.map((_, idx) => `${name}.${idx}.options` as const)
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

              {field.type === "select" ? (
                <Controller
                  name={`${name}.${index}.value` as const}
                  control={control}
                  render={({ field: selectField }) => {
                    const liveOptions = (watchedOptions[index] as string[] | undefined) || field.options;
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
                        <SelectValue placeholder={`${t.select || "Select"} ${liveLabel}...`}>
                          {selectField.value ? translateDynamicOption(selectField.value, t) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {liveOptions?.map((opt: string) => (
                           <SelectItem key={opt} value={opt}>{translateDynamicOption(opt, t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}}
                />
              ) : field.type === "company" ? (
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
                          placeholder={`${t.enter || "Enter"} ${liveLabel}...`} 
                        />
                      );
                    }}
                  />
                </>
              ) : field.type === "time12" ? (
                <Controller
                  name={`${name}.${index}.value` as const}
                  control={control}
                  render={({ field: timeField }) => {
                    const timeValue = timeField.value || "10:00 (Morning)";
                    const parts = timeValue.match(/(\d{1,2}):(\d{2})\s*(?:\((.*)\))?/i);
                    const hhPart: string = (parts?.[1] ?? "10");
                    const mmPart: string = (parts?.[2] ?? "00");
                    const periodPart: string = (parts?.[3] ?? "Morning");

                    const updateValue = (h: string, m: string, p: string) => {
                      timeField.onChange(`${h}:${m} (${p})`);
                    };

                    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
                    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Select value={hhPart} onValueChange={(val) => updateValue(val || "10", mmPart, periodPart)}>
                            <SelectTrigger className="flex-1" aria-label="Select Hour">
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                              {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Select value={mmPart} onValueChange={(val) => updateValue(hhPart, val || "00", periodPart)}>
                            <SelectTrigger className="flex-1" aria-label="Select Minute">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Select value={periodPart} onValueChange={(val) => updateValue(hhPart, mmPart, val || "Morning")}>
                          <SelectTrigger className="w-full" aria-label="Select AM/PM Period">
                            <SelectValue placeholder={t.select || "Select Period"}>
                              {periodPart ? (t[periodPart] || periodPart) : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Early Morning">{t["Early Morning"] || "Early Morning"}</SelectItem>
                            <SelectItem value="Morning">{t.Morning || "Morning"}</SelectItem>
                            <SelectItem value="Afternoon">{t.Afternoon || "Afternoon"}</SelectItem>
                            <SelectItem value="Evening">{t.Evening || "Evening"}</SelectItem>
                            <SelectItem value="Night">{t.Night || "Night"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }}
                />
              ) : field.type === "textarea" ? (
                <Textarea {...register(`${name}.${index}.value` as const)} placeholder={`${t.enter || "Enter"} ${liveLabel}...`} />
              ) : (
                <Input type={field.type} {...register(`${name}.${index}.value` as const)} placeholder={`${t.enter || "Enter"} ${liveLabel}...`} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNew || "Add New"} {dialogState?.label}</DialogTitle>
          </DialogHeader>
          <Input 
            value={customInput} 
            onChange={e => setCustomInput(e.target.value)} 
            placeholder={`${t.enter || "Enter"} ${dialogState?.label || ""}...`} 
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('add-custom-option-btn')?.click();
              }
            }}
          />
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => {
              if (dialogState) {
                const currentValue = getValues(`${name}.${dialogState.index}.value` as any);
                if (currentValue === "Other") {
                  setValue(`${name}.${dialogState.index}.value` as any, "");
                }
              }
              setDialogState(null);
              setCustomInput("");
            }}>Cancel</Button>
            <Button size="sm" id="add-custom-option-btn" onClick={() => {
              if (customInput.trim() && dialogState) {
                const newOptions = [...dialogState.options];
                const otherIdx = newOptions.indexOf("Other");
                if (otherIdx !== -1) {
                  newOptions.splice(otherIdx, 0, customInput.trim());
                } else {
                  newOptions.push(customInput.trim());
                }
                setValue(`${name}.${dialogState.index}.options` as any, newOptions);
                setValue(`${name}.${dialogState.index}.value` as any, customInput.trim());
                setCustomInput("");
                setDialogState(null);
              }
            }}>Add</Button>
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
