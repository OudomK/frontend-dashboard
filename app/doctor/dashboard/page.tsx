import {
  AlertTriangle,
  BookMarked,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Grid2X2,
  HeartPulse,
  ListChecks,
  MoreVertical,
  PenLine,
  RotateCw,
  UploadCloud,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  {
    title: "AI Knowledge Documents",
    value: "142",
    note: "+3 uploads this week",
    icon: FileCheck2,
    iconTone: "text-blue-600",
  },
  {
    title: "Published Articles",
    value: "38",
    note: "In 4 health categories",
    icon: BookMarked,
    iconTone: "text-blue-600",
  },
  {
    title: "Active Emergency Rules",
    value: "12",
    note: "Triggered 45 times today",
    icon: HeartPulse,
    iconTone: "text-red-500",
  },
  {
    title: "Pending AI Reviews",
    value: "5",
    note: "Require doctor verification",
    icon: ListChecks,
    iconTone: "text-slate-900",
  },
];

const uploads = [
  {
    name: "Pregnancy_Trimester_1_Guide.pdf",
    category: "Pregnancy Care",
    status: "Active",
    icon: Grid2X2,
    iconTone: "text-red-500",
  },
  {
    name: "PCOS_Clinical_Guidelines_2023.docx",
    category: "Reproductive Health",
    status: "Processing",
    icon: FileText,
    iconTone: "text-blue-600",
  },
  {
    name: "Infection_Symptoms_List.xlsx",
    category: "Infection Care",
    status: "Active",
    icon: FileSpreadsheet,
    iconTone: "text-emerald-600",
  },
  {
    name: "Old_Menstrual_Hygiene_2019.pdf",
    category: "Menstrual Health",
    status: "Deactivated",
    icon: Grid2X2,
    iconTone: "text-red-500",
  },
];

const tasks = [
  {
    title: "Emergency Rule Update Needed",
    body: "Review new definitions for ectopic pregnancy symptoms.",
    icon: AlertTriangle,
    tone: "bg-red-600 text-white",
  },
  {
    title: "5 AI Answers for Review",
    body: "System flagged borderline responses regarding medication dosage.",
    icon: FileQuestion,
    tone: "bg-amber-500 text-slate-950",
  },
  {
    title: "Unanswered User Queries",
    body: "3 common questions missing from current Knowledge Base.",
    icon: FileQuestion,
    tone: "bg-sky-50 text-slate-700",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "Processing") {
    return (
      <Badge className="gap-1 rounded-md bg-amber-400 px-2.5 text-xs font-bold text-slate-950">
        <RotateCw className="h-3 w-3" />
        Processing
      </Badge>
    );
  }

  if (status === "Active") {
    return (
      <Badge className="rounded-md bg-emerald-600 px-2.5 text-xs font-bold text-white">
        Active
      </Badge>
    );
  }

  return (
    <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold text-slate-700">
      Deactivated
    </Badge>
  );
}

function DoctorMetricCard({
  title,
  value,
  note,
  icon: Icon,
  iconTone,
}: (typeof metrics)[number]) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <Icon className={`h-5 w-5 ${iconTone}`} />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {note}
      </p>
    </section>
  );
}

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout
      role="doctor"
      title="Doctor Dashboard"
      subtitle="Manage your clinic's AI knowledge base, content, and emergency protocols."
      actions={
        <>
          <Button variant="secondary" className="h-9 rounded-md bg-slate-100 px-4 text-slate-900">
            <PenLine />
            Write Article
          </Button>

          <Button className="h-9 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700">
            <UploadCloud />
            Upload Document
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DoctorMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_364px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-950">
                Recent Knowledge Uploads
              </h2>
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                View All
              </Button>
            </div>

            {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-400">
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">AI Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => {
                    const Icon = upload.icon;

                    return (
                      <tr key={upload.name} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${upload.iconTone}`} />
                            <span className="font-medium text-slate-950">
                              {upload.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-slate-700">
                          {upload.category}
                        </td>
                        <td className="px-5 py-5">
                          <StatusBadge status={upload.status} />
                        </td>
                        <td className="px-5 py-5 text-right">
                          <Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${upload.name}`}>
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile */}
<div className="space-y-3 p-4 lg:hidden">
  {uploads.map((upload) => {
    const Icon = upload.icon;

    return (
      <div
        key={upload.name}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start gap-3">
          <Icon
            className={`mt-1 h-5 w-5 shrink-0 ${upload.iconTone}`}
          />

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold text-slate-900">
              {upload.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {upload.category}
            </p>

            <div className="mt-3">
              <StatusBadge status={upload.status} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  })}
</div>

          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-950">
                Action Needed
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.map((task) => {
                const Icon = task.icon;

                return (
                  <article key={task.title} className="flex gap-4 px-5 py-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${task.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold leading-5 text-slate-950">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-400">
                        {task.body}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-center">
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                View All Tasks
              </Button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
