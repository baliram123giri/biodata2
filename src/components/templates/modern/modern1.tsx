import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function Modern1({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-full min-h-[297mm] border border-2 bg-white text-[#333] shadow-xl rounded-none mx-auto relative flex flex-col">
      {/* SVG Frame */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/templates/modern/modern1.svg"
          alt="Frame"
          className="w-full h-full object-fill"
        />
      </div>

      {/* Modern Header - Flex layout to support Photo */}
      <div className="relative z-10 bg-primary p-10 text-white flex items-center justify-between gap-8">
        <div className="flex-1 space-y-2 text-left">
          {data.mantra && (
            <div className="text-white/80 font-medium text-[12px] tracking-[0.3em] uppercase">
              {data.mantra}
            </div>
          )}
          {data.title && (
            <h1 className="text-[32px] font-light tracking-tight border-b border-white/20 pb-2 inline-block">
              {data.title}
            </h1>
          )}
          {/* Main Name from personalDetails if available */}
          <div className="pt-2">
             <p className="text-[14px] text-white/90 italic">Professional Matrimonial Biodata</p>
          </div>
        </div>

        {data.photo && (
          <div className="shrink-0 w-32 h-40 border-4 border-white/20 shadow-2xl rounded-sm overflow-hidden bg-white/10">
            <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="relative z-10 p-10 space-y-10">
        <TemplateSection title={t.personal || "Personal Details"} fields={data.personalDetails} t={t} data={data} />
        <TemplateSection title={t.educationSec || "Education & Career"} fields={data.educationDetails} t={t} data={data} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          <TemplateSection title={t.family || "Family Details"} fields={data.familyDetails} t={t} data={data} />
          <TemplateSection title={t.contact || "Contact Details"} fields={data.contactDetails} t={t} data={data} />
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
      <h2 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] mb-5 flex items-center gap-4">
        {title}
        <div className="h-[1px] bg-primary/10 flex-1" />
      </h2>
      <div className="flex flex-col gap-y-4 text-[13.5px]">
        {fields.map(field => {
          if (field.type === "hidden") return null;

          // Skip occupation fields as they will be merged with names
          if (field.id === "fatherOccupation" || field.id === "motherOccupation") return null;

          let displayValue = field.value;
          let logoUrl;

          // Merge Father's Name and Occupation
          if (field.id === "fatherName") {
            const occupation = fields.find(f => f.id === "fatherOccupation")?.value;
            if (occupation) displayValue = `${field.value} (${occupation})`;
          }

          // Merge Mother's Name and Occupation
          if (field.id === "motherName") {
            const occupation = fields.find(f => f.id === "motherOccupation")?.value;
            if (occupation) displayValue = `${field.value} (${occupation})`;
          }

          if (field.type === "company" || field.id === "companyName") {
            logoUrl = data.educationDetails.find(f => f.id === "companyLogo")?.value;
          }
          
          return <TemplateField key={field.id} label={field.label} value={displayValue} type={field.type} t={t} logoUrl={logoUrl} />;
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
    <div className={`flex flex-col gap-1 items-start`}>
      <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest`}>{label}</span>
      <span className="font-semibold break-words text-gray-800 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
