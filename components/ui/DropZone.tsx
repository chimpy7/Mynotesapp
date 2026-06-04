import type { DragEvent, ReactNode } from "react";

type DropZoneProps = {
  active: boolean;
  children: ReactNode;
  className: string;
  onClick?: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
};

export function DropZone({
  active,
  children,
  className,
  onClick,
  onDragOver,
  onDrop,
}: DropZoneProps) {
  return (
    <div
      className={`${className} ${
        active ? "outline outline-2 outline-offset-2 outline-[#506051]/50" : ""
      }`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}
