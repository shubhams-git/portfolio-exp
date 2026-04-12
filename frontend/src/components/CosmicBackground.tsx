import { useEffect, useRef } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Star {
  x: number; y: number; r: number; op: number;
  phase: number; freq: number; layer: 1 | 2 | 3;
}

interface PlanetDef {
  nx: number; ny: number;
  r: number;   atmR: number;
  bodyHi: string; bodyLo: string;
  atmRgb: string;
  phase: number;
  driftAmp: number; driftFreq: number;
  parallax: number;
  hasRing: boolean;
}

interface Meteor {
  ox: number; oy: number; cos: number; sin: number;
  speed: number; tailLen: number; maxTravel: number; traveled: number;
}

interface Comet {
  ox: number; oy: number; cos: number; sin: number;
  speed: number; tailLen: number; maxTravel: number; traveled: number;
}

interface Ripple {
  x: number; y: number; r: number; maxR: number; alpha: number;
}

// ── Static definitions ──────────────────────────────────────────────────────

const CONSTELLATIONS: Array<{
  pts: [number, number][];
  edges: [number, number][];
}> = [
  {
    pts: [[0.07,0.10],[0.13,0.06],[0.18,0.12],[0.22,0.07],[0.10,0.18]],
    edges: [[0,1],[1,2],[2,3],[1,4]],
  },
  {
    pts: [[0.73,0.05],[0.79,0.11],[0.85,0.07],[0.88,0.15],[0.76,0.19]],
    edges: [[0,1],[1,2],[2,3],[1,4]],
  },
  {
    pts: [[0.40,0.17],[0.46,0.12],[0.51,0.20],[0.44,0.27]],
    edges: [[0,1],[1,2],[1,3]],
  },
];

// Three planets — accent teal + two cold variants, matching --color-accent: #6ffbbe
const PLANET_DEFS: PlanetDef[] = [
  {
    // Main planet — upper right — teal atmosphere + ring
    nx: 0.83, ny: 0.21,
    r: 52, atmR: 118,
    bodyHi: "rgba(44,68,56,0.95)", bodyLo: "rgba(7,11,9,0.98)",
    atmRgb: "111,251,190",
    phase: 0, driftAmp: 8, driftFreq: 0.000038, parallax: 52,
    hasRing: true,
  },
  {
    // Secondary — left side — cold silver-blue
    nx: 0.09, ny: 0.46,
    r: 28, atmR: 66,
    bodyHi: "rgba(46,52,66,0.92)", bodyLo: "rgba(8,9,14,0.98)",
    atmRgb: "190,205,232",
    phase: 2.1, driftAmp: 5, driftFreq: 0.000052, parallax: 34,
    hasRing: false,
  },
  {
    // Distant small — upper center — faint teal-white
    nx: 0.55, ny: 0.06,
    r: 11, atmR: 36,
    bodyHi: "rgba(34,40,36,0.88)", bodyLo: "rgba(4,5,4,0.98)",
    atmRgb: "160,220,190",
    phase: 4.4, driftAmp: 3, driftFreq: 0.000066, parallax: 20,
    hasRing: false,
  },
];

// Faint nebula blobs for background depth
const NEBULAS: [number, number, number, string, number][] = [
  [0.14, 0.62, 340, "111,251,190", 0.026],
  [0.79, 0.74, 270, "175,195,240", 0.020],
  [0.50, 0.40, 200, "111,251,190", 0.013],
];

// ── Component ───────────────────────────────────────────────────────────────

export function CosmicBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = (e: MediaQueryListEvent) => { reduced = e.matches; };
    mq.addEventListener("change", onMq);

    // Seeded xorshift32 — deterministic star layout, no reload jank
    let _s = 0x12ab3cd4 | 0;
    const rand = (): number => {
      _s ^= _s << 13; _s ^= _s >> 17; _s ^= _s << 5;
      return (_s >>> 0) / 4294967295;
    };

    // ── Star generation ─────────────────────────────────────────────────────
    const stars: Star[] = [];
    const addLayer = (
      n: number, l: 1 | 2 | 3,
      rLo: number, rHi: number,
      oLo: number, oHi: number,
    ) => {
      for (let i = 0; i < n; i++) {
        // Sky-bias: 60% of stars in upper 38% of viewport
        const yn = rand();
        const y = yn < 0.6 ? yn * 0.633 : 0.38 + (yn - 0.6) * 1.55;
        stars.push({
          x: rand(), y: Math.min(1, Math.max(0, y)),
          r: rLo + rand() * (rHi - rLo),
          op: oLo + rand() * (oHi - oLo),
          phase: rand() * 6.283, freq: 0.0001 + rand() * 0.0004,
          layer: l,
        });
      }
    };
    addLayer(190, 1, 0.25, 0.62, 0.05, 0.20);
    addLayer(58,  2, 0.62, 1.28, 0.14, 0.45);
    addLayer(10,  3, 1.30, 2.20, 0.44, 0.84);

    // Constellation anchor stars (bright, hand-placed)
    for (const c of CONSTELLATIONS) {
      for (const [px, py] of c.pts) {
        stars.push({
          x: px, y: py,
          r: 1.2 + rand() * 0.85,
          op: 0.56 + rand() * 0.30,
          phase: rand() * 6.283, freq: 0.00014 + rand() * 0.00025,
          layer: 3,
        });
      }
    }

    // ── Runtime state ───────────────────────────────────────────────────────
    let meteor: Meteor | null = null;
    let meteorCd = 600 + rand() * 2000;  // first meteor fires quickly

    let comet: Comet | null = null;
    let cometCd = 800 + rand() * 3500;   // first comet fires early so user sees one

    const ripples: Ripple[] = [];

    // Mouse / touch — normalized -0.5 to 0.5 from viewport center
    let mouseNX = 0, mouseNY = 0;  // smoothed
    let tgtNX = 0,   tgtNY = 0;    // raw target

    // ── Viewport ────────────────────────────────────────────────────────────
    let W = 0, H = 0, dpr = 1;
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    // ── Event listeners ─────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      tgtNX = e.clientX / W - 0.5;
      tgtNY = e.clientY / H - 0.5;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) { tgtNX = t.clientX / W - 0.5; tgtNY = t.clientY / H - 0.5; }
    };
    const onClick = (e: MouseEvent) => {
      if (!reduced) ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 135, alpha: 0.60 });
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && !reduced) ripples.push({ x: t.clientX, y: t.clientY, r: 0, maxR: 135, alpha: 0.60 });
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove",  onTouchMove, { passive: true });
    window.addEventListener("click",      onClick);
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    // ── Spawn helpers ────────────────────────────────────────────────────────
    const spawnMeteor = () => {
      const deg = 12 + rand() * 24;
      const rad = deg * Math.PI / 180;
      const tailLen = 90 + rand() * 120;
      meteor = {
        ox: W * (0.04 + rand() * 0.52), oy: H * (0.02 + rand() * 0.26),
        cos: Math.cos(rad), sin: Math.sin(rad),
        speed: 0.55 + rand() * 0.45, tailLen,
        maxTravel: tailLen + 220 + rand() * W * 0.36, traveled: 0,
      };
    };

    const spawnComet = () => {
      const goRight = rand() > 0.38;
      const deg = goRight ? 5 + rand() * 18 : 162 + rand() * 18;
      const rad = deg * Math.PI / 180;
      const cos = Math.cos(rad);
      const tailLen = 250 + rand() * 200;
      comet = {
        ox: goRight ? -tailLen : W + tailLen,
        oy: H * (0.04 + rand() * 0.32),
        cos, sin: Math.sin(rad),
        speed: 0.022 + rand() * 0.016,  // px/ms — very slow
        tailLen,
        maxTravel: Math.abs((W + tailLen * 2) / Math.max(Math.abs(cos), 0.08)),
        traveled: 0,
      };
    };

    // ── Planet renderer ──────────────────────────────────────────────────────
    const drawPlanet = (p: PlanetDef, px: number, py: number, ts: number) => {
      const pulse = reduced ? 1.0 : 0.82 + 0.18 * Math.sin(ts * 0.000085 + p.phase);

      // Outer atmosphere haze
      const ag = ctx.createRadialGradient(px, py, p.r * 0.5, px, py, p.atmR);
      ag.addColorStop(0,    `rgba(${p.atmRgb},${(0.20 * pulse).toFixed(3)})`);
      ag.addColorStop(0.35, `rgba(${p.atmRgb},${(0.08 * pulse).toFixed(3)})`);
      ag.addColorStop(1,    `rgba(${p.atmRgb},0)`);
      ctx.beginPath();
      ctx.arc(px, py, p.atmR, 0, 6.283);
      ctx.fillStyle = ag;
      ctx.fill();

      // Planet sphere — off-center radial gradient fakes directional lighting
      const lx = px - p.r * 0.28, ly = py - p.r * 0.38;
      const bg = ctx.createRadialGradient(lx, ly, 0, px, py, p.r);
      bg.addColorStop(0,    p.bodyHi);
      bg.addColorStop(0.55, p.bodyLo);
      bg.addColorStop(1,    "rgba(0,0,0,0.99)");
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, 6.283);
      ctx.fillStyle = bg;
      ctx.fill();

      // Rim light — atmospheric edge glow wrapping the dark side
      const rg = ctx.createRadialGradient(px, py, p.r * 0.80, px, py, p.r * 1.06);
      rg.addColorStop(0, `rgba(${p.atmRgb},0)`);
      rg.addColorStop(1, `rgba(${p.atmRgb},${(0.35 * pulse).toFixed(3)})`);
      ctx.beginPath();
      ctx.arc(px, py, p.r * 1.06, 0, 6.283);
      ctx.fillStyle = rg;
      ctx.fill();

      // Ring system (flattened ellipse viewed at angle)
      if (p.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.26);
        const ro = (0.14 * pulse).toFixed(3);

        ctx.beginPath();
        ctx.arc(0, 0, p.r * 1.68, 0, 6.283);
        ctx.strokeStyle = `rgba(${p.atmRgb},${ro})`;
        ctx.lineWidth = (p.r * 0.24) / 0.26;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, p.r * 1.42, 0, 6.283);
        ctx.strokeStyle = `rgba(${p.atmRgb},${(0.07 * pulse).toFixed(3)})`;
        ctx.lineWidth = (p.r * 0.10) / 0.26;
        ctx.stroke();

        ctx.restore();
      }
    };

    // ── Comet renderer ───────────────────────────────────────────────────────
    const drawComet = (c: Comet) => {
      const hd = c.traveled;
      const hx = c.ox + c.cos * hd;
      const hy = c.oy + c.sin * hd;

      const fadeIn  = Math.min(1, hd / 90);
      const fadeOut = Math.max(0, Math.min(1, (c.maxTravel - hd) / (c.tailLen * 0.9)));
      const alpha   = fadeIn * fadeOut;
      if (alpha < 0.004) return;

      // Fan-shaped dust tail — 5 lines at slightly different angles
      const backAngle = Math.atan2(c.sin, c.cos) + Math.PI;
      for (let i = -2; i <= 2; i++) {
        const angle  = backAngle + i * 0.09;
        const a      = alpha * (0.58 - Math.abs(i) * 0.10);
        const tLen   = c.tailLen * (1 - Math.abs(i) * 0.13);
        const ex = hx + Math.cos(angle) * tLen;
        const ey = hy + Math.sin(angle) * tLen;

        const g = ctx.createLinearGradient(hx, hy, ex, ey);
        g.addColorStop(0,   `rgba(210,255,235,${a.toFixed(3)})`);
        g.addColorStop(0.5, `rgba(255,255,255,${(a * 0.35).toFixed(3)})`);
        g.addColorStop(1,   "rgba(255,255,255,0)");

        ctx.save();
        ctx.lineWidth = Math.max(0.4, 2.0 - Math.abs(i) * 0.45);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();
      }

      // Coma (fuzzy ball around nucleus)
      const cg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 15);
      cg.addColorStop(0,   `rgba(225,255,242,${(alpha * 0.95).toFixed(3)})`);
      cg.addColorStop(0.4, `rgba(175,240,210,${(alpha * 0.45).toFixed(3)})`);
      cg.addColorStop(1,   "rgba(175,240,210,0)");
      ctx.beginPath();
      ctx.arc(hx, hy, 15, 0, 6.283);
      ctx.fillStyle = cg;
      ctx.fill();

      // Nucleus (hard bright core)
      ctx.beginPath();
      ctx.arc(hx, hy, 2.2, 0, 6.283);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.fill();
    };

    // ── Render loop ──────────────────────────────────────────────────────────
    let lastTs = -1, rafId = 0;

    const tick = (ts: number) => {
      rafId = requestAnimationFrame(tick);
      if (lastTs < 0) { lastTs = ts; return; }
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      // Smooth mouse follow — lerp toward target
      mouseNX += (tgtNX - mouseNX) * 0.075;
      mouseNY += (tgtNY - mouseNY) * 0.075;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Per-layer parallax offsets (deeper = moves more with cursor = feels closer)
      const p1x = mouseNX * 7,  p1y = mouseNY * 7;   // micro-stars (distant)
      const p2x = mouseNX * 18, p2y = mouseNY * 18;  // mid-stars
      const p3x = mouseNX * 32, p3y = mouseNY * 32;  // bright stars + constellations
      const ppx = mouseNX * 54, ppy = mouseNY * 54;  // planets (closest)

      // ── Nebula depth clouds (background) ─────────────────────────────────
      for (const [nx, ny, nr, rgb, op] of NEBULAS) {
        const bx = (nx as number) * W + p1x;
        const by = (ny as number) * H + p1y;
        const ng = ctx.createRadialGradient(bx, by, 0, bx, by, nr as number);
        ng.addColorStop(0, `rgba(${rgb},${op})`);
        ng.addColorStop(1, `rgba(${rgb},0)`);
        ctx.beginPath();
        ctx.arc(bx, by, nr as number, 0, 6.283);
        ctx.fillStyle = ng;
        ctx.fill();
      }

      // ── Layer 1: micro-stars — static fill, no twinkle ────────────────────
      for (const s of stars) {
        if (s.layer !== 1) continue;
        ctx.beginPath();
        ctx.arc(s.x * W + p1x, s.y * H + p1y, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${s.op.toFixed(3)})`;
        ctx.fill();
      }

      // ── Constellation lines — teal hairlines ──────────────────────────────
      ctx.save();
      ctx.lineWidth = 0.45;
      for (const c of CONSTELLATIONS) {
        for (const [a, b] of c.edges) {
          const [ax, ay] = c.pts[a], [bx, by] = c.pts[b];
          const x0 = ax * W + p3x, y0 = ay * H + p3y;
          const x1 = bx * W + p3x, y1 = by * H + p3y;
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0,   "rgba(111,251,190,0.08)");
          g.addColorStop(0.5, "rgba(111,251,190,0.15)");
          g.addColorStop(1,   "rgba(111,251,190,0.08)");
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ── Layer 2: mid-stars — subtle sine twinkle ──────────────────────────
      for (const s of stars) {
        if (s.layer !== 2) continue;
        const op = reduced ? s.op : s.op * (0.87 + 0.13 * Math.sin(ts * s.freq + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W + p2x, s.y * H + p2y, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
        ctx.fill();
      }

      // ── Layer 3: bright stars — radial glow + twinkle + diffraction ───────
      for (const s of stars) {
        if (s.layer !== 3) continue;
        const sx = s.x * W + p3x, sy = s.y * H + p3y;
        const op = reduced ? s.op : s.op * (0.76 + 0.24 * Math.sin(ts * s.freq + s.phase));

        const glowR = s.r * 5;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        grd.addColorStop(0,   `rgba(255,255,255,${(op * 0.34).toFixed(3)})`);
        grd.addColorStop(0.4, `rgba(255,255,255,${(op * 0.08).toFixed(3)})`);
        grd.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, 6.283);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
        ctx.fill();

        // Diffraction cross on brightest stars
        if (s.op > 0.54 && !reduced) {
          const len = s.r * 5.8;
          ctx.save();
          ctx.lineWidth = 0.55;
          for (const [cx, cy] of [[1, 0], [0, 1]] as [number, number][]) {
            const sg = ctx.createLinearGradient(sx - cx*len, sy - cy*len, sx + cx*len, sy + cy*len);
            sg.addColorStop(0,   "rgba(255,255,255,0)");
            sg.addColorStop(0.5, `rgba(255,255,255,${(op * 0.38).toFixed(3)})`);
            sg.addColorStop(1,   "rgba(255,255,255,0)");
            ctx.strokeStyle = sg;
            ctx.beginPath();
            ctx.moveTo(sx - cx*len, sy - cy*len);
            ctx.lineTo(sx + cx*len, sy + cy*len);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ── Planets ───────────────────────────────────────────────────────────
      for (const pd of PLANET_DEFS) {
        const drift = reduced ? 0 : pd.driftAmp * Math.sin(ts * pd.driftFreq + pd.phase);
        const px = pd.nx * W + ppx + drift;
        const py = pd.ny * H + ppy + drift * 0.4;
        drawPlanet(pd, px, py, ts);
      }

      // ── Cursor light bloom — teal additive glow that follows the pointer ──
      if (!reduced) {
        const cx = (0.5 + mouseNX) * W;
        const cy = (0.5 + mouseNY) * H;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 230);
        lg.addColorStop(0,   "rgba(111,251,190,0.10)");
        lg.addColorStop(0.38,"rgba(111,251,190,0.04)");
        lg.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 230, 0, 6.283);
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.restore();
      }

      // ── Comet ─────────────────────────────────────────────────────────────
      if (!reduced) {
        cometCd -= dt;
        if (!comet && cometCd <= 0) {
          spawnComet();
          cometCd = 22000 + rand() * 28000;
        }
        if (comet) {
          comet.traveled += dt * comet.speed;
          drawComet(comet);
          const hx = comet.ox + comet.cos * comet.traveled;
          const hy = comet.oy + comet.sin * comet.traveled;
          if (comet.traveled >= comet.maxTravel || hx < -400 || hx > W + 400 || hy > H + 100) {
            comet = null;
          }
        }
      }

      // ── Shooting star (meteor) ────────────────────────────────────────────
      if (!reduced) {
        meteorCd -= dt;
        if (!meteor && meteorCd <= 0) {
          spawnMeteor();
          meteorCd = 5000 + rand() * 9000;
        }
        if (meteor) {
          meteor.traveled += dt * meteor.speed;
          const hd = meteor.traveled;
          const td = Math.max(0, hd - meteor.tailLen);
          const hx = meteor.ox + meteor.cos * hd;
          const hy = meteor.oy + meteor.sin * hd;
          const tx = meteor.ox + meteor.cos * td;
          const ty = meteor.oy + meteor.sin * td;

          const fadeIn  = Math.min(1, hd / (meteor.tailLen * 0.55));
          const fadeOut = Math.max(0, Math.min(1, (meteor.maxTravel - hd) / (meteor.tailLen * 0.9)));
          const alpha   = fadeIn * fadeOut;

          if (alpha > 0.005 && hd > td) {
            const sg = ctx.createLinearGradient(tx, ty, hx, hy);
            sg.addColorStop(0,    "rgba(255,255,255,0)");
            sg.addColorStop(0.55, `rgba(255,255,255,${(alpha * 0.42).toFixed(3)})`);
            sg.addColorStop(1,    `rgba(255,255,255,${alpha.toFixed(3)})`);
            ctx.save();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = sg;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx, hy);
            ctx.stroke();

            const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7);
            hg.addColorStop(0, `rgba(255,255,255,${(alpha * 0.92).toFixed(3)})`);
            hg.addColorStop(1, "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.arc(hx, hy, 7, 0, 6.283);
            ctx.fillStyle = hg;
            ctx.fill();
            ctx.restore();
          }

          if (hd >= meteor.maxTravel || hx > W + 80 || hy > H + 50) meteor = null;
        }
      }

      // ── Click / tap ripples — teal expanding ring ─────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r     += dt * 0.14;
        rp.alpha -= dt * 0.00092;
        if (rp.alpha <= 0 || rp.r >= rp.maxR) { ripples.splice(i, 1); continue; }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, 6.283);
        ctx.strokeStyle = `rgba(111,251,190,${rp.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (rp.r > 18) {
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 0.68, 0, 6.283);
          ctx.strokeStyle = `rgba(111,251,190,${(rp.alpha * 0.38).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("click",      onClick);
      window.removeEventListener("touchstart", onTouchStart);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
