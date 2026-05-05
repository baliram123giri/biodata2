import type { BiodataFormValues } from "@/types/biodata";
import { Classic1 } from "../templates/classic/classic1";
import { Classic2 } from "../templates/classic/classic2";
import { Modern1 } from "../templates/modern/modern1";
import { Marathi1 } from "../templates/traditional/marathi1";
import { HinduGold } from "../templates/traditional/hindu_gold";

export function BiodataPreview({ data, templateId = "marathi1" }: { data: BiodataFormValues; templateId?: string }) {
  switch (templateId) {
    case "classic1":
      return <Classic1 data={data} />;
    case "classic2":
      return <Classic2 data={data} />;
    case "modern1":
      return <Modern1 data={data} />;
    case "marathi1":
      return <Marathi1 data={data} />;
    case "hindu_gold":
      return <HinduGold data={data} />;
    default:
      return <Classic1 data={data} />;
  }
}
