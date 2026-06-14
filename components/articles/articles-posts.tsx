"use client";
import { useState, useEffect } from "react";
import { CreateArticleDialog } from "./create-article-dialog";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  ImageIcon,
  ChevronDown,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";



const stats = [
  {
    title: "Total content items",
    value: "128",
    subtitle: "Across articles, quick posts, and alerts",
  },
  {
    title: "Published",
    value: "84",
    subtitle: "Visible to users in app and web",
  },
  {
    title: "Drafts",
    value: "21",
    subtitle: "Awaiting edits or scheduling",
  },
  {
    title: "Needs review",
    value: "7",
    subtitle: "Pending doctor approval before publish",
  },
];

const articles = [
  {
    id: 1,
    title: "First Trimester Nutrition: Essential Foods for You and Your Baby",
    description:
      "Congratulations on your pregnancy! The first trimester is a crucial time for your baby's development.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300",
    views: "4.2k",
  },

  {
    id: 2,
    title: "Understanding Prenatal Vitamins: What to Take and Why",
    description:
      "Prenatal vitamins are designed to support both you and your baby's nutritional needs.",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300",
    views: "3.8k",
  },

  {
    id: 3,
    title: "Safe Exercise Routines for Expectant Mothers",
    description:
      "Staying active during pregnancy can improve your mood and overall health.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300",
    views: "5.1k",
  },

  {
    id: 4,
    title: "Managing Morning Sickness: Tips and Tricks",
    description:
      "Morning sickness affects many expectant mothers. Explore safe remedies and lifestyle adjustments.",
    image:
      "https://images.unsplash.com/photo-1514995669114-6081e934b693?w=300",
    views: "4.7k",
  },
];

export function ArticlesPosts() {

    useEffect(() => {
  console.log("HYDRATED");
}, []);

  const [openArticleDialog, setOpenArticleDialog] =
    useState(false);

    console.log("dialog state:", openArticleDialog);


  return (
    <DashboardLayout
      role="doctor"
      title="Articles & Posts"
      subtitle="Create, organize, and publish trusted women's health content for the app and web experience."
    >
      {/* Top Actions */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
            All Posts
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600">
            Published
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600">
            Drafts
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600">
            Needs Review
          </button>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium">
            Category
            <ChevronDown className="h-4 w-4" />
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium">
            Newest First
          </button>


       <button
  onClick={() => setOpenArticleDialog(true)}
  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
>
  <Plus className="h-4 w-4" />
  New Article
</button>




        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {item.title}
            </p>

            <h3 className="mt-3 text-4xl font-bold text-slate-900">
              {item.value}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Recent Content */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recent Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage educational posts, pregnancy tips, nutrition guides and warning sign articles.
              </p>
            </div>

            <button className="text-sm font-medium text-slate-600">
              Bulk Actions
            </button>
          </div>

          {articles.map((article) => (
            <div
              key={article.id}
              className="flex gap-4 border-b border-slate-100 p-6 last:border-0"
            >
              <img
                src={article.image}
                alt={article.title}
                className="h-24 w-28 rounded-xl object-cover"
              />

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
                      {article.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {article.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Published
                    </span>

                    <span className="text-sm text-slate-400">
                      {article.views} views
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                    <Eye className="h-4 w-4" />
                  </button>

                  <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Composer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Quick Composer
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Prepare a new article or short educational post.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Enter article title"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select className="w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option>Pregnancy Care</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Language
                </label>

                <select className="w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option>Khmer + English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Cover Image
              </label>

              <div className="flex h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <ImageIcon className="mb-3 h-8 w-8 text-slate-400" />

                <p className="text-sm font-medium text-slate-600">
                  Click to upload or drag and drop
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG, SVG (800x400)
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Summary
              </label>

              <textarea
                rows={5}
                className="w-full rounded-xl border border-slate-200 p-4"
                placeholder="Write a short summary for patients..."
              />
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-xl border border-slate-200 py-3 font-medium">
                Save Draft
              </button>

              <button className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                Publish
              </button>
            </div>
          </div>
        </section>
      </div>


      <CreateArticleDialog
  open={openArticleDialog}
  onOpenChange={setOpenArticleDialog}
/>

    </DashboardLayout>
  );
}