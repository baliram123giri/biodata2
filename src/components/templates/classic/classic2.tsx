import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function Classic2({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-[210mm] min-h-[297mm] bg-[#FFFBF0] text-[#2A1F1F] shadow-lg rounded-lg p-6 sm:p-8 mx-auto relative border-[3px] border-[#D4AF37] flex flex-col gap-6">
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-primary rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-primary rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-primary rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-primary rounded-br-lg" />

      {/* Header */}
      <div className="text-center space-y-2 relative">
        {data.mantra && (
          <div className="text-primary font-bold text-[13px] italic">
            {data.mantra}
          </div>
        )}
        {data.title && (
          <h1 className="text-[20px] font-extrabold uppercase tracking-[0.2em] text-primary border-y-2 border-primary/30 py-2 inline-block px-8">
            {data.title}
          </h1>
        )}
      </div>

      <div className="space-y-6 relative">
        <TemplateSection title={t.personal || "Personal Details"} fields={data.personalDetails} t={t} data={data} />
        <TemplateSection title={t.educationSec || "Education & Career"} fields={data.educationDetails} t={t} data={data} />
        <TemplateSection title={t.family || "Family Background"} fields={data.familyDetails} t={t} data={data} />
        <TemplateSection title={t.contact || "Contact Details"} fields={data.contactDetails} t={t} data={data} />
      </div>

    </div>
  );
}

function TemplateSection({ title, fields, t, data }: { title: string; fields: any[]; t: Record<string, string>; data: BiodataFormValues }) {
  if (!fields || fields.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-[14px] font-bold text-white bg-primary py-1 px-3 mb-3 rounded-sm inline-block">
        {title}
      </h2>
      <div className="flex flex-col gap-y-2 text-[12.5px] border-l-2 border-primary/10 pl-4">
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
    <div className={`flex gap-2 items-start ${isFullWidth ? 'flex-col' : 'flex-row'}`}>
      <span className={`font-bold text-[#5C4033] shrink-0 ${isFullWidth ? 'w-full' : 'w-24 sm:w-28'}`}>{label}</span>
      {!isFullWidth && <span className="font-bold text-primary shrink-0">▸</span>}
      <span className="font-medium break-words text-gray-800 flex-1 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
