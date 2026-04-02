import { useEffect, useRef } from "react";

interface Star {
  x: number;     // normalized 0–1
  y: number;     // normalized 0–1
  r: number;     // radius in CSS px
  op: number;    // base opacity
  phase: number; // twinkle phase offset (radians)
  freq: number;  // twinkle frequency (rad/ms)
  layer: 1 | 2 | 3;
}

interface Meteor {
  ox: number;        // origin x (CSS px)
  oy: number;        // origin y (CSS px)
  cos: number;       // direction unit x
  sin: number;       // direction unit y
  speed: number;     // CSS px / ms
  tailLen: number;   // visible tail length (px)
  maxTravel: number; // total px before deactivation
  traveled: number;  // elapsed px
}

// Hand-placed constellation star clusters — angular/geometric to match
// the "Digital Architect" design identity. Kept in the upper viewport area.
const CONSTELLATIONS: Array<{
  pts: [number, number][];
  edges: [number, number][];
}> = [
  {
    // Upper-left — "The Offset" (5 stars, L-bracket shape)
    pts: [
      [0.07, 0.10],
      [0.13, 0.06],
      [0.18, 0.12],
      [0.22, 0.07],
      [0.10, 0.18],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
    ],
  },
  {
    // Upper-right — "The Meridian" (5 stars, Z-bracket shape)
    pts: [
      [0.73, 0.05],
      [0.79, 0.11],
      [0.85, 0.07],
      [0.88, 0.15],
      [0.76, 0.19],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
    ],
  },
  {
    // Upper-center — "The Pivot" (4 stars, arrow/chevron shape)
    pts: [
      [0.40, 0.17],
      [0.46, 0.12],
      [0.51, 0.20],
      [0.44, 0.27],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
  },
];

export function CosmicBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── Reduced-motion support ─────────────────────────────────────────────
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      reduced = e.matches;
    };
    mq.addEventListener("change", onMq);

    // ── Seeded xorshift32 RNG (deterministic, no layout jank on reload) ────
    let _s = 0x12ab3cd4 | 0;
    const rand = (): number => {
      _s ^= _s << 13;
      _s ^= _s >> 17;
      _s ^= _s << 5;
      return (_s >>> 0) / 4294967295;
    };

    // ── Star generation ────────────────────────────────────────────────────
    const stars: Star[] = [];

    const addLayer = (
      n: number,
      l: 1 | 2 | 3,
      rLo: number,
      rHi: number,
      oLo: number,
      oHi: number,
    ) => {
      for (let i = 0; i < n; i++) {
        // Sky-bias: compress upper region so 60% of stars appear above y=0.38
        const yn = rand();
        const y =
          yn < 0.6
            ? yn * 0.633           // 0–0.6  → y 0–0.38
            : 0.38 + (yn - 0.6) * 1.55; // 0.6–1 → y 0.38–1
        stars.push({
          x: rand(),
          y: Math.min(1, Math.max(0, y)),
          r: rLo + rand() * (rHi - rLo),
          op: oLo + rand() * (oHi - oLo),
          phase: rand() * 6.283,
          freq: 0.00010 + rand() * 0.00040,
          layer: l,
        });
      }
    };

    addLayer(185, 1, 0.25, 0.58, 0.04, 0.15); // micro-stars  (no twinkle)
    addLayer(55, 2, 0.60, 1.22, 0.10, 0.36);  // mid-stars    (subtle twinkle)
    addLayer(8, 3, 1.25, 2.05, 0.38, 0.74);   // bright stars (glow + twinkle)

    // Constellation stars — hand-placed layer-3 stars
    for (const c of CONSTELLATIONS) {
      for (const [px, py] of c.pts) {
        stars.push({
          x: px,
          y: py,
          r: 1.15 + rand() * 0.78,
          op: 0.48 + rand() * 0.30,
          phase: rand() * 6.283,
          freq: 0.00014 + rand() * 0.00026,
          layer: 3,
        });
      }
    }

    // ── Meteor (shooting star) state ───────────────────────────────────────
    let meteor: Meteor | null = null;
    let meteorCountdown = 1500 + rand() * 3500; // ms until first meteor

    const spawnMeteor = () => {
      const deg = 12 + rand() * 24; // 12–36° below horizontal
      const rad = (deg * Math.PI) / 180;
      const tailLen = 85 + rand() * 118;
      meteor = {
        ox: W * (0.04 + rand() * 0.52),
        oy: H * (0.02 + rand() * 0.28),
        cos: Math.cos(rad),
        sin: Math.sin(rad),
        speed: 0.48 + rand() * 0.44,     // px/ms ≈ 480–920 px/s
        tailLen,
        maxTravel: tailLen + 220 + rand() * W * 0.36,
        traveled: 0,
      };
    };

    // ── Viewport + DPR management ──────────────────────────────────────────
    let W = 0,
      H = 0,
      dpr = 1;
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    // ── Render loop ────────────────────────────────────────────────────────
    let lastTs = -1;
    let rafId = 0;

    const tick = (ts: number) => {
      rafId = requestAnimationFrame(tick);
      if (lastTs < 0) {
        lastTs = ts;
        return;
      }
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      // Reset to DPR-scaled transform each frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: micro-stars — plain fill, no twinkle (performance) ──────
      for (const s of stars) {
        if (s.layer !== 1) continue;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${s.op.toFixed(3)})`;
        ctx.fill();
      }

      // ── Constellation lines — thin gradient hairlines ──────────────────
      ctx.save();
      ctx.lineWidth = 0.42;
      for (const c of CONSTELLATIONS) {
        for (const [a, b] of c.edges) {
          const [ax, ay] = c.pts[a];
          const [bx, by] = c.pts[b];
          const x0 = ax * W,
            y0 = ay * H,
            x1 = bx * W,
            y1 = by * H;
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, "rgba(255,255,255,0.055)");
          g.addColorStop(0.5, "rgba(255,255,255,0.095)");
          g.addColorStop(1, "rgba(255,255,255,0.055)");
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ── Layer 2: mid-stars — subtle twinkle via sine ──────────────────
      for (const s of stars) {
        if (s.layer !== 2) continue;
        const op = reduced
          ? s.op
          : s.op * (0.87 + 0.13 * Math.sin(ts * s.freq + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
        ctx.fill();
      }

      // ── Layer 3: bright stars — radial glow + twinkle + diffraction ──
      for (const s of stars) {
        if (s.layer !== 3) continue;
        const sx = s.x * W,
          sy = s.y * H;
        const op = reduced
          ? s.op
          : s.op * (0.77 + 0.23 * Math.sin(ts * s.freq + s.phase));

        // Soft outer halo
        const glowR = s.r * 4.8;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        grd.addColorStop(0, `rgba(255,255,255,${(op * 0.30).toFixed(3)})`);
        grd.addColorStop(0.42, `rgba(255,255,255,${(op * 0.07).toFixed(3)})`);
        grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, 6.283);
        ctx.fillStyle = grd;
        ctx.fill();

        // Star core
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
        ctx.fill();

        // Diffraction cross spikes for the brightest stars only
        if (s.op > 0.56 && !reduced) {
          const len = s.r * 5.5;
          ctx.save();
          ctx.lineWidth = 0.5;
          for (const [cx, cy] of [
            [1, 0],
            [0, 1],
          ] as [number, number][]) {
            const sg = ctx.createLinearGradient(
              sx - cx * len,
              sy - cy * len,
              sx + cx * len,
              sy + cy * len,
            );
            sg.addColorStop(0, "rgba(255,255,255,0)");
            sg.addColorStop(0.5, `rgba(255,255,255,${(op * 0.34).toFixed(3)})`);
            sg.addColorStop(1, "rgba(255,255,255,0)");
            ctx.strokeStyle = sg;
            ctx.beginPath();
            ctx.moveTo(sx - cx * len, sy - cy * len);
            ctx.lineTo(sx + cx * len, sy + cy * len);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ── Shooting star ─────────────────────────────────────────────────
      if (!reduced) {
        meteorCountdown -= dt;

        if (!meteor && meteorCountdown <= 0) {
          spawnMeteor();
          meteorCountdown = 5000 + rand() * 9500;
        }

        if (meteor) {
          meteor.traveled += dt * meteor.speed;

          const hd = meteor.traveled; // head distance from origin
          const td = Math.max(0, hd - meteor.tailLen); // tail distance
          const hx = meteor.ox + meteor.cos * hd;
          const hy = meteor.oy + meteor.sin * hd;
          const tx = meteor.ox + meteor.cos * td;
          const ty = meteor.oy + meteor.sin * td;

          // Smooth fade-in / fade-out envelope
          const fadeIn = Math.min(1, hd / (meteor.tailLen * 0.55));
          const fadeOut = Math.max(
            0,
            Math.min(1, (meteor.maxTravel - hd) / (meteor.tailLen * 0.9)),
          );
          const alpha = fadeIn * fadeOut;

          if (alpha > 0.005 && hd > td) {
            // Gradient trail — transparent at tail, bright at head
            const sg = ctx.createLinearGradient(tx, ty, hx, hy);
            sg.addColorStop(0, "rgba(255,255,255,0)");
            sg.addColorStop(0.55, `rgba(255,255,255,${(alpha * 0.40).toFixed(3)})`);
            sg.addColorStop(1, `rgba(255,255,255,${alpha.toFixed(3)})`);

            ctx.save();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = sg;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx, hy);
            ctx.stroke();

            // Head glow blob
            const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 5.5);
            hg.addColorStop(0, `rgba(255,255,255,${(alpha * 0.88).toFixed(3)})`);
            hg.addColorStop(1, "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.arc(hx, hy, 5.5, 0, 6.283);
            ctx.fillStyle = hg;
            ctx.fill();

            ctx.restore();
          }

          if (hd >= meteor.maxTravel || hx > W + 80 || hy > H + 50) {
            meteor = null;
          }
        }
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
