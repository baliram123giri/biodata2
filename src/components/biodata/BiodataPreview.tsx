import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";

export function BiodataPreview({ data }: { data: BiodataFormValues }) {
  const t = translations[data.language || "English"] || translations["English"];

  return (
    <div className="w-full max-w-[500px] bg-white text-[#2A1F1F] shadow-lg rounded-md p-6 sm:p-8 mx-auto relative border-t-[8px] border-t-primary border-b-[8px] border-b-primary h-auto flex flex-col gap-6">

      {/* Header */}
      <div className="text-center space-y-2">
        {data.mantra && (
          <div className="text-primary font-bold text-[13px]">
            {data.mantra}
          </div>
        )}
        {data.title && (
          <h1 className="text-[18px] font-extrabold uppercase tracking-wider text-primary border-b-2 border-secondary/50 pb-2 inline-block px-4">
            {data.title}
          </h1>
        )}
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        {data.personalDetails && data.personalDetails.length > 0 && (
          <section>
            <h2 className="text-[15px] font-bold text-primary mb-3 border-b border-primary/20 pb-1.5 flex items-center gap-2">
              {t.personal || "Personal Details"}
            </h2>
            <div className="flex flex-col gap-y-2 text-[12.5px]">
              {data.personalDetails.map(field => (
                <PreviewRow key={field.id} label={field.label} value={field.value} type={field.type} t={t} />
              ))}
            </div>
          </section>
        )}

        {/* Education & Career */}
        {data.educationDetails && data.educationDetails.length > 0 && (
          <section>
            <h2 className="text-[15px] font-bold text-primary mb-3 border-b border-primary/20 pb-1.5 flex items-center gap-2">
              {t.educationSec || "Education & Career"}
            </h2>
            <div className="flex flex-col gap-y-2 text-[12.5px]">
              {data.educationDetails.map(field => {
                if (field.type === "hidden") return null;
                let logoUrl;
                if (field.type === "company" || field.id === "companyName") {
                  logoUrl = data.educationDetails.find(f => f.id === "companyLogo")?.value;
                }
                return <PreviewRow key={field.id} label={field.label} value={field.value} type={field.type} t={t} logoUrl={logoUrl} />;
              })}
            </div>
          </section>
        )}

        {/* Family Background */}
        {data.familyDetails && data.familyDetails.length > 0 && (
          <section>
            <h2 className="text-[15px] font-bold text-primary mb-3 border-b border-primary/20 pb-1.5 flex items-center gap-2">
              {t.family || "Family Background"}
            </h2>
            <div className="flex flex-col gap-y-2 text-[12.5px]">
              {data.familyDetails.map(field => {
                if (field.type === "hidden") return null;
                return <PreviewRow key={field.id} label={field.label} value={field.value} type={field.type} t={t} />
              })}
            </div>
          </section>
        )}

        {/* Contact Details */}
        {data.contactDetails && data.contactDetails.length > 0 && (
          <section>
            <h2 className="text-[15px] font-bold text-primary mb-3 border-b border-primary/20 pb-1.5 flex items-center gap-2">
              {t.contact || "Contact Details"}
            </h2>
            <div className="flex flex-col gap-y-2 text-[12.5px]">
              {data.contactDetails.map(field => {
                if (field.type === "hidden") return null;
                return <PreviewRow key={field.id} label={field.label} value={field.value} type={field.type} t={t} />
              })}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}

function PreviewRow({ label, value, type, t, logoUrl }: { label: string; value: string; type?: string; t: Record<string, string>; logoUrl?: string }) {
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
      <span className={`font-semibold text-primary shrink-0 ${isFullWidth ? 'w-full' : 'w-24 sm:w-28'}`}>{label}</span>
      {!isFullWidth && <span className="font-semibold text-primary shrink-0">:</span>}
      <span className="font-medium break-words text-gray-800 flex-1 flex items-center">
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-4 w-4 mr-1.5 object-contain" />}
        {logoUrl ? `(${displayValue})` : displayValue}
      </span>
    </div>
  );
}
