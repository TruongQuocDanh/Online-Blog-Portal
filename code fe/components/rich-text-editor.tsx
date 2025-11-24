"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Heading2, List, Code, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "text";
    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      const cursorPos = start + before.length + selectedText.length;
      textarea.selectionStart = cursorPos;
      textarea.selectionEnd = cursorPos;
      textarea.focus();
    }, 0);
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  return (
    <div className="border border-border rounded-xl p-4 bg-background/60 backdrop-blur-xl shadow-md space-y-4">

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/40 backdrop-blur-xl">
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("**", "**")} title="Bold">
          <Bold size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("*", "*")} title="Italic">
          <Italic size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("## ", "")} title="Heading">
          <Heading2 size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("- ", "")} title="List">
          <List size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("`", "`")} title="Inline Code">
          <Code size={18} />
        </Button>

        <div className="flex-grow"></div>

        {/* Toggle Preview */}
        <Button
          variant={preview ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setPreview(!preview)}
        >
          {preview ? <Pencil size={15} /> : <Eye size={15} />}
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Editor / Preview */}
      {!preview ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your content here..."
          className="
            w-full min-h-[200px] p-4 text-base resize-none leading-6
            bg-background border border-border rounded-lg
            focus:ring-2 focus:ring-primary focus:outline-none
          "
        />
      ) : (
        <div
          className="
            bg-muted/30 p-4 rounded-lg prose prose-invert max-w-none
            border border-border min-h-[200px]
          "
          dangerouslySetInnerHTML={{ __html: marked(value) }}
        />
      )}

      {/* Help */}
      {!preview && (
        <div className="text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg">
          <p className="font-medium mb-2">Format Guide:</p>
          <ul className="space-y-1">
            <li>
              <code className="bg-background px-1 rounded">**text**</code> → Bold
            </li>
            <li>
              <code className="bg-background px-1 rounded">*text*</code> → Italic
            </li>
            <li>
              <code className="bg-background px-1 rounded">## Heading</code> → Heading
            </li>
            <li>
              <code className="bg-background px-1 rounded">- item</code> → List item
            </li>
            <li>
              <code className="bg-background px-1 rounded">`code`</code> → Inline code
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
