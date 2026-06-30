import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Marriage Biodata Online | biodata99.com",
  description: "Customize your matrimonial biodata details, choose colors, select traditional templates, and preview your changes live. Download instantly in PDF or JPG.",
  alternates: {
    canonical: "https://biodata99.com/edit",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
