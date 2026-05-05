import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function Modern1({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-[#333] shadow-xl rounded-none p-0 mx-auto overflow-hidden border border-gray-200 flex flex-col">
      
      {/* Modern Header */}
      <div className="bg-primary p-8 text-white text-center space-y-2">
        {data.mantra && (
          <div className="text-white/80 font-medium text-[12px] tracking-widest uppercase">
            {data.mantra}
          </div>
        )}
        {data.title && (
          <h1 className="text-[24px] font-light tracking-tight">
            {data.title}
          </h1>
        )}
      </div>

      <div className="p-8 space-y-10">
        <TemplateSection title={t.personal || "Personal"} fields={data.personalDetails} t={t} data={data} />
        <TemplateSection title={t.educationSec || "Education"} fields={data.educationDetails} t={t} data={data} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <TemplateSection title={t.family || "Family"} fields={data.familyDetails} t={t} data={data} />
          <TemplateSection title={t.contact || "Contact"} fields={data.contactDetails} t={t} data={data} />
        </div>
      </div>

      {/* Modern Footer Accent */}
      <div className="h-2 bg-primary w-full mt-auto" />
    </div>
  );
}

function TemplateSection({ title, fields, t, data }: { title: string; fields: any[]; t: Record<string, string>; data: BiodataFormValues }) {
  if (!fields || fields.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-3">
        {title}
        <div className="h-[1px] bg-primary/20 flex-1" />
      </h2>
      <div className="flex flex-col gap-y-3 text-[13px]">
        {fields.map(field => {
          if (field.type === "hidden") return null;
          let logoUrl;
          if (field.type === "company" || field.id === "companyName") {
            logoUrl = data.educationDetails.find(f => f.id === "companyLogo")?.value;
          }
          return <TemplateField key={field.id} label={field.label} value={field.value} type={field.type} t={t} logoUrl={logoUrl} />;
        })}
      </div>
    </section>
  );
}

function TemplateField({ label, value, type, t, logoUrl }: { label: string; value: string; type?: string; t: Record<string, string>; logoUrl?: string }) {
  if (!value) return null;
  const isFullWidth = type === 'textarea';

  let displayValue = translateDynamicOption(value, t);
  
  if (type === "date" && value) {
    const [year, month, day] = value.split("-");
    if (year && month && day) {
      displayValue = `${day}/${month}/${year}`;
    }
  }

  return (
    <div className={`flex flex-col gap-0.5 items-start`}>
      <span className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider`}>{label}</span>
      <span className="font-semibold break-words text-gray-800 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
