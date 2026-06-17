"use client";

import { HomeBiodataBuilder } from "@/components/biodata/HomeBiodataBuilder";

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

