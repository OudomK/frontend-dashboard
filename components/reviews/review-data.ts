// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewStatus = "needs_review" | "approved" | "flagged";
export type ConfidenceLevel = "high" | "medium" | "low";

export type ReviewSource = {
  filename: string;
  type: "pdf" | "xlsx" | "docx";
};

export type AiReview = {
  id: string;
  sessionId: string;
  timestamp: string;
  userQuestion: string;
  userQuestionTranslation?: string; // English translation if question is in another language
  aiAnswer: string;
  isEmergency: boolean;
  emergencyNote?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0–100
  sources: ReviewSource[];
  status: ReviewStatus;
  editedAnswer?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const aiReviews: AiReview[] = [
  {
    id: "r1",
    sessionId: "#A92-B4",
    timestamp: "Today, 10:24 AM",
    userQuestion:
      "តើខ្ញុំអាចទទួលថ្នាំសេរាមូស (Paracetamol) ពេលពុកកោះបានទេ? ខ្ញុំឈឺក្បាលខ្លាំង។",
    userQuestionTranslation:
      "Can I take Paracetamol during pregnancy? I have a bad headache.",
    aiAnswer:
      "បាទ/ចាស ថ្នាំបំបាត់ចំណុចប្អូតធម្មតាផ្អែកលើសុវត្ថិភាពសម្រាប់ប្រើបានក្នុងពេលពុកកោះ នៃអំឡុងភ្លើងកំដៅហ្គីប៊ូស សូមប្រើចំណុចថ្នាំ Acetaminophen ចំនួន 500mg–1000mg (ដែលអ្នកអាចគ្រប់គ្រង 4000mg ក្នុងមួយថ្ងៃ)។ ចែ តែចៀសមិនចេញ ប្រើសំញែប័ត្រ NSAIDs ទ្រង់ទ្រាយរួមជំងឺ ត្រូវរំណោះការដ្ឋានផ្លូវដោយទំរង់Ibuprofens។ ស្ត្រីពើង ហ្នឹងឯ ហ្ដ្រែ Preeclampsia ករណីខ្លះអ្នកគ្រប់ត្រូវ ហ្ដ្រីBy ដើម្បីដកស្រង់ស្ថានការណ៍ ទៅអ្នកខ្លួន ប្អូតឯ Preeclampsia",
    isEmergency: false,
    confidence: "medium",
    confidenceScore: 78,
    sources: [
      { filename: "Pregnancy_Care_Guidelines_2023.pdf", type: "pdf" },
      { filename: "Safe_Medications_Chart.xlsx", type: "xlsx" },
    ],
    status: "needs_review",
  },
  {
    id: "r2",
    sessionId: "#C44-X1",
    timestamp: "Yesterday, 04:15 PM",
    userQuestion:
      "I missed my period for 2 weeks, and now I have severe sharp cramps on the left side of my lower stomach. Is this normal?",
    aiAnswer:
      "⚠️ EMERGENCY WARNING DETECTED\n\nThe symptoms you describe — missed period combined with severe one-sided lower abdominal pain — may indicate an ectopic pregnancy. This is a medical emergency that requires immediate attention.\n\nPlease go to the nearest emergency room or call emergency services immediately. Do not wait or take any pain medication without medical supervision.",
    isEmergency: true,
    emergencyNote:
      "AI triggered emergency protocol — directed to ER. Confidence score below threshold for self-resolution.",
    confidence: "high",
    confidenceScore: 94,
    sources: [
      { filename: "Emergency_Obstetric_Protocol.pdf", type: "pdf" },
    ],
    status: "needs_review",
  },
  {
    id: "r3",
    sessionId: "#B17-K9",
    timestamp: "Yesterday, 11:30 AM",
    userQuestion:
      "How often should I take folic acid supplements before and during pregnancy?",
    aiAnswer:
      "Folic acid is recommended at 400–800 micrograms (mcg) daily for all women of reproductive age. If you are planning to become pregnant, start taking folic acid at least 1 month before conception. Continue throughout the first trimester (first 12 weeks) at minimum, and ideally for the full duration of your pregnancy. Some high-risk women may be prescribed a higher dose — please consult your OB-GYN.",
    isEmergency: false,
    confidence: "high",
    confidenceScore: 96,
    sources: [
      { filename: "Prenatal_Nutrition_Guide.pdf", type: "pdf" },
      { filename: "Supplement_Recommendations.docx", type: "docx" },
    ],
    status: "needs_review",
  },
  {
    id: "r4",
    sessionId: "#D88-P3",
    timestamp: "Jun 7, 09:05 AM",
    userQuestion:
      "I've had heavy bleeding for 5 days and it doesn't seem to be stopping. Is this my period?",
    aiAnswer:
      "Heavy bleeding lasting more than 7 days, or soaking more than one pad/tampon per hour for several consecutive hours, is considered abnormal and requires medical attention. While some variation in cycle length is normal, bleeding this heavy could indicate a hormonal imbalance, fibroids, or another condition requiring diagnosis.",
    isEmergency: false,
    confidence: "low",
    confidenceScore: 61,
    sources: [
      { filename: "Menstrual_Health_Guidelines.pdf", type: "pdf" },
    ],
    status: "needs_review",
  },
  // ── Approved ─────────────────────────────────────────────────────────────
  {
    id: "r5",
    sessionId: "#E22-M7",
    timestamp: "Jun 6, 02:30 PM",
    userQuestion: "What are signs of a UTI during pregnancy?",
    aiAnswer:
      "Common UTI symptoms during pregnancy include burning during urination, frequent urge to urinate, cloudy or strong-smelling urine, and pelvic discomfort. UTIs in pregnancy require prompt treatment — contact your doctor for a urine culture and appropriate antibiotics safe for pregnancy.",
    isEmergency: false,
    confidence: "high",
    confidenceScore: 92,
    sources: [
      { filename: "Pregnancy_Care_Guidelines_2023.pdf", type: "pdf" },
    ],
    status: "approved",
    reviewedAt: "Jun 6, 03:10 PM",
    reviewedBy: "Dr. Sarah Jenkins",
  },
  {
    id: "r6",
    sessionId: "#F55-T2",
    timestamp: "Jun 5, 10:00 AM",
    userQuestion: "Is it safe to exercise during the first trimester?",
    aiAnswer:
      "Yes, moderate exercise is generally safe and beneficial during the first trimester for most women. Activities like walking, swimming, and prenatal yoga are recommended. Avoid high-impact sports, contact sports, or activities with a fall risk. Always consult your doctor before starting any new exercise routine during pregnancy.",
    isEmergency: false,
    confidence: "high",
    confidenceScore: 95,
    sources: [
      { filename: "Prenatal_Fitness_Guide.pdf", type: "pdf" },
    ],
    status: "approved",
    reviewedAt: "Jun 5, 11:00 AM",
    reviewedBy: "Dr. Sarah Jenkins",
  },
  // ── Flagged & Edited ──────────────────────────────────────────────────────
  {
    id: "r7",
    sessionId: "#G11-R6",
    timestamp: "Jun 4, 08:45 AM",
    userQuestion: "Can I take ibuprofen for period cramps?",
    aiAnswer:
      "Ibuprofen is effective for menstrual cramps and can be taken at the standard dose of 200–400 mg every 4–6 hours as needed. It is best taken with food. Avoid if you have kidney issues, stomach ulcers, or are pregnant.",
    isEmergency: false,
    confidence: "medium",
    confidenceScore: 74,
    sources: [
      { filename: "Safe_Medications_Chart.xlsx", type: "xlsx" },
    ],
    status: "flagged",
    editedAnswer:
      "Ibuprofen (an NSAID) can help with menstrual cramps at 200–400 mg every 4–6 hours with food. However, ibuprofen should be AVOIDED during pregnancy — especially in the third trimester — as it can cause serious complications. If you are or might be pregnant, use paracetamol instead and consult your doctor.",
    reviewedAt: "Jun 4, 09:30 AM",
    reviewedBy: "Dr. Sarah Jenkins",
  },
];
