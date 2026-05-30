"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type EditorState,
  type LexicalEditor,
  type TextFormatType,
} from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";

type RichTextEditorProps = {
  initialEditorState?: string;
  onSerializedChange?: (serializedState: string) => void;
  placeholder?: string;
};

const editorTheme = {
  paragraph: "mb-3 last:mb-0",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline underline-offset-2",
  },
};

const toolbarFormats: Array<{
  command: TextFormatType;
  label: string;
  shortcut: string;
}> = [
  { command: "bold", label: "B", shortcut: "Bold" },
  { command: "italic", label: "I", shortcut: "Italic" },
  { command: "underline", label: "U", shortcut: "Underline" },
];

export function RichTextEditor({
  initialEditorState,
  onSerializedChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const initialConfig = useMemo(
    () => ({
      editorState: initialEditorState,
      namespace: "DocumentEditor",
      onError(error: Error) {
        throw error;
      },
      theme: editorTheme,
    }),
    [initialEditorState],
  );

  const handleChange = useCallback(
    (editorState: EditorState) => {
      onSerializedChange?.(JSON.stringify(editorState.toJSON()));
    },
    [onSerializedChange],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <ToolbarPlugin />
        <div className="relative min-h-[360px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={placeholder}
                className="min-h-[360px] resize-none px-6 py-5 text-base leading-7 text-zinc-950 outline-none"
                placeholder={
                  <div className="pointer-events-none absolute left-6 top-5 text-base leading-7 text-zinc-400">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        </div>
      </div>
    </LexicalComposer>
  );
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      setActiveFormats({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
      });
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <div className="flex h-12 items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-3">
      {toolbarFormats.map((format) => (
        <ToolbarButton
          key={format.command}
          active={activeFormats[format.command]}
          editor={editor}
          format={format.command}
          label={format.label}
          shortcut={format.shortcut}
        />
      ))}
    </div>
  );
}

function ToolbarButton({
  active,
  editor,
  format,
  label,
  shortcut,
}: {
  active: boolean;
  editor: LexicalEditor;
  format: TextFormatType;
  label: string;
  shortcut: string;
}) {
  return (
    <button
      aria-label={shortcut}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-semibold transition-colors ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-white"
      }`}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
      title={shortcut}
      type="button"
    >
      <span className={format === "italic" ? "italic" : undefined}>{label}</span>
    </button>
  );
}
