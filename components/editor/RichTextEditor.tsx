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
  $getRoot,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type EditorState,
  type ElementFormatType,
  type LexicalEditor,
  type TextFormatType,
} from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";

type RichTextEditorProps = {
  initialEditorState?: string;
  onSerializedChange?: (serializedState: string) => void;
  onPlainTextChange?: (plainText: string) => void;
  placeholder?: string;
};

const editorTheme = {
  paragraph: "mb-3 last:mb-0",
  text: {
    bold: "font-semibold",
    italic: "italic",
    code: "rounded bg-[#e9e8e6] px-1 py-0.5 font-mono text-[0.92em]",
    strikethrough: "line-through",
    underline: "underline underline-offset-2",
  },
};

const toolbarFormats: Array<{
  command: TextFormatType;
  label: string;
  shortcut: string;
  className?: string;
}> = [
  { command: "bold", label: "B", shortcut: "Bold", className: "font-bold" },
  { command: "italic", label: "I", shortcut: "Italic", className: "italic" },
  {
    command: "underline",
    label: "U",
    shortcut: "Underline",
    className: "underline underline-offset-2",
  },
  {
    command: "strikethrough",
    label: "S",
    shortcut: "Strikethrough",
    className: "line-through",
  },
  {
    command: "code",
    label: "<>",
    shortcut: "Inline code",
    className: "font-mono text-[12px]",
  },
];

const toolbarAlignments: Array<{
  command: ElementFormatType;
  label: string;
  shortcut: string;
}> = [
  { command: "left", label: "L", shortcut: "Align left" },
  { command: "center", label: "C", shortcut: "Align center" },
  { command: "right", label: "R", shortcut: "Align right" },
  { command: "justify", label: "J", shortcut: "Justify" },
];

export function RichTextEditor({
  initialEditorState,
  onSerializedChange,
  onPlainTextChange,
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
      editorState.read(() => {
        onPlainTextChange?.($getRoot().getTextContent());
      });
    },
    [onPlainTextChange, onSerializedChange],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex min-h-[520px] flex-col gap-6">
        <ToolbarPlugin />
        <div className="relative min-h-[420px] flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={placeholder}
                className="min-h-[420px] resize-none font-[Georgia,serif] text-[24px] font-medium leading-9 text-[#434842] outline-none"
                placeholder={
                  <div className="pointer-events-none absolute left-0 top-0 font-[Georgia,serif] text-[24px] font-medium leading-9 text-[#c3c8c0]">
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
          <InitialPlainTextPlugin onPlainTextChange={onPlainTextChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({
    bold: false,
    code: false,
    italic: false,
    strikethrough: false,
    underline: false,
  });
  const [activeAlignment, setActiveAlignment] =
    useState<ElementFormatType>("left");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      setActiveFormats({
        bold: selection.hasFormat("bold"),
        code: selection.hasFormat("code"),
        italic: selection.hasFormat("italic"),
        strikethrough: selection.hasFormat("strikethrough"),
        underline: selection.hasFormat("underline"),
      });

      const topLevelElement = selection.anchor
        .getNode()
        .getTopLevelElementOrThrow();

      setActiveAlignment(topLevelElement.getFormatType() || "left");
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
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e3e2e0] bg-[#f4f3f1] p-2">
      <div className="flex items-center gap-1">
        {toolbarFormats.map((format) => (
          <TextToolbarButton
            active={activeFormats[format.command]}
            className={format.className}
            editor={editor}
            format={format.command}
            key={format.command}
            label={format.label}
            shortcut={format.shortcut}
          />
        ))}
      </div>
      <div className="h-7 w-px bg-[#d6d8d3]" />
      <div className="flex items-center gap-1">
        {toolbarAlignments.map((alignment) => (
          <AlignmentToolbarButton
            active={activeAlignment === alignment.command}
            alignment={alignment.command}
            editor={editor}
            key={alignment.command}
            label={alignment.label}
            shortcut={alignment.shortcut}
          />
        ))}
      </div>
    </div>
  );
}

function InitialPlainTextPlugin({
  onPlainTextChange,
}: {
  onPlainTextChange?: (plainText: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.getEditorState().read(() => {
      onPlainTextChange?.($getRoot().getTextContent());
    });
  }, [editor, onPlainTextChange]);

  return null;
}

function TextToolbarButton({
  active,
  className,
  editor,
  format,
  label,
  shortcut,
}: {
  active: boolean;
  className?: string;
  editor: LexicalEditor;
  format: TextFormatType;
  label: string;
  shortcut: string;
}) {
  return (
    <button
      aria-label={shortcut}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors ${
        active
          ? "border-[#506051] bg-[#506051] text-white"
          : "border-transparent text-[#434842] hover:border-[#c3c8c0] hover:bg-white"
      }`}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
      title={shortcut}
      type="button"
    >
      <span className={className}>{label}</span>
    </button>
  );
}

function AlignmentToolbarButton({
  active,
  alignment,
  editor,
  label,
  shortcut,
}: {
  active: boolean;
  alignment: ElementFormatType;
  editor: LexicalEditor;
  label: string;
  shortcut: string;
}) {
  return (
    <button
      aria-label={shortcut}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors ${
        active
          ? "border-[#506051] bg-[#506051] text-white"
          : "border-transparent text-[#434842] hover:border-[#c3c8c0] hover:bg-white"
      }`}
      onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)}
      title={shortcut}
      type="button"
    >
      <span>{label}</span>
    </button>
  );
}
