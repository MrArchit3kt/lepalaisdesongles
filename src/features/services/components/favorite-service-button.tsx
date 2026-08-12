"use client";

import { Heart, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleFavoriteServiceAction } from "@/features/services/actions/toggle-favorite-service.action";

type FavoriteServiceButtonProps = {
  serviceId: string;
  initialIsFavorited: boolean;
  isAuthenticated: boolean;
  className?: string;
};

const DEFAULT_CLASSES =
  "grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-[#A64D69] shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white disabled:opacity-70";

export function FavoriteServiceButton({
  serviceId,
  initialIsFavorited,
  isAuthenticated,
  className,
}: FavoriteServiceButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) return;

    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    const nextState = !isFavorited;
    setIsFavorited(nextState);

    startTransition(async () => {
      try {
        const result = await toggleFavoriteServiceAction(serviceId);
        setIsFavorited(result.isFavorited);
      } catch (error) {
        setIsFavorited(!nextState);
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour vos favoris.",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={isFavorited}
      className={className ?? DEFAULT_CLASSES}
    >
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Heart className={isFavorited ? "size-5 fill-current" : "size-5"} />
      )}
    </button>
  );
}
