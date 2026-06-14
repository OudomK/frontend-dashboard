export type FaqStatus = "active" | "draft" | "inactive";

export type FaqCategory =
  | "Pregnancy Care"
  | "Menstrual Health"
  | "Infection Care"
  | "Reproductive Health"
  | "Emergency"
  | "General Hygiene"
  | "Account & Security";

export type Faq = {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory;
  status: FaqStatus;
  updatedAt: string;
  updatedBy: string;
};

export const faqCategories: FaqCategory[] = [
  "Pregnancy Care",
  "Menstrual Health",
  "Infection Care",
  "Reproductive Health",
  "Emergency",
  "General Hygiene",
  "Account & Security",
];

export const faqData: Faq[] = [
  {
    id: 1,
    question: "What are the early signs of pregnancy?",
    answer:
      "Common early signs include a missed period, tender or swollen breasts, nausea with or without vomiting, increased urination, and fatigue. Some women may also experience light spotting or cramping.",
    category: "Pregnancy Care",
    status: "active",
    updatedAt: "Oct 24, 2023",
    updatedBy: "Dr. Anderson",
  },
  {
    id: 2,
    question: "Is it normal to have irregular periods?",
    answer:
      "Irregular periods can be normal during puberty and perimenopause. However, if they become persistently irregular, it could indicate conditions like PCOS, thyroid issues, or hormonal imbalances.",
    category: "Menstrual Health",
    status: "active",
    updatedAt: "Oct 18, 2023",
    updatedBy: "System Admin",
  },
  {
    id: 3,
    question: "How can I treat a mild yeast infection at home?",
    answer:
      "Over-the-counter antifungal creams, ointments, or suppositories can treat a yeast infection effectively. Maintain good hygiene and wear loose, breathable clothing. If symptoms persist beyond a week, see a doctor.",
    category: "Infection Care",
    status: "draft",
    updatedAt: "Oct 12, 2023",
    updatedBy: "Dr. Smith",
  },
  {
    id: 4,
    question: "What vitamins should I take before pregnancy?",
    answer:
      "Folic acid is crucial. Doctors recommend taking 400 micrograms of folic acid daily starting at least one month before trying to conceive. Iron, calcium, and vitamin D are also important.",
    category: "Reproductive Health",
    status: "active",
    updatedAt: "Sep 28, 2023",
    updatedBy: "Dr. Anderson",
  },
  {
    id: 5,
    question: "When should I see a doctor for severe abdominal pain?",
    answer:
      "Seek immediate emergency care if the pain is sudden and severe, accompanied by fever, bloody stools, persistent nausea and vomiting, or tenderness when touching the abdomen.",
    category: "Emergency",
    status: "active",
    updatedAt: "Sep 15, 2023",
    updatedBy: "System Admin",
  },
  {
    id: 6,
    question: "How often should I get a Pap smear?",
    answer:
      "Women aged 21–65 should get a Pap smear every 3 years. Women 30–65 may get a Pap smear combined with an HPV test every 5 years. Talk to your doctor about the schedule that's right for you.",
    category: "Reproductive Health",
    status: "active",
    updatedAt: "Sep 10, 2023",
    updatedBy: "Dr. Jenkins",
  },
  {
    id: 7,
    question: "What are signs of a hormonal imbalance?",
    answer:
      "Common signs include irregular periods, acne, unexplained weight gain or loss, hair thinning, mood swings, fatigue, and changes in libido. A blood test can help confirm a hormonal imbalance.",
    category: "Menstrual Health",
    status: "inactive",
    updatedAt: "Aug 30, 2023",
    updatedBy: "Dr. Smith",
  },
];