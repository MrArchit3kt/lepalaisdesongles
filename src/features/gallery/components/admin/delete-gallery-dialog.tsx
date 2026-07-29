"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  deleteGalleryItemAction,
} from "@/features/gallery/actions/gallery.actions";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type DeleteGalleryDialogItem = {
  id: string;
  title: string;
};

type DeleteGalleryDialogProps = {
  item: DeleteGalleryDialogItem | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
};

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export function DeleteGalleryDialog({
  item,
  open,
  onOpenChange,
}: DeleteGalleryDialogProps) {
  const router = useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleOpenChange(
    nextOpen: boolean,
  ): void {
    if (isPending) {
      return;
    }

    onOpenChange(nextOpen);
  }

  function handleDelete(): void {
    if (!item || isPending) {
      return;
    }

    startTransition(async () => {
      const result =
        await deleteGalleryItemAction(
          item.id,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <DialogTitle>
            Supprimer la réalisation
          </DialogTitle>

          <DialogDescription className="leading-6">
            Cette action est
            irréversible. Toutes les
            informations et tous les
            médias associés seront
            supprimés.
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Réalisation concernée
            </p>

            <p className="mt-1 break-words text-sm font-bold text-red-900">
              {item.title}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Annuler
          </Button>

          <Button
            type="button"
            variant="danger"
            disabled={
              isPending || !item
            }
            onClick={handleDelete}
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />

                Supprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
