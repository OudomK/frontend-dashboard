"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateArticleDialog({
  open,
  onOpenChange,
}: Props) {
    console.log("CreateArticleDialog Render");  
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Create New Article
          </DialogTitle>

          <DialogDescription>
            Draft a comprehensive educational post for the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Article Title *
            </label>

            <input
              placeholder="e.g. Navigating the First Trimester"
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
          </div>

          {/* Category + Language */}
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category *
              </label>

              <select className="w-full rounded-lg border border-slate-200 px-4 py-3">
                <option>Select category...</option>
                <option>Pregnancy Care</option>
                <option>Menstrual Health</option>
                <option>Reproductive Health</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Language
              </label>

              <select className="w-full rounded-lg border border-slate-200 px-4 py-3">
                <option>English</option>
                <option>Khmer</option>
                <option>Khmer + English</option>
              </select>
            </div>

          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Cover Image
            </label>

            <div className="flex h-52 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              Upload Cover Image
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Content *
            </label>

            <textarea
              rows={12}
              placeholder="Write your article content here..."
              className="w-full rounded-lg border border-slate-200 p-4"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <Button variant="outline">
              Save Draft
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700">
              Publish Article
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}