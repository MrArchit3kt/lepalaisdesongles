"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type GalleryPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function GalleryPagination({
  page,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-neutral-500">
        Page {page} sur {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}