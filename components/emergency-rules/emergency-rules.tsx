// "use client";

// import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
// import { Button } from "@/components/ui/button";
// import {
//   Pencil,
//   Trash2,
// } from "lucide-react";

// const emergencyRules = [
//   {
//     id: 1,
//     title: "Ectopic Pregnancy Suspected",
//     category: "Pregnancy Care",
//     symptoms: [
//       "severe abdominal pain",
//       "spotting",
//       "shoulder pain",
//     ],
//     advice:
//       "Seek immediate emergency medical care. These symptoms may indicate an ectopic pregnancy.",
//     status: "Active",
//   },

//   {
//     id: 2,
//     title: "Severe Postpartum Bleeding",
//     category: "Reproductive Health",
//     symptoms: [
//       "large blood clots",
//       "dizziness",
//       "blurred vision",
//     ],
//     advice:
//       "Go to the nearest hospital immediately. Possible postpartum hemorrhage.",
//     status: "Active",
//   },

//   {
//     id: 3,
//     title: "High Fever In Pregnancy",
//     category: "Pregnancy Care",
//     symptoms: [
//       "fever over 39°C",
//       "chills",
//       "burning urination",
//     ],
//     advice:
//       "Contact your doctor immediately. High fever during pregnancy requires urgent evaluation.",
//     status: "Active",
//   },
// ];

// export function EmergencyRules() {
//   return (
//     <DashboardLayout
//       role="doctor"
//       title="Emergency Rules"
//       subtitle="Configure medical guidance and alert messages for high-risk symptoms."
//     >
//         <section className="mb-6 overflow-hidden rounded-xl border border-orange-300 bg-orange-50">
//   <div className="flex items-center justify-between bg-orange-500 px-5 py-3 text-white">
//     <h2 className="font-semibold">
//       AI Suggestion: New Emergency Rule Detected
//     </h2>

//     <span className="text-sm">
//       1 pending review
//     </span>
//   </div>

//   <div className="grid gap-4 p-5 lg:grid-cols-3">
//     <div>
//       <h3 className="font-semibold">
//         Severe Allergic Reaction (Anaphylaxis)
//       </h3>

//       <div className="mt-3 flex flex-wrap gap-2">
//         <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
//           difficulty breathing
//         </span>

//         <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
//           swollen face
//         </span>

//         <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
//           hives
//         </span>
//       </div>
//     </div>

//     <div>
//       <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
//         This could be a severe allergic reaction.
//       </div>
//     </div>

//     <div className="flex items-center justify-end gap-2">
//       <Button variant="outline">
//         Dismiss
//       </Button>

//       <Button className="bg-green-600 hover:bg-green-700">
//         Approve & Activate
//       </Button>
//     </div>
//   </div>
// </section>
//       <div className="space-y-4">   

//         {emergencyRules.map((rule) => (
//           <div
//             key={rule.id}
//             className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
//           >
//             {/* Header */}
//             <div className="flex items-start justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-900">
//                   {rule.title}
//                 </h3>

//                 <p className="mt-1 text-sm text-slate-500">
//                   {rule.category}
//                 </p>
//               </div>

//               <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
//                 {rule.status}
//               </span>
//             </div>

//             {/* Symptoms */}
//             <div className="mt-4 flex flex-wrap gap-2">
//               {rule.symptoms.map((symptom) => (
//                 <span
//                   key={symptom}
//                   className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
//                 >
//                   {symptom}
//                 </span>
//               ))}
//             </div>

//             {/* Advice */}
//             <div className="mt-4 rounded-lg bg-slate-50 p-4">
//               <p className="text-sm text-slate-600">
//                 {rule.advice}
//               </p>
//             </div>
//           </div>
//         ))}

//       </div>
//     </DashboardLayout>
//   );
// }



"use client";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";

import {
  Pencil,
  Trash2,
  Search,
  TriangleAlert,
} from "lucide-react";

const emergencyRules = [
  {
    id: 1,
    title: "Ectopic Pregnancy Suspected",
    category: "Pregnancy Care",
    symptoms: [
      "severe abdominal pain",
      "spotting",
      "shoulder pain",
      "positive pregnancy test",
    ],
    advice:
      "Seek immediate emergency medical care. These symptoms may indicate an ectopic pregnancy, which can be life-threatening if not treated promptly.",
    status: "Active",
  },
  {
    id: 2,
    title: "Severe Postpartum Bleeding",
    category: "Reproductive Health",
    symptoms: [
      "soaking pad in an hour",
      "large blood clots",
      "dizziness",
      "blurred vision",
    ],
    advice:
      "Go to the nearest hospital immediately. This could be postpartum hemorrhage requiring urgent medical intervention.",
    status: "Active",
  },
  {
    id: 3,
    title: "High Fever In Pregnancy",
    category: "Pregnancy Care",
    symptoms: [
      "fever over 39°C",
      "chills",
      "severe back pain",
      "burning urination",
    ],
    advice:
      "Contact your doctor or visit a clinic immediately. High fever during pregnancy can pose serious risks to you and your baby.",
    status: "Active",
  },
];

export function EmergencyRules({
  role = "doctor",
}: {
  role?: "doctor" | "admin";
}) {
  return (
    <DashboardLayout
      role={role}
      title="Emergency Rules"
      subtitle="Configure medical guidance and alert messages for high-risk symptoms."
    >
      {/* AI Suggestion Banner */}
      <section className="mb-6 overflow-hidden rounded-xl border border-orange-300 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5" />
            <span className="font-semibold">
              AI Suggestion: New Emergency Rule Detected
            </span>
          </div>

          <span className="text-sm">
            1 pending review
          </span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_1.8fr_auto]">
          <div>
            <h3 className="font-semibold text-slate-900">
              Severe Allergic Reaction (Anaphylaxis)
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "difficulty breathing",
                "swollen face",
                "hives",
                "rapid heartbeat",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-500">
              Suggested AI Advice Message:
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              "This could be a severe allergic reaction (anaphylaxis).
              Please seek emergency medical help immediately or call an
              ambulance. Do not wait."
            </div>
          </div>

          <div className="flex items-start gap-2 lg:justify-end">
            <Button variant="outline">
              Dismiss
            </Button>

            <Button className="bg-green-600 hover:bg-green-700">
              Approve & Activate
            </Button>
          </div>
        </div>
      </section>

      {/* Desktop Table */}
      <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Configured Emergency Protocols
          </h2>

          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Search rules or symptoms..."
              className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-500">
              <th className="px-5 py-4">Rule Definition</th>
              <th className="px-5 py-4">Triggering Symptoms</th>
              <th className="px-5 py-4">AI Advice Text</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {emergencyRules.map((rule) => (
              <tr
                key={rule.id}
                className="border-t border-slate-200 align-top"
              >
                <td className="px-5 py-5">
                  <h3 className="font-semibold text-slate-900">
                    {rule.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Applies to: {rule.category}
                  </p>
                </td>

                <td className="px-5 py-5">
                  <div className="flex max-w-sm flex-wrap gap-2">
                    {rule.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-5 py-5">
                  <div className="max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {rule.advice}
                  </div>
                </td>

                <td className="px-5 py-5">
                  <span className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    {rule.status}
                  </span>
                </td>

                <td className="px-5 py-5">
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {emergencyRules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {rule.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {rule.category}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {rule.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {rule.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  {symptom}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                {rule.advice}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}