
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportMarkdown: string;
  title: string;
}

export function ReportDialog({ isOpen, onClose, reportMarkdown, title }: ReportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-headline text-2xl text-primary">{title}</DialogTitle>
          <DialogDescription>
            Full Investment Research Report
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow min-h-0">
          <ScrollArea className="h-full w-full pr-4">
            <article className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-h1:font-headline prose-h2:font-headline prose-h3:font-headline prose-h2:border-b prose-h2:pb-2 prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reportMarkdown}
              </ReactMarkdown>
            </article>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
