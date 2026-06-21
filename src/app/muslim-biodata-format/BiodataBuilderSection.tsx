"use client";

import { HomeBiodataBuilder } from "@/components/biodata/HomeBiodataBuilder";

interface Props {
  defaultCommunity: string;
  defaultReligion: string;
  defaultTitle: string;
  defaultTemplateId: string;
  hideCommunityAndReligion: boolean;
  builderTitle?: string;
  builderSubtitle?: React.ReactNode;
  defaultLanguage?: string;
  forceLanguage?: string;
  hideHeader?: boolean;
}

export function BiodataBuilderSection(props: Props) {
  return <HomeBiodataBuilder {...props} />;
}

