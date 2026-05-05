import { Metadata } from "next";
import { CreateClient } from "./CreateClient";

export const metadata: Metadata = {
  title: "Create Marriage Biodata Online | Free & Professional Builder",
  description: "Start creating your professional marriage biodata now. Easy to use, instant preview, and high-quality PDF download. Choose from 50+ traditional and modern designs.",
  keywords: ["create biodata for marriage", "marriage biodata online", "matrimonial biodata builder", "free biodata format"],
};

export default function CreateBiodataPage() {
  return <CreateClient />;
}
