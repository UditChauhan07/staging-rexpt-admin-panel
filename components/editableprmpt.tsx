// components/EditablePromptEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface EditablePromptEditorProps {
  initialPrompt: string;
  variables: string[];
  onSave: (html: string) => void;
}

export default function EditablePromptEditor({
  initialPrompt,
  variables,
  onSave,
}: EditablePromptEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run TipTap on client side
    setIsClient(true);
  }, []);

  const editor = useEditor({
    content: initialPrompt,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Enter system prompt here…" }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      },
    },
    onUpdate: ({ editor }) => {
      // optional live updates
    },
    // 👇 This disables SSR rendering
    immediatelyRender: false,
  });

  const insertVariable = (variable: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  if (!isClient || !editor) return null; // prevent SSR mismatch

  return (
    <div className="border rounded p-4 bg-white min-h-[300px]">
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {variables.map((v) => (
          <Button
            key={v}
            variant="outline"
            size="sm"
            onClick={() => insertVariable(v)}
          >
            + {v}
          </Button>
        ))}
      </div>

      <EditorContent editor={editor} />

      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => {
            const html = editor?.getHTML() || "";
            onSave(html);
          }}
        >
          Save Prompt
        </Button>
      </div>
    </div>
  );
}
