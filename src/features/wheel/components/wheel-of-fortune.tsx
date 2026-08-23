"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { WheelSegmentPublic } from "@/features/wheel/types/wheel.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type WheelOfFortuneProps = {
  segments: WheelSegmentPublic[];
  targetSegmentId: string | null;
  spinToken: number;
  onSpinComplete?: () => void;
};

type SegmentSlice = {
  segment: WheelSegmentPublic;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  color: string;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const FALLBACK_COLORS = [
  "#A64D69",
  "#35242B",
  "#D6B778",
  "#8B405A",
  "#C47890",
  "#6F5962",
];

function buildSlices(segments: WheelSegmentPublic[]): SegmentSlice[] {
  const totalWeight =
    segments.reduce((sum, segment) => sum + Math.max(0, segment.weight), 0) ||
    segments.length;

  let cursor = 0;

  return segments.map((segment, index) => {
    const share = (Math.max(0, segment.weight) || 1) / totalWeight * 360;
    const startAngle = cursor;
    const endAngle = cursor + share;

    cursor = endAngle;

    return {
      segment,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      color:
        segment.colorHex ??
        FALLBACK_COLORS[index % FALLBACK_COLORS.length]!,
    };
  });
}

function buildConicGradient(slices: SegmentSlice[]): string {
  const stops = slices.map(
    (slice) =>
      `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`,
  );

  return `conic-gradient(${stops.join(", ")})`;
}

const SPIN_ROTATIONS = 6;

function computeTargetRotation(
  slices: SegmentSlice[],
  targetSegmentId: string | null,
  spinToken: number,
): number {
  const target = slices.find(
    (slice) => slice.segment.id === targetSegmentId,
  );

  const midAngle = target?.midAngle ?? 0;

  // spinToken varie à chaque nouveau tirage : ajouter son parité aux
  // tours complets garantit une rotation visible même si deux
  // tirages consécutifs tombent sur le même secteur.
  const extraSpin = spinToken % 2;

  return (SPIN_ROTATIONS + extraSpin) * 360 + (360 - midAngle);
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function WheelOfFortune({
  segments,
  targetSegmentId,
  spinToken,
  onSpinComplete,
}: WheelOfFortuneProps) {
  const slices = useMemo(() => buildSlices(segments), [segments]);

  const rotation = useMemo(
    () => computeTargetRotation(slices, targetSegmentId, spinToken),
    [slices, targetSegmentId, spinToken],
  );

  const isSpinning = spinToken > 0 && targetSegmentId !== null;

  return (
    <div className="relative mx-auto flex size-64 items-center justify-center sm:size-80">
      <div
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-20 size-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-[#35242B] drop-shadow"
      />

      <motion.div
        className="relative size-full overflow-hidden rounded-full border-4 border-white shadow-[0_25px_70px_-25px_rgba(139,64,90,0.55)]"
        style={{ background: buildConicGradient(slices) }}
        animate={{ rotate: isSpinning ? rotation : 0 }}
        transition={
          isSpinning
            ? { duration: 4.2, ease: [0.12, 0.66, 0.24, 1] }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (isSpinning) {
            onSpinComplete?.();
          }
        }}
      >
        {slices.map((slice) => (
          <span
            key={slice.segment.id}
            className="absolute left-1/2 top-1/2 w-24 origin-left text-center text-[11px] font-bold leading-tight text-white drop-shadow sm:w-28 sm:text-xs"
            style={{
              transform: `rotate(${slice.midAngle}deg) translateX(0.75rem)`,
            }}
          >
            <span
              className="inline-block max-w-[5.5rem] truncate"
              style={{ transform: "translateY(-50%)" }}
            >
              {slice.segment.label}
            </span>
          </span>
        ))}
      </motion.div>

      <div className="absolute z-10 flex size-14 items-center justify-center rounded-full border-4 border-white bg-[#35242B] text-white shadow-lg sm:size-16">
        <span className="font-serif text-2xl">✦</span>
      </div>
    </div>
  );
}
