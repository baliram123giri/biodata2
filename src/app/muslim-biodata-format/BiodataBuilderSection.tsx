"use client";

import dynamic from "next/dynamic";

const HomeBiodataBuilder = dynamic(
  () =>
    import("@/components/biodata/HomeBiodataBuilder").then((m) => m.HomeBiodataBuilder)
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

