import { z } from "zod";

export const FieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  type: z.enum(["text", "date", "time", "time12", "select", "textarea", "number", "company", "hidden"]),
  options: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
  logo: z.string().optional(), // Company logo URL stored by CompanyAutocomplete
});

export const biodataSchema = z.object({
  language: z.string().optional(),
  community: z.string().optional(),
  mantra: z.string().default("॥ श्री गणेशाय नमः ॥"),
  title: z.string().default("Biodata"),
  personalTitle: z.string().optional(),
  educationTitle: z.string().optional(),
  familyTitle: z.string().optional(),
  contactTitle: z.string().optional(),
  personalDetails: z.array(FieldSchema),
  educationDetails: z.array(FieldSchema),
  familyDetails: z.array(FieldSchema),
  contactDetails: z.array(FieldSchema),
  photo: z.string().optional(),
});

export type BiodataFormValues = z.infer<typeof biodataSchema>;
export type BiodataField = z.infer<typeof FieldSchema>;
