"use client";

import dynamic from "next/dynamic";

const HomeBiodataBuilder = dynamic(
  () =>
    import("@/components/biodata/HomeBiodataBuilder").then((m) => m.HomeBiodataBuilder),
  {
    loading: () => (
      <div className="w-full min-h-[600px] flex items-center justify-center bg-[#FAF8F3]">
        <div className="w-10 h-10 rounded-full border-4 border-[#0F4C3A]/20 border-t-[#0F4C3A] animate-spin" />
      </div>
    ),
  }
);

interface Props {
  defaultCommunity: string;
  defaultReligion: string;
  defaultTitle: string;
  defaultTemplateId: string;
  hideCommunityAndReligion: boolean;
}

export function BiodataBuilderSection(props: Props) {
  return <HomeBiodataBuilder {...props} />;
}

