import {
  CalendarDays,
  Download,
  MessageSquare,
  PhoneForwarded,
  Target,
  Zap,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  {
    title: "Total AI Queries",
    value: "24,592",
    note: "+14.2% vs last period",
    icon: MessageSquare,
    iconTone: "bg-blue-50 text-blue-600",
    noteTone: "text-emerald-600",
  },
  {
    title: "Avg. Response Time",
    value: "1.2s",
    note: "-0.1s vs last period",
    icon: Zap,
    iconTone: "bg-blue-50 text-blue-600",
    noteTone: "text-emerald-600",
  },
  {
    title: "Knowledge Hit Rate",
    value: "96.4%",
    note: "+2.1% accuracy improved",
    icon: Target,
    iconTone: "bg-blue-50 text-blue-600",
    noteTone: "text-emerald-600",
  },
  {
    title: "Escalated to Doctor",
    value: "342",
    note: "1.4% of total queries",
    icon: PhoneForwarded,
    iconTone: "bg-red-50 text-red-500",
    noteTone: "text-slate-400",
  },
];

const topics = [
  { label: "Pregnancy Care", value: 45, color: "bg-blue-600" },
  { label: "Menstrual Health", value: 28, color: "bg-blue-500" },
  { label: "Infection Care", value: 15, color: "bg-emerald-500" },
  { label: "General Hygiene", value: 8, color: "bg-amber-500" },
  { label: "Other Queries", value: 4, color: "bg-violet-500" },
];

const methods = [
  { label: "AI Chatbot", value: 55, color: "bg-blue-600" },
  { label: "Browse Topics", value: 30, color: "bg-emerald-500" },
  { label: "FAQ Search", value: 15, color: "bg-amber-500" },
];

const escalations = [
  {
    query: '"Sharp pain in lower left abdomen with spotting"',
    category: "Pregnancy Q1",
    trigger: "Triggered",
    resolution: "Directed to ER/Clinic",
  },
  {
    query: '"Missed period 3 weeks but test is negative"',
    category: "Menstrual Health",
    trigger: "None",
    resolution: "Advised Doctor Visit",
  },
  {
    query: '"Continuous high fever 39C for 2 days"',
    category: "Infection",
    trigger: "Triggered",
    resolution: "Emergency Alert",
  },
  {
    query: '"Is it safe to take paracetamol in 2nd trimester?"',
    category: "Pregnancy Q2",
    trigger: "None",
    resolution: "Answered + KB Ref",
  },
  {
    query: '"Heavy bleeding changing pad every hour"',
    category: "Menstrual Health",
    trigger: "Warning",
    resolution: "Urgent Clinic Visit",
  },
];

function AnalyticsMetricCard({
  title,
  value,
  note,
  icon: Icon,
  iconTone,
  noteTone,
}: (typeof metrics)[number]) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            {title}
          </p>
          <p className="mt-7 text-4xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className={`mt-3 text-sm ${noteTone}`}>
        {note}
      </p>
    </section>
  );
}

function TriggerBadge({ value }: { value: string }) {
  if (value === "Triggered") {
    return (
      <Badge className="rounded-md bg-red-600 px-2.5 text-xs font-bold uppercase text-white">
        Triggered
      </Badge>
    );
  }

  if (value === "Warning") {
    return (
      <Badge className="rounded-md bg-amber-500 px-2.5 text-xs font-bold uppercase text-slate-950">
        Warning
      </Badge>
    );
  }

  return (
    <Badge className="rounded-md bg-slate-100 px-2.5 text-xs font-bold uppercase text-slate-700">
      None
    </Badge>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout
      role="admin"
      title="System Analytics"
      subtitle="Deep dive into system usage, user engagement, and AI performance."
      actions={
        <>
          <Button variant="outline" className="h-10 rounded-md px-4">
            <CalendarDays />
            Last 30 Days
          </Button>

          <Button className="h-10 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700">
            <Download />
            Export Report
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <AnalyticsMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_356px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                AI Query Volume Over Time
              </h2>
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                View Details
              </Button>
            </div>

            <div className="px-6 py-6">
              <svg
                className="h-[270px] w-full"
                viewBox="0 0 720 270"
                role="img"
                aria-label="AI query volume line chart"
              >
                <defs>
                  <linearGradient id="queryFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0b73d9" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#0b73d9" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[30, 85, 140, 195].map((y) => (
                  <line
                    key={y}
                    x1="48"
                    x2="704"
                    y1={y}
                    y2={y}
                    stroke="#e8eef5"
                    strokeWidth="1"
                  />
                ))}

                {["1k", "750", "500", "250", "0"].map((label, index) => (
                  <text
                    key={label}
                    x="8"
                    y={index === 4 ? 250 : 35 + index * 55}
                    fill="#9aa4b2"
                    fontSize="12"
                  >
                    {label}
                  </text>
                ))}

                <path
                  d="M48 230 L114 205 L180 218 L246 170 L312 194 L378 132 L444 144 L510 86 L576 110 L642 60 L704 72 L704 250 L48 250 Z"
                  fill="url(#queryFill)"
                />
                <path
                  d="M48 230 L114 205 L180 218 L246 170 L312 194 L378 132 L444 144 L510 86 L576 110 L642 60 L704 72"
                  fill="none"
                  stroke="#0b73d9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />

                {[510, 642].map((x, index) => (
                  <circle
                    key={x}
                    cx={x}
                    cy={index === 0 ? 86 : 60}
                    r="6"
                    fill="#ffffff"
                    stroke="#0b73d9"
                    strokeWidth="3"
                  />
                ))}

                {["Oct 1", "Oct 5", "Oct 10", "Oct 15", "Oct 20", "Oct 25", "Oct 30"].map((label, index) => (
                  <text
                    key={label}
                    x={48 + index * 109}
                    y="268"
                    fill="#9aa4b2"
                    fontSize="12"
                    textAnchor={index === 0 ? "start" : index === 6 ? "end" : "middle"}
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                Top Health Topics
              </h2>
            </div>

            <div className="space-y-5 px-6 py-7">
              {topics.map((topic) => (
                <div key={topic.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-950">{topic.label}</span>
                    <span className="text-slate-950">{topic.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${topic.color}`}
                      style={{ width: `${topic.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[356px_minmax(0,2fr)]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                Access Methods
              </h2>
            </div>

            <div className="flex min-h-[340px] flex-col justify-center px-6 py-6">
              
              {/* SVG Donut Chart */}
              <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f8fafc" strokeWidth="3" />
                  
                  {/* Segment 1: AI Chatbot (55%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="55 45" strokeDashoffset="100" />
                  
                  {/* Segment 2: Browse Topics (30%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="45" />
                  
                  {/* Segment 3: FAQ Search (15%) */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="15" />
                </svg>
                
                <div className="text-center select-none">
                  <p className="text-2xl font-extrabold text-slate-950 tracking-tight">24.5k</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sessions</p>
                </div>
              </div>

              <div className="mt-16 space-y-4">
                {methods.map((method) => (
                  <div key={method.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded ${method.color}`} />
                      <span className="font-medium text-slate-950">{method.label}</span>
                    </div>
                    <span className="text-slate-950">{method.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                Recent Escalated Queries
              </h2>
              <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
                View All Escalations
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400">
                    <th className="px-5 py-3">Query Summary</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Emergency Trigger</th>
                    <th className="px-5 py-3">Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {escalations.map((item) => (
                    <tr key={item.query} className="border-b border-slate-100 last:border-0">
                      <td className="max-w-[320px] px-5 py-4 font-medium text-slate-950">
                        {item.query}
                      </td>
                      <td className="px-5 py-4 text-slate-950">
                        {item.category}
                      </td>
                      <td className="px-5 py-4">
                        <TriggerBadge value={item.trigger} />
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {item.resolution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
