import type {
  DragOverHandler,
  DropHandler,
  OrganizationCategory,
  OrganizationDocument,
} from "@/components/categories/organizationTypes";
import { DropZone } from "@/components/categories/DropZone";

type CategoryCardProps = {
  activeDropTarget: string;
  category: OrganizationCategory;
  directDocuments: OrganizationDocument[];
  documentsBySubcategory: Map<string, OrganizationDocument[]>;
  onDragOver: DragOverHandler;
  onDrop: DropHandler;
  onOpenCategory: () => void;
};

export function CategoryCard({
  activeDropTarget,
  category,
  directDocuments,
  documentsBySubcategory,
  onDragOver,
  onDrop,
  onOpenCategory,
}: CategoryCardProps) {
  const categoryTargetKey = `category:${category.id}`;
  const documentCount =
    directDocuments.length +
    category.subcategories.reduce(
      (count, subcategory) =>
        count + (documentsBySubcategory.get(subcategory.id)?.length ?? 0),
      0,
    );

  return (
    <DropZone
      active={activeDropTarget === categoryTargetKey}
      className="group relative flex min-h-[190px] cursor-pointer flex-col rounded-xl border border-transparent bg-[#efeeec] p-5 text-center transition-all duration-300 hover:border-[#506051]/30"
      onClick={onOpenCategory}
      onDragOver={(event) => onDragOver(event, categoryTargetKey)}
      onDrop={(event) =>
        onDrop(event, {
          categoryId: category.id,
          subcategoryId: null,
        })
      }
    >
      <div className="mx-auto mb-3 h-10 w-12 transition-transform duration-300 group-hover:scale-110">
        <div className="h-3 w-7 rounded-t bg-[#506051]/60" />
        <div className="h-8 rounded bg-[#506051]/70" />
      </div>
      <h3 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]">
        {category.name}
      </h3>
      <span className="mt-1 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {documentCount} {documentCount === 1 ? "Note" : "Notes"}
      </span>
      {category.subcategories.length > 0 ? (
        <span className="mt-3 text-xs leading-5 text-[#747872]">
          {category.subcategories.length}{" "}
          {category.subcategories.length === 1
            ? "subcategory"
            : "subcategories"}
        </span>
      ) : null}
    </DropZone>
  );
}
