import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function Classic1({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-full min-h-[297mm] border border-2 bg-white text-[#2A1F1F] shadow-lg rounded-none mx-auto relative flex flex-col">
      {/* SVG Frame */}
      <div className="absolute scale-[1.3] inset-0 z-0 pointer-events-none">
        <img
          src="/templates/classic/classic2.svg"
          alt="Frame"
          className="w-full h-full object-fill"
        />
      </div>

      <div className="relative z-10 px-20 py-16 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {data.mantra && (
            <div className="text-primary font-bold text-[15px]">
              {data.mantra}
            </div>
          )}
          {data.title && (
            <h1 className="text-[22px] font-extrabold uppercase tracking-wider text-primary border-b-2 border-secondary/50 pb-2 inline-block px-4">
              {data.title}
            </h1>
          )}
        </div>

        <div className="space-y-6 ms-10">
          {/* Sections */}
          <TemplateSection title={t.personal || "Personal Details"} fields={data.personalDetails} t={t} data={data} />
          <TemplateSection title={t.educationSec || "Education & Career"} fields={data.educationDetails} t={t} data={data} />
          <TemplateSection title={t.family || "Family Background"} fields={data.familyDetails} t={t} data={data} />
          <TemplateSection title={t.contact || "Contact Details"} fields={data.contactDetails} t={t} data={data} />
        </div>
      </div>

    </div>
  );
}

function TemplateSection({ title, fields, t, data }: { title: string; fields: any[]; t: Record<string, string>; data: BiodataFormValues }) {
  if (!fields || fields.length === 0) return null;

  return (
    <section>
      <h2 className="text-[17px] font-bold text-primary mb-3 border-b border-primary/20 pb-1.5 flex items-center gap-2">
        {title}
      </h2>
      <div className="flex flex-col gap-y-2 text-[14px]">
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
      <span className={`font-semibold text-primary shrink-0 ${isFullWidth ? 'w-full' : 'w-28 sm:w-32'}`}>{label}</span>
      {!isFullWidth && <span className="font-semibold text-primary shrink-0">:</span>}
      <span className="font-bold break-words text-gray-900 flex-1 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
