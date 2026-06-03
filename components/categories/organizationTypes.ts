import type { DragEvent, FormEvent } from "react";

export type OrganizationDocument = {
  id: string;
  title: string;
  preview: string;
  categoryId: string | null;
  subcategoryId: string | null;
  updatedAtLabel: string;
};

export type OrganizationCategory = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

export type DropTarget = {
  categoryId: string | null;
  subcategoryId: string | null;
};

export type DocumentAction = "delete" | "remove";

export type PendingDocumentAction = {
  documentId: string;
  action: DocumentAction;
} | null;

export type DragStartHandler = (
  event: DragEvent<HTMLElement>,
  documentId: string,
) => void;

export type DragOverHandler = (
  event: DragEvent<HTMLElement>,
  targetKey: string,
) => void;

export type DropHandler = (
  event: DragEvent<HTMLElement>,
  target: DropTarget,
) => Promise<void>;

export type CreateSubcategoryHandler = (
  event: FormEvent<HTMLFormElement>,
  categoryId: string,
) => Promise<void>;
