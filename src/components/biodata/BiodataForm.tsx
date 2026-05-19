"use client";

import React, { useState, useRef, useEffect, memo } from "react";

import { useFormContext, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette } from "lucide-react";
import type { BiodataFormValues } from "@/types/biodata";
import { LANGUAGES, translations, translateDynamicOption } from "@/lib/translations";

export function BiodataForm() {
  const { register, setValue, getValues, control } = useFormContext<BiodataFormValues>();
  const watchLang = useWatch({ control, name: "language" });
  const currentLang = watchLang || "English";

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

  return (
    <form className="space-y-6 pb-0">
      {/* Language Selector */}
      <div className="bg-card p-4 rounded-lg border flex items-center justify-between mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Globe className="w-5 h-5" />
          <span>Language</span>
        </div>
        <Select value={currentLang} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" defaultValue={["personal", "education", "family", "contact", "customization"]} className="w-full">
        
        {/* CUSTOMIZATION */}
        <AccordionItem value="customization" className="bg-card px-4 rounded-lg border mb-4 shadow-sm hover:shadow-md transition-shadow">
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

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mantra">Mantra / Heading</Label>
                <Input id="mantra" placeholder="e.g. Shree Ganeshay Namah" {...register("mantra")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Biodata Title</Label>
                <Input id="title" placeholder="e.g. Biodata, Resume" {...register("title")} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <FieldSection name="personalDetails" title={t.personal || "Personal Details"} currentLang={currentLang} icon={<User className="w-5 h-5" />} />
        <FieldSection name="educationDetails" title={t.educationSec || "Education & Career"} currentLang={currentLang} icon={<Briefcase className="w-5 h-5" />} />
        <FieldSection name="familyDetails" title={t.family || "Family Background"} currentLang={currentLang} icon={<Users className="w-5 h-5" />} />
        <FieldSection name="contactDetails" title={t.contact || "Contact Details"} currentLang={currentLang} icon={<Phone className="w-5 h-5" />} />

      </Accordion>
    </form>
  );
}

const FieldSection = memo(function FieldSection({ name, title, currentLang, icon }: { name: "personalDetails" | "educationDetails" | "familyDetails" | "contactDetails", title: string, currentLang: string, icon: React.ReactNode }) {
  const { control, register } = useFormContext<BiodataFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const liveFields = useWatch({ control, name }) || [];

  const [dialogState, setDialogState] = useState<{ isOpen: boolean; index: number; options: string[]; label: string } | null>(null);
  const [customInput, setCustomInput] = useState("");
  const { setValue, getValues } = useFormContext<BiodataFormValues>();

  const t = translations[currentLang] || translations["English"];
  const customFieldLabel = t.customField || "Custom Field";
  const addMoreFieldLabel = t.addMoreField || "Add More Field";

  return (
    <AccordionItem value={name.replace('Details', '')} className="bg-card px-4 rounded-lg border mb-4 shadow-sm hover:shadow-md transition-shadow">
      <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map((field, index) => {
            if (field.type === "hidden") return null;
            const liveLabel = liveFields[index]?.label || field.label;
            return (
            <div key={field.id} className={`flex flex-col gap-1 relative group`}>
              <div className="flex items-center justify-between mb-1">
                <EditableLabel name={`${name}.${index}.label`} />
                
                <button type="button" onClick={() => remove(index)} className="text-destructive/70 hover:text-destructive transition-colors p-1 shrink-0 cursor-pointer" title="Remove Field">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {field.type === "select" ? (
                <Controller
                  name={`${name}.${index}.value` as const}
                  control={control}
                  render={({ field: selectField }) => {
                    const liveOptions = liveFields[index]?.options || field.options;
                    return (
                    <Select onValueChange={(val) => {
                      if (val === "Other") {
                        setDialogState({ isOpen: true, index, options: liveOptions || [], label: liveLabel });
                        selectField.onChange("Other");
                      } else {
                        selectField.onChange(val);
                      }
                    }} value={selectField.value}>
                      <SelectTrigger>
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
                <Controller
                  name={`${name}.${index}.value` as const}
                  control={control}
                  render={({ field: compField }) => {
                    return (
                      <CompanyAutocomplete 
                        value={compField.value} 
                        onChange={(val, logo) => {
                           compField.onChange(val);
                           const logoIndex = fields.findIndex(f => f.id === "companyLogo");
                           if (logoIndex !== -1) {
                              setValue(`${name}.${logoIndex}.value`, logo || "");
                           }
                        }} 
                        placeholder={`${t.enter || "Enter"} ${liveLabel}...`} 
                      />
                    );
                  }}
                />
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
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                              {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Select value={mmPart} onValueChange={(val) => updateValue(hhPart, val || "00", periodPart)}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Select value={periodPart} onValueChange={(val) => updateValue(hhPart, mmPart, val || "Morning")}>
                          <SelectTrigger className="w-full">
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
            </div>
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

const EditableLabel = memo(function EditableLabel({ name }: { name: string }) {
  const { register, watch } = useFormContext();
  const value = watch(name);
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
