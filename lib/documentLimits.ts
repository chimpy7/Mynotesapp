export const maxDocumentPlainTextLength = 1500;
export const maxDocumentSerializedContentLength = 25000;
export const documentLengthErrorMessage =
  "Documents are limited to one page (1,500 characters).";

type LexicalContentNode = {
  children?: unknown;
  root?: unknown;
  text?: unknown;
};

export function getDocumentPlainTextLength(content: unknown) {
  return getDocumentPlainText(content).length;
}

export function getDocumentPlainText(content: unknown) {
  const parts: string[] = [];

  if (isLexicalContentNode(content) && content.root) {
    collectText(content.root, parts);
  } else {
    collectText(content, parts);
  }

  return parts.join("");
}

export function isDocumentContentWithinLimits(content: unknown) {
  if (content == null) {
    return true;
  }

  if (getDocumentPlainTextLength(content) > maxDocumentPlainTextLength) {
    return false;
  }

  try {
    return JSON.stringify(content).length <= maxDocumentSerializedContentLength;
  } catch {
    return false;
  }
}

function collectText(value: unknown, parts: string[]) {
  if (!isLexicalContentNode(value)) {
    return;
  }

  if (typeof value.text === "string") {
    parts.push(value.text);
  }

  if (Array.isArray(value.children)) {
    value.children.forEach((child) => collectText(child, parts));
  }
}

function isLexicalContentNode(value: unknown): value is LexicalContentNode {
  return typeof value === "object" && value !== null;
}
