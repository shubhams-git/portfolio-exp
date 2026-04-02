import { useEffect, useState } from "react";
import type { MotionValue } from "motion/react";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
} from "motion/react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type SceneDepth = "far" | "mid" | "near";
type BodyTone = "neutral" | "cool" | "accent";
type BodyPalette = "dune" | "ice" | "pearl" | "storm" | "verdant";
type DetailLevel = "atmospheric" | "support" | "hero";
type SceneWeight = "planetSupport" | "planetHero";

type BackgroundBody = {
  depth: SceneDepth;
  detailLevel: DetailLevel;
  hasRing: boolean;
  id: string;
  palette: BodyPalette;
  position: {
    left: string;
    top: string;
  };
  ringTilt?: number;
  sceneWeight: SceneWeight;
  size: number;
  tone: BodyTone;
};

type BackgroundStar = {
  color: string;
  delay: number;
  depth: SceneDepth;
  glow: string;
  id: string;
  left: string;
  opacity: number;
  size: number;
  top: string;
  twinkleDuration: number;
};

type BackgroundConstellation = {
  delay: number;
  duration: number;
  height: number;
  id: string;
  left: string;
  links: Array<[number, number]>;
  opacity: number;
  points: Array<{ x: number; y: number }>;
  top: string;
  width: number;
};

type BackgroundCluster = {
  height: number;
  id: string;
  left: string;
  stars: Array<{
    opacity: number;
    size: number;
    x: number;
    y: number;
  }>;
  top: string;
  width: number;
};

type BackgroundComet = {
  anchorX: number;
  anchorY: number;
  brightness: number;
  depth: "mid" | "near";
  drift: number;
  id: string;
  phase: number;
  shiftX: number;
  shiftY: number;
  speed: number;
  trailLength: number;
};

type PlanetTone = {
  atmosphere: string;
  band: string;
  detail: string;
  glow: string;
  ring: string;
  ringGlow: string;
  rim: string;
  surface: string;
  terrain: string;
};

type PlanetPalette = {
  cloudLayer: string;
  colorWash: string;
  featureLayer: string;
  rimLight: string;
};

type ShootingStarState = {
  angle: number;
  duration: number;
  id: number;
  left: string;
  length: number;
  top: string;
  travelX: number;
  travelY: number;
};

type ShootingStarVariant = "upper" | "mid" | "lower";

const backgroundBodies: BackgroundBody[] = [
  {
    depth: "mid",
    detailLevel: "support",
    hasRing: true,
    id: "counterweight-ring",
    palette: "ice",
    position: { left: "6%", top: "14%" },
    ringTilt: -12,
    sceneWeight: "planetSupport",
    size: 118,
    tone: "neutral",
  },
  {
    depth: "far",
    detailLevel: "atmospheric",
    hasRing: false,
    id: "far-haze-west",
    palette: "pearl",
    position: { left: "50%", top: "10%" },
    sceneWeight: "planetSupport",
    size: 112,
    tone: "neutral",
  },
  {
    depth: "far",
    detailLevel: "atmospheric",
    hasRing: false,
    id: "far-haze-east",
    palette: "storm",
    position: { left: "84%", top: "24%" },
    sceneWeight: "planetSupport",
    size: 74,
    tone: "cool",
  },
  {
    depth: "mid",
    detailLevel: "support",
    hasRing: false,
    id: "signal-support",
    palette: "verdant",
    position: { left: "20%", top: "72%" },
    sceneWeight: "planetSupport",
    size: 82,
    tone: "accent",
  },
  {
    depth: "near",
    detailLevel: "hero",
    hasRing: false,
    id: "hero-mass",
    palette: "storm",
    position: { left: "82%", top: "72%" },
    sceneWeight: "planetHero",
    size: 194,
    tone: "neutral",
  },
];

const planetTones: Record<BodyTone, PlanetTone> = {
  accent: {
    atmosphere: "rgba(111,251,190,0.16)",
    band:
      "linear-gradient(180deg, transparent 0%, rgba(210,255,234,0.04) 34%, rgba(111,251,190,0.1) 48%, rgba(8,24,18,0.08) 58%, transparent 76%)",
    detail:
      "conic-gradient(from 214deg at 48% 50%, rgba(205,255,235,0.04) 0deg, rgba(111,251,190,0.08) 86deg, rgba(7,18,13,0.16) 176deg, rgba(111,251,190,0.04) 266deg, rgba(205,255,235,0.04) 360deg)",
    glow: "rgba(111,251,190,0.12)",
    ring: "rgba(171,255,223,0.22)",
    ringGlow: "rgba(111,251,190,0.08)",
    rim: "rgba(201,255,232,0.05)",
    surface:
      "radial-gradient(circle at 31% 28%, rgba(228,255,240,0.2) 0%, rgba(111,251,190,0.12) 15%, rgba(23,38,31,0.88) 48%, rgba(9,12,11,0.96) 78%, rgba(4,6,5,1) 100%)",
    terrain:
      "radial-gradient(circle at 26% 24%, rgba(222,255,239,0.08) 0 5%, transparent 10%), radial-gradient(circle at 62% 58%, rgba(111,251,190,0.08) 0 8%, transparent 16%), radial-gradient(circle at 46% 44%, rgba(12,26,20,0.2) 0 18%, transparent 28%), linear-gradient(145deg, transparent 0%, rgba(210,255,234,0.04) 34%, transparent 62%), conic-gradient(from 190deg at 50% 50%, rgba(210,255,234,0.03) 0deg, transparent 104deg, rgba(9,20,16,0.12) 208deg, transparent 360deg)",
  },
  cool: {
    atmosphere: "rgba(198,231,255,0.14)",
    band:
      "linear-gradient(180deg, transparent 0%, rgba(232,245,255,0.04) 36%, rgba(182,212,236,0.08) 48%, rgba(12,20,28,0.08) 58%, transparent 76%)",
    detail:
      "conic-gradient(from 210deg at 49% 50%, rgba(228,242,255,0.04) 0deg, rgba(175,208,238,0.08) 94deg, rgba(12,18,24,0.16) 188deg, rgba(149,187,218,0.04) 276deg, rgba(228,242,255,0.04) 360deg)",
    glow: "rgba(198,231,255,0.11)",
    ring: "rgba(214,238,255,0.22)",
    ringGlow: "rgba(198,231,255,0.07)",
    rim: "rgba(228,242,255,0.05)",
    surface:
      "radial-gradient(circle at 31% 27%, rgba(246,249,255,0.18) 0%, rgba(204,228,247,0.12) 16%, rgba(25,34,44,0.88) 48%, rgba(9,12,17,0.96) 78%, rgba(5,7,10,1) 100%)",
    terrain:
      "radial-gradient(circle at 28% 26%, rgba(244,249,255,0.07) 0 6%, transparent 12%), radial-gradient(circle at 66% 52%, rgba(177,209,235,0.08) 0 7%, transparent 16%), radial-gradient(circle at 44% 62%, rgba(9,14,20,0.18) 0 16%, transparent 26%), linear-gradient(150deg, transparent 0%, rgba(228,242,255,0.04) 34%, transparent 64%), conic-gradient(from 202deg at 50% 50%, rgba(228,242,255,0.02) 0deg, transparent 116deg, rgba(18,24,32,0.12) 224deg, transparent 360deg)",
  },
  neutral: {
    atmosphere: "rgba(255,255,255,0.12)",
    band:
      "linear-gradient(180deg, transparent 0%, rgba(245,247,250,0.04) 34%, rgba(201,210,220,0.08) 48%, rgba(13,16,20,0.08) 58%, transparent 76%)",
    detail:
      "conic-gradient(from 208deg at 50% 50%, rgba(255,255,255,0.04) 0deg, rgba(213,222,232,0.06) 92deg, rgba(15,19,24,0.18) 182deg, rgba(159,177,196,0.04) 276deg, rgba(255,255,255,0.04) 360deg)",
    glow: "rgba(255,255,255,0.1)",
    ring: "rgba(240,245,250,0.2)",
    ringGlow: "rgba(255,255,255,0.06)",
    rim: "rgba(255,255,255,0.05)",
    surface:
      "radial-gradient(circle at 31% 27%, rgba(252,253,255,0.16) 0%, rgba(218,226,235,0.1) 16%, rgba(28,33,39,0.88) 48%, rgba(10,11,13,0.96) 78%, rgba(5,6,7,1) 100%)",
    terrain:
      "radial-gradient(circle at 24% 24%, rgba(255,255,255,0.06) 0 6%, transparent 12%), radial-gradient(circle at 62% 56%, rgba(205,214,223,0.07) 0 8%, transparent 16%), radial-gradient(circle at 48% 42%, rgba(11,13,16,0.18) 0 18%, transparent 28%), linear-gradient(152deg, transparent 0%, rgba(255,255,255,0.03) 34%, transparent 64%), conic-gradient(from 202deg at 50% 50%, rgba(255,255,255,0.02) 0deg, transparent 116deg, rgba(14,17,20,0.12) 224deg, transparent 360deg)",
  },
};

const planetPalettes: Record<BodyPalette, PlanetPalette> = {
  dune: {
    cloudLayer:
      "linear-gradient(180deg, transparent 0%, rgba(246,221,194,0.05) 28%, rgba(198,151,111,0.12) 44%, rgba(90,60,44,0.08) 56%, transparent 74%), radial-gradient(ellipse at 64% 42%, rgba(248,214,179,0.08) 0 10%, transparent 22%)",
    colorWash:
      "conic-gradient(from 196deg at 50% 50%, rgba(197,151,108,0.24) 0deg, rgba(233,200,161,0.16) 88deg, rgba(108,76,53,0.16) 172deg, rgba(168,124,83,0.12) 260deg, rgba(197,151,108,0.24) 360deg)",
    featureLayer:
      "radial-gradient(circle at 28% 36%, rgba(255,226,188,0.12) 0 7%, transparent 14%), radial-gradient(circle at 58% 58%, rgba(117,81,53,0.16) 0 13%, transparent 24%), linear-gradient(145deg, transparent 0%, rgba(205,160,114,0.08) 34%, transparent 64%)",
    rimLight:
      "radial-gradient(circle at 28% 28%, rgba(255,231,203,0.2) 0%, rgba(243,185,126,0.12) 18%, transparent 46%)",
  },
  ice: {
    cloudLayer:
      "linear-gradient(180deg, transparent 0%, rgba(226,244,255,0.08) 28%, rgba(127,190,255,0.16) 42%, rgba(68,112,174,0.1) 56%, transparent 76%), radial-gradient(ellipse at 62% 34%, rgba(236,246,255,0.12) 0 10%, transparent 20%), linear-gradient(148deg, transparent 0%, rgba(198,232,255,0.08) 36%, transparent 68%)",
    colorWash:
      "conic-gradient(from 206deg at 50% 50%, rgba(92,156,255,0.26) 0deg, rgba(188,228,255,0.18) 94deg, rgba(53,89,153,0.18) 186deg, rgba(122,166,223,0.14) 282deg, rgba(92,156,255,0.26) 360deg)",
    featureLayer:
      "radial-gradient(circle at 34% 28%, rgba(245,250,255,0.14) 0 8%, transparent 16%), radial-gradient(circle at 66% 62%, rgba(70,110,165,0.18) 0 12%, transparent 22%), linear-gradient(152deg, transparent 0%, rgba(178,222,255,0.1) 36%, transparent 64%)",
    rimLight:
      "radial-gradient(circle at 28% 28%, rgba(216,242,255,0.28) 0%, rgba(116,196,255,0.22) 16%, rgba(76,138,255,0.12) 28%, transparent 50%)",
  },
  pearl: {
    cloudLayer:
      "linear-gradient(180deg, transparent 0%, rgba(246,240,255,0.06) 28%, rgba(194,167,255,0.14) 42%, rgba(92,80,137,0.08) 56%, transparent 76%), radial-gradient(ellipse at 56% 40%, rgba(239,229,255,0.1) 0 10%, transparent 20%)",
    colorWash:
      "conic-gradient(from 192deg at 50% 50%, rgba(142,118,232,0.24) 0deg, rgba(224,210,255,0.14) 104deg, rgba(84,72,130,0.16) 196deg, rgba(182,156,255,0.12) 286deg, rgba(142,118,232,0.24) 360deg)",
    featureLayer:
      "radial-gradient(circle at 30% 24%, rgba(246,241,255,0.12) 0 7%, transparent 14%), radial-gradient(circle at 62% 56%, rgba(86,73,124,0.14) 0 12%, transparent 24%), linear-gradient(150deg, transparent 0%, rgba(214,199,255,0.08) 34%, transparent 64%)",
    rimLight:
      "radial-gradient(circle at 28% 28%, rgba(240,232,255,0.24) 0%, rgba(186,160,255,0.18) 18%, rgba(138,118,230,0.1) 30%, transparent 50%)",
  },
  storm: {
    cloudLayer:
      "linear-gradient(180deg, transparent 0%, rgba(217,231,255,0.06) 18%, rgba(109,143,255,0.14) 30%, rgba(78,90,168,0.1) 42%, rgba(209,218,248,0.06) 54%, rgba(69,78,145,0.1) 66%, transparent 82%), radial-gradient(ellipse at 66% 38%, rgba(228,238,255,0.1) 0 8%, transparent 20%), radial-gradient(ellipse at 38% 62%, rgba(118,98,188,0.08) 0 10%, transparent 22%)",
    colorWash:
      "conic-gradient(from 208deg at 50% 50%, rgba(54,92,214,0.28) 0deg, rgba(131,175,255,0.16) 88deg, rgba(86,68,161,0.18) 176deg, rgba(72,98,194,0.16) 270deg, rgba(54,92,214,0.28) 360deg)",
    featureLayer:
      "radial-gradient(circle at 26% 28%, rgba(234,241,255,0.12) 0 7%, transparent 14%), radial-gradient(circle at 62% 58%, rgba(89,74,166,0.16) 0 12%, transparent 22%), radial-gradient(circle at 48% 44%, rgba(44,72,156,0.16) 0 18%, transparent 28%), linear-gradient(152deg, transparent 0%, rgba(177,205,255,0.08) 34%, transparent 64%)",
    rimLight:
      "radial-gradient(circle at 28% 28%, rgba(219,235,255,0.24) 0%, rgba(121,174,255,0.22) 16%, rgba(98,126,255,0.16) 28%, transparent 50%)",
  },
  verdant: {
    cloudLayer:
      "linear-gradient(180deg, transparent 0%, rgba(218,247,231,0.06) 26%, rgba(82,190,160,0.14) 42%, rgba(32,92,78,0.1) 56%, transparent 74%), radial-gradient(ellipse at 64% 42%, rgba(220,248,232,0.08) 0 8%, transparent 18%)",
    colorWash:
      "conic-gradient(from 194deg at 50% 50%, rgba(44,152,126,0.24) 0deg, rgba(169,229,211,0.14) 96deg, rgba(24,78,67,0.14) 184deg, rgba(88,198,165,0.12) 286deg, rgba(44,152,126,0.24) 360deg)",
    featureLayer:
      "radial-gradient(circle at 28% 32%, rgba(225,250,233,0.1) 0 7%, transparent 14%), radial-gradient(circle at 62% 60%, rgba(29,86,72,0.16) 0 12%, transparent 22%), linear-gradient(148deg, transparent 0%, rgba(164,226,204,0.08) 34%, transparent 64%)",
    rimLight:
      "radial-gradient(circle at 28% 28%, rgba(214,249,233,0.2) 0%, rgba(88,223,190,0.18) 18%, rgba(55,188,156,0.12) 30%, transparent 50%)",
  },
};

const backgroundConstellations: BackgroundConstellation[] = [
  {
    delay: 0.4,
    duration: 20,
    height: 66,
    id: "west-constellation",
    left: "14%",
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    opacity: 0.09,
    points: [
      { x: 14, y: 22 },
      { x: 36, y: 12 },
      { x: 58, y: 28 },
      { x: 82, y: 18 },
      { x: 96, y: 42 },
    ],
    top: "22%",
    width: 114,
  },
  {
    delay: 1.1,
    duration: 24,
    height: 72,
    id: "south-east-constellation",
    left: "70%",
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
    ],
    opacity: 0.08,
    points: [
      { x: 12, y: 54 },
      { x: 34, y: 28 },
      { x: 60, y: 18 },
      { x: 90, y: 36 },
      { x: 44, y: 58 },
    ],
    top: "58%",
    width: 124,
  },
  {
    delay: 0.8,
    duration: 22,
    height: 60,
    id: "north-bridge",
    left: "38%",
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    opacity: 0.07,
    points: [
      { x: 10, y: 28 },
      { x: 34, y: 12 },
      { x: 58, y: 22 },
      { x: 88, y: 10 },
    ],
    top: "12%",
    width: 104,
  },
  {
    delay: 1.7,
    duration: 26,
    height: 68,
    id: "west-fall",
    left: "9%",
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
    ],
    opacity: 0.075,
    points: [
      { x: 12, y: 18 },
      { x: 34, y: 30 },
      { x: 54, y: 16 },
      { x: 82, y: 28 },
      { x: 44, y: 54 },
    ],
    top: "54%",
    width: 108,
  },
  {
    delay: 1.3,
    duration: 23,
    height: 62,
    id: "eastern-lattice",
    left: "78%",
    links: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
    opacity: 0.068,
    points: [
      { x: 12, y: 16 },
      { x: 28, y: 34 },
      { x: 54, y: 22 },
      { x: 60, y: 50 },
    ],
    top: "16%",
    width: 76,
  },
];

const backgroundClusters: BackgroundCluster[] = [
  {
    height: 34,
    id: "cluster-north-west",
    left: "28%",
    stars: [
      { opacity: 0.16, size: 1.4, x: 4, y: 10 },
      { opacity: 0.11, size: 1.1, x: 18, y: 6 },
      { opacity: 0.13, size: 1.2, x: 24, y: 18 },
      { opacity: 0.09, size: 0.9, x: 38, y: 12 },
      { opacity: 0.12, size: 1.15, x: 44, y: 24 },
      { opacity: 0.08, size: 0.85, x: 56, y: 14 },
    ],
    top: "18%",
    width: 64,
  },
  {
    height: 28,
    id: "cluster-middle",
    left: "56%",
    stars: [
      { opacity: 0.12, size: 1.1, x: 6, y: 8 },
      { opacity: 0.1, size: 0.95, x: 18, y: 16 },
      { opacity: 0.15, size: 1.3, x: 30, y: 6 },
      { opacity: 0.11, size: 1.0, x: 40, y: 18 },
      { opacity: 0.08, size: 0.85, x: 52, y: 10 },
    ],
    top: "44%",
    width: 58,
  },
  {
    height: 32,
    id: "cluster-south-east",
    left: "74%",
    stars: [
      { opacity: 0.11, size: 1.0, x: 8, y: 8 },
      { opacity: 0.15, size: 1.28, x: 18, y: 20 },
      { opacity: 0.09, size: 0.9, x: 34, y: 14 },
      { opacity: 0.13, size: 1.12, x: 46, y: 8 },
      { opacity: 0.1, size: 0.95, x: 58, y: 18 },
      { opacity: 0.08, size: 0.85, x: 68, y: 12 },
    ],
    top: "68%",
    width: 78,
  },
];

const backgroundComets: BackgroundComet[] = [
  {
    anchorX: 16,
    anchorY: 26,
    brightness: 0.64,
    depth: "mid",
    drift: 12,
    id: "comet-west",
    phase: 0.45,
    shiftX: 24,
    shiftY: 18,
    speed: 3200,
    trailLength: 124,
  },
  {
    anchorX: 72,
    anchorY: 36,
    brightness: 0.58,
    depth: "mid",
    drift: 10,
    id: "comet-east",
    phase: 1.35,
    shiftX: 20,
    shiftY: 15,
    speed: 3600,
    trailLength: 112,
  },
  {
    anchorX: 26,
    anchorY: 78,
    brightness: 0.74,
    depth: "near",
    drift: 14,
    id: "comet-south",
    phase: 2.15,
    shiftX: 28,
    shiftY: 22,
    speed: 2900,
    trailLength: 144,
  },
];

function seededUnit(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function lerp(min: number, max: number, amount: number) {
  return min + (max - min) * amount;
}

function createStarfield(depth: SceneDepth, count: number): BackgroundStar[] {
  const depthSeed = depth === "far" ? 100 : depth === "mid" ? 200 : 300;
  const sizeRange =
    depth === "far" ? [0.8, 1.35] : depth === "mid" ? [1.05, 1.75] : [1.45, 2.3];
  const opacityRange =
    depth === "far" ? [0.045, 0.105] : depth === "mid" ? [0.07, 0.15] : [0.11, 0.22];
  const durationRange =
    depth === "far" ? [11.5, 16] : depth === "mid" ? [9.6, 13.6] : [8.8, 12.1];
  const accentThreshold = depth === "mid" ? 0.972 : 0.942;

  return Array.from({ length: count }, (_, index) => {
    const seed = depthSeed + index;
    const left = `${(2 + seededUnit(seed, 0.41) * 96).toFixed(2)}%`;
    const top = `${(4 + seededUnit(seed, 1.17) * 90).toFixed(2)}%`;
    const size = Number(lerp(sizeRange[0], sizeRange[1], seededUnit(seed, 2.61)).toFixed(2));
    const opacity = Number(lerp(opacityRange[0], opacityRange[1], seededUnit(seed, 3.77)).toFixed(3));
    const twinkleDuration = Number(
      lerp(durationRange[0], durationRange[1], seededUnit(seed, 4.39)).toFixed(2),
    );
    const delay = Number((seededUnit(seed, 5.21) * 4.2).toFixed(2));
    const isAccent = depth !== "far" && seededUnit(seed, 6.83) > accentThreshold;
    const color = isAccent ? "rgba(111,251,190,0.92)" : "rgba(255,255,255,0.94)";
    const glowAlpha =
      depth === "near" ? (isAccent ? 0.16 : 0.14) : depth === "mid" ? (isAccent ? 0.12 : 0.11) : isAccent ? 0.09 : 0.08;
    const glowColor = isAccent ? `rgba(111,251,190,${glowAlpha})` : `rgba(255,255,255,${glowAlpha})`;

    return {
      color,
      delay,
      depth,
      glow: `0 0 ${depth === "near" ? 14 : depth === "mid" ? 11 : 8}px ${glowColor}`,
      id: `${depth}-${index}`,
      left,
      opacity,
      size,
      top,
      twinkleDuration,
    };
  });
}

const backgroundStars = [
  ...createStarfield("far", 140),
  ...createStarfield("mid", 56),
  ...createStarfield("near", 24),
];

const farStars = backgroundStars.filter((star) => star.depth === "far");
const midStars = backgroundStars.filter((star) => star.depth === "mid");
const nearStars = backgroundStars.filter((star) => star.depth === "near");
const supportBodies = backgroundBodies.filter((body) => body.sceneWeight === "planetSupport");
const heroBodies = backgroundBodies.filter((body) => body.sceneWeight === "planetHero");

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function subscribeMediaQuery(query: MediaQueryList, handler: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }

  query.addListener(handler);
  return () => query.removeListener(handler);
}

function usePointerCapabilities() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const finePointer = window.matchMedia("(pointer: fine)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const hoverCapable = window.matchMedia("(any-hover: hover)");

    const update = () => {
      setIsFinePointer(finePointer.matches);
      setIsCoarsePointer(coarsePointer.matches);
      setCanHover(hoverCapable.matches);
    };

    update();

    const cleanups = [
      subscribeMediaQuery(finePointer, update),
      subscribeMediaQuery(coarsePointer, update),
      subscribeMediaQuery(hoverCapable, update),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return { canHover, isCoarsePointer, isFinePointer };
}

function useSceneOffset(
  sceneLeadX: MotionValue<number>,
  sceneLeadY: MotionValue<number>,
  xRange: number,
  yRange: number,
) {
  const x = useTransform(sceneLeadX, [-1, 1], [-xRange, xRange]);
  const y = useTransform(sceneLeadY, [-1, 1], [-yRange, yRange]);

  return { x, y };
}

function ScrollProgressLine({
  progress,
  reducedMotion,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reducedMotion: boolean;
}) {
  const smoothedProgress = useSpring(progress, {
    damping: 28,
    mass: 0.2,
    stiffness: 120,
  });

  return (
    <div className="pointer-events-none fixed right-5 top-24 bottom-24 z-[1] hidden w-px lg:block">
      <div className="absolute inset-0 bg-white/8" />
      <motion.div
        className={cx(
          "absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-[rgba(111,251,190,0.9)] via-[rgba(111,251,190,0.4)] to-transparent",
          reducedMotion ? "opacity-65" : "opacity-90",
        )}
        style={{ scaleY: reducedMotion ? progress : smoothedProgress }}
      />
      <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full border border-white/12 bg-[rgba(111,251,190,0.16)] shadow-[0_0_18px_rgba(111,251,190,0.25)]" />
      <div className="absolute -left-12 top-0 hidden font-mono text-[0.58rem] uppercase tracking-[0.34em] text-white/30 xl:block">
        scroll
      </div>
    </div>
  );
}

function ShootingStarLayer({
  enabled,
  variant,
}: {
  enabled: boolean;
  variant: ShootingStarVariant;
}) {
  const [activeStar, setActiveStar] = useState<ShootingStarState | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setActiveStar(null);
      return;
    }

    let cancelled = false;
    let timerId: number | undefined;
    const lane =
      variant === "upper"
        ? {
            angleMax: 24,
            angleMin: 16,
            initialMax: 2200,
            initialMin: 1100,
            leftMax: 86,
            leftMin: 46,
            lengthMax: 230,
            lengthMin: 162,
            nextMax: 5400,
            nextMin: 3200,
            topMax: 22,
            topMin: 5,
            travelXMax: 282,
            travelXMin: 198,
            travelYMax: 146,
            travelYMin: 92,
          }
        : variant === "mid"
          ? {
              angleMax: 22,
              angleMin: 14,
              initialMax: 3200,
              initialMin: 1700,
              leftMax: 68,
              leftMin: 20,
              lengthMax: 184,
              lengthMin: 128,
              nextMax: 7200,
              nextMin: 4200,
              topMax: 42,
              topMin: 16,
              travelXMax: 236,
              travelXMin: 162,
              travelYMax: 122,
              travelYMin: 72,
            }
          : {
              angleMax: 20,
              angleMin: 12,
              initialMax: 4600,
              initialMin: 2600,
              leftMax: 42,
              leftMin: 6,
              lengthMax: 150,
              lengthMin: 108,
              nextMax: 8200,
              nextMin: 5400,
              topMax: 68,
              topMin: 42,
              travelXMax: 186,
              travelXMin: 126,
              travelYMax: 96,
              travelYMin: 54,
            };

    const scheduleNext = (isInitial = false) => {
      if (cancelled) {
        return;
      }

      timerId = window.setTimeout(() => {
        const duration = randomBetween(1150, 1650);
        const star: ShootingStarState = {
          angle: randomBetween(lane.angleMin, lane.angleMax),
          duration,
          id: Date.now(),
          left: `${randomBetween(lane.leftMin, lane.leftMax)}%`,
          length: randomBetween(lane.lengthMin, lane.lengthMax),
          top: `${randomBetween(lane.topMin, lane.topMax)}%`,
          travelX: randomBetween(lane.travelXMin, lane.travelXMax),
          travelY: randomBetween(lane.travelYMin, lane.travelYMax),
        };

        setActiveStar(star);

        timerId = window.setTimeout(() => {
          setActiveStar(null);
          scheduleNext();
        }, duration + 180);
      }, randomBetween(
        isInitial ? lane.initialMin : lane.nextMin,
        isInitial ? lane.initialMax : lane.nextMax,
      ));
    };

    scheduleNext(true);

    return () => {
      cancelled = true;
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, [enabled, variant]);

  if (!enabled || !activeStar) {
    return null;
  }

  return (
    <motion.div
      className="absolute will-change-transform"
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, variant === "upper" ? 0.44 : variant === "mid" ? 0.32 : 0.22, 0],
        x: [0, activeStar.travelX],
        y: [0, activeStar.travelY],
      }}
      key={activeStar.id}
      style={{
        left: activeStar.left,
        top: activeStar.top,
        width: `${activeStar.length}px`,
        height: "1.5px",
        rotate: `${activeStar.angle}deg`,
        transformOrigin: "left center",
      }}
      transition={{
        duration: activeStar.duration / 1000,
        ease: [0.16, 0.78, 0.24, 1],
      }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            variant === "upper"
              ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 22%, rgba(111,251,190,0.22) 60%, rgba(255,255,255,0.82) 100%)"
              : variant === "mid"
                ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.025) 22%, rgba(111,251,190,0.14) 60%, rgba(255,255,255,0.56) 100%)"
                : "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 20%, rgba(111,251,190,0.1) 58%, rgba(255,255,255,0.42) 100%)",
          boxShadow:
            variant === "upper"
              ? "0 0 18px rgba(111,251,190,0.2)"
              : variant === "mid"
                ? "0 0 12px rgba(111,251,190,0.14)"
                : "0 0 10px rgba(111,251,190,0.12)",
        }}
      />
      <span
        className="absolute right-0 top-1/2 h-[4px] w-[4px] -translate-y-1/2 rounded-full"
        style={{
          backgroundColor:
            variant === "upper"
              ? "rgba(255,255,255,0.9)"
              : variant === "mid"
                ? "rgba(255,255,255,0.76)"
                : "rgba(255,255,255,0.62)",
          boxShadow:
            variant === "upper"
              ? "0 0 16px rgba(255,255,255,0.28)"
              : variant === "mid"
                ? "0 0 12px rgba(255,255,255,0.18)"
                : "0 0 10px rgba(255,255,255,0.14)",
        }}
      />
    </motion.div>
  );
}

function BackgroundPlanet({
  body,
  prefersReducedMotion,
  sceneLeadX,
  sceneLeadY,
}: {
  body: BackgroundBody;
  prefersReducedMotion: boolean;
  sceneLeadX: MotionValue<number>;
  sceneLeadY: MotionValue<number>;
}) {
  const tone = planetTones[body.tone];
  const palette = planetPalettes[body.palette];
  const lightRangeX =
    body.detailLevel === "hero" ? [38, 62] : body.detailLevel === "support" ? [42, 58] : [46, 54];
  const lightRangeY =
    body.detailLevel === "hero" ? [40, 58] : body.detailLevel === "support" ? [42, 56] : [45, 55];
  const shadowRangeX =
    body.detailLevel === "hero" ? [62, 38] : body.detailLevel === "support" ? [58, 42] : [54, 46];
  const shadowRangeY =
    body.detailLevel === "hero" ? [60, 42] : body.detailLevel === "support" ? [57, 43] : [55, 45];
  const highlightX = useTransform(sceneLeadX, [-1, 1], lightRangeX);
  const highlightY = useTransform(sceneLeadY, [-1, 1], lightRangeY);
  const shadowX = useTransform(sceneLeadX, [-1, 1], shadowRangeX);
  const shadowY = useTransform(sceneLeadY, [-1, 1], shadowRangeY);
  const ringRotate = useTransform(sceneLeadX, [-1, 1], [
    (body.ringTilt ?? -10) - 4,
    (body.ringTilt ?? -10) + 4,
  ]);
  const ringShiftX = useTransform(sceneLeadX, [-1, 1], [-2.2, 2.2]);
  const ringShiftY = useTransform(sceneLeadY, [-1, 1], [-1.4, 1.4]);
  const discInset =
    body.detailLevel === "hero" ? "12%" : body.detailLevel === "support" ? "16%" : "20%";
  const outerGlowOpacity =
    body.detailLevel === "hero" ? 0.14 : body.detailLevel === "support" ? 0.1 : 0.04;
  const discOpacity =
    body.detailLevel === "hero" ? 0.8 : body.detailLevel === "support" ? 0.72 : 0.5;
  const terrainOpacity =
    body.detailLevel === "hero" ? 0.38 : body.detailLevel === "support" ? 0.28 : 0.12;
  const bandOpacity =
    body.detailLevel === "hero" ? 0.34 : body.detailLevel === "support" ? 0.26 : 0.14;
  const colorWashOpacity =
    body.detailLevel === "hero" ? 0.52 : body.detailLevel === "support" ? 0.42 : 0.24;
  const featureOpacity =
    body.detailLevel === "hero" ? 0.32 : body.detailLevel === "support" ? 0.24 : 0.1;
  const cloudOpacity =
    body.detailLevel === "hero" ? 0.22 : body.detailLevel === "support" ? 0.16 : 0.06;
  const detailOpacity =
    body.detailLevel === "hero" ? 0.18 : body.detailLevel === "support" ? 0.12 : 0.06;
  const shadowOpacity =
    body.detailLevel === "hero" ? 0.56 : body.detailLevel === "support" ? 0.5 : 0.38;
  const rimStrength =
    body.detailLevel === "hero"
      ? `0 0 0 1px ${tone.rim} inset, 0 0 12px ${tone.glow}`
      : body.detailLevel === "support"
        ? `0 0 0 1px ${tone.rim} inset, 0 0 8px ${tone.atmosphere}`
        : "0 0 0 1px rgba(255,255,255,0.03) inset";
  const highlight = useMotionTemplate`radial-gradient(circle at ${highlightX}% ${highlightY}%, rgba(255,255,255,${body.detailLevel === "hero" ? "0.12" : body.detailLevel === "support" ? "0.08" : "0.04"}) 0%, rgba(255,255,255,${body.detailLevel === "hero" ? "0.06" : body.detailLevel === "support" ? "0.045" : "0.02"}) 18%, transparent 46%)`;
  const atmosphereTint = useMotionTemplate`radial-gradient(circle at ${highlightX}% ${highlightY}%, ${tone.atmosphere} 0%, transparent 54%)`;
  const limbLight = palette.rimLight;
  const shadow = useMotionTemplate`radial-gradient(circle at ${shadowX}% ${shadowY}%, rgba(2,4,5,0.02) 12%, rgba(2,4,5,0.12) 34%, rgba(2,4,5,0.32) 74%, rgba(2,4,5,0.6) 100%)`;
  const ringLight = useMotionTemplate`radial-gradient(circle at ${highlightX}% 50%, ${tone.ringGlow} 0%, transparent 64%)`;
  const showDetail = body.detailLevel !== "atmospheric";
  const shouldRotateSurface = !prefersReducedMotion && (body.detailLevel === "hero" || body.hasRing);
  const shouldRotateClouds = !prefersReducedMotion && body.detailLevel === "hero";

  return (
    <div
      className="absolute"
      style={{
        left: body.position.left,
        top: body.position.top,
        width: `${body.size}px`,
        height: `${body.size}px`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          backgroundImage: `radial-gradient(circle, ${tone.glow} 0%, transparent 72%)`,
          opacity: outerGlowOpacity,
        }}
      />
      {body.hasRing ? (
        <motion.span
          className="absolute left-1/2 top-1/2 h-[24%] w-[142%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
          style={{
            x: ringShiftX,
            y: ringShiftY,
            rotate: ringRotate,
            borderColor: tone.ring,
            boxShadow: `0 0 8px ${tone.ringGlow}`,
            opacity: 0.24,
          }}
        />
      ) : null}
      <div
        className="absolute overflow-hidden rounded-full isolate"
        style={{
          inset: discInset,
          opacity: discOpacity,
        }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: tone.surface }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: palette.colorWash,
            mixBlendMode: "normal",
            opacity: colorWashOpacity,
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: tone.terrain,
            mixBlendMode: "soft-light",
            opacity: terrainOpacity,
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: palette.featureLayer,
            mixBlendMode: "normal",
            opacity: featureOpacity,
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: tone.band,
            mixBlendMode: "normal",
            opacity: bandOpacity,
          }}
        />
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: palette.cloudLayer,
            mixBlendMode: "screen",
            opacity: cloudOpacity,
          }}
          animate={shouldRotateClouds ? { rotate: 360 } : undefined}
          transition={{
            duration: 136,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        {showDetail ? (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage: tone.detail,
              mixBlendMode: "overlay",
              opacity: detailOpacity,
            }}
            animate={shouldRotateSurface ? { rotate: 360 } : undefined}
            transition={{
              duration: body.detailLevel === "hero" ? 88 : 118,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        ) : (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 28%, rgba(255,255,255,0.01) 54%, transparent 100%)",
              opacity: 0.18,
            }}
          />
        )}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: atmosphereTint,
            mixBlendMode: "screen",
            opacity: body.detailLevel === "hero" ? 0.44 : body.detailLevel === "support" ? 0.3 : 0.12,
          }}
        />
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: limbLight,
            mixBlendMode: "screen",
            opacity: body.detailLevel === "hero" ? 0.42 : body.detailLevel === "support" ? 0.26 : 0.12,
          }}
        />
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: highlight,
            mixBlendMode: "screen",
            opacity: showDetail ? (body.detailLevel === "hero" ? 0.34 : 0.24) : 0.12,
          }}
        />
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: shadow,
            mixBlendMode: "multiply",
            opacity: shadowOpacity,
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: rimStrength }}
        />
      </div>
      {body.hasRing ? (
        <motion.span
          className="absolute left-1/2 top-1/2 h-[24%] w-[142%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
          style={{
            x: ringShiftX,
            y: ringShiftY,
            rotate: ringRotate,
            backgroundImage: ringLight,
            borderColor: tone.ring,
            boxShadow: `0 0 10px ${tone.ringGlow}`,
            clipPath: "inset(49% -14% -14% -14%)",
            opacity: 0.28,
          }}
        />
      ) : null}
    </div>
  );
}

function StarClusterField({
  clusters,
  reducedMotion,
}: {
  clusters: BackgroundCluster[];
  reducedMotion: boolean;
}) {
  return (
    <>
      {clusters.map((cluster) => (
        <motion.div
          className="absolute"
          key={cluster.id}
          style={{
            height: `${cluster.height}px`,
            left: cluster.left,
            top: cluster.top,
            width: `${cluster.width}px`,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.84, 1, 0.88],
                  scale: [1, 1.02, 1],
                }
          }
          transition={{
            duration: 10.5,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          {cluster.stars.map((star, index) => (
            <span
              className="absolute rounded-full"
              key={`${cluster.id}-${index}`}
              style={{
                backgroundColor: "rgba(255,255,255,0.96)",
                boxShadow: `0 0 10px rgba(255,255,255,${Math.min(star.opacity + 0.03, 0.18)})`,
                height: `${star.size}px`,
                left: `${star.x}px`,
                opacity: star.opacity,
                top: `${star.y}px`,
                width: `${star.size}px`,
              }}
            />
          ))}
        </motion.div>
      ))}
    </>
  );
}

function TrackingComet({
  comet,
  pointerLeadX,
  pointerLeadY,
  reducedMotion,
}: {
  comet: BackgroundComet;
  pointerLeadX: MotionValue<number>;
  pointerLeadY: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const time = useTime();
  const deltaX = useTransform(() => pointerLeadX.get() - comet.anchorX);
  const deltaY = useTransform(() => pointerLeadY.get() - comet.anchorY);
  const angleRadians = useTransform(() => Math.atan2(deltaY.get(), deltaX.get()));
  const angle = useTransform(() => (angleRadians.get() * 180) / Math.PI);
  const baseTravelX = useTransform(() => clamp(deltaX.get() * 0.42, -comet.shiftX, comet.shiftX));
  const baseTravelY = useTransform(() => clamp(deltaY.get() * 0.36, -comet.shiftY, comet.shiftY));
  const forwardDrift = useTransform(
    time,
    (value) => Math.sin(value / comet.speed + comet.phase) * comet.drift,
  );
  const lateralDrift = useTransform(
    time,
    (value) => Math.cos(value / (comet.speed * 1.18) + comet.phase) * (comet.drift * 0.34),
  );
  const travelX = useTransform(
    () =>
      baseTravelX.get() +
      Math.cos(angleRadians.get()) * forwardDrift.get() -
      Math.sin(angleRadians.get()) * lateralDrift.get(),
  );
  const travelY = useTransform(
    () =>
      baseTravelY.get() +
      Math.sin(angleRadians.get()) * forwardDrift.get() +
      Math.cos(angleRadians.get()) * lateralDrift.get(),
  );
  const distance = useTransform(() => Math.hypot(deltaX.get(), deltaY.get()));
  const scaleX = useTransform(() => 0.9 + Math.min(distance.get() / 42, 0.55));
  const opacity = useTransform(() => Math.min(comet.brightness + distance.get() / 220, 0.92));
  const scaleY = useTransform(time, (value) => 0.96 + Math.sin(value / 1700 + comet.phase) * 0.04);

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: `${comet.anchorX}%`,
        top: `${comet.anchorY}%`,
        x: travelX,
        y: travelY,
        rotate: angle,
        scaleX,
        scaleY,
        opacity,
        transformOrigin: "left center",
        width: `${comet.trailLength}px`,
        height: "8px",
      }}
      animate={
        reducedMotion
          ? undefined
          : {
              opacity: [comet.brightness * 0.88, comet.brightness, comet.brightness * 0.94],
            }
      }
      transition={{
        duration: 3.2,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      <span
        className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(111,251,190,0.015) 0%, rgba(111,251,190,0.09) 18%, rgba(255,255,255,0.34) 62%, rgba(255,255,255,0.96) 100%)",
          boxShadow: `0 0 14px rgba(255,255,255,${comet.brightness * 0.22})`,
        }}
      />
      <span
        className="absolute right-0 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: `0 0 16px rgba(255,255,255,${comet.brightness * 0.28})`,
        }}
      />
    </motion.div>
  );
}

function PointerCometField({
  comets,
  pointerLeadX,
  pointerLeadY,
  reducedMotion,
}: {
  comets: BackgroundComet[];
  pointerLeadX: MotionValue<number>;
  pointerLeadY: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <>
      {comets.map((comet) => (
        <TrackingComet
          comet={comet}
          key={comet.id}
          pointerLeadX={pointerLeadX}
          pointerLeadY={pointerLeadY}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}

function StarField({
  stars,
  reducedMotion,
}: {
  stars: BackgroundStar[];
  reducedMotion: boolean;
}) {
  return (
    <>
      {stars.map((star) => (
        <motion.span
          className="absolute rounded-full"
          key={star.id}
          style={{
            backgroundColor: star.color,
            boxShadow: star.glow,
            height: `${star.size}px`,
            left: star.left,
            opacity: star.opacity,
            top: star.top,
            width: `${star.size}px`,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [star.opacity * 0.72, star.opacity, star.opacity * 0.82],
                  scale: [1, star.depth === "near" ? 1.18 : star.depth === "mid" ? 1.12 : 1.08, 1],
                }
          }
          transition={{
            delay: star.delay,
            duration: star.twinkleDuration,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      ))}
    </>
  );
}

export function BackgroundInteractionLayer({
  className,
}: {
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { canHover, isCoarsePointer, isFinePointer } = usePointerCapabilities();
  const { scrollYProgress } = useScroll();

  const sceneTargetX = useMotionValue(0);
  const sceneTargetY = useMotionValue(0);
  const sceneLeadX = useSpring(sceneTargetX, {
    damping: 27,
    mass: 0.52,
    stiffness: 155,
  });
  const sceneLeadY = useSpring(sceneTargetY, {
    damping: 27,
    mass: 0.52,
    stiffness: 155,
  });
  const canUseParallax = !prefersReducedMotion && isFinePointer && canHover;
  const deepSpaceOffset = useSceneOffset(sceneLeadX, sceneLeadY, 4, 3);
  const farFieldOffset = useSceneOffset(sceneLeadX, sceneLeadY, 8, 6);
  const midFieldOffset = useSceneOffset(sceneLeadX, sceneLeadY, 14, 10);
  const planetSupportOffset = useSceneOffset(sceneLeadX, sceneLeadY, 18, 12);
  const planetHeroOffset = useSceneOffset(sceneLeadX, sceneLeadY, 28, 18);
  const shootingStarOffset = useSceneOffset(sceneLeadX, sceneLeadY, 3, 2);
  const pointerLeadX = useTransform(sceneLeadX, [-1, 1], [0, 100]);
  const pointerLeadY = useTransform(sceneLeadY, [-1, 1], [0, 100]);

  useEffect(() => {
    if (!canUseParallax || typeof window === "undefined") {
      sceneTargetX.set(0);
      sceneTargetY.set(0);
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      sceneTargetX.set((event.clientX / window.innerWidth) * 2 - 1);
      sceneTargetY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    const handleBlur = () => {
      sceneTargetX.set(0);
      sceneTargetY.set(0);
    };

    handleBlur();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handleBlur);
    document.documentElement.addEventListener("pointerleave", handleBlur);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleBlur);
      document.documentElement.removeEventListener("pointerleave", handleBlur);
    };
  }, [canUseParallax, sceneTargetX, sceneTargetY]);

  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
    >
      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? deepSpaceOffset : undefined}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(111,251,190,0.03),transparent_22%),radial-gradient(circle_at_74%_12%,rgba(255,255,255,0.03),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_32%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_26%)]" />
        <div className="absolute left-[46%] top-[12vh] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.032)_0%,rgba(255,255,255,0.012)_24%,transparent_72%)] blur-3xl opacity-80" />
        <div className="absolute left-[18%] top-[18vh] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(111,251,190,0.042)_0%,rgba(111,251,190,0.014)_28%,transparent_74%)] blur-3xl opacity-70" />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? farFieldOffset : undefined}
      >
        <StarField reducedMotion={prefersReducedMotion} stars={farStars} />
        <StarClusterField clusters={backgroundClusters} reducedMotion={prefersReducedMotion} />
        {backgroundConstellations.map((constellation) => (
          <motion.div
            className="absolute"
            key={constellation.id}
            style={{
              height: `${constellation.height}px`,
              left: constellation.left,
              top: constellation.top,
              width: `${constellation.width}px`,
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [
                      constellation.opacity * 0.74,
                      constellation.opacity,
                      constellation.opacity * 0.82,
                    ],
                  }
            }
            initial={{ opacity: constellation.opacity * 0.74 }}
            transition={{
              delay: constellation.delay,
              duration: constellation.duration,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            <svg
              aria-hidden="true"
              className="h-full w-full"
              preserveAspectRatio="none"
              viewBox={`0 0 ${constellation.width} ${constellation.height}`}
            >
              {constellation.links.map(([fromIndex, toIndex]) => {
                const fromPoint = constellation.points[fromIndex];
                const toPoint = constellation.points[toIndex];

                if (!fromPoint || !toPoint) {
                  return null;
                }

                return (
                  <line
                    key={`${constellation.id}-${fromIndex}-${toIndex}`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.7"
                    x1={fromPoint.x}
                    x2={toPoint.x}
                    y1={fromPoint.y}
                    y2={toPoint.y}
                  />
                );
              })}
              {constellation.points.map((point, index) => (
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill={index === 0 ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.54)"}
                  key={`${constellation.id}-${point.x}-${point.y}`}
                  r={index === 0 ? 1.45 : 1.1}
                />
              ))}
            </svg>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? midFieldOffset : undefined}
      >
        <StarField reducedMotion={prefersReducedMotion} stars={midStars} />
        {canUseParallax ? (
          <PointerCometField
            comets={backgroundComets.filter((comet) => comet.depth === "mid")}
            pointerLeadX={pointerLeadX}
            pointerLeadY={pointerLeadY}
            reducedMotion={prefersReducedMotion}
          />
        ) : null}
        <div className="absolute right-[10%] top-[34vh] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(111,251,190,0.034)_0%,rgba(111,251,190,0.012)_30%,transparent_74%)] blur-3xl opacity-55" />
        <div className="absolute left-[62%] top-[22vh] h-[14rem] w-[14rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.024)_0%,transparent_72%)] blur-3xl opacity-46" />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? planetSupportOffset : undefined}
      >
        {supportBodies.map((body) => (
          <BackgroundPlanet
            body={body}
            key={body.id}
            prefersReducedMotion={prefersReducedMotion}
            sceneLeadX={sceneLeadX}
            sceneLeadY={sceneLeadY}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? planetHeroOffset : undefined}
      >
        <StarField reducedMotion={prefersReducedMotion} stars={nearStars} />
        {canUseParallax ? (
          <PointerCometField
            comets={backgroundComets.filter((comet) => comet.depth === "near")}
            pointerLeadX={pointerLeadX}
            pointerLeadY={pointerLeadY}
            reducedMotion={prefersReducedMotion}
          />
        ) : null}
        <div className="absolute right-[2%] top-[56vh] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.032)_0%,rgba(255,255,255,0.01)_34%,transparent_76%)] blur-3xl opacity-60" />
        <div className="absolute right-[8%] top-[62vh] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(111,251,190,0.034)_0%,rgba(111,251,190,0.012)_32%,transparent_76%)] blur-3xl opacity-52" />
        {heroBodies.map((body) => (
          <BackgroundPlanet
            body={body}
            key={body.id}
            prefersReducedMotion={prefersReducedMotion}
            sceneLeadX={sceneLeadX}
            sceneLeadY={sceneLeadY}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={canUseParallax ? shootingStarOffset : undefined}
      >
        <ShootingStarLayer enabled={!prefersReducedMotion && !isCoarsePointer} variant="upper" />
        <ShootingStarLayer enabled={!prefersReducedMotion && !isCoarsePointer} variant="mid" />
        <ShootingStarLayer enabled={!prefersReducedMotion && !isCoarsePointer} variant="lower" />
      </motion.div>

      {!isCoarsePointer ? (
        <ScrollProgressLine
          progress={scrollYProgress}
          reducedMotion={prefersReducedMotion}
        />
      ) : null}
    </div>
  );
}
