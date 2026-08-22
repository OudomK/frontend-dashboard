"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/use-translation";

function formatBackendError(error: any): string {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
      return `${field}: ${d.msg}`;
    }).join(", ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return error.response?.data?.message || error.message || "An error occurred";
}

export function ChatUsageWidget() {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchChart() {
      try {
        const res = await apiClient.get("/api/v1/dashboard/chat-usage-chart");
        if (res.data && res.data.data) {
          setChartData(res.data.data);
        }
      } catch (error: any) {
        toast.error(formatBackendError(error));
      }
    }
    fetchChart();
  }, []);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6 lg:py-5">
        <h2 className="font-bold text-slate-950">
          {t("dashboard.aiChatUsage")}
        </h2>
        <Link href="/dashboard/chat-logs">
          <Button variant="link" className="h-auto px-0 font-semibold text-blue-600">
            {t("dashboard.viewFullReport")}
          </Button>
        </Link>
      </div>

      <div className="px-6 py-6 lg:px-10 flex-1 flex flex-col justify-end">
        <div className="relative flex h-[200px] items-end justify-between gap-4 border-b border-slate-100 pb-2">
          {(() => {
            const dataToUse = chartData.length > 0 ? chartData : [
              { day: "Mon", value: 0 },
              { day: "Tue", value: 0 },
              { day: "Wed", value: 0 },
              { day: "Thu", value: 0 },
              { day: "Fri", value: 0 },
              { day: "Sat", value: 0 },
              { day: "Sun", value: 0 },
            ];
            const maxVal = Math.max(...dataToUse.map(d => d.value), 1);
            
            return dataToUse.map((item) => {
              const percentage = Math.max((item.value / maxVal) * 100, 5);
              const color = item.day === "Sat" || item.day === "Sun" ? "bg-blue-500/70" : "bg-blue-600";
              
              return (
                <div key={item.day} className="group relative flex flex-1 flex-col items-center h-full justify-end select-none">
                  <div className="absolute -top-7 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-all duration-200 z-10 whitespace-nowrap">
                    {item.value} queries
                  </div>
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-90 ${color}`}
                    style={{ height: `${percentage}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-400 mt-2 block shrink-0">{item.day}</span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
}
