"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  TouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import type {
  PublicGalleryItem,
} from "@/features/gallery/components/public/gallery.types";

type GalleryLightboxProps = {
  items: PublicGalleryItem[];
  selectedIndex:
    | number
    | null;
  onClose: () => void;
  onIndexChange: (
    index: number,
  ) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;
const SWIPE_THRESHOLD =
  55;

export function GalleryLightbox({
  items,
  selectedIndex,
  onClose,
  onIndexChange,
}: GalleryLightboxProps) {
  const [zoom, setZoom] =
    useState(
      MIN_ZOOM,
    );

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const touchStartXRef =
    useRef<
      number | null
    >(null);

  const dialogRef =
    useRef<
      HTMLDivElement | null
    >(null);

  const selectedItem =
    selectedIndex !== null
      ? items[
          selectedIndex
        ]
      : undefined;

  const isOpen =
    selectedIndex !== null &&
    Boolean(
      selectedItem,
    );

  const canNavigate =
    items.length > 1;

  const goToPrevious =
    useCallback(() => {
      if (
        selectedIndex === null ||
        items.length === 0
      ) {
        return;
      }

      const previousIndex =
        selectedIndex === 0
          ? items.length -
            1
          : selectedIndex -
            1;

      setZoom(
        MIN_ZOOM,
      );

      onIndexChange(
        previousIndex,
      );
    }, [
      items.length,
      onIndexChange,
      selectedIndex,
    ]);

  const goToNext =
    useCallback(() => {
      if (
        selectedIndex === null ||
        items.length === 0
      ) {
        return;
      }

      const nextIndex =
        selectedIndex ===
        items.length - 1
          ? 0
          : selectedIndex +
            1;

      setZoom(
        MIN_ZOOM,
      );

      onIndexChange(
        nextIndex,
      );
    }, [
      items.length,
      onIndexChange,
      selectedIndex,
    ]);

  const increaseZoom =
    useCallback(() => {
      setZoom(
        (
          currentZoom,
        ) =>
          Math.min(
            currentZoom +
              ZOOM_STEP,
            MAX_ZOOM,
          ),
      );
    }, []);

  const decreaseZoom =
    useCallback(() => {
      setZoom(
        (
          currentZoom,
        ) =>
          Math.max(
            currentZoom -
              ZOOM_STEP,
            MIN_ZOOM,
          ),
      );
    }, []);

  function resetZoom() {
    setZoom(
      MIN_ZOOM,
    );
  }

  const handleClose =
    useCallback(() => {
      setZoom(
        MIN_ZOOM,
      );

      setIsFullscreen(
        false,
      );

      if (
        document.fullscreenElement
      ) {
        void document
          .exitFullscreen()
          .catch(() => {
            // La fermeture de la galerie reste prioritaire.
          });
      }

      onClose();
    }, [
      onClose,
    ]);

  async function toggleFullscreen() {
    try {
      if (
        !document.fullscreenElement
      ) {
        await dialogRef.current?.requestFullscreen();

        setIsFullscreen(
          true,
        );

        return;
      }

      await document.exitFullscreen();

      setIsFullscreen(
        false,
      );
    } catch {
      setIsFullscreen(
        false,
      );
    }
  }

  function handleTouchStart(
    event: TouchEvent<HTMLDivElement>,
  ) {
    touchStartXRef.current =
      event.touches[0]
        ?.clientX ??
      null;
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLDivElement>,
  ) {
    const startX =
      touchStartXRef.current;

    const endX =
      event.changedTouches[0]
        ?.clientX;

    touchStartXRef.current =
      null;

    if (
      startX === null ||
      endX ===
        undefined ||
      zoom >
        MIN_ZOOM
    ) {
      return;
    }

    const distance =
      endX -
      startX;

    if (
      Math.abs(
        distance,
      ) <
      SWIPE_THRESHOLD
    ) {
      return;
    }

    if (
      distance > 0
    ) {
      goToPrevious();
    } else {
      goToNext();
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body
        .style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        handleClose();

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        goToPrevious();

        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        goToNext();

        return;
      }

      if (
        event.key ===
          "+" ||
        event.key ===
          "="
      ) {
        increaseZoom();

        return;
      }

      if (
        event.key ===
        "-"
      ) {
        decreaseZoom();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    decreaseZoom,
    goToNext,
    goToPrevious,
    handleClose,
    increaseZoom,
    isOpen,
    items.length,
    selectedIndex,
  ]);

  useEffect(() => {
    if (
      selectedIndex ===
        null ||
      items.length < 2
    ) {
      return;
    }

    const previousIndex =
      selectedIndex === 0
        ? items.length -
          1
        : selectedIndex -
          1;

    const nextIndex =
      selectedIndex ===
      items.length - 1
        ? 0
        : selectedIndex +
          1;

    const previousImage =
      new window.Image();

    previousImage.src =
      items[
        previousIndex
      ]?.coverUrl ??
      "";

    const nextImage =
      new window.Image();

    nextImage.src =
      items[nextIndex]
        ?.coverUrl ??
      "";
  }, [
    items,
    selectedIndex,
  ]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement,
        ),
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen &&
      selectedItem &&
      selectedIndex !==
        null ? (
        <motion.div
          ref={
            dialogRef
          }
          role="dialog"
          aria-modal="true"
          aria-label={`Réalisation ${selectedItem.title}`}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration:
              0.2,
          }}
          className="fixed inset-0 z-[100] flex bg-zinc-950/95 backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={
              handleClose
            }
            aria-label="Fermer la galerie"
            className="absolute right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-white/20 sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-full w-full flex-col lg:flex-row">
            <div
              onTouchStart={
                handleTouchStart
              }
              onTouchEnd={
                handleTouchEnd
              }
              className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_55%)]"
              />

              <motion.div
                key={
                  selectedItem.id
                }
                initial={{
                  opacity: 0,
                  scale:
                    0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale:
                    0.96,
                }}
                transition={{
                  duration:
                    0.25,
                }}
                className="relative h-full w-full overflow-hidden"
              >
                <motion.div
                  animate={{
                    scale:
                      zoom,
                  }}
                  transition={{
                    type:
                      "spring",
                    stiffness:
                      260,
                    damping:
                      28,
                  }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={
                      selectedItem.coverUrl
                    }
                    alt={
                      selectedItem.alt ??
                      selectedItem.title
                    }
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    className="select-none object-contain"
                    draggable={
                      false
                    }
                  />
                </motion.div>
              </motion.div>

              {canNavigate ? (
                <>
                  <button
                    type="button"
                    onClick={
                      goToPrevious
                    }
                    aria-label="Réalisation précédente"
                    className="absolute left-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-white/20 sm:left-6 sm:h-14 sm:w-14"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      goToNext
                    }
                    aria-label="Réalisation suivante"
                    className="absolute right-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-white/20 sm:right-6 sm:h-14 sm:w-14"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/50 p-1.5 text-white shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={
                    decreaseZoom
                  }
                  disabled={
                    zoom <=
                    MIN_ZOOM
                  }
                  aria-label="Réduire le zoom"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    resetZoom
                  }
                  aria-label="Réinitialiser le zoom"
                  className="inline-flex h-10 min-w-16 items-center justify-center gap-1 rounded-full px-3 text-xs font-bold transition hover:bg-white/15"
                >
                  <RotateCcw className="h-3.5 w-3.5" />

                  {Math.round(
                    zoom *
                      100,
                  )}
                  %
                </button>

                <button
                  type="button"
                  onClick={
                    increaseZoom
                  }
                  disabled={
                    zoom >=
                    MAX_ZOOM
                  }
                  aria-label="Augmenter le zoom"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <div className="mx-1 h-6 w-px bg-white/15" />

                <button
                  type="button"
                  onClick={
                    toggleFullscreen
                  }
                  aria-label={
                    isFullscreen
                      ? "Quitter le plein écran"
                      : "Afficher en plein écran"
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:top-6">
                {selectedIndex +
                  1}{" "}
                /{" "}
                {
                  items.length
                }
              </div>
            </div>

            <aside className="relative z-20 max-h-[42vh] w-full overflow-y-auto border-t border-white/10 bg-zinc-950 p-6 text-white lg:max-h-none lg:w-[360px] lg:border-l lg:border-t-0 lg:p-8 xl:w-[420px]">
              {selectedItem.isFeatured ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-500/10 px-4 py-2 text-xs font-bold text-pink-300">
                  <Sparkles className="h-4 w-4" />

                  Création en
                  vedette
                </div>
              ) : null}

              {selectedItem.category ? (
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-pink-400">
                  {
                    selectedItem.category
                  }
                </p>
              ) : null}

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {
                  selectedItem.title
                }
              </h2>

              {selectedItem.serviceName ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Prestation
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {
                      selectedItem.serviceName
                    }
                  </p>
                </div>
              ) : null}

              <p className="mt-6 text-sm leading-7 text-zinc-400">
                Cette création vous
                plaît ? Réservez
                votre prochain
                rendez-vous et
                présentez cette
                inspiration lors de
                votre venue au
                salon.
              </p>

              <Link
                href="/reservation"
                onClick={
                  handleClose
                }
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-pink-950/30 transition hover:-translate-y-0.5 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/30"
              >
                Réserver cette pose

                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs leading-5 text-zinc-500">
                  Navigation :
                  utilisez les
                  flèches du
                  clavier, balayez
                  sur mobile ou
                  utilisez les
                  boutons affichés
                  à l’écran.
                </p>
              </div>
            </aside>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}