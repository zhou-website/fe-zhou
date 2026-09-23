"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Helper to render an authentic 3D embossed isometric cube
 * using highlight (#FFFFFF, 5%-8% opacity) and shadow (#000000, 35%-45% opacity) strokes.
 * Strictly ZERO gradients: 100% solid color fills and chiseled beveled edges.
 */
function EmbossedCube({ cx, cy, size = 52 }: { cx: number; cy: number; size?: number }) {
  const w = Math.round(size * 0.866025); // cos(30°) ≈ 45px for size 52
  const h = Math.round(size * 0.5); // sin(30°) = 26px for size 52

  return (
    <g className="transition-opacity duration-300">
      {/* 1. Top Facet (Facing top-left light source: subtle 2.5% white fill) */}
      <polygon
        points={`${cx},${cy - size} ${cx + w},${cy - h} ${cx},${cy} ${cx - w},${cy - h}`}
        fill="#FFFFFF"
        fillOpacity="0.025"
      />
      {/* Top Facet - Highlight Stroke (Top-Left edge) */}
      <line
        x1={cx - w}
        y1={cy - h}
        x2={cx}
        y2={cy - size}
        stroke="#FFFFFF"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      {/* Top Facet - Shadow Stroke (Directly offset under Top-Left highlight) */}
      <line
        x1={cx - w + 1}
        y1={cy - h + 1}
        x2={cx + 1}
        y2={cy - size + 1}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Top Facet - Highlight Stroke (Bottom-Left inner edge) */}
      <line
        x1={cx - w}
        y1={cy - h}
        x2={cx}
        y2={cy}
        stroke="#FFFFFF"
        strokeOpacity="0.07"
        strokeWidth="1"
      />
      <line
        x1={cx - w}
        y1={cy - h + 1}
        x2={cx}
        y2={cy + 1}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Top Facet - Shadow Stroke (Top-Right edge) */}
      <line
        x1={cx}
        y1={cy - size}
        x2={cx + w}
        y2={cy - h}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Top Facet - Shadow Stroke (Bottom-Right inner edge) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + w}
        y2={cy - h}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* 2. Left Facet (Direct side reflection: subtle 1.2% white fill) */}
      <polygon
        points={`${cx - w},${cy - h} ${cx},${cy} ${cx},${cy + size} ${cx - w},${cy + h}`}
        fill="#FFFFFF"
        fillOpacity="0.012"
      />
      {/* Left Facet - Highlight Stroke (Left vertical edge) */}
      <line
        x1={cx - w}
        y1={cy - h}
        x2={cx - w}
        y2={cy + h}
        stroke="#FFFFFF"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      {/* Left Facet - Shadow Stroke (Adjacent to vertical highlight) */}
      <line
        x1={cx - w + 1}
        y1={cy - h}
        x2={cx - w + 1}
        y2={cy + h}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Left Facet - Highlight Stroke (Center ridge) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy + size}
        stroke="#FFFFFF"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      {/* Left Facet - Shadow Stroke (Adjacent to center ridge) */}
      <line
        x1={cx + 1}
        y1={cy}
        x2={cx + 1}
        y2={cy + size}
        stroke="#000000"
        strokeOpacity="0.40"
        strokeWidth="1"
      />
      {/* Left Facet - Bottom Shadow Stroke */}
      <line
        x1={cx - w}
        y1={cy + h}
        x2={cx}
        y2={cy + size}
        stroke="#000000"
        strokeOpacity="0.40"
        strokeWidth="1"
      />

      {/* 3. Right Facet (In shadow: 22% dark navy/black solid tint) */}
      <polygon
        points={`${cx},${cy} ${cx + w},${cy - h} ${cx + w},${cy + h} ${cx},${cy + size}`}
        fill="#000000"
        fillOpacity="0.22"
      />
      {/* Right Facet - Shadow Stroke (Right vertical edge) */}
      <line
        x1={cx + w}
        y1={cy - h}
        x2={cx + w}
        y2={cy + h}
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Right Facet - Shadow Stroke (Bottom edge) */}
      <line
        x1={cx + w}
        y1={cy + h}
        x2={cx}
        y2={cy + size}
        stroke="#000000"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
    </g>
  );
}

export function Hero() {
  const { t } = useLanguage();
  return (
    <section
      id="hero"
      aria-label="Hero Banner"
      className="relative bg-[#060D22] text-white py-20 sm:py-24 lg:py-28 overflow-hidden"
    >
      {/* 
        Background Graphic Layer: 100% Solid Navy (#060D22) Base
        Strictly NO Gradients (No linear-gradient, no radial-gradient, no blur-3xl ambient color glow).
        Pure 3D Embossed Effect created via Classical Highlight (#FFFFFF, 5%-8%) & Shadow (#000000, 35%-45%) Contrast.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#060D22]"
      >
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* 1. Full-Surface Architectural Beveled Grid Pattern (56px x 56px) */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="embossed-grid"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              {/* Horizontal Bevel: Highlight line at y=0, Shadow line at y=1 */}
              <line
                x1="0"
                y1="0"
                x2="56"
                y2="0"
                stroke="#FFFFFF"
                strokeOpacity="0.06"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="1"
                x2="56"
                y2="1"
                stroke="#000000"
                strokeOpacity="0.35"
                strokeWidth="1"
              />

              {/* Vertical Bevel: Highlight line at x=0, Shadow line at x=1 */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="56"
                stroke="#FFFFFF"
                strokeOpacity="0.06"
                strokeWidth="1"
              />
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="56"
                stroke="#000000"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#embossed-grid)" />
        </svg>

        {/* 2. Embossed Isometric Architectural Sculpture (Right / Middle Area) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] lg:w-[620px] h-[480px] pointer-events-none select-none opacity-90 sm:opacity-100">
          <svg
            viewBox="0 0 620 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Architectural Connecting Beveled Guide Rays */}
            <line
              x1="220"
              y1="40"
              x2="580"
              y2="248"
              stroke="#FFFFFF"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
            <line
              x1="220"
              y1="41"
              x2="580"
              y2="249"
              stroke="#000000"
              strokeOpacity="0.30"
              strokeWidth="1"
            />

            <line
              x1="140"
              y1="230"
              x2="500"
              y2="438"
              stroke="#FFFFFF"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
            <line
              x1="140"
              y1="231"
              x2="500"
              y2="439"
              stroke="#000000"
              strokeOpacity="0.30"
              strokeWidth="1"
            />

            {/*
              Interlocking Embossed Isometric Cubes (Rendered Back to Front)
              Unit size: 52px. Column step: w=45px, h=26px.
            */}
            {/* Back Row (Upper Level) */}
            <EmbossedCube cx={420} cy={105} size={52} />
            <EmbossedCube cx={510} cy={157} size={52} />

            {/* Middle-Back Row */}
            <EmbossedCube cx={330} cy={157} size={52} />
            <EmbossedCube cx={420} cy={209} size={52} />
            <EmbossedCube cx={510} cy={261} size={52} />

            {/* Front-Middle Row */}
            <EmbossedCube cx={240} cy={209} size={52} />
            <EmbossedCube cx={330} cy={261} size={52} />
            <EmbossedCube cx={420} cy={313} size={52} />

            {/* Lower-Front Stepping Pedestals */}
            <EmbossedCube cx={240} cy={313} size={52} />
            <EmbossedCube cx={330} cy={365} size={52} />
          </svg>
        </div>
      </div>

      {/* Main Content Container (relative z-10 for sharp focus, high contrast & zero glare) */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight lg:leading-[1.1]">
            {t.hero.title}
          </h1>

          {/* Subtitles */}
          <div className="space-y-2">
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-white/95 leading-snug">
              {t.hero.subtitle2}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white/30 text-white bg-white/5 hover:bg-white/15 hover:text-white font-semibold text-sm px-6 py-2.5 rounded-md shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <Link href="/konsultasi">{t.hero.ctaConsult}</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white font-semibold text-sm px-6 py-2.5 rounded-md transition-all duration-200 active:scale-[0.98]"
            >
              <Link href="/#layanan">{t.hero.ctaServices}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
