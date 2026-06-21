"use client";

import { useState } from "react";
import {
  Heart,
  Sparkles,
  User,
  Check,
  Star,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MarathiInfoSection() {
  const [activeGenderTab, setActiveGenderTab] = useState<string>("bride");

  const kootasData = [
    { name: "Varna (वर्ण)", points: 1, meaning: "धार्मिक व वैचारिक जुळवणी", desc: "Reflects the spiritual and mental compatibility." },
    { name: "Vashya (वश्य)", points: 2, meaning: "स्वभाव आणि एकमेकांवरील प्रभाव", desc: "Indicates mutual attraction and control." },
    { name: "Tara (तारा)", points: 3, meaning: "आरोग्य, भाग्य आणि जीवनातील स्थैर्य", desc: "Relates to the health, longevity, and well-being." },
    { name: "Yoni (योनी)", points: 4, meaning: "आकर्षण आणि वैवाहिक सुसंगतता", desc: "Measures physical compatibility and intimacy." },
    { name: "Graha Maitri (ग्रह मैत्री)", points: 5, meaning: "मानसिक जुळवणी आणि मैत्रीपूर्ण संबंध", desc: "Shows intellectual alignment and friendship." },
    { name: "Gana (गण)", points: 6, meaning: "व्यक्तिमत्त्व आणि वागणुकीतील सुसंगतता", desc: "Signifies temperament and behavior matches." },
    { name: "Bhakoot (भकूट)", points: 7, meaning: "आर्थिक, कौटुंबिक आणि भावनिक जुळवणी", desc: "Evaluates family growth, emotional bond, and wealth." },
    { name: "Nadi (नाडी)", points: 8, meaning: "आरोग्य, संतती आणि दीर्घकालीन सुसंगतता", desc: "Measures physiological compatibility and progeny." }
  ];

  return (
    <div className="space-y-10">
      {/* 1. Marathi Marriage Biodata Sample Intro Section */}
      <section className="bg-gradient-to-br from-[#FFFDF9] to-[#FFFBEB] border border-[#EAB308]/20 rounded-3xl p-4 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C2410C]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EAB308]/5 rounded-tr-full pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-5 relative z-10">
          <Badge variant="outline" className="border-[#C2410C]/40 text-[#C2410C] bg-[#C2410C]/5 font-bold uppercase tracking-wider px-3.5 py-1 text-xs">
            Format Sample • नमुना फॉरमॅट
          </Badge>

          <h2 className="text-2xl md:text-3.5xl font-black text-[#C2410C] leading-tight font-sans">
            मुलगा व मुलीसाठी नमुना विवाह बायोडाटा <br className="hidden sm:inline" />
            <span className="text-[#EAB308] text-xl md:text-2xl font-bold">(Marathi Marriage Biodata Sample Format for Boy & Girl)</span>
          </h2>

          <p className="text-stone-750 text-sm md:text-base leading-relaxed font-semibold">
            खाली दिलेला <strong>Marathi Marriage Biodata Sample</strong> हा मुलगा आणि मुलगी दोघांसाठी अत्यंत उपयुक्त आहे. या उदाहरणामध्ये वैयक्तिक माहिती, शिक्षण, व्यवसाय, कौटुंबिक माहिती आणि संपर्क माहिती समाविष्ट आहे. तुम्ही हा नमुना पाहून स्वतःचा <strong>Professional Marathi Biodata</strong> सहज तयार करू शकता.
          </p>

          {/* Interactive Toggle for Sample Biodata Showcase */}
          <div className="mt-8 flex flex-col items-center w-full">
            <Tabs defaultValue="bride" onValueChange={setActiveGenderTab} className="w-full max-w-5xl">
              <div className="flex justify-center mb-6 w-full">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-[#FEF3C7] p-1 rounded-full border border-[#EAB308]/30 shadow-xs h-auto">
                  <TabsTrigger value="bride" className="rounded-full px-2 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 text-stone-700 hover:!text-[#C2410C] data-active:!bg-[#C2410C] data-active:!text-white data-active:hover:!text-white cursor-pointer transition-all whitespace-normal sm:whitespace-nowrap text-center">
                    <Heart className="w-3.5 h-3.5 shrink-0" /> <span className="leading-tight">वधू बायोडाटा (Bride)</span>
                  </TabsTrigger>
                  <TabsTrigger value="groom" className="rounded-full px-2 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 text-stone-700 hover:!text-[#C2410C] data-active:!bg-[#C2410C] data-active:!text-white data-active:hover:!text-white cursor-pointer transition-all whitespace-normal sm:whitespace-nowrap text-center">
                    <User className="w-3.5 h-3.5 shrink-0" /> <span className="leading-tight">वर बायोडाटा (Groom)</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Bride Biodata Card Preview */}
              <TabsContent value="bride" className="outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    {/* CSS Styled Premium Biodata Card */}
                    <div className="relative p-3.5 md:p-8 bg-[#FFFDF5] border-4 border-double border-[#C2410C]/60 rounded-2xl shadow-xl max-w-md mx-auto w-full font-serif overflow-hidden select-none">
                      {/* Corner Ornaments */}
                      <div className="absolute top-2 left-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute top-2 right-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute bottom-2 left-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute bottom-2 right-2 text-[#C2410C] text-lg font-bold">⚜</div>

                      {/* Ganpati Header */}
                      <div className="text-center space-y-1 mb-6">
                        <div className="text-2xl text-[#C2410C] font-bold">🌺</div>
                        <h4 className="text-sm font-black text-[#C2410C] tracking-widest font-sans">
                          ॥ श्री गणेशाय नमः ॥
                        </h4>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent mx-auto" />
                      </div>

                      {/* Biodata Body */}
                      <div className="space-y-5 text-left text-[11px] md:text-xs text-stone-850 font-sans font-medium">
                        {/* Personal Section */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            वैयक्तिक माहिती (Personal Details)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">पूर्ण नाव:</span>
                            <span className="col-span-8 font-extrabold text-[#C2410C]">प्रिया रमेश कुलकर्णी</span>
                            <span className="col-span-4 font-bold text-stone-500">जन्मतारीख:</span>
                            <span className="col-span-8">१५ ऑगस्ट १९९८</span>
                            <span className="col-span-4 font-bold text-stone-500">जन्म वेळ:</span>
                            <span className="col-span-8">सकाळी ०८:३० वाजता</span>
                            <span className="col-span-4 font-bold text-stone-500">जन्म ठिकाण:</span>
                            <span className="col-span-8">पुणे</span>
                            <span className="col-span-4 font-bold text-stone-500">उंची:</span>
                            <span className="col-span-8">५ फूट ४ इंच (5'4")</span>
                            <span className="col-span-4 font-bold text-stone-500">गोत्र:</span>
                            <span className="col-span-8">कश्यप (Kashyap)</span>
                            <span className="col-span-4 font-bold text-stone-500">रास / नक्षत्र:</span>
                            <span className="col-span-8">सिंह / मघा</span>
                          </div>
                        </div>

                        {/* Education & Career */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            शिक्षण आणि व्यवसाय (Education & Career)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">शिक्षण:</span>
                            <span className="col-span-8">MBA (Marketing)</span>
                            <span className="col-span-4 font-bold text-stone-500">व्यवसाय:</span>
                            <span className="col-span-8 font-bold">Digital Marketing Manager</span>
                            <span className="col-span-4 font-bold text-stone-500">भाषा ज्ञान:</span>
                            <span className="col-span-8">मराठी, हिंदी, इंग्रजी</span>
                          </div>
                        </div>

                        {/* Family Section */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            कौटुंबिक माहिती (Family Information)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">वडिलांचे नाव:</span>
                            <span className="col-span-8">रमेश सदाशिव कुलकर्णी (व्यवसाय: निवृत्त बँक अधिकारी)</span>
                            <span className="col-span-4 font-bold text-stone-500">आईचे नाव:</span>
                            <span className="col-span-8">सुनिता कुलकर्णी (गृहिणी)</span>
                            <span className="col-span-4 font-bold text-stone-500">भाऊ / बहीण:</span>
                            <span className="col-span-8">१ लहान भाऊ (शिक्षण सुरू)</span>
                            <span className="col-span-4 font-bold text-stone-500">मामा:</span>
                            <span className="col-span-8">श्री. सुधीर अनंत जोशी (व्यवसाय: उद्योजक)</span>
                            <span className="col-span-4 font-bold text-stone-500">मूळ गाव:</span>
                            <span className="col-span-8">सातारा</span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            संपर्क (Contact Info)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">मोबाईल:</span>
                            <span className="col-span-8 font-bold text-[#C2410C]">+91 98765 43210</span>
                            <span className="col-span-4 font-bold text-stone-500">पत्ता:</span>
                            <span className="col-span-8">१२, स्वप्नशिल्प अपार्टमेंट, कोथरूड, पुणे - ४११०३८</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 w-fit">
                      👰 Bride Profile Analysis
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#C2410C] font-sans">
                      मराठी वधू बायोडाटा नमुना विश्लेषण
                    </h3>
                    <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
                      मुलींच्या बायोडाटामध्ये शैक्षणिक पात्रता (Education) आणि करिअरचे ध्येय (Career Goals) या घटकांवर विशेष लक्ष दिले जाते. आजकालच्या कुटुंबांमध्ये मुलगी स्वावलंबी आणि सुशिक्षित असावी अशी अपेक्षा असते, त्यामुळे <strong>MBA Marketing</strong> आणि <strong>Digital Marketing Manager</strong> सारखे जॉब प्रोफाईल बायोडाटा अधिक प्रभावी बनवतात.
                    </p>

                    <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-stone-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Education:</strong> उच्च शिक्षण (Higher Education) स्पष्टपणे मांडले आहे.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Hobbies:</strong> वाचन, स्वयंपाक, फिरणे या छंदातून व्यक्तिमत्त्वाची आवड समजते.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Family Info:</strong> आई-वडील, भाऊ आणि मामांचे सविस्तर वर्णन कौटुंबिक मूल्ये दर्शवते.</span>
                      </li>
                    </ul>

                    <div className="pt-2">
                      <Button className="rounded-full !bg-[#C2410C] hover:!bg-[#A2350A] !text-white font-bold px-6 py-5 cursor-pointer hover:scale-105 transition-all text-xs md:text-sm shadow-md" asChild>
                        <a href="#builder">
                          Create Bride Biodata
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Groom Biodata Card Preview */}
              <TabsContent value="groom" className="outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    {/* CSS Styled Premium Biodata Card */}
                    <div className="relative p-3.5 md:p-8 bg-[#FFFDF5] border-4 border-double border-[#C2410C]/60 rounded-2xl shadow-xl max-w-md mx-auto w-full font-serif overflow-hidden select-none">
                      {/* Corner Ornaments */}
                      <div className="absolute top-2 left-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute top-2 right-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute bottom-2 left-2 text-[#C2410C] text-lg font-bold">⚜</div>
                      <div className="absolute bottom-2 right-2 text-[#C2410C] text-lg font-bold">⚜</div>

                      {/* Ganpati Header */}
                      <div className="text-center space-y-1 mb-6">
                        <div className="text-2xl text-[#C2410C] font-bold">🌺</div>
                        <h4 className="text-sm font-black text-[#C2410C] tracking-widest font-sans">
                          ॥ श्री कुलदेवता प्रसन्न ॥
                        </h4>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent mx-auto" />
                      </div>

                      {/* Biodata Body */}
                      <div className="space-y-5 text-left text-[11px] md:text-xs text-stone-850 font-sans font-medium">
                        {/* Personal Section */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            वैयक्तिक माहिती (Personal Details)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">पूर्ण नाव:</span>
                            <span className="col-span-8 font-extrabold text-[#C2410C]">अमित विजय साळुंखे</span>
                            <span className="col-span-4 font-bold text-stone-500">जन्मतारीख:</span>
                            <span className="col-span-8">२४ सप्टेंबर १९९५</span>
                            <span className="col-span-4 font-bold text-stone-500">जन्म वेळ / ठिकाण:</span>
                            <span className="col-span-8">दुपारी ०२:१५ वाजता / सांगली</span>
                            <span className="col-span-4 font-bold text-stone-500">उंची / वजन:</span>
                            <span className="col-span-8">५ फूट ९ इंच (5'9") / ७२ किलोग्रॅम</span>
                            <span className="col-span-4 font-bold text-stone-500">रक्तगट:</span>
                            <span className="col-span-8">B +ve</span>
                            <span className="col-span-4 font-bold text-stone-500">गोत्र:</span>
                            <span className="col-span-8">भारद्वाज (Bharadwaj)</span>
                            <span className="col-span-4 font-bold text-stone-500">रास / नक्षत्र:</span>
                            <span className="col-span-8">कन्या / उत्तरा फाल्गुनी</span>
                          </div>
                        </div>

                        {/* Education & Career */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            शिक्षण आणि करिअर (Education & Career)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">शिक्षण:</span>
                            <span className="col-span-8 font-bold">B.E. Computer Engineering</span>
                            <span className="col-span-4 font-bold text-stone-500">नोकरी / पद:</span>
                            <span className="col-span-8">Senior Software Engineer (7 Years Exp)</span>
                            <span className="col-span-4 font-bold text-stone-500">कंपनी:</span>
                            <span className="col-span-8">Leading IT Company, Pune</span>
                            <span className="col-span-4 font-bold text-stone-500">वार्षिक उत्पन्न:</span>
                            <span className="col-span-8 font-extrabold text-emerald-700">₹18 LPA</span>
                          </div>
                        </div>

                        {/* Family Section */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            कौटुंबिक माहिती (Family Background)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">वडिलांचे नाव:</span>
                            <span className="col-span-8">विजय साळुंखे (व्यवसाय: शेती व व्यावसायिक)</span>
                            <span className="col-span-4 font-bold text-stone-500">आईचे नाव:</span>
                            <span className="col-span-8">मंगला साळुंखे (गृहिणी)</span>
                            <span className="col-span-4 font-bold text-stone-500">भाऊ / बहीण:</span>
                            <span className="col-span-8">१ मोठी बहीण (विवाहित)</span>
                            <span className="col-span-4 font-bold text-stone-500">मूळ गाव:</span>
                            <span className="col-span-8">सांगली</span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[#C2410C] text-[12px] border-b border-[#EAB308]/20 pb-0.5">
                            संपर्क (Contact Details)
                          </h5>
                          <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                            <span className="col-span-4 font-bold text-stone-500">मोबाईल:</span>
                            <span className="col-span-8 font-bold text-[#C2410C]">+91 91234 56789</span>
                            <span className="col-span-4 font-bold text-stone-500">पत्ता:</span>
                            <span className="col-span-8">फ्लॅट क्र. ४०५, गोल्डन हाइट्स, बाणेर, पुणे - ४११०४५</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                      🤵 Groom Profile Analysis
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#C2410C] font-sans">
                      मराठी वर बायोडाटा नमुना विश्लेषण
                    </h3>
                    <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
                      मुलांच्या लग्नाच्या बायोडाटामध्ये शिक्षण (Qualification), नोकरीचे स्वरूप (Job Role), कामाचा अनुभव (Experience), कंपनी (Company Details) आणि वार्षिक उत्पन्न (Income/Package) या गोष्टींना अधिक महत्त्व दिले जाते. यामुळे भविष्यातील स्थिरता आणि करिअरमधील प्रगती समजण्यास मदत होते.
                    </p>

                    <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-stone-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Career Growth:</strong> Senior Software Engineer (7 Years Exp) नोकरीतील स्थैर्य दर्शवते.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Income Details:</strong> ₹18 LPA पॅकेज नोकरीतील प्रगती स्पष्ट करते.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Background:</strong> कौटुंबिक शेती आणि बाणेर पुणे येथील रहिवास उत्तम परिस्थिती दाखवते.</span>
                      </li>
                    </ul>

                    <div className="pt-2">
                      <Button className="rounded-full !bg-[#C2410C] hover:!bg-[#A2350A] !text-white font-bold px-6 py-5 cursor-pointer hover:scale-105 transition-all text-xs md:text-sm shadow-md" asChild>
                        <a href="#builder">
                          Create Groom Biodata
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="pt-6">
            <Button size="lg" className="rounded-full text-sm px-10 py-6 bg-gradient-primary hover:opacity-95 !text-white font-bold tracking-wide shadow-xl shadow-[#C2410C]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer" asChild>
              <a href="#builder">
                Create Your Marathi Biodata →
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. How to Understand this Marathi Biodata Sample */}
      <section className="space-y-4">
        <div className="text-center space-y-2 max-w-4xl mx-auto">
          <Badge variant="outline" className="border-[#EAB308]/40 text-[#C2410C] bg-[#EAB308]/10 font-bold px-3 py-0.5 text-xs">
            Understanding Layout • मांडणी समजावून घ्या
          </Badge>
          <h2 className="text-2xl md:text-3.5xl font-extrabold text-[#C2410C] tracking-tight font-sans">
            हा नमुना बायोडाटा कसा समजून घ्यावा?
          </h2>
          <p className="text-stone-600 text-xs md:text-sm font-semibold">
            How to Understand This Marathi Marriage Biodata Sample?
          </p>
        </div>

        <div className="bg-white border border-[#EAB308]/20 rounded-3xl p-5 md:p-6 shadow-2xs text-left max-w-7xl mx-auto space-y-4">
          <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
            या <strong>Marathi Marriage Biodata Sample</strong> मध्ये प्रत्येक विभागाची मांडणी अशा प्रकारे करण्यात आली आहे की समोरच्या कुटुंबाला आवश्यक माहिती सहजपणे समजू शकेल.
            The format focuses on clarity, professional presentation, and easy readability. A well-structured biodata helps families quickly understand the candidate's background, education, career, and family values.
          </p>
          <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
            या नमुन्यात वापरलेले Sections हे आधुनिक Marathi Marriage Biodata साठी सर्वाधिक लोकप्रिय मानले जातात आणि विवाहासाठी स्थळ शोधताना आवश्यक असलेली सर्व महत्त्वाची माहिती समाविष्ट करतात.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { title: "वैयक्तिक तपशील", desc: "नाव, जन्मतारीख, वेळ, जन्मस्थळ, उंची, गोत्र, रास व नक्षत्र" },
              { title: "शैक्षणिक पात्रता", desc: "पदवी, विशेष प्राविण्य आणि मिळालेले उच्च दर्जाचे शिक्षण" },
              { title: "करिअर आणि नोकरी", desc: "कंपनी नाव, पद, कामाचा अनुभव आणि वार्षिक पॅकेज किंवा उत्पन्न" },
              { title: "कौटुंबिक माहिती", desc: "आई-वडील, बहीण-भाऊ, आजोळ व मूळ गाव याबद्दल सविस्तर माहिती" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#FFFDF9] border border-[#EAB308]/15 rounded-xl p-4 space-y-2 hover:border-[#C2410C]/35 transition-all">
                <span className="w-6 h-6 rounded-full bg-[#C2410C]/10 text-[#C2410C] flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-extrabold text-[#C2410C]">{item.title}</h4>
                <p className="text-[11px] text-stone-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Gotra, Rashi, Kuldaivat & Kundali Details Included in Marathi Biodata? */}
      <section className="space-y-4">
        <div className="text-center space-y-2 max-w-4xl mx-auto">
          <Badge variant="outline" className="border-[#EAB308]/40 text-[#C2410C] bg-[#EAB308]/10 font-bold px-3 py-0.5 text-xs">
            Astrological Details • ज्योतिषीय माहितीचे महत्त्व
          </Badge>
          <h2 className="text-2xl md:text-3.5xl font-extrabold text-[#C2410C] tracking-tight font-sans">
            गोत्र, राशी, कुलदेवता आणि कुंडलीची माहिती का दिली जाते?
          </h2>
          <p className="text-stone-600 text-xs md:text-sm font-semibold">
            Why Are Gotra, Rashi, Kuldaivat & Kundali Details Included in Marathi Biodata?
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#EAB308]/20 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6 text-left">
              <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
                आजही अनेक मराठी कुटुंबांमध्ये Marriage Biodata पाहताना Gotra, Rashi, Kuldaivat आणि Kundali Details ला महत्त्व दिले जाते. ही माहिती कुटुंबाची पारंपरिक ओळख समजण्यास मदत करते आणि विवाह जुळवणीच्या प्रक्रियेत अत्यंत उपयुक्त ठरू शकते.
              </p>

              <div className="space-y-5">
                {/* Gotra */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#C2410C] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                    गोत्र (Gotra) म्हणजे काय?
                  </h4>
                  <p className="text-xs text-stone-700 font-medium pl-3.5 leading-relaxed">
                    Gotra म्हणजे कुटुंबाची प्राचीन ऋषी परंपरा किंवा ancestral family lineage. अनेक Marathi families मध्ये विवाह जुळवताना Gotra चा विचार केला जातो, म्हणून ही माहिती देणे सामान्य आहे.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pl-3.5 pt-1">
                    {["कश्यप (Kashyap)", "भारद्वाज (Bharadwaj)", "वशिष्ठ (Vashistha)", "अत्री (Atri)", "गौतम (Gautam)"].map((g) => (
                      <span key={g} className="text-[10px] font-bold text-stone-650 bg-stone-100 border border-stone-200 rounded-full px-2 py-0.5">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rashi & Nakshatra */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#C2410C] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                    राशी आणि नक्षत्र (Rashi & Nakshatra)
                  </h4>
                  <p className="text-xs text-stone-700 font-medium pl-3.5 leading-relaxed">
                    Rashi आणि Nakshatra हे व्यक्तीच्या जन्माच्या वेळच्या ग्रह-ताऱ्यांच्या स्थितीवर (birth details) आधारित ज्योतिषीय घटक आहेत. अनेक कुटुंबात Rashi-Nakshatra Matching ला महत्त्व दिले जाते.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3.5 pt-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500">Popular Rashis:</span>
                      <div className="flex flex-wrap gap-1">
                        {["मेष (Mesh)", "वृषभ (Vrushabh)", "मिथुन (Mithun)", "सिंह (Singh)", "कन्या (Kanya)"].map((r) => (
                          <span key={r} className="text-[9px] font-bold text-stone-600 bg-stone-50 border border-stone-150 rounded px-1.5 py-0.5">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500">Popular Nakshatras:</span>
                      <div className="flex flex-wrap gap-1">
                        {["अश्विनी", "रोहिणी", "मघा", "स्वाती", "रेवती"].map((n) => (
                          <span key={n} className="text-[9px] font-bold text-stone-600 bg-stone-50 border border-stone-150 rounded px-1.5 py-0.5">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kuldaivat */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#C2410C] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                    कुलदेवता (Kuldaivat) म्हणजे काय?
                  </h4>
                  <p className="text-xs text-stone-700 font-medium pl-3.5 leading-relaxed">
                    Kuldaivat म्हणजे कुटुंबाची traditional family deity किंवा आराध्य देवता. कुलदेवतेचा उल्लेख केल्याने कुटुंबाची सांस्कृतिक आणि धार्मिक पार्श्वभूमी समजण्यास मदत होते.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pl-3.5 pt-1">
                    {["तुळजाभवानी (Tulja Bhavani)", "खंडोबा (Khandoba)", "महालक्ष्मी (Mahalakshmi)", "रेणुका माता (Renuka)", "सप्तशृंगी देवी"].map((k) => (
                      <span key={k} className="text-[10px] font-bold text-[#C2410C] bg-[#C2410C]/5 border border-[#C2410C]/15 rounded-full px-2.5 py-0.5">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Manglik */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#C2410C] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                    मंगळ दोष (Manglik)
                  </h4>
                  <p className="text-xs text-stone-700 font-medium pl-3.5 leading-relaxed">
                    Manglik किंवा Mangal Dosh हा Kundali मधील मंगळ ग्रहाच्या स्थितीशी संबंधित मानला जातो. काही families विवाह निश्चित करण्यापूर्वी याचा विचार करतात.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3.5 pt-1">
                    {[
                      { l: "Manglik: Yes", d: "कुंडलीनुसार व्यक्तीला मंगळ दोष लागू होतो." },
                      { l: "Manglik: No / Not Present", d: "कुंडलीमध्ये मंगळ दोष नाही." },
                      { l: "Partial Manglik", d: "मंगळ दोषाचा थोडासा प्रभाव आहे (अंशतः मंगळिक)." },
                      { l: "Consultation Recommended", d: "कुंडलीची अधिक सविस्तर ज्योतिष तपासणी आवश्यक." }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-150 p-2 rounded-xl text-left">
                        <span className="text-[10px] font-extrabold text-[#C2410C] block">{m.l}</span>
                        <span className="text-[9px] font-medium text-stone-600">{m.d}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Kundali & Gun Milan Sidebar with 8 Kootas */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFFBEB] border-2 border-[#EAB308]/40 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 text-left">
              <h3 className="text-base font-extrabold text-[#C2410C] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#EAB308] shrink-0" />
                कुंडली आणि गुण जुळवणी (Kundali Matching)
              </h3>

              <p className="text-[11px] text-stone-700 font-semibold leading-relaxed">
                पारंपरिक विवाह जुळवणीमध्ये वधू-वरांच्या कुंडल्या पाहून गुण जुळवणी (Gun Milan) केली जाते. यात वधू-वरांच्या जन्ममाहितीची ८ वेगवेगळ्या घटकांवर (Kootas) तुलना केली जाते. या सर्व घटकांचे एकूण ३६ गुण असतात.
              </p>

              {/* Points table for Kootas */}
              <div className="border border-[#EAB308]/20 rounded-2xl overflow-hidden bg-white shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] md:text-xs">
                    <thead>
                      <tr className="bg-[#FEF3C7]/40 border-b border-[#EAB308]/20 text-[#C2410C] font-extrabold font-sans">
                        <th className="py-2.5 px-3">Koota (कूट)</th>
                        <th className="py-2.5 px-2 text-center">Points</th>
                        <th className="py-2.5 px-3">Meaning (अर्थ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700 font-semibold">
                      {kootasData.map((k, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-extrabold text-[#C2410C]">{k.name}</td>
                          <td className="py-2.5 px-2 text-center font-bold">{k.points}</td>
                          <td className="py-2.5 px-3">{k.meaning}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#C2410C]/5 font-black text-[#C2410C]">
                        <td className="py-3 px-3">Total (एकूण)</td>
                        <td className="py-3 px-2 text-center">36</td>
                        <td className="py-3 px-3">जास्त गुण म्हणजे चांगली जुळवणी</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-[#EAB308]/25 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-[#C2410C] block">Common Entry Examples:</span>
                <ul className="text-[10px] text-stone-700 font-semibold space-y-1 pl-1">
                  <li>• Kundali Available: Yes / No</li>
                  <li>• Gun Milan: 28/36 or 32/36 (Matching Preferred)</li>
                </ul>
                <p className="text-[9px] text-stone-550 leading-relaxed pt-1.5 border-t border-stone-100 font-medium">
                  Note: २८, ३२ किंवा ३४ गुण मिळाल्यास अनेक पारंपरिक मराठी कुटुंबे त्याला अत्यंत उत्तम व सुसंगत जुळणी मानतात.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bride vs Groom Biodata Comparison Section */}
      <section className="space-y-4 pt-8 md:pt-14 border-t border-[#EAB308]/15">
        <div className="text-center space-y-2 max-w-4xl mx-auto">
          <Badge variant="outline" className="border-[#EAB308]/40 text-[#C2410C] bg-[#EAB308]/10 font-bold px-3 py-0.5 text-xs">
            Comparison Guide • प्राधान्यक्रम तुलना
          </Badge>
          <h2 className="text-2xl md:text-3.5xl font-extrabold text-[#C2410C] tracking-tight font-sans">
            मुलगा आणि मुलगी यांच्या बायोडाटा मधील फरक
          </h2>
          <p className="text-stone-600 text-xs md:text-sm font-semibold">
            Marathi Biodata for Bride vs Groom: Key Focus Differences
          </p>
        </div>

        <div className="bg-white border border-[#EAB308]/20 rounded-3xl p-5 md:p-6 shadow-2xs text-left max-w-7xl mx-auto space-y-4">
          <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
            Marathi Marriage Biodata तयार करताना Bride आणि Groom दोघांच्याही Biodata मध्ये Personal Details, Education, Family Information, Career Details आणि Partner Expectations यांसारखे विभाग असतात. मात्र विवाह जुळवणीच्या प्रक्रियेत काही माहितीला अधिक लक्ष दिले जाते.
          </p>
          <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
            हे कोणतेही निश्चित नियम नसून अनेक Marathi families मध्ये सामान्यतः पाहिले जाणारे patterns आहेत. आजच्या काळात Education, Career, Family Values, Lifestyle आणि Personality या गोष्टी मुलगा आणि मुलगी दोघांसाठीही तितक्याच महत्त्वाच्या मानल्या जातात.
          </p>

          {/* Comparison Cards for Mobile (hidden on desktop) */}
          <div className="block md:hidden space-y-4.5 mt-4">
            {[
              { section: "Education (शिक्षण)", bride: "Qualification आणि Career Goals वर लक्ष दिले जाते.", groom: "Qualification, Specialization आणि Career Growth वर लक्ष दिले जाते." },
              { section: "Profession (करिअर / नोकरी)", bride: "Job Profile आणि Work Preferences.", groom: "Job Role, Experience आणि Career Stability." },
              { section: "Height & Personal Details (उंची व वैयक्तिक माहिती)", bride: "Height आणि Basic Personal Information अनेकदा पाहिली जाते.", groom: "Height आणि Personal Information देखील पाहिली जाते." },
              { section: "Company Details (कंपनीचे नाव)", bride: "Optional (पर्यायी).", groom: "अनेकदा आवर्जून नमूद केले जाते." },
              { section: "Income (वार्षिक उत्पन्न)", bride: "Optional (पर्यायी).", groom: "काही कुटुंबे Income किंवा Package आवर्जून विचारतात." },
              { section: "Hobbies (छंद व आवड)", bride: "Hobbies, Interests आणि Lifestyle.", groom: "Hobbies, Interests आणि Lifestyle." },
              { section: "Family Background (कौटुंबिक पार्श्वभूमी)", bride: "Family Values आणि Background.", groom: "Family Values आणि Background." },
              { section: "Future Plans (भविष्य नियोजन)", bride: "Career आणि Marriage Balance.", groom: "Career Growth आणि Future Planning." },
              { section: "Partner Expectations (जोडीदाराकडून अपेक्षा)", bride: "अपेक्षित जोडीदाराबद्दल सविस्तर माहिती.", groom: "अपेक्षित जोडीदाराबद्दल सविस्तर माहिती." }
            ].map((row, idx) => (
              <div key={idx} className="border border-[#EAB308]/20 bg-[#FFFDF9] rounded-2xl p-4 space-y-3 shadow-3xs">
                <h4 className="text-xs font-black text-[#C2410C] border-b border-[#EAB308]/15 pb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                  {row.section}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="bg-[#FFF5F7] border border-[#FCD3DE] rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-pink-700 tracking-wider uppercase flex items-center gap-1">
                      <span>👰</span> Bride (मुलगी)
                    </span>
                    <p className="text-xs text-stone-750 font-semibold leading-relaxed">{row.bride}</p>
                  </div>
                  <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-black text-blue-700 tracking-wider uppercase flex items-center gap-1">
                      <span>🤵</span> Groom (मुलगा)
                    </span>
                    <p className="text-xs text-stone-750 font-semibold leading-relaxed">{row.groom}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table for Desktop (hidden on mobile) */}
          <div className="hidden md:block border border-stone-200 rounded-2xl overflow-hidden shadow-3xs bg-white mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[#C2410C] font-extrabold font-sans">
                    <th className="py-4 px-5 w-1/4">Section</th>
                    <th className="py-4 px-5 w-3/8 text-pink-700 bg-pink-50/30">Bride Biodata (मुलगी)</th>
                    <th className="py-4 px-5 w-3/8 text-blue-700 bg-blue-50/30">Groom Biodata (मुलगा)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-stone-700 font-semibold">
                  {[
                    { section: "Education (शिक्षण)", bride: "Qualification आणि Career Goals वर लक्ष दिले जाते", groom: "Qualification, Specialization आणि Career Growth वर लक्ष दिले जाते" },
                    { section: "Profession (करिअर / नोकरी)", bride: "Job Profile आणि Work Preferences", groom: "Job Role, Experience आणि Career Stability" },
                    { section: "Height & Personal Details (उंची व वैयक्तिक माहिती)", bride: "Height आणि Basic Personal Information अनेकदा पाहिली जाते", groom: "Height आणि Personal Information देखील पाहिली जाते" },
                    { section: "Company Details (कंपनीचे नाव)", bride: "Optional (पर्यायी)", groom: "अनेकदा आवर्जून नमूद केले जाते" },
                    { section: "Income (वार्षिक उत्पन्न)", bride: "Optional (पर्यायी)", groom: "काही कुटुंबे Income किंवा Package आवर्जून विचारतात" },
                    { section: "Hobbies (छंद व आवड)", bride: "Hobbies, Interests आणि Lifestyle", groom: "Hobbies, Interests आणि Lifestyle" },
                    { section: "Family Background (कौटुंबिक पार्श्वभूमी)", bride: "Family Values आणि Background", groom: "Family Values आणि Background" },
                    { section: "Future Plans (भविष्य नियोजन)", bride: "Career आणि Marriage Balance", groom: "Career Growth आणि Future Planning" },
                    { section: "Partner Expectations (जोडीदाराकडून अपेक्षा)", bride: "अपेक्षित जोडीदाराबद्दल सविस्तर माहिती", groom: "अपेक्षित जोडीदाराबद्दल सविस्तर माहिती" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-extrabold text-[#C2410C]">{row.section}</td>
                      <td className="py-3.5 px-5 text-stone-750 bg-pink-50/5 leading-relaxed">{row.bride}</td>
                      <td className="py-3.5 px-5 text-stone-750 bg-blue-50/5 leading-relaxed">{row.groom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modern Trends & Final Thoughts */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Modern Trends Card */}
        <div className="bg-white border border-[#EAB308]/20 rounded-3xl p-6 md:p-8 shadow-2xs text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-extrabold text-[#C2410C] flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-[#EAB308]" />
              Modern Marriage Biodata Trends
            </h3>
            <p className="text-stone-700 text-xs md:text-sm font-semibold leading-relaxed">
              आजच्या Modern Marathi Marriage Biodata मध्ये फक्त Education किंवा Salary पुरेसे मानले जात नाही. अनेक आधुनिक कुटुंबे खालील गोष्टींनाही तितकेच महत्त्व देतात:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-bold text-stone-750">
              {[
                "Family Values", "Lifestyle Preferences",
                "Work-Life Balance", "Personality & Nature",
                "Career Ambitions", "Hobbies & Interests",
                "Future Goals", "Marriage Expectations"
              ].map((trend) => (
                <div key={trend} className="flex items-center gap-2 bg-[#FFFDF9] border border-stone-150 rounded-xl p-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Thought Card */}
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFFBEB] border border-[#EAB308]/25 rounded-3xl p-6 md:p-8 shadow-2xs text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-extrabold text-[#C2410C] flex items-center gap-2 font-sans">
              <BookOpen className="w-5 h-5 text-[#EAB308]" />
              Final Thought (अंतिम विचार)
            </h3>
            <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
              Bride असो किंवा Groom, एक चांगला <strong>Marathi Marriage Biodata</strong> हा समोरच्या कुटुंबाला तुमच्याबद्दलची महत्त्वाची माहिती स्पष्टपणे समजून घेण्यास मदत करतो.
            </p>
            <p className="text-stone-750 text-xs md:text-sm font-semibold leading-relaxed">
              Education, Career, Family Background, Hobbies, Partner Expectations आणि Personal Values यांची व्यवस्थित आणि अचूक मांडणी केल्यास योग्य स्थळ शोधणे अधिक सोपे आणि जलद होते.
            </p>
          </div>

          <div className="pt-6">
            <Button className="w-full rounded-full bg-[#C2410C] hover:bg-[#A2350A] text-white font-bold py-6 cursor-pointer shadow-md text-xs md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
              <a href="#builder">
                Create Your Marathi Biodata Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
