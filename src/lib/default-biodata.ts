import { type BiodataFormValues } from "@/types/biodata";

export const defaultBiodataValues: BiodataFormValues = {
  language: "English",
  mantra: "॥ श्री गणेशाय नमः ॥",
  title: "Biodata",
  personalDetails: [
    { id: "fullName", label: "Full Name", value: "Baliram Giri", type: "text", isDefault: true },
    { id: "dateOfBirth", label: "Date of Birth", value: "1998-05-15", type: "date", isDefault: true },
    { id: "timeOfBirth", label: "Time of Birth", value: "10:30 (Morning)", type: "time12", isDefault: true },
    { id: "placeOfBirth", label: "Place of Birth", value: "Pune, Maharashtra", type: "text", isDefault: true },
    { id: "height", label: "Height", value: "5 ft 8 in (172 cm)", type: "select", options: [
      "4 ft (122 cm)", "4 ft 1 in (124 cm)", "4 ft 2 in (127 cm)", "4 ft 3 in (129 cm)", "4 ft 4 in (132 cm)", "4 ft 5 in (134 cm)", "4 ft 6 in (137 cm)", "4 ft 7 in (139 cm)", "4 ft 8 in (142 cm)", "4 ft 9 in (144 cm)", "4 ft 10 in (147 cm)", "4 ft 11 in (149 cm)",
      "5 ft (152 cm)", "5 ft 1 in (154 cm)", "5 ft 2 in (157 cm)", "5 ft 3 in (160 cm)", "5 ft 4 in (162 cm)", "5 ft 5 in (165 cm)", "5 ft 6 in (167 cm)", "5 ft 7 in (170 cm)", "5 ft 8 in (172 cm)", "5 ft 9 in (175 cm)", "5 ft 10 in (177 cm)", "5 ft 11 in (180 cm)",
      "6 ft (182 cm)", "6 ft 1 in (185 cm)", "6 ft 2 in (187 cm)", "6 ft 3 in (190 cm)", "6 ft 4 in (193 cm)", "6 ft 5 in (195 cm)", "6 ft 6 in (198 cm)", "6 ft 7 in (200 cm)", "6 ft 8 in (203 cm)", "6 ft 9 in (205 cm)", "6 ft 10 in (208 cm)", "6 ft 11 in (210 cm)",
      "7 ft (213 cm)", "7 ft 1 in (216 cm)"
    ], isDefault: true },
    { id: "maritalStatus", label: "Marital Status", value: "Single", type: "select", options: ["Single", "Divorced", "Widowed", "Separated"], isDefault: true },
    { id: "bloodGroup", label: "Blood Group", value: "O+", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], isDefault: true },
    { id: "complexion", label: "Complexion", value: "Wheatish", type: "select", options: ["Fair", "Very Fair", "Wheatish", "Wheatish Brown", "Dark"], isDefault: true },
    { id: "religion", label: "Religion", value: "Hindu", type: "select", options: ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Other"], isDefault: true },
    { id: "caste", label: "Caste", value: "Maratha", type: "text", isDefault: true },
    { id: "gotra", label: "Gotra", value: "Kashyapa", type: "select", options: [
      "Agastya", "Angirasa", "Atri", "Bharadwaja", "Bhrigu", "Gautama", "Jamadagni", "Kashyapa", "Shandilya", "Vashishta", "Vishvamitra", "Gargya", "Kaushika", "Vatsa", "Mudgala", "Parashara", "Upamanyu", "Harita", "Other"
    ], isDefault: true },
    { id: "rashi", label: "Rashi (Zodiac)", value: "Kanya (Virgo)", type: "select", options: ["Mesh (Aries)", "Vrishabh (Taurus)", "Mithun (Gemini)", "Kark (Cancer)", "Singh (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchik (Scorpio)", "Dhanu (Sagittarius)", "Makar (Capricorn)", "Kumbh (Aquarius)", "Meen (Pisces)", "Other"], isDefault: true },
    { id: "nakshatra", label: "Nakshatra", value: "Chitra", type: "select", options: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati", "Other"], isDefault: true },
    { id: "manglik", label: "Manglik", value: "No", type: "select", options: ["No", "Yes", "Partial (Anshik)", "Don't Know", "Other"], isDefault: true },
  ],
  educationDetails: [
    { id: "education", label: "Highest Education", value: "B.E. / B.Tech", type: "select", options: ["10th", "12th", "Diploma", "B.A.", "B.Sc.", "B.Com", "B.E. / B.Tech", "BCA", "BBA", "M.A.", "M.Sc.", "M.Com", "M.E. / M.Tech", "MCA", "MBA", "MBBS", "Ph.D.", "CA", "Other"], isDefault: true },
    { id: "college", label: "College/University", value: "Pune University", type: "text", isDefault: true },
    { id: "occupation", label: "Occupation/Job", value: "Software Engineer", type: "select", options: ["Software Engineer", "Doctor", "Teacher / Professor", "Government Job", "Business", "Self Employed", "Banker", "CA / Accountant", "Lawyer", "Engineer (Non-IT)", "Defense / Police", "Private Job", "Not Working", "Other"], isDefault: true },
    { id: "annualIncome", label: "Annual Income", value: "10-15 LPA", type: "select", options: ["0-5 LPA", "5-10 LPA", "10-15 LPA", "15-20 LPA", "20-25 LPA", "25-30 LPA", "30-35 LPA", "35-40 LPA", "40-45 LPA", "45-50 LPA", "50+ LPA"], isDefault: true },
    { id: "companyName", label: "Company Name", value: "Google", type: "company", isDefault: true },
    { id: "companyLogo", label: "Company Logo", value: "", type: "hidden", isDefault: false },
  ],
  familyDetails: [
    { id: "fatherName", label: "Father's Name", value: "Shankar Giri", type: "text", isDefault: true },
    { id: "fatherOccupation", label: "Father's Occupation", value: "Retired", type: "text", isDefault: true },
    { id: "motherName", label: "Mother's Name", value: "Savita Giri", type: "text", isDefault: true },
    { id: "motherOccupation", label: "Mother's Occupation", value: "Housewife", type: "text", isDefault: true },
    { id: "totalBrothers", label: "Total Brothers", value: "1", type: "number", isDefault: true },
    { id: "totalSisters", label: "Total Sisters", value: "0", type: "number", isDefault: true },
    { id: "nativePlace", label: "Native Place", value: "Satara, Maharashtra", type: "text", isDefault: true },
  ],
  contactDetails: [
    { id: "mobileNumber", label: "Mobile Number", value: "+91 9876543210", type: "text", isDefault: true },
    { id: "email", label: "Email ID", value: "baliram.giri@example.com", type: "text", isDefault: true },
    { id: "residentialAddress", label: "Residential Address", value: "Baner, Pune, 411045", type: "textarea", isDefault: true },
  ]
};

