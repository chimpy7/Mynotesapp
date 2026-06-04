import type {
  OrganizationCategory,
  OrganizationDocument,
} from "@/components/categories/organizationTypes";

/**
 * Counts every document that belongs to a category, including documents inside
 * its subcategories. Used by both the category card and category modal header.
 */
export function getCategoryDocumentCount(
  category: OrganizationCategory,
  directDocuments: OrganizationDocument[],
  documentsBySubcategory: Map<string, OrganizationDocument[]>,
) {
  const subcategoryDocumentCount = category.subcategories.reduce(
    (count, subcategory) =>
      count + (documentsBySubcategory.get(subcategory.id)?.length ?? 0),
    0,
  );

  return directDocuments.length + subcategoryDocumentCount;
}
