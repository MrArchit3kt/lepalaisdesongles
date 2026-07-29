"use client";

import { useState } from "react";

import {
  GalleryTable,
  type GalleryTableItem,
} from "@/features/gallery/components/admin/gallery-table";

import {
  DeleteGalleryDialog,
  type DeleteGalleryDialogItem,
} from "@/features/gallery/components/admin/delete-gallery-dialog";

type GalleryManagerProps = {
  items: GalleryTableItem[];
};

export function GalleryManager({
  items,
}: GalleryManagerProps) {
  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<DeleteGalleryDialogItem | null>(
      null,
    );

  function handleDeleteRequest(
    item: GalleryTableItem,
  ): void {
    setSelectedItem({
      id: item.id,
      title: item.title,
    });
  }

  function handleDialogOpenChange(
    open: boolean,
  ): void {
    if (!open) {
      setSelectedItem(null);
    }
  }

  return (
    <>
      <GalleryTable
        items={items}
        editBasePath="/admin/galerie"
        onDelete={
          handleDeleteRequest
        }
      />

      <DeleteGalleryDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={
          handleDialogOpenChange
        }
      />
    </>
  );
}
