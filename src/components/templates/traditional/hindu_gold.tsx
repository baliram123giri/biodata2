import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function HinduGold({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-[#2A1F1F] shadow-2xl rounded-none p-0 mx-auto relative border-[16px] border-[#D4AF37] flex flex-col">
      {/* Ornate Gold Border Inner */}
      <div className="border-[2px] border-primary m-1 flex-1 flex flex-col p-6 sm:p-8">
        
        {/* Ornate Header */}
        <div className="text-center space-y-4 mb-8">
          {data.mantra && (
            <div className="text-primary font-bold text-[18px] bg-secondary/20 py-1 rounded-full border border-secondary/30">
              {data.mantra}
            </div>
          )}
          {data.title && (
            <div className="relative inline-block">
              <h1 className="text-[26px] font-extrabold uppercase tracking-[0.15em] text-primary px-10">
                {data.title}
              </h1>
              <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-secondary" />
              <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-secondary" />
            </div>
          )}
        </div>

        <div className="space-y-8 flex-1">
          <TemplateSection title={t.personal || "Personal"} fields={data.personalDetails} t={t} data={data} />
          <TemplateSection title={t.educationSec || "Education"} fields={data.educationDetails} t={t} data={data} />
          <TemplateSection title={t.family || "Family"} fields={data.familyDetails} t={t} data={data} />
          <TemplateSection title={t.contact || "Contact"} fields={data.contactDetails} t={t} data={data} />
        </div>

        {/* Ornate Footer */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <div className="h-[1px] bg-secondary flex-1" />
          <span className="text-primary text-xl">ॐ</span>
          <div className="h-[1px] bg-secondary flex-1" />
        </div>
      </div>
    </div>
  );
}

function TemplateSection({ title, fields, t, data }: { title: string; fields: any[]; t: Record<string, string>; data: BiodataFormValues }) {
  if (!fields || fields.length === 0) return null;
  
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <h2 className="text-[16px] font-bold text-primary flex-1">
          {title}
        </h2>
        <div className="h-[1px] bg-secondary/30 flex-[4]" />
      </div>
      <div className="grid grid-cols-1 gap-y-3 text-[13px] pl-5">
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
    <div className={`flex gap-3 items-start ${isFullWidth ? 'flex-col' : 'flex-row'}`}>
      <span className={`font-bold text-primary shrink-0 ${isFullWidth ? 'w-full underline decoration-secondary decoration-2 underline-offset-4' : 'w-28 sm:w-32'}`}>{label}</span>
      {!isFullWidth && <span className="font-bold text-secondary shrink-0">::</span>}
      <span className="font-medium break-words text-gray-800 flex-1 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
