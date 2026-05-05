import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function Marathi1({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-[210mm] min-h-[297mm] bg-[#FEF9E7] text-[#2A1F1F] shadow-2xl rounded-sm p-6 sm:p-10 mx-auto relative border-[12px] border-double border-[#800000] flex flex-col gap-6">
      
      {/* Traditional Header */}
      <div className="text-center space-y-3">
        {data.mantra && (
          <div className="text-[#800000] font-bold text-[16px]">
            {data.mantra}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <div className="h-[2px] bg-[#800000] flex-1" />
          {data.title && (
            <h1 className="text-[22px] font-bold text-[#800000] px-4">
              {data.title}
            </h1>
          )}
          <div className="h-[2px] bg-[#800000] flex-1" />
        </div>
      </div>

      <div className="space-y-8">
        <TemplateSection title={t.personal || "Personal"} fields={data.personalDetails} t={t} data={data} />
        <TemplateSection title={t.educationSec || "Education"} fields={data.educationDetails} t={t} data={data} />
        <TemplateSection title={t.family || "Family"} fields={data.familyDetails} t={t} data={data} />
        <TemplateSection title={t.contact || "Contact"} fields={data.contactDetails} t={t} data={data} />
      </div>

      {/* Traditional Footer Accent */}
      <div className="text-center text-[#800000] text-[18px] mt-4 font-bold">
        🚩
      </div>
    </div>
  );
}

function TemplateSection({ title, fields, t, data }: { title: string; fields: any[]; t: Record<string, string>; data: BiodataFormValues }) {
  if (!fields || fields.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-[16px] font-bold text-[#800000] mb-4 text-center border-b-2 border-[#800000]/20 pb-1">
        ॥ {title} ॥
      </h2>
      <div className="grid grid-cols-1 gap-y-2 text-[13px]">
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
    <div className={`flex gap-3 items-start ${isFullWidth ? 'flex-col' : 'flex-row'} border-b border-[#800000]/5 pb-1`}>
      <span className={`font-bold text-[#800000] shrink-0 ${isFullWidth ? 'w-full text-center' : 'w-28 sm:w-32'}`}>{label}</span>
      {!isFullWidth && <span className="font-bold text-[#800000] shrink-0">-</span>}
      <span className="font-semibold break-words text-[#3E2723] flex-1 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
