"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";

import { useFormContext, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { MantraAutocomplete } from "./MantraAutocomplete";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, ArrowUp, ArrowDown, Sparkles, Loader2, X, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { BiodataFormValues } from "@/types/biodata";
import { defaultBiodataValues } from "@/lib/default-biodata";
import { LANGUAGES, translations, translateDynamicOption, LANGUAGE_DISPLAY_NAMES, translateUI } from "@/lib/translations";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useShallow } from "zustand/react/shallow";
import { Slider } from "@/components/ui/slider";
import { TEMPLATE_CONFIGS } from "@/lib/frame-config";
import { cn } from "@/lib/utils";

const COMMUNITY_FIELDS: Record<string, any[]> = {
  Hindu: [
    { id: "religion", label: "Religion", value: "Hindu", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "caste", label: "Caste", value: "", type: "text", isDefault: true },
    { id: "gotra", label: "Gotra", value: "", type: "select", options: [
      "Agastya", "Angirasa", "Atri", "Bharadwaja", "Bhrigu", "Gautama", "Jamadagni", "Kashyapa", "Shandilya", "Vashishta", "Vishvamitra", "Gargya", "Kaushika", "Vatsa", "Mudgala", "Parashara", "Upamanyu", "Harita", "Other"
    ], isDefault: true },
    { id: "rashi", label: "Rashi (Zodiac)", value: "", type: "select", options: ["Mesh (Aries)", "Vrishabh (Taurus)", "Mithun (Gemini)", "Kark (Cancer)", "Singh (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchik (Scorpio)", "Dhanu (Sagittarius)", "Makar (Capricorn)", "Kumbh (Aquarius)", "Meen (Pisces)", "Other"], isDefault: true },
    { id: "nakshatra", label: "Nakshatra", value: "", type: "select", options: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati", "Other"], isDefault: true },
    { id: "manglik", label: "Manglik", value: "", type: "select", options: ["No", "Yes", "Partial (Anshik)", "Don't Know", "Other"], isDefault: true },
  ],
  Muslim: [
    { id: "religion", label: "Religion", value: "Muslim", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "sect", label: "Sect", value: "", type: "select", options: ["Sunni", "Shia", "Bohra", "Ahmadiyya", "Other"], isDefault: true },
    { id: "caste", label: "Caste/Sub-Caste", value: "", type: "text", isDefault: true },
    { id: "namaz", label: "Namaz / Prayer", value: "", type: "select", options: ["5 Times Daily", "Only Friday", "Occasionally", "Other"], isDefault: true },
  ],
  Christian: [
    { id: "religion", label: "Religion", value: "Christian", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "denomination", label: "Denomination", value: "", type: "select", options: ["Roman Catholic", "Protestant", "Pentecostal", "Orthodox", "Anglican", "Methodist", "Baptist", "Other"], isDefault: true },
    { id: "parish", label: "Parish / Church", value: "", type: "text", isDefault: true },
  ],
  Sikh: [
    { id: "religion", label: "Religion", value: "Sikh", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "caste", label: "Caste/Clan", value: "", type: "text", isDefault: true },
    { id: "gotra", label: "Gotra (Goth)", value: "", type: "text", isDefault: true },
    { id: "ancestralVillage", label: "Ancestral Village", value: "", type: "text", isDefault: true },
  ],
  Jain: [
    { id: "religion", label: "Religion", value: "Jain", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "sect", label: "Sect", value: "", type: "select", options: ["Digambar", "Shvetambar", "Other"], isDefault: true },
    { id: "gotra", label: "Gotra", value: "", type: "text", isDefault: true },
    { id: "diet", label: "Dietary Preference", value: "", type: "select", options: ["Jain Vegetarian", "Strict Vegetarian", "Other"], isDefault: true },
  ],
  General: [
    { id: "religion", label: "Religion", value: "", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
  ]
};

const COMMUNITY_HEADER_DEFAULTS: Record<string, Record<string, { mantra: string; title: string }>> = {
  Hindu: {
    English: { mantra: "|| Shree Ganeshay Namah ||", title: "Marriage Biodata" },
    हिंदी: { mantra: "॥ श्री गणेशाय नमः ॥", title: "शादी का बायोडाटा" },
    मराठी: { mantra: "॥ श्री गणेशाय नमः ॥", title: "लग्नाचा बायोडाटा" },
    ગુજરાતી: { mantra: "॥ શ્રી ગણેશાય નમઃ ॥", title: "લગ્નનો બાયોડેટા" },
    বাংলা: { mantra: "॥ শ্রী গণেশায় নমঃ ॥", title: "বিবাহের বায়োডাটা" },
    தமிழ்: { mantra: "॥ ஸ்ரீ கணேசாய நமஃ ॥", title: "திருமண பயோடேட்டா" },
    తెలుగు: { mantra: "॥ శ్రీ గణేసాయ నమః ॥", title: "వివాహ బయోడేటా" },
    ಕನ್ನಡ: { mantra: "॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥", title: "ವಿವಾಹ ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਏ ਨਮਹ ॥", title: "ਵਿਆਹ ਦਾ ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "|| شری گنیشائے نمہ ||", title: "شادی کا بائیو ڈیٹا" }
  },
  Muslim: {
    English: { mantra: "|| Bismillah-ir-Rahman-ir-Rahim ||", title: "Nikah Biodata" },
    हिंदी: { mantra: "॥ बिस्मिल्लाह-हिर-रहमान-निर-रहीम ॥", title: "निकाह बायोडाटा" },
    मराठी: { mantra: "॥ बिस्मिल्लाह-हिर-रहमान-निर-रहीम ॥", title: "निकाह बायोडाटा" },
    ગુજરાતી: { mantra: "॥ બિસ્મિલ્લાહ-હિર-रहમાન-નિર્-રહીમ ॥", title: "નિકાહ બાયોડેટા" },
    বাংলা: { mantra: "|| বিসমিল্লাহির রহমানির রাহিম ||", title: "নিকাহ বায়োডাটা" },
    தமிழ்: { mantra: "|| பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம் ||", title: "நிக்காஹ் பயோடேட்டா" },
    తెలుగు: { mantra: "|| బిస్మిల్లాహిర్ రహ్మానిర్ రహీమ్ ||", title: "నికాహ్ బయోడేటా" },
    ಕನ್ನಡ: { mantra: "|| ಬಿಸ್ಮಿಲ್ಲಾಹಿರ್ ರಹ್ರಾನಿರ್ ರಹೀಮ್ ||", title: "ನಿಕಾಹ್ ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "|| ਬਿਸਮਿੱਲਾਹ-ਹਿਰ-ਰਹਿਮਾਨ-ਨਿਰ-ਰਹੀਮ ||", title: "ਨਿਕਾਹ ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم", title: "نکاح بائیو ڈیٹا" }
  },
  Sikh: {
    English: { mantra: "|| Ek Onkar Satgur Prasad ||", title: "Sikh Marriage Biodata" },
    हिंदी: { mantra: "॥ एक ओंकार सतगुर प्रसाद ॥", title: "सिख विवाह बायोडाटा" },
    मराठी: { mantra: "॥ एक ओंकार सतगुर प्रसाद ॥", title: "शीख विवाह बायोडाटा" },
    ગુજરાતી: { mantra: "॥ એક ઓન્ਕਾਰ સત્ગુર પ્રસાદ ॥", title: "શીખ લગ્ન બાયોડેટા" },
    বাংলা: { mantra: "|| এক ওঙ্কার সৎগুর প্রসাদ ||", title: "শিখ বিবাহের বায়োডাটা" },
    தமிழ்: { mantra: "|| ஏக் ஓங்கார் சத்குர் பிரசாத் ||", title: "சீக்கிய திருமண பயோடேட்டா" },
    తెలుగు: { mantra: "|| ஏక్ ఓంకార్ సత్గుర్ ప్రసాద్ ||", title: "సిక్కు వివాహ బయోడేటా" },
    ಕನ್ನಡ: { mantra: "|| ಏಕ್ ಓಂಕಾರ್ ಸದ್ಗುರ್ ಪ್ರಸಾದ್ ||", title: "ಸಿಖ್ ವಿವಾಹ ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ", title: "ਵਿਆਹ ਦਾ ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "|| اک اونکار ستگر پرساد ||", title: "شادی کا بائیو ڈیٹا" }
  },
  Christian: {
    English: { mantra: "|| Praise the Lord ||", title: "Christian Marriage Biodata" },
    हिंदी: { mantra: "॥ ईश्वर की स्तुति हो ॥", title: "क्रिश्चियन विवाह बायोडाटा" },
    मराठी: { mantra: "॥ प्रभूची स्तुती असो ॥", title: "ख्रिश्चन विवाह बायोडाटा" },
    ગુજરાતી: { mantra: "॥ પ્રભુની સ્તુતિ હો ॥", title: "ખ્રિસ્તી લગ્ન બાયોડેટા" },
    বাংলা: { mantra: "|| প্রভুর প্রশংসা হোক ||", title: "খ্রিস্টান বিবাহের বায়োডাটা" },
    தமிழ்: { mantra: "|| கர்த்தருக்கு ஸ்தோத்திரம் ||", title: "கிறிஸ்தவ திருமண பயோடேட்டா" },
    తెలుగు: { mantra: "|| ప్రభువుకు స్తుతి కలుగును గాక ||", title: "క్రైస్తవ వివాహ బయోడేటా" },
    ಕನ್ನಡ: { mantra: "|| ದೇವರಿಗೆ ಸ್ತೋತ್ರವಾಗಲಿ ||", title: "ಕ್ರಿಶ್ಚಿಯನ್ ವಿವಾಹ ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "|| ਪ੍ਰਭੂ ਦੀ ਉਸਤਤ ਹੋਵੇ ||", title: "ਈਸਾਈ ਵਿਆਹ ਦਾ ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "|| خدا کی تعریف ہو ||", title: "عیسائی شادی کا بائیو ڈیٹا" }
  },
  Jain: {
    English: { mantra: "|| Jai Jinendra ||", title: "Jain Marriage Biodata" },
    हिंदी: { mantra: "॥ जय जिनेंद्र ॥", title: "जैन विवाह बायोडाटा" },
    मराठी: { mantra: "॥ जय जिनेंद्र ॥", title: "जैन विवाह बायोडाटा" },
    ગુજરાતી: { mantra: "॥ જય જિનેન્દ્ર ॥", title: "જૈન લગ્ન બાયોડેટા" },
    বাংলা: { mantra: "|| জয় জিনেন্দ্র ||", title: "জৈন বিবাহের বায়োডাটা" },
    தமிழ்: { mantra: "|| ஜெய் ஜினேந்திரா ||", title: "சைன திருமண பயோடேட்டா" },
    తెలుగు: { mantra: "|| జై జినేంద్ర ||", title: "జైన్ వివాహ బయోడేటా" },
    ಕನ್ನಡ: { mantra: "|| జై ಜಿನೇಂದ್ರ ||", title: "ಜೈನ್ ವಿವಾಹ ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "|| ਜੈ ਜਿਨੇਂਦਰ ||", title: "ਜੈਨ ਵਿਆਹ ਦਾ ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "|| جے جینندرا ||", title: "شادی کا بائیو ڈیٹا" }
  },
  General: {
    English: { mantra: "", title: "Biodata" },
    हिंदी: { mantra: "", title: "बायोडाटा" },
    मराठी: { mantra: "", title: "बायोडाटा" },
    ગુજરાતી: { mantra: "", title: "બાયોડેટા" },
    বাংলা: { mantra: "", title: "বায়োডাটা" },
    தமிழ்: { mantra: "", title: "பയോடேட்டா" },
    తెలుగు: { mantra: "", title: "బయోడేటా" },
    ಕನ್ನಡ: { mantra: "", title: "ಬಯೋಡೇಟಾ" },
    ਪੰਜਾਬੀ: { mantra: "", title: "ਬਾਇਓਡਾਟਾ" },
    اردو: { mantra: "", title: "بائیو ڈیٹا" }
  }
};

const findBestMantraSticker = (stickers: any[], community: string) => {
  if (community === "General") return null;
  
  // 1. Try exact religion match
  let matched = stickers.find(s => s.religion?.toLowerCase() === community.toLowerCase());
  if (matched) return matched;
  
  // 2. Fallback to name-based match
  const nameMap: Record<string, string[]> = {
    Hindu: ["ganesh", "swastik", "om", "kalash"],
    Muslim: ["crescent", "moon", "bismillah", "allah", "mosque"],
    Sikh: ["khanda", "onkar", "sikh"],
    Christian: ["cross", "church", "christian"],
    Jain: ["jain", "mahavir", "swastika"]
  };
  
  const keywords = nameMap[community] || [];
  for (const kw of keywords) {
    matched = stickers.find(s => 
      (s.name || "").toLowerCase().includes(kw) || 
      (s.url || "").toLowerCase().includes(kw)
    );
    if (matched) return matched;
  }
  
  return null;
};

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  "English": {
    "sect": "Sect",
    "denomination": "Denomination",
    "parish": "Parish / Church",
    "diet": "Dietary Preference",
    "ancestralVillage": "Ancestral Village",
    "namaz": "Namaz / Prayer",
  },
  "हिंदी": {
    "sect": "फ़िरक़ा / संप्रदाय",
    "denomination": "पंथ",
    "parish": "पारिश / चर्च",
    "diet": "आहार प्राथमिकता",
    "ancestralVillage": "पैतृक गाँव",
    "namaz": "नमाज़ / प्रार्थना",
  },
  "मराठी": {
    "sect": "पंथ / संप्रदाय",
    "denomination": "पंथ",
    "parish": "पॅरिश / चर्च",
    "diet": "आहार प्राधान्य",
    "ancestralVillage": "मूळ गाव",
    "namaz": "नमाज / प्रार्थना",
  },
  "ગુજરાતી": {
    "sect": "ફિરકો / સંપ્રદાય",
    "denomination": "સંપ્રદાય",
    "parish": "પેરિશ / ચર્ચ",
    "diet": "આહાર પસંદગી",
    "ancestralVillage": "પૂર્વજોનું ગામ",
    "namaz": "નમાઝ / પ્રાર્થના",
  },
  "বাংলা": {
    "sect": "সম্প্রদায়",
    "denomination": "সম্প্রদায়",
    "parish": "প্যারিশ / গির্জা",
    "diet": "খাদ্য পছন্দ",
    "ancestralVillage": "পৈতৃক গ্রাম",
    "namaz": "নামাজ / প্রার্থনা",
  },
  "தமிழ்": {
    "sect": "பிரிவு",
    "denomination": "சமயம்",
    "parish": "பங்கு / தேவாலயம்",
    "diet": "உணவு விருப்பம்",
    "ancestralVillage": "பூர்வீக கிராமம்",
    "namaz": "தொழுகை",
  },
  "తెలుగు": {
    "sect": "శాఖ",
    "denomination": "శాఖ",
    "parish": "పారిష్ / చర్చి",
    "diet": "ఆహార ప్రాధాన్యత",
    "ancestralVillage": "పూర్వీకుల గ్రామం",
    "namaz": "నమాజ్",
  },
  "ಕನ್ನಡ": {
    "sect": "ಪಂಥ",
    "denomination": "ಪಂಥ",
    "parish": "ಪ್ಯಾರಿಷ್ / ಚರ್ಚ್",
    "diet": "आಹಾರದ ಆದ್ಯತೆ",
    "ancestralVillage": "ಪೂರ್ವಜರ ಗ್ರಾಮ",
    "namaz": "ನಮಾಜ್",
  },
  "ਪੰਜਾਬੀ": {
    "sect": "ਫਿਰਕਾ",
    "denomination": "ਫਿਰਕਾ",
    "parish": "ਪੈਰਿਸ਼ / ਚਰਚ",
    "diet": "ਖੁਰਾਕ ਤਰਜੀਹ",
    "ancestralVillage": "ਜੱਦੀ ਪਿੰਡ",
    "namaz": "ਨਮਾਜ਼",
  },
  "اردو": {
    "sect": "فرقہ",
    "denomination": "فرقہ",
    "parish": "چرچ / پیرش",
    "diet": "کھانے کی ترجیح",
    "ancestralVillage": "آبائی گاؤں",
    "namaz": "نماز",
  }
};

const LOCAL_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  "English": {
    "communityLabel": "Community / Religion",
    "communityPlaceholder": "Select Community",
    "langDesc": "Select template language",
    "commDesc": "Tailor input fields dynamically",
    "General": "General / Other",
    "Hindu": "Hindu",
    "Muslim": "Muslim",
    "Sikh": "Sikh",
    "Christian": "Christian",
    "Jain": "Jain",
  },
  "हिंदी": {
    "communityLabel": "समुदाय / धर्म",
    "communityPlaceholder": "समुदाय चुनें",
    "langDesc": "बायोडाटा की भाषा चुनें",
    "commDesc": "इनपुट फ़ील्ड को अनुकूलित करें",
    "General": "सामान्य / अन्य",
    "Hindu": "हिंदू",
    "Muslim": "मुस्लिम",
    "Sikh": "सिख",
    "Christian": "ईसाई",
    "Jain": "जैन",
  },
  "मराठी": {
    "communityLabel": "समुदाय / धर्म",
    "communityPlaceholder": "समुदाय निवडा",
    "langDesc": "बायोडाटाची भाषा निवडा",
    "commDesc": "इनपुट फील्ड सानुकूलित करा",
    "General": "सामान्य / इतर",
    "Hindu": "हिंदू",
    "Muslim": "मुस्लिम",
    "Sikh": "शीख",
    "Christian": "ख्रिश्चन",
    "Jain": "जैन",
  },
  "ગુજરાતી": {
    "communityLabel": "સમુદાય / ધર્મ",
    "communityPlaceholder": "સમુદાય પસંદ કરો",
    "langDesc": "બાયોડેટાની ભાષા પસંદ કરો",
    "commDesc": "ઇનપુટ ફિલ્ડ બદલો",
    "General": "સામાન્ય / અન્ય",
    "Hindu": "હિન્દુ",
    "Muslim": "મુસ્લિમ",
    "Sikh": "શિખ",
    "Christian": "ખ્રિસ્તી",
    "Jain": "જૈન",
  },
  "বাংলা": {
    "communityLabel": "সম্প্রদায় / धर्म",
    "communityPlaceholder": "সম্প্রदाय নির্বাচন করুন",
    "langDesc": "বায়োডাটার ভাষা নির্বাচন করুন",
    "commDesc": "ইনপুট ফিল্ড মানানসই করুন",
    "General": "সাধারণ / অন্যান্য",
    "Hindu": "हिंदू",
    "Muslim": "মুসলিম",
    "Sikh": "শিখ",
    "Christian": "খ্রিস্টান",
    "Jain": "জৈন",
  },
  "தமிழ்": {
    "communityLabel": "சமூகம் / மதம்",
    "communityPlaceholder": "சமூகத்தைத் தேர்ந்தெடுக்கவும்",
    "langDesc": "பயோடேட்டா மொழியைத் தேர்ந்தெடுக்கவும்",
    "commDesc": "உள்ளீட்டு புலங்களை மாற்றுக",
    "General": "பொது / பிற",
    "Hindu": "இந்து",
    "Muslim": "முஸ்லிம்",
    "Sikh": "சீக்கியர்",
    "Christian": "கிறிஸ்தவர்",
    "Jain": "சைனர்",
  },
  "తెలుగు": {
    "communityLabel": "సమూహం / మతం",
    "communityPlaceholder": "సమూహాన్ని ఎంచుకోండి",
    "langDesc": "బయోడేటా భాషను ఎంచుకోండి",
    "commDesc": "ఫీల్డ్లను మార్చండి",
    "General": "సాధారణ / ఇతర",
    "Hindu": "హిందూ",
    "Muslim": "ముస్లిం",
    "Sikh": "సిక్కు",
    "Christian": "క్రైస్తవ",
    "Jain": "జైన్",
  },
  "ಕನ್ನಡ": {
    "communityLabel": "ಸಮುದಾಯ / ಧರ್ಮ",
    "communityPlaceholder": "ಸಮುದಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "langDesc": "ಬಯೋಡೇಟಾ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "commDesc": "ಕ್ಷೇತ್ರಗಳನ್ನು ಬದಲಾಯಿಸಿ",
    "General": "ಸಾನ್ಯ / ಇತರ",
    "Hindu": "ಹಿಂದೂ",
    "Muslim": "ಮುಸ್ಲಿం",
    "Sikh": "ಸಿಖ್",
    "Christian": "ಕ್ರಿಶ್ಚಿಯನ್",
    "Jain": "ಜೈನ್",
  },
  "ਪੰਜਾਬੀ": {
    "communityLabel": "ਭਾਈਚਾਰਾ / ਧਰਮ",
    "communityPlaceholder": "ਭਾਈਚਾਰਾ ਚੁਣੋ",
    "langDesc": "ਬਾਇਓਡਾਟਾ ਭਾਸ਼ਾ ਚੁਣੋ",
    "commDesc": "ਖੇਤਰਾਂ ਨੂੰ ਬਦਲੋ",
    "General": "ਆਮ / ਹੋਰ",
    "Hindu": "ਹਿੰਦੂ",
    "Muslim": "ਮੁਸਲਿਮ",
    "Sikh": "ਸਿੱਖ",
    "Christian": "ਈਸਾਈ",
    "Jain": "ਜੈਨ",
  },
  "اردو": {
    "communityLabel": "برادری / مذہب",
    "communityPlaceholder": "برادری منتخب کریں",
    "langDesc": "بائیو ڈیٹا کی زبان منتخب کریں",
    "commDesc": "ان پٹ فیلڈز کو تبدیل کریں",
    "General": "عام / دیگر",
    "Hindu": "ہندو",
    "Muslim": "مسلمان",
    "Sikh": "سکھ",
    "Christian": "عیسائی",
    "Jain": "جین",
  }
};

export function BiodataForm({ 
  asDiv = false, 
  hideSliders = false,
  hideCommunityAndReligion = false
}: { 
  asDiv?: boolean; 
  hideSliders?: boolean;
  hideCommunityAndReligion?: boolean;
} = {}) {
  const { register, setValue, getValues, control } = useFormContext<BiodataFormValues>();
  const watchLang = useWatch({ control, name: "language" });
  const watchPhoto = useWatch({ control, name: "photo" });
  const currentLang = watchLang || "English";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const communityParam = searchParams.get("community");
      if (communityParam && ["General", "Hindu", "Muslim", "Sikh", "Christian", "Jain"].includes(communityParam)) {
        const currentComm = getValues("community");
        if (currentComm !== communityParam) {
          // Wrap in a tiny timeout to ensure react-hook-form is fully ready
          setTimeout(() => {
            handleCommunityChange(communityParam);
          }, 50);
        }
      }
    }
  }, []);

  const { addSticker, removeSticker, formData, setFormData: setStoredFormData, selectedTemplate, customTemplates } = useBiodataStore(useShallow(s => ({
    addSticker: s.addSticker,
    removeSticker: s.removeSticker,
    formData: s.formData,
    setFormData: s.setFormData,
    selectedTemplate: s.selectedTemplate,
    customTemplates: s.customTemplates,
  })));

  const personalDetails = useWatch({ control, name: "personalDetails" }) || [];
  const religionField = personalDetails.find((f: any) => f.id === "religion");
  const religionValue = religionField?.value || "";

  // Community: read from Zustand store (persisted, survives page navigation) as authoritative source.
  // useWatch catches live user changes inside the form before debounce saves back to store.
  const watchCommunity = useWatch({ control, name: "community" });
  const storedCommunity = formData?.community;
  const selectedCommunity = (
    // Prefer the live form value if it's a known valid community value
    (watchCommunity && ["General", "Hindu", "Muslim", "Sikh", "Christian", "Jain"].includes(watchCommunity))
      ? watchCommunity
      // Fall back to the store's persisted value (reliable across page navigation)
      : (storedCommunity && ["General", "Hindu", "Muslim", "Sikh", "Christian", "Jain"].includes(storedCommunity))
        ? storedCommunity
        // Fall back to the religion field's value
        : (["Hindu", "Muslim", "Sikh", "Christian", "Jain", "General"].includes(religionValue)
          ? religionValue
          : "General")
  );

  const handleCommunityChange = async (community: string) => {
    setValue("community", community);
    // Immediately persist to store — don't wait for the debounced watch subscription.
    // This ensures the value survives navigation before the 400ms debounce fires.
    setStoredFormData({ community });

    // Get current field values to preserve them
    const currentPersonal = getValues("personalDetails") || [];
    const valuesMap = new Map<string, string>();
    currentPersonal.forEach((f: any) => {
      valuesMap.set(f.id, f.value);
    });

    // Core standard fields
    const standardIds = ["fullName", "dateOfBirth", "timeOfBirth", "placeOfBirth", "height", "maritalStatus", "bloodGroup", "complexion"];

    // Build the new personalDetails array
    const newPersonal: any[] = [];

    // 1. Add standard fields with preserved values
    currentPersonal.forEach((f: any) => {
      if (standardIds.includes(f.id)) {
        newPersonal.push({ ...f });
      }
    });

    // If any standard fields are missing, add them from default
    const defaultPersonal = defaultBiodataValues.personalDetails;
    standardIds.forEach(id => {
      if (!newPersonal.some((f: any) => f.id === id)) {
        const defField = defaultPersonal.find(f => f.id === id);
        if (defField) {
          newPersonal.push({ ...defField, value: valuesMap.get(id) || "" });
        }
      }
    });

    // 2. Add community specific fields
    const specFields = COMMUNITY_FIELDS[community] || COMMUNITY_FIELDS.General;
    const currentT = { ...(translations[currentLang] || translations["English"]), ...(LOCAL_TRANSLATIONS[currentLang] || LOCAL_TRANSLATIONS["English"]) };
    
    specFields.forEach(f => {
      // Set the default value or the preserved value
      let val = valuesMap.get(f.id) || f.value || "";
      if (f.id === "religion") {
        val = community === "General" ? (valuesMap.get("religion") || "") : community;
      }
      
      // Also apply translations to label if key exists
      let label = f.label;
      if (currentT[f.id]) {
        label = currentT[f.id];
      }

      newPersonal.push({
        ...f,
        label,
        value: val
      });
    });

    // Update the form values
    setValue("personalDetails", newPersonal);

    // 3. Fill Header Details: Mantra Text and Title Text
    const defaults = COMMUNITY_HEADER_DEFAULTS[community]?.[currentLang] || 
                     COMMUNITY_HEADER_DEFAULTS[community]?.English || 
                     COMMUNITY_HEADER_DEFAULTS.General.English;
    setValue("mantra", defaults.mantra);
    setValue("title", defaults.title);
    // Immediately persist mantra + title to store — don't wait for the 400ms debounce.
    // This ensures the header text survives navigation to the edit page.
    setStoredFormData({ mantra: defaults.mantra, title: defaults.title });
  };

  const [isMantraDialogOpen, setIsMantraDialogOpen] = useState(false);
  const currentMantraSticker = formData?.stickers?.find((s: any) => s.isMantra);

  const templateConfig = customTemplates.find((t: any) => t.id === selectedTemplate) || TEMPLATE_CONFIGS[selectedTemplate] || TEMPLATE_CONFIGS["royal"];
  const defaultCornerRadius = templateConfig?.photo?.cornerRadius ?? 8;
  const defaultBorderSize = templateConfig?.photo?.showBorder !== false ? 2 : 0;

  const { data: mantraStickers, isLoading: isLoadingMantras } = useQuery({
    queryKey: ["mantraStickers", selectedCommunity, hideCommunityAndReligion],
    queryFn: async () => {
      const targetReligion = hideCommunityAndReligion ? "Muslim" : (selectedCommunity !== "General" ? selectedCommunity : "");
      const url = `/api/stickers?type=Mantra&limit=100${targetReligion ? `&religion=${targetReligion}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load mantras");
      const data = await res.json();
      let stickers = (data.stickers || []) as { id: string; name: string; url: string; religion?: string }[];
      if (hideCommunityAndReligion) {
        stickers = stickers.filter(s => s.religion?.toLowerCase() === "muslim");
      }
      return stickers;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60,    // Keep garbage collection time at 1 hour
  });

  const { data: dbMantras } = useQuery({
    queryKey: ["dbMantras"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/mantras`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.mantras || []) as { id: string; text: string; nativeText: string | null; religion: string }[];
    },
    staleTime: 1000 * 60 * 30,
  });

  // One-time cleanup: remove any stray non-standard occupation/profession fields
  // from familyDetails that may have been added by a previous session
  useEffect(() => {
    const standardFamilyIds = new Set([
      "fatherName", "fatherOccupation", "motherName", "motherOccupation",
      "totalBrothers", "totalSisters", "nativePlace"
    ]);
    const family = getValues("familyDetails") || [];
    const cleaned = family.filter(f => {
      // Keep standard fields always
      if (standardFamilyIds.has(f.id)) return true;
      // Keep fields with a value (user typed something)
      if (f.value && f.value.trim()) return true;
      // Remove stray occupation/profession select fields with no value
      const labelLower = (f.label || "").toLowerCase();
      if (f.type === "select" && (labelLower.includes("occupation") || labelLower.includes("profession") || labelLower.includes("व्यवसाय") || labelLower.includes("पेशा"))) {
        return false;
      }
      return true;
    });
    if (cleaned.length !== family.length) {
      setValue("familyDetails", cleaned as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const personal = getValues("personalDetails") || [];
    const hasKuldaivat = personal.some(f => f.id === "kuldaivat");

    const kuldaivatLangs: Record<string, string> = {
      "मराठी": "कुलदैवत",
      "हिंदी": "कुलदेवता",
    };

    const kuldaivatLabel = kuldaivatLangs[currentLang];

    if (kuldaivatLabel) {
      if (!hasKuldaivat) {
        const gotraIdx = personal.findIndex(f => f.id === "gotra");
        const newField = { id: "kuldaivat", label: kuldaivatLabel, value: "", type: "text" as const, isDefault: true };
        const newPersonal = [...personal];
        if (gotraIdx !== -1) {
          newPersonal.splice(gotraIdx + 1, 0, newField);
        } else {
          newPersonal.push(newField);
        }
        setValue("personalDetails", newPersonal);
      }
    } else {
      if (hasKuldaivat) {
        const field = personal.find(f => f.id === "kuldaivat");
        if (field && !field.value) {
          const newPersonal = personal.filter(f => f.id !== "kuldaivat");
          setValue("personalDetails", newPersonal);
        }
      }
    }
  }, [currentLang, setValue, getValues]);

  const handleLanguageChange = (newLang: string | null) => {
    if (!newLang) return;
    setValue("language", newLang);
    // Immediately persist language to store — don't wait for the 400ms debounce.
    setStoredFormData({ language: newLang });
    const baseT = translations[newLang];
    if (!baseT) return;
    const t = { ...baseT, ...(LOCAL_TRANSLATIONS[newLang] || LOCAL_TRANSLATIONS["English"]) };

    // Translate main titles if they match standard
    const currentMantra = getValues("mantra");
    const currentTitle = getValues("title");

    // Check if they are standard (or just overwrite them if default)
    // For simplicity, we just safely overwrite if it's currently a default mantra of ANY language
    // But it's safer to just set it always to the language's default
    setValue("mantra", t.mantra);
    setValue("title", t.title);

    // Translate default fields
    (["personalDetails", "educationDetails", "familyDetails", "contactDetails"] as const).forEach(section => {
      const sectionFields = getValues(section);
      sectionFields?.forEach((field, index) => {
        const fieldKey = field.id || (field.label?.toLowerCase() === "company name" ? "companyName" : "");
        if (fieldKey && t[fieldKey]) {
          setValue(`${section}.${index}.label`, t[fieldKey]);
        } else if (field.isDefault && t[field.id]) {
          setValue(`${section}.${index}.label`, t[field.id]);
        }
      });
    });
  };

  const t = { ...(translations[currentLang] || translations["English"]), ...(LOCAL_TRANSLATIONS[currentLang] || LOCAL_TRANSLATIONS["English"]) };

  const FormComponent = asDiv ? "div" : "form";

  return (
    <FormComponent
      className="space-y-6 pb-0"
      onSubmit={asDiv ? (e: any) => { e.preventDefault(); e.stopPropagation(); } : undefined}
    >
      {/* Selector Container */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Language Selector */}
        <div className="group relative bg-gradient-to-br from-card to-card/95 p-4 rounded-2xl border border-border/80 hover:border-primary/40 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">Language</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {LOCAL_UI_TRANSLATIONS[currentLang]?.langDesc || LOCAL_UI_TRANSLATIONS["English"].langDesc}
              </span>
            </div>
          </div>
          <Select value={currentLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[160px] bg-background/50 border-border/60 rounded-xl focus:ring-primary hover:bg-background/80 transition-colors" aria-label="Select Language">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/80">
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang} className="focus:bg-primary/10 rounded-lg">{LANGUAGE_DISPLAY_NAMES[lang] || lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Community Selector */}
        {!hideCommunityAndReligion && (
          <div className="group relative bg-gradient-to-br from-card to-card/95 p-4 rounded-2xl border border-border/80 hover:border-primary/40 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">
                  {LOCAL_UI_TRANSLATIONS[currentLang]?.communityLabel || LOCAL_UI_TRANSLATIONS["English"].communityLabel}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {LOCAL_UI_TRANSLATIONS[currentLang]?.commDesc || LOCAL_UI_TRANSLATIONS["English"].commDesc}
                </span>
              </div>
            </div>
            <Select value={selectedCommunity} onValueChange={handleCommunityChange}>
              <SelectTrigger className="w-[160px] bg-background/50 border-border/60 rounded-xl focus:ring-primary hover:bg-background/80 transition-colors" aria-label="Select Community">
                <SelectValue placeholder={LOCAL_UI_TRANSLATIONS[currentLang]?.communityPlaceholder || LOCAL_UI_TRANSLATIONS["English"].communityPlaceholder} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80">
                {["General", "Hindu", "Muslim", "Sikh", "Christian", "Jain"].map(comm => (
                  <SelectItem key={comm} value={comm} className="focus:bg-primary/10 rounded-lg">
                    {LOCAL_UI_TRANSLATIONS[currentLang]?.[comm] || LOCAL_UI_TRANSLATIONS["English"][comm]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <p className="privacy-note">
        🔒 {translateUI("privacyNote", currentLang)}
      </p>

      <Accordion type="multiple" defaultValue={["customization", "personal"]} className="w-full">

        {/* CUSTOMIZATION */}
        <AccordionItem id="photo-customization-section" value="customization" className="bg-card px-4 rounded-lg border-0 mb-4 shadow-sm hover:shadow-md transition-shadow premium-gold-border">
          <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Palette className="w-5 h-5" />
              </div>
              {t.photoCustom || "Photo & Customization"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Profile Photo</Label>
              <Controller
                name="photo"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    aspect={3 / 4}
                  />
                )}
              />

              {/* Photo Styling Options */}
              {!hideSliders && (
                <PhotoCustomizationSliders
                  watchPhoto={watchPhoto}
                  defaultCornerRadius={defaultCornerRadius}
                  defaultBorderSize={defaultBorderSize}
                />)}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Mantra / Heading</span>
                  <span className="text-xs font-normal text-muted-foreground">Appears at top of page</span>
                </Label>

                <div className="flex items-stretch gap-3">
                  {/* Premium Sign Selector Thumbnail Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMantraDialogOpen(true)}
                      className={cn(
                        "relative group w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden p-1 shadow-sm",
                        currentMantraSticker
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-dashed border-border/80 bg-muted/20 hover:bg-muted/30 hover:border-primary/40"
                      )}
                      title={currentMantraSticker ? "Change Sign" : "Add Sign"}
                    >
                      {currentMantraSticker ? (
                        <>
                          <img
                            src={currentMantraSticker.type}
                            alt="Selected religious mantra sign"
                            className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Pencil className="w-3.5 h-3.5 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary tracking-tight mt-0.5 text-center leading-none">Add Sign</span>
                        </>
                      )}
                    </button>
                    {currentMantraSticker && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(currentMantraSticker.id);
                        }}
                        className="absolute -top-4 -right-4 z-20 w-12 h-12 flex items-center justify-center cursor-pointer group/remove"
                        aria-label="Remove Sign"
                        title="Remove Sign"
                      >
                        <div className="bg-destructive text-destructive-foreground group-hover/remove:bg-destructive/90 rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-transform group-active/remove:scale-95 border-2 border-background">
                          <X className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Mantra Input */}
                  <div className="flex-1 flex flex-col justify-center relative">
                    <Controller
                      name="mantra"
                      control={control}
                      render={({ field }) => (
                        <MantraAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g. Shree Ganeshay Namah"
                          mantras={dbMantras || []}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-foreground">Biodata Title</Label>
                <Input id="title" placeholder="e.g. Biodata, Resume" {...register("title")} className="border-border/80 focus-visible:ring-primary/20 bg-card font-semibold" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <FieldSection name="personalDetails" title={t.personal || "Personal Details"} currentLang={currentLang} icon={<User className="w-5 h-5" />} hideCommunityAndReligion={hideCommunityAndReligion} />
        <FieldSection name="educationDetails" title={t.educationSec || "Education & Career"} currentLang={currentLang} icon={<Briefcase className="w-5 h-5" />} />
        <FieldSection name="familyDetails" title={t.family || "Family Background"} currentLang={currentLang} icon={<Users className="w-5 h-5" />} />
        <FieldSection name="contactDetails" title={t.contact || "Contact Details"} currentLang={currentLang} icon={<Phone className="w-5 h-5" />} />

      </Accordion>

      <Dialog open={isMantraDialogOpen} onOpenChange={setIsMantraDialogOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-stitch-outline/20">
          <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-border/50 sticky top-0 bg-card z-10">
            <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Mantra Sign
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Available Signs
                {isLoadingMantras && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </Label>

              {!isLoadingMantras && mantraStickers?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                  No signs available yet.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mantraStickers?.map((sticker) => {
                    const isSelected = currentMantraSticker?.type === sticker.url;
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() => {
                          if (currentMantraSticker) {
                            removeSticker(currentMantraSticker.id);
                          }
                          if (!isSelected) {
                            addSticker({ type: sticker.url, x: 250, y: 50, scaleX: 1, scaleY: 1, isMantra: true });
                          }
                          setIsMantraDialogOpen(false);
                        }}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-xl border-2 bg-white transition-all group overflow-hidden p-2 relative cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border/50 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md"
                        )}
                      >
                        <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-black">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 border-t border-border/50 sticky bottom-0 bg-card z-10 flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-28 rounded-xl border-border/60 hover:bg-muted/50 font-bold transition-all text-muted-foreground hover:text-foreground shadow-sm">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormComponent>
  );
}

const FieldSection = memo(function FieldSection({ 
  name, 
  title, 
  currentLang, 
  icon,
  hideCommunityAndReligion = false
}: { 
  name: "personalDetails" | "educationDetails" | "familyDetails" | "contactDetails"; 
  title: string; 
  currentLang: string; 
  icon: React.ReactNode;
  hideCommunityAndReligion?: boolean;
}) {
  const { control, register } = useFormContext<BiodataFormValues>();
  const { fields, append, remove, swap, update } = useFieldArray({
    control,
    name,
  });

  // Watch ONLY the labels of the fields to prevent typing in values from causing re-renders
  const labelNames = React.useMemo(() => fields.map((_, idx) => `${name}.${idx}.label` as const), [fields.length, name]);
  const watchedLabels = useWatch({
    control,
    name: labelNames
  });

  // Watch ONLY the options of the fields to prevent typing in values from causing re-renders
  const optionNames = React.useMemo(() => fields.map((_, idx) => `${name}.${idx}.options` as const), [fields.length, name]);
  const watchedOptions = useWatch({
    control,
    name: optionNames
  });

  const [dialogState, setDialogState] = useState<{ isOpen: boolean; index: number; options: string[]; label: string } | null>(null);
  const [customInput, setCustomInput] = useState("");
  const { setValue, getValues } = useFormContext<BiodataFormValues>();

  const t = translations[currentLang] || translations["English"];
  const customFieldLabel = t.customField || "Custom Field";
  const addMoreFieldLabel = t.addMoreField || "Add More Field";

  return (
    <AccordionItem value={name.replace('Details', '')} className="bg-card px-4 rounded-lg border-0 mb-4 shadow-sm hover:shadow-md transition-shadow premium-gold-border">
      <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2 overflow-hidden">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4">
          {fields.map((field, index) => {
            const isReligion = field.id === "religion" || field.label?.trim().toLowerCase() === "religion" || field.label?.trim() === "धर्म";
            if (field.type === "hidden" || (isReligion && hideCommunityAndReligion)) {
              return (
                <input
                  key={field.id}
                  type="hidden"
                  {...register(`${name}.${index}.value` as const)}
                />
              );
            }
            const isAnnualIncome = field.id === "annualIncome" ||
              field.label?.trim().toLowerCase() === "annual income" ||
              field.label?.trim() === "वार्षिक आय" ||
              field.label?.trim() === "वार्षिक उत्पन्न" ||
              field.label?.trim() === "વાર્ષિક આવક" ||
              field.label?.trim() === "বার্ষিক আয়" ||
              field.label?.trim() === "ஆண்டு வருமானம்" ||
              field.label?.trim() === "వార్షిక ఆదాయం" ||
              field.label?.trim() === "ವಾರ್ಷಿಕ ಆದಾಯ" ||
              field.label?.trim() === "ਸਾਲਾਨਾ ਆਮਦਨ" ||
              field.label?.trim() === "سالانہ آمدنی";
            const isParentOccupation = field.id === "fatherOccupation" || field.id === "motherOccupation" ||
              field.label?.trim().toLowerCase() === "father's occupation" ||
              field.label?.trim().toLowerCase() === "mother's occupation" ||
              (t.fatherOccupation && field.label?.trim() === t.fatherOccupation) ||
              (t.motherOccupation && field.label?.trim() === t.motherOccupation);

            let fieldType = isAnnualIncome ? "text" : field.type;
            // Force select for parent occupation fields even if type got lost
            if (isParentOccupation) {
              fieldType = "select";
            }

            const liveLabel = watchedLabels[index] || field.label;
            return (
              <motion.div key={field.id} className="flex flex-col gap-1 relative group px-1 py-0.5 bg-card z-10">
                <div className="flex items-center justify-between mb-1">
                  <EditableLabel name={`${name}.${index}.label`} value={liveLabel} />

                  <div className="flex items-center gap-0.5">
                    <button type="button" disabled={index === 0} onClick={() => swap(index, index - 1)} className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-30 disabled:hover:text-muted-foreground cursor-pointer" title="Move Up">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" disabled={index === fields.length - 1} onClick={() => swap(index, index + 1)} className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-30 disabled:hover:text-muted-foreground cursor-pointer" title="Move Down">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(index)} className="text-destructive/70 hover:text-destructive transition-colors p-1 shrink-0 cursor-pointer" title="Remove Field">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {fieldType === "select" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: selectField }) => {
                      const parentOccupationOptions = [
                        "Software Engineer", "Doctor", "Teacher / Professor", "Government Job", "Business",
                        "Self Employed", "Banker", "CA / Accountant", "Lawyer", "Engineer (Non-IT)",
                        "Defense / Police", "Private Job", "Retired", "Homemaker", "Not Working", "Other"
                      ];
                      const watched = watchedOptions[index] as string[] | undefined;
                      const liveOptions = (watched && watched.length > 0 ? watched : undefined)
                        ?? field.options
                        ?? (isParentOccupation ? parentOccupationOptions : []);
                      return (
                        <Select onValueChange={(val) => {
                          if (val === "Other") {
                            setDialogState({ isOpen: true, index, options: liveOptions || [], label: liveLabel });
                            selectField.onChange("Other");
                          } else {
                            selectField.onChange(val);
                          }
                        }} value={selectField.value}>
                          <SelectTrigger aria-label={`Select ${liveLabel}`}>
                            <SelectValue placeholder={currentLang === "English" ? `${t.select || "Select"} ${liveLabel}` : `${liveLabel} ${t.select || "Select"}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {liveOptions?.map((opt: string) => {
                              const isOther = opt === "Other";
                              return (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className={isOther ? "text-primary font-semibold italic border-t border-border/40 mt-1 pt-1 bg-primary/10 rounded-sm" : ""}
                                >
                                  {isOther ? (
                                    <span className="flex items-center gap-1.5">
                                      <Pencil className="w-3 h-3" />
                                      {translateDynamicOption(opt, t, field.id)}
                                    </span>
                                  ) : translateDynamicOption(opt, t, field.id)}
                                </SelectItem>
                              );
                            })}
                            {selectField.value && !liveOptions?.includes(selectField.value) && (
                              <SelectItem key={selectField.value} value={selectField.value}>{translateDynamicOption(selectField.value, t, field.id)}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                ) : fieldType === "company" ? (
                  <>
                    <input type="hidden" {...register(`${name}.${index}.logo` as any)} />
                    <Controller
                      name={`${name}.${index}.value` as const}
                      control={control}
                      render={({ field: compField }) => {
                        return (
                          <CompanyAutocomplete
                            value={compField.value}
                            logo={getValues(`${name}.${index}.logo` as any)}
                            onChange={(val, logo) => {
                              compField.onChange(val);
                              setValue(`${name}.${index}.logo` as any, logo || "");

                              // Backwards compatibility sync for separate hidden logo field
                              const logoIndex = fields.findIndex(f => f.id === "companyLogo");
                              if (logoIndex !== -1) {
                                setValue(`${name}.${logoIndex}.value`, logo || "");
                              } else {
                                setValue(`${name}.${fields.length}`, {
                                  id: "companyLogo",
                                  label: "Company Logo",
                                  value: logo || "",
                                  type: "hidden",
                                  isDefault: false
                                } as any);
                              }
                            }}
                            placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`}
                          />
                        );
                      }}
                    />
                  </>
                ) : fieldType === "time12" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: timeField }) => (
                      <TimePickerPopover
                        value={timeField.value || "10:00 (Morning)"}
                        onChange={timeField.onChange}
                        t={t}
                      />
                    )}
                  />
                ) : fieldType === "date" ? (
                  <Controller
                    name={`${name}.${index}.value` as const}
                    control={control}
                    render={({ field: dateField }) => (
                      <DatePickerPopover
                        value={dateField.value}
                        onChange={dateField.onChange}
                        currentLang={currentLang}
                        t={t}
                      />
                    )}
                  />
                ) : fieldType === "textarea" ? (
                  <Textarea {...register(`${name}.${index}.value` as const)} placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`} />
                ) : (
                  <Input type={fieldType} {...register(`${name}.${index}.value` as const)} placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${liveLabel}` : `${liveLabel} ${t.enter || "Enter"}`} />
                )}
              </motion.div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-full border-dashed text-muted-foreground hover:text-primary"
          onClick={() => append({ id: Date.now().toString(), label: customFieldLabel, value: "", type: "text" })}
        >
          <Plus className="w-4 h-4 mr-2" /> {addMoreFieldLabel}
        </Button>
      </AccordionContent>

      <Dialog open={!!dialogState?.isOpen} onOpenChange={(open) => {
        if (!open && dialogState) {
          const currentValue = getValues(`${name}.${dialogState.index}.value` as any);
          if (currentValue === "Other") {
            setValue(`${name}.${dialogState.index}.value` as any, "");
          }
          setDialogState(null);
          setCustomInput("");
        }
      }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t.addNew || "Add New"} {dialogState?.label}</DialogTitle>
          </DialogHeader>
          <Input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={currentLang === "English" ? `${t.enter || "Enter"} ${dialogState?.label || ""}` : `${dialogState?.label || ""} ${t.enter || "Enter"}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('add-custom-option-btn')?.click();
              }
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" variant="outline" onClick={() => {
                if (dialogState) {
                  const currentValue = getValues(`${name}.${dialogState.index}.value` as any);
                  if (currentValue === "Other") {
                    setValue(`${name}.${dialogState.index}.value` as any, "");
                  }
                }
                setDialogState(null);
                setCustomInput("");
              }} className="w-full sm:w-24 rounded-xl border-border/60 hover:bg-muted/50 font-bold transition-all text-muted-foreground hover:text-foreground shadow-sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" id="add-custom-option-btn" onClick={() => {
              if (customInput.trim() && dialogState) {
                const newOptions = [...dialogState.options];
                const otherIdx = newOptions.indexOf("Other");
                if (otherIdx !== -1) {
                  newOptions.splice(otherIdx, 0, customInput.trim());
                } else {
                  newOptions.push(customInput.trim());
                }

                // Use useFieldArray's update to correctly modify the field's options and selected value in sync
                update(dialogState.index, {
                  ...fields[dialogState.index],
                  options: newOptions,
                  value: customInput.trim()
                });

                setCustomInput("");
                setDialogState(null);
              }
            }} className="w-full sm:w-24 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
});

const EditableLabel = memo(function EditableLabel({ name, value }: { name: string, value: string }) {
  const { register } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { ref: formRef, ...rest } = register(name);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        {...rest}
        ref={(e) => {
          formRef(e);
          inputRef.current = e;
        }}
        onBlur={(e) => {
          rest.onBlur(e);
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setIsEditing(false);
          }
        }}
        className="h-7 px-1 py-0 text-sm font-semibold border-transparent focus-visible:ring-1 focus-visible:ring-ring bg-transparent shadow-none truncate w-[150px]"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 cursor-pointer group/label"
      onClick={() => setIsEditing(true)}
      title="Click to edit label"
    >
      <span className="text-sm font-semibold truncate text-foreground">{value || "Label"}</span>
      <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover/label:text-primary transition-colors shrink-0" />
    </div>
  );
});

const COMPANY_OPTIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "TCS (Tata Consultancy Services)",
  "Infosys",
  "Wipro",
  "Cognizant",
  "Accenture",
  "Capgemini",
  "Tech Mahindra",
  "HCL Technologies",
  "IBM",
  "Oracle",
  "Cisco",
  "Adobe",
  "Salesforce",
  "Deloitte",
  "PwC",
  "EY (Ernst & Young)",
  "KPMG",
  "J.P. Morgan",
  "Morgan Stanley",
  "Goldman Sachs",
  "Other"
];

interface PremiumSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

function PremiumSelect({ value, onChange, options, placeholder }: PremiumSelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-input text-sm rounded-md h-9 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%237C726C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat transition-all text-foreground"
      >
        <option value="" disabled className="text-muted-foreground">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-sm text-foreground bg-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const PhotoCustomizationSliders = memo(function PhotoCustomizationSliders({ watchPhoto, defaultCornerRadius, defaultBorderSize }: { watchPhoto: any, defaultCornerRadius: number, defaultBorderSize: number }) {
  const photoCornerRadius = useThemeStore(s => s.photoCornerRadius);
  const photoBorderSize = useThemeStore(s => s.photoBorderSize);
  const setPhotoCornerRadius = useThemeStore(s => s.setPhotoCornerRadius);
  const setPhotoBorderSize = useThemeStore(s => s.setPhotoBorderSize);
  const photoScale = useThemeStore(s => s.photoScale);
  const setPhotoScale = useThemeStore(s => s.setPhotoScale);

  const photoXOffset = useThemeStore(s => s.photoXOffset);
  const photoYOffset = useThemeStore(s => s.photoYOffset);
  const setPhotoXOffset = useThemeStore(s => s.setPhotoXOffset);
  const setPhotoYOffset = useThemeStore(s => s.setPhotoYOffset);

  if (!watchPhoto) return null;

  const hasOffset = (photoXOffset !== 0) || (photoYOffset !== 0);

  return (
    <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase">Corner Radius</Label>
        <Slider
          value={[photoCornerRadius ?? defaultCornerRadius]}
          min={0}
          max={100}
          step={1}
          onValueChange={([val]) => setPhotoCornerRadius(val)}
          className="w-full"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase">Border Size {photoBorderSize}</Label>
        <Slider
          value={[photoBorderSize ?? defaultBorderSize]}
          min={0}
          max={5}
          step={0.5}
          onValueChange={([val]) => setPhotoBorderSize(val)}
          className="w-full"
        />
      </div>
      <div className="space-y-3 col-span-2 pt-2 border-t border-border/50">
        <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
          <span>Photo Scale</span>
          <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">{photoScale ?? 100}%</span>
        </Label>
        <Slider
          value={[photoScale ?? 100]}
          min={50}
          max={200}
          step={1}
          onValueChange={([val]) => setPhotoScale(val)}
          className="w-full"
        />
      </div>
      <div className="col-span-2 pt-2 border-t border-border/50 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Drag photo on preview to reposition
          </span>
          {hasOffset && (
            <button
              type="button"
              onClick={() => {
                setPhotoXOffset(0);
                setPhotoYOffset(0);
              }}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-2 py-1 rounded transition-colors"
            >
              Reset Position
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const TimePickerPopover = ({ value, onChange, t }: { value: string; onChange: (val: string) => void; t: Record<string, string> }) => {
  const parts = value.match(/(\d{1,2}):(\d{2})\s*(?:\((.*)\))?/i);
  const hhPart = parts?.[1] ?? "10";
  const mmPart = parts?.[2] ?? "00";
  const periodPart = parts?.[3] ?? "Morning";

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const updateValue = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} (${p})`);
  };

  const hourScrollContainerRef = useRef<HTMLDivElement>(null);
  const minuteScrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const activeHourElem = hourScrollContainerRef.current?.querySelector('[data-active="true"]');
        activeHourElem?.scrollIntoView({ block: "center", behavior: "auto" });

        const activeMinuteElem = minuteScrollContainerRef.current?.querySelector('[data-active="true"]');
        activeMinuteElem?.scrollIntoView({ block: "center", behavior: "auto" });
      }, 50);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10 border-input/30 bg-card hover:bg-muted/40 shadow-sm rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground opacity-70 shrink-0" />
            <span>{translateDynamicOption(value, t) || "Select Time..."}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-popover text-popover-foreground rounded-xl border shadow-lg flex flex-col gap-3 z-[9999]" align="start">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Period / Time of Day</span>
          <div className="grid grid-cols-5 gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border/20">
            {["Early Morning", "Morning", "Afternoon", "Evening", "Night"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateValue(hhPart, mmPart, p)}
                className={cn(
                  "text-[9px] py-1.5 rounded-md font-bold transition-all truncate px-0.5 text-center",
                  periodPart === p
                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                {t[p] || p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-3 border-border/40">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">Hour</span>
            <div
              ref={hourScrollContainerRef}
              className="h-44 overflow-y-auto border border-border/30 rounded-lg p-1 bg-muted/10 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-muted"
            >
              {hours.map((h) => {
                const isActive = hhPart === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => updateValue(h, mmPart, periodPart)}
                    className={cn(
                      "py-1.5 px-3 rounded-md text-sm font-semibold transition-all text-center",
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/20 scale-[1.02]"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">Minute</span>
            <div
              ref={minuteScrollContainerRef}
              className="h-44 overflow-y-auto border border-border/30 rounded-lg p-1 bg-muted/10 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-muted"
            >
              {minutes.map((m) => {
                const isActive = mmPart === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => updateValue(hhPart, m, periodPart)}
                    className={cn(
                      "py-1.5 px-3 rounded-md text-sm font-semibold transition-all text-center",
                      isActive
                        ? "bg-primary/10 text-primary font-bold border border-primary/20 scale-[1.02]"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const DatePickerPopover = ({ value, onChange, currentLang, t }: { value: string; onChange: (val: string) => void; currentLang: string; t: Record<string, string> }) => {
  const parts = value ? value.split("-") : [];
  const selectedYear = parts[0] ? parseInt(parts[0], 10) : null;
  const selectedMonth = parts[1] ? parseInt(parts[1], 10) - 1 : null;
  const selectedDay = parts[2] ? parseInt(parts[2], 10) : null;

  const [viewYear, setViewYear] = useState(selectedYear || 1995);
  const [viewMonth, setViewMonth] = useState(selectedMonth !== null ? selectedMonth : 0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedYear) setViewYear(selectedYear);
    if (selectedMonth !== null) setViewMonth(selectedMonth);
  }, [value, isOpen]);

  const getLocaleCode = (lang: string) => {
    const map: Record<string, string> = {
      "English": "en",
      "हिंदी": "hi",
      "मराठी": "mr",
      "ગુજરાતી": "gu",
      "বাংলা": "bn",
      "தமிழ்": "ta",
      "తెలుగు": "te",
      "ಕನ್ನಡ": "kn",
      "ਪੰਜਾਬੀ": "pa",
      "اردو": "ur"
    };
    return map[lang] || "en";
  };

  const getNumberingSystem = (lang: string) => {
    const map: Record<string, string> = {
      "हिंदी": "deva",
      "मराठी": "deva",
      "ગુજરાતી": "gujr",
      "বাংলা": "beng",
      "ಕನ್ನಡ": "knda",
      "ਪੰਜਾਬੀ": "guru",
      "اردو": "arabext"
    };
    return map[lang] || "latn";
  };

  const locale = getLocaleCode(currentLang);
  const numSys = getNumberingSystem(currentLang);

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: monthFormatter.format(new Date(2000, i, 1))
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => 1940 + i).reverse();

  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    return dayFormatter.format(new Date(2026, 5, 7 + i));
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const cells: { dayNum: number | null; isCurrent: boolean }[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dayNum: null, isCurrent: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ dayNum: i, isCurrent: true });
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = (viewMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(prev => prev - 1);
      } else {
        setViewMonth(prev => prev - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(prev => prev + 1);
      } else {
        setViewMonth(prev => prev + 1);
      }
    }
  };

  const formatDateLabel = (val: string) => {
    if (!val) return t.selectDate || "Select Date...";
    const [y, m, d] = val.split("-");
    if (!y || !m || !d) return val;
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(dateObj.getTime())) return val;

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      numberingSystem: numSys
    } as any).format(dateObj);
  };

  const dayNumberFormatter = new Intl.NumberFormat(locale, { numberingSystem: numSys });
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false, numberingSystem: numSys });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10 border-input/30 bg-card hover:bg-muted/40 shadow-sm rounded-lg"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground opacity-70 shrink-0" />
            <span>{formatDateLabel(value)}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3 bg-popover text-popover-foreground rounded-xl border shadow-lg flex flex-col gap-3 z-[9999]" align="start">
        <div className="flex items-center justify-between gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1 flex-1 justify-center">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="h-8 py-0 px-2 text-xs font-semibold bg-muted/60 border border-border/20 rounded-lg outline-none focus:ring-1 focus:ring-primary w-[110px] cursor-pointer"
            >
              {months.map(m => (
                <option key={m.value} value={m.value} className="bg-popover text-popover-foreground">
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="h-8 py-0 px-2 text-xs font-semibold bg-muted/60 border border-border/20 rounded-lg outline-none focus:ring-1 focus:ring-primary w-[80px] cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-popover text-popover-foreground">
                  {yearFormatter.format(y)}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-7 text-center">
            {weekdays.map((wd, i) => (
              <span key={i} className="text-[10px] font-bold text-muted-foreground py-0.5">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, idx) => {
              if (cell.dayNum === null) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }

              const isSelected = selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === cell.dayNum;
              const isToday = new Date().getDate() === cell.dayNum && new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear;

              return (
                <button
                  key={`day-${cell.dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(cell.dayNum!)}
                  className={cn(
                    "h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all mx-auto",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm scale-105"
                      : isToday
                        ? "border border-primary text-primary font-bold"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  {dayNumberFormatter.format(cell.dayNum)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


