"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  disabled = false,
  placeholder = "Write blog post content here...",
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline font-medium",
        },
      }),
    ],
    content: content || "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[220px] px-4 py-3 text-sm text-ink leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content when prop updates from outside (e.g., initial form load or reset)
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[220px] rounded-md border border-border bg-background p-4 text-xs text-ink-muted flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden focus-within:border-accent transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background/60 p-2 text-xs">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded font-bold transition-colors ${
            editor.isActive("bold")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Bold"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded italic font-serif transition-colors ${
            editor.isActive("italic")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Italic"
        >
          I
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded line-through transition-colors ${
            editor.isActive("strike")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* H2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Bullet list */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Bullet List"
        >
          • List
        </button>

        {/* Ordered list */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Numbered List"
        >
          1. List
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Blockquote"
        >
          “ Quote
        </button>

        {/* Code block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded font-mono transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Code Block"
        >
          {"< >"}
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          disabled={disabled}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("link")
              ? "bg-accent text-white"
              : "text-ink hover:bg-surface border border-transparent hover:border-border"
          }`}
          title="Insert Link"
        >
          Link
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className="px-2 py-1 rounded text-ink-muted hover:text-ink disabled:opacity-30"
          title="Undo"
        >
          ↶
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className="px-2 py-1 rounded text-ink-muted hover:text-ink disabled:opacity-30"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="tiptap-container bg-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
