import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your description here...",
  minHeight = "min-h-[150px]",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-editor-empty",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${minHeight} prose dark:prose-invert prose-sm max-w-none text-foreground p-3 bg-background border border-border border-t-0 rounded-b-lg tiptap-content-canvas`,
      },
    },
  });

  // Sync value if it changes externally
  React.useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Safely wrap in try-catch in case editor state is in transition
      try {
        const currentContent = editor.getHTML();
        if (value !== currentContent) {
          editor.commands.setContent(value);
        }
      } catch (e) {
        console.warn("Editor sync error:", e);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <style dangerouslySetInnerHTML={{
        __html: `
        .tiptap-content-canvas p.is-editor-empty:first-child::before {
          color: #64748b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
          line-height: 1.6;
          font-size: 0.85rem;
        }
        .tiptap-content-canvas {
          outline: none !important;
          font-size: 0.9rem;
          line-height: 1.6;
          transition: all 0.2s ease;
        }
        .tiptap-content-canvas p { margin-bottom: 0.5rem; }
        .tiptap-content-canvas p:last-child { margin-bottom: 0; }
        .tiptap-content-canvas h2 { font-size: 1.15rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; }
        .tiptap-content-canvas h3 { font-size: 1.05rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
        .tiptap-content-canvas ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap-content-canvas ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap-content-canvas li { margin-bottom: 0.25rem; }
        .tiptap-content-canvas blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 1rem;
          font-style: italic;
          color: #94a3b8;
          margin: 0.8rem 0;
          background: rgba(201, 168, 76, 0.04);
          padding-top: 0.3rem;
          padding-bottom: 0.3rem;
          border-radius: 0 4px 4px 0;
        }
      ` }} />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 bg-muted/50 p-1.5 border-b border-border">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <Heading2 className="w-3.5 h-3.5" /> H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("heading", { level: 3 }) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <Heading3 className="w-3.5 h-3.5" /> H3
        </button>
        <div className="w-px h-5 bg-border mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("bold") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("italic") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-5 bg-border mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10 text-muted-foreground hover:text-foreground"
            }`}
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
