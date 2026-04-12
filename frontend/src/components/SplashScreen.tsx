import { useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const STROKE_MULTIPLIER = 4.2;
const BEAD_LEN = 42;

const WELCOME_TEXT = "Welcome to my";
const COSMOS_TEXT  = "COSMOS";

// Per-character stagger delays for "Welcome to my" (ms from cascade start).
// Word-boundary pauses create a reading rhythm: Welcome ··· to ··· my
function buildWelcomeDelays(): number[] {
  const d: number[] = [];
  let t = 0;
  for (let i = 0; i < WELCOME_TEXT.length; i++) {
    if (i === 7 || i === 10) t += 120;  // pause at word boundary
    d.push(t);
    t += 55;
  }
  return d;
}
const WELCOME_DELAYS = buildWelcomeDelays();

// Per-letter ignition delays for COSMOS (ms from bead start).
// Accelerating pacing: first letter hangs, last letters snap.
const COSMOS_IGNITION = [150, 530, 880, 1200, 1500, 1780];

const T = {
  prelude:        0,
  welcomeCascade: 1400,
  dividerExtend:  2500,
  cosmosBeadStart:3200,
  // ── energy sequence ──
  particleStart:  6200,
  ballForm:       7400,
  textDim:        7800,
  ballCharge:     8600,
  shakeStart:     9400,
  shakeIntense:   10200,
  explosion:      11000,
  complete:       12200,
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; size: number;
  life: number; maxLife: number;
  absorbed: boolean;
}

interface Props { onComplete: () => void }

// ── Component ────────────────────────────────────────────────────────────────

export function SplashScreen({ onComplete }: Props) {
  const overlayRef      = useRef<HTMLDivElement>(null);
  const tintRef         = useRef<HTMLDivElement>(null);
  const titleGroupRef   = useRef<SVGGElement>(null);
  const welcomeCharRefs = useRef<(SVGTSpanElement | null)[]>([]);
  const dividerRef      = useRef<SVGLineElement>(null);
  const trailRef        = useRef<SVGTextElement>(null);
  const beadRef         = useRef<SVGTextElement>(null);
  const cosmosCharRefs  = useRef<(SVGTSpanElement | null)[]>([]);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const blastRef        = useRef<HTMLDivElement>(null);

  const rafs   = useRef<Set<number>>(new Set());
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const doneRef = useRef(false);

  const raf = useCallback((fn: FrameRequestCallback): number => {
    const id = requestAnimationFrame(fn);
    rafs.current.add(id);
    return id;
  }, []);

  const tick = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    const activeRafs = rafs.current;
    const activeTimers = timers.current;

    return () => {
      activeRafs.forEach(cancelAnimationFrame);
      activeTimers.forEach(clearTimeout);
    };
  }, []);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  // ── Main orchestration ─────────────────────────────────────────────────────

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setTimeout(complete, 200); return; }

    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function animVal(
      from: number, to: number, dur: number,
      setter: (v: number) => void,
      onDone?: () => void, useEase = false,
    ) {
      const s = performance.now();
      const step = (now: number) => {
        const raw = Math.min(1, (now - s) / dur);
        setter(from + (to - from) * (useEase ? ease(raw) : raw));
        if (raw < 1) raf(step); else onDone?.();
      };
      raf(step);
    }

    // ── Init: everything invisible ──────────────────────────────────────────

    welcomeCharRefs.current.forEach(el => {
      if (el) el.style.opacity = "0";
    });
    cosmosCharRefs.current.forEach(el => {
      if (el) el.style.opacity = "0";
    });
    if (trailRef.current)  trailRef.current.style.opacity = "0";
    if (beadRef.current)   beadRef.current.style.opacity  = "0";
    if (blastRef.current)  blastRef.current.style.opacity  = "0";
    if (dividerRef.current) dividerRef.current.style.opacity = "0";
    if (titleGroupRef.current) {
      titleGroupRef.current.style.opacity   = "0";
      titleGroupRef.current.style.transform = "translateY(10px)";
    }

    // ── Run after fonts load ────────────────────────────────────────────────

    const run = () => {
      const totalLen = (trailRef.current?.getComputedTextLength() ?? 820) * STROKE_MULTIPLIER;

      if (trailRef.current) {
        trailRef.current.style.strokeDasharray  = `${totalLen} ${totalLen}`;
        trailRef.current.style.strokeDashoffset = String(totalLen);
      }
      if (beadRef.current) {
        beadRef.current.style.strokeDashoffset = "0";
      }

      startSequence(totalLen);
    };

    let started = false;
    const start = () => { if (started) return; started = true; run(); };
    if (document.fonts?.ready) document.fonts.ready.then(start);
    tick(start, 650);

    // ═════════════════════════════════════════════════════════════════════════
    //  SEQUENCE
    // ═════════════════════════════════════════════════════════════════════════

    const startSequence = (totalLen: number) => {

      // ── PHASE 1: Cosmic prelude — dark tint lifts to reveal stars ─────────
      animVal(1, 0.78, 1400, v => {
        if (tintRef.current) tintRef.current.style.opacity = String(v);
      });

      // ── PHASE 2: Title group rises ────────────────────────────────────────
      tick(() => {
        animVal(0, 1, 1000, v => {
          if (titleGroupRef.current) {
            titleGroupRef.current.style.opacity   = String(v);
            titleGroupRef.current.style.transform = `translateY(${(10 * (1 - v)).toFixed(1)}px)`;
          }
        }, undefined, true);
      }, T.welcomeCascade);

      // ── PHASE 2a: "Welcome to my" character cascade ──────────────────────
      //    Each character materializes with word-paced rhythm.
      //    Fill: soft silver-teal (not white), ethereal and anticipatory.
      tick(() => {
        WELCOME_DELAYS.forEach((delay, i) => {
          tick(() => {
            const el = welcomeCharRefs.current[i];
            if (!el) return;
            animVal(0, 0.55, 280, v => {
              el.style.opacity = String(v);
            }, undefined, true);
          }, delay);
        });
      }, T.welcomeCascade);

      // ── PHASE 2b: Decorative teal divider extends from center ─────────────
      tick(() => {
        if (dividerRef.current) dividerRef.current.style.opacity = "1";
        animVal(0, 170, 700, v => {
          if (dividerRef.current) {
            dividerRef.current.setAttribute("x1", String(500 - v));
            dividerRef.current.setAttribute("x2", String(500 + v));
          }
        }, undefined, true);
      }, T.dividerExtend);

      // ── PHASE 3: COSMOS bead traces — the hero moment ────────────────────
      //    The bead CREATES each letter. Ghost is nearly invisible (0.03).
      //    Trail write-on draws teal outlines. As the bead passes each letter,
      //    that letter's fill ignites from nothing to luminous teal-white.
      tick(() => {
        if (trailRef.current) trailRef.current.style.opacity = "1";
        if (beadRef.current)  beadRef.current.style.opacity  = "1";

        const dur = 2400;

        // Trail write-on
        animVal(totalLen, 0, dur, v => {
          if (trailRef.current) trailRef.current.style.strokeDashoffset = String(v);
        });

        // Bead travels
        animVal(0, -totalLen, dur, v => {
          if (beadRef.current) beadRef.current.style.strokeDashoffset = String(v);
        }, () => {
          // Bead done: fade it out gracefully
          animVal(1, 0, 500, v => {
            if (beadRef.current) beadRef.current.style.opacity = String(v);
          });
        });

        // Per-letter ignition: each letter's fill blooms as the bead reaches it
        COSMOS_IGNITION.forEach((delay, i) => {
          tick(() => {
            const el = cosmosCharRefs.current[i];
            if (!el) return;
            // Quick bloom with overshoot: 0 → 0.92 with ease
            animVal(0, 0.92, 380, v => {
              el.style.opacity = String(v);
            }, undefined, true);
          }, delay);
        });
      }, T.cosmosBeadStart);

      // ── PHASE 4+: Energy convergence → ball → shake → explosion ───────────
      tick(startEnergySequence, T.particleStart);

      // ── Text dimming: energy drains from letters into the ball ─────────────
      tick(() => {
        // Welcome text dims almost fully
        welcomeCharRefs.current.forEach(el => {
          if (el) animVal(0.55, 0.08, 2200, v => { el.style.opacity = String(v); });
        });
        // COSMOS dims but retains some presence
        cosmosCharRefs.current.forEach(el => {
          if (el) {
            const cur = parseFloat(el.style.opacity) || 0.92;
            animVal(cur, 0.18, 2200, v => { el.style.opacity = String(v); });
          }
        });
        // Trail glow dims
        if (trailRef.current) {
          animVal(1, 0.15, 2000, v => { trailRef.current!.style.opacity = String(v); });
        }
        // Divider fades
        if (dividerRef.current) {
          animVal(1, 0, 1500, v => { dividerRef.current!.style.opacity = String(v); });
        }
      }, T.textDim);

      tick(complete, T.complete);
    };

    // ═════════════════════════════════════════════════════════════════════════
    //  ENERGY CONVERGENCE + BALL + SHAKE + EXPLOSION
    // ═════════════════════════════════════════════════════════════════════════

    const particles: Particle[] = [];
    let energyRaf = 0;
    let energyActive = false;
    let shakeActive = false;
    let explosionTriggered = false;
    let shakeProgress = 0;
    let emitted = 0;
    let ringRadius = 0, ringAlpha = 0, ringActive = false;
    let ballRadius = 0, ballAlpha = 0, ballPulsePhase = 0;

    function startEnergySequence() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);

      energyActive = true;
      emitted = 0;
      particles.length = 0;
      explosionTriggered = false;
      shakeActive = false;
      ringActive = false;
      ballRadius = 0;
      ballAlpha = 0;
      ballPulsePhase = 0;

      // Focal point: BELOW the text, not behind it
      const fx = W * 0.5;
      const fy = H * 0.65;

      const startMs = performance.now();
      const ballFormDelay  = T.ballForm - T.particleStart;
      const shakeDelay     = T.shakeStart - T.particleStart;
      const shakeIntDelay  = T.shakeIntense - T.particleStart;
      const explosionDelay = T.explosion - T.particleStart;

      tick(() => { shakeActive = true; shakeProgress = 0; }, shakeDelay);
      tick(() => { shakeProgress = 0.5; }, shakeIntDelay);

      tick(() => {
        explosionTriggered = true;
        ringActive = true;
        ringRadius = 0;
        ringAlpha = 1;
        shakeActive = false;

        animVal(0, 1, 500, v => {
          if (blastRef.current) blastRef.current.style.opacity = String(v);
        });
        if (overlayRef.current) overlayRef.current.style.transform = "";
      }, explosionDelay);

      const etick = () => {
        if (!energyActive) return;
        ctx.clearRect(0, 0, W, H);

        const elapsed = performance.now() - startMs;
        const inBallPhase = elapsed > ballFormDelay;

        // ── Emit particles ─────────────────────────────────────────────
        if (emitted < 160 && !explosionTriggered) {
          const rate = emitted < 50 ? 4 : (emitted < 100 ? 2 : 1);
          for (let i = 0; i < rate; i++) {
            const angle  = Math.random() * Math.PI * 2;
            const radius = 200 + Math.random() * 320;
            particles.push({
              x: fx + Math.cos(angle) * radius,
              y: fy + Math.sin(angle) * radius,
              vx: 0, vy: 0,
              alpha: 0, size: 0.6 + Math.random() * 2.8,
              life: 0, maxLife: 1200 + Math.random() * 1400,
              absorbed: false,
            });
            emitted++;
          }
        }

        // ── Update & draw particles ────────────────────────────────────
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += 16;
          if (p.absorbed || p.life > p.maxLife) { particles.splice(i, 1); continue; }

          const dx = fx - p.x;
          const dy = fy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const pullMul = inBallPhase ? 0.35 : 0.18;
          const t = p.life / p.maxLife;
          const spd = 0.06 + t * t * pullMul;

          p.vx += (dx / dist) * spd;
          p.vy += (dy / dist) * spd;
          p.vx *= 0.90;
          p.vy *= 0.90;
          p.x += p.vx;
          p.y += p.vy;

          const distNow = Math.sqrt((fx - p.x) ** 2 + (fy - p.y) ** 2);
          if (distNow < (inBallPhase ? 18 : 8)) { p.absorbed = true; continue; }

          const nearness = Math.max(0, 1 - distNow / 60);
          p.alpha = Math.max(0, Math.min(1, t / 0.25) * 0.8 * (1 - nearness * 0.5));
          if (p.alpha < 0.008) continue;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(111,251,190,${p.alpha.toFixed(3)})`;
          ctx.fill();

          if (p.size > 1.2) {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) + 0.001;
            const tailLen = Math.min(14, speed * 4);
            const tx = p.x - (p.vx / speed) * tailLen;
            const ty = p.y - (p.vy / speed) * tailLen;
            const g = ctx.createLinearGradient(p.x, p.y, tx, ty);
            g.addColorStop(0, `rgba(111,251,190,${(p.alpha * 0.65).toFixed(3)})`);
            g.addColorStop(1, "rgba(111,251,190,0)");
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = g;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
          }
        }

        // ── Energy ball ────────────────────────────────────────────────
        if (inBallPhase && !explosionTriggered) {
          const ballTime = (elapsed - ballFormDelay) / 1000;
          const chargeTime = Math.max(0, elapsed - (T.ballCharge - T.particleStart)) / 1000;

          const targetR = 8 + ballTime * 4.5 + chargeTime * 8;
          ballRadius += (targetR - ballRadius) * 0.08;
          ballAlpha = Math.min(1, ballTime * 0.6 + chargeTime * 0.3);
          ballPulsePhase += 0.12;

          const pulse = 1 + Math.sin(ballPulsePhase) * 0.12 * Math.min(1, chargeTime * 2);
          const r = ballRadius * pulse;

          const og = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 4);
          og.addColorStop(0,   `rgba(111,251,190,${(ballAlpha * 0.25).toFixed(3)})`);
          og.addColorStop(0.3, `rgba(111,251,190,${(ballAlpha * 0.10).toFixed(3)})`);
          og.addColorStop(1,   "rgba(111,251,190,0)");
          ctx.beginPath();
          ctx.arc(fx, fy, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = og;
          ctx.fill();

          const mg = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 2);
          mg.addColorStop(0,   `rgba(200,255,230,${(ballAlpha * 0.55).toFixed(3)})`);
          mg.addColorStop(0.5, `rgba(111,251,190,${(ballAlpha * 0.25).toFixed(3)})`);
          mg.addColorStop(1,   "rgba(111,251,190,0)");
          ctx.beginPath();
          ctx.arc(fx, fy, r * 2, 0, Math.PI * 2);
          ctx.fillStyle = mg;
          ctx.fill();

          const cg = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
          cg.addColorStop(0,   `rgba(255,255,255,${(ballAlpha * 0.95).toFixed(3)})`);
          cg.addColorStop(0.5, `rgba(220,255,240,${(ballAlpha * 0.7).toFixed(3)})`);
          cg.addColorStop(1,   `rgba(111,251,190,${(ballAlpha * 0.15).toFixed(3)})`);
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, Math.PI * 2);
          ctx.fillStyle = cg;
          ctx.fill();

          if (chargeTime > 0) {
            const spikeCount = 6;
            const spikeAlpha = Math.min(0.4, chargeTime * 0.15);
            for (let s = 0; s < spikeCount; s++) {
              const sAngle = (Math.PI * 2 / spikeCount) * s + ballPulsePhase * 0.3;
              const sLen = r * 2 + Math.sin(ballPulsePhase + s * 1.3) * r;
              const sx = fx + Math.cos(sAngle) * sLen;
              const sy = fy + Math.sin(sAngle) * sLen;
              const sg = ctx.createLinearGradient(fx, fy, sx, sy);
              sg.addColorStop(0, `rgba(111,251,190,${spikeAlpha.toFixed(3)})`);
              sg.addColorStop(1, "rgba(111,251,190,0)");
              ctx.beginPath();
              ctx.moveTo(fx, fy);
              ctx.lineTo(sx, sy);
              ctx.strokeStyle = sg;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }

        // ── Explosion shockwave ring ───────────────────────────────────
        if (ringActive) {
          ringRadius += 18;
          ringAlpha = Math.max(0, ringAlpha - 0.015);
          if (ringAlpha > 0.01) {
            ctx.beginPath();
            ctx.arc(fx, fy, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,${ringAlpha.toFixed(3)})`;
            ctx.lineWidth = 8 + ringRadius * 0.04;
            ctx.stroke();

            const ig = ctx.createRadialGradient(fx, fy, Math.max(0, ringRadius - 30), fx, fy, ringRadius + 20);
            ig.addColorStop(0, "rgba(111,251,190,0)");
            ig.addColorStop(0.5, `rgba(111,251,190,${(ringAlpha * 0.15).toFixed(3)})`);
            ig.addColorStop(1, "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.arc(fx, fy, ringRadius + 20, 0, Math.PI * 2);
            ctx.fillStyle = ig;
            ctx.fill();
          } else {
            ringActive = false;
          }
        }

        // ── Screen shake ───────────────────────────────────────────────
        if (shakeActive && overlayRef.current) {
          shakeProgress = Math.min(1, shakeProgress + 0.008);
          const amp = 2 + shakeProgress * 12;
          const sx = (Math.random() - 0.5) * amp;
          const sy = (Math.random() - 0.5) * amp;
          overlayRef.current.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
        }

        if (energyActive) {
          energyRaf = requestAnimationFrame(etick);
          rafs.current.add(energyRaf);
        }
      };

      energyRaf = requestAnimationFrame(etick);
      rafs.current.add(energyRaf);
    }

    return () => {
      energyActive = false;
      cancelAnimationFrame(energyRaf);
    };
  }, [raf, tick, complete]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={overlayRef} className="splash-overlay" aria-hidden="true">
      <div ref={tintRef} className="splash-tint" />
      <canvas ref={canvasRef} className="splash-particles-canvas" />

      <svg
        viewBox="0 0 1000 360"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        className="splash-title-svg"
        role="img"
        aria-label="Welcome to my Cosmos"
      >
        <defs>
          <filter id="sp-trail-glow" x="-15%" y="-50%" width="130%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="sp-bead" x="-25%" y="-60%" width="150%" height="220%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="sp-fill-glow" x="-8%" y="-30%" width="116%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="sp-welcome-glow" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g ref={titleGroupRef} style={{ willChange: "transform, opacity" }}>

          {/* ── "Welcome to my" — per-character cascade, no bead ─────── */}
          <text
            className="splash-text-base splash-text-1"
            x="500" y="100"
            textAnchor="middle"
            fontSize={48}
            letterSpacing={6}
            xmlSpace="preserve"
            filter="url(#sp-welcome-glow)"
            style={{ fill: "rgb(200, 230, 220)" }}
          >
            {WELCOME_TEXT.split("").map((ch, i) => (
              <tspan
                key={i}
                ref={el => { welcomeCharRefs.current[i] = el; }}
                style={{ opacity: 0 }}
              >
                {ch}
              </tspan>
            ))}
          </text>

          {/* ── Decorative divider between lines ─────────────────────── */}
          <line
            ref={dividerRef}
            x1="500" y1="142" x2="500" y2="142"
            stroke="rgba(111,251,190,0.22)"
            strokeWidth="0.5"
            style={{ opacity: 0 }}
          />

          {/* ── "COSMOS" ghost fill — near-invisible, just a hint ───── */}
          <text
            className="splash-text-base splash-text-2"
            x="500" y="310"
            textAnchor="middle"
            fontSize={180}
            letterSpacing={22}
            style={{ fill: "rgba(255,255,255,0.025)", stroke: "none" }}
          >
            COSMOS
          </text>

          {/* ── COSMOS trail stroke (write-on, teal outlines) ────────  */}
          <text
            ref={trailRef}
            className="splash-text-base splash-text-2"
            x="500" y="310"
            textAnchor="middle"
            fontSize={180}
            letterSpacing={22}
            filter="url(#sp-trail-glow)"
            style={{
              fill: "none",
              stroke: "rgba(111,251,190,0.88)",
              strokeWidth: 2,
            }}
          >
            COSMOS
          </text>

          {/* ── COSMOS moving bead ────────────────────────────────────  */}
          <text
            ref={beadRef}
            className="splash-text-base splash-text-2"
            x="500" y="310"
            textAnchor="middle"
            fontSize={180}
            letterSpacing={22}
            filter="url(#sp-bead)"
            style={{
              fill: "none",
              stroke: "rgba(255,255,255,1)",
              strokeWidth: 4,
              strokeDasharray: `${BEAD_LEN} 99999`,
            }}
          >
            COSMOS
          </text>

          {/* ── COSMOS per-letter fill (ignited by the bead) ─────────
               Teal-tinted white — luminous, never flat.
               Each <tspan> blooms independently as the bead passes. */}
          <text
            className="splash-text-base splash-text-2"
            x="500" y="310"
            textAnchor="middle"
            fontSize={180}
            letterSpacing={22}
            filter="url(#sp-fill-glow)"
            style={{ fill: "rgb(235, 255, 248)" }}
          >
            {COSMOS_TEXT.split("").map((ch, i) => (
              <tspan
                key={i}
                ref={el => { cosmosCharRefs.current[i] = el; }}
                style={{ opacity: 0 }}
              >
                {ch}
              </tspan>
            ))}
          </text>

        </g>
      </svg>

      <div ref={blastRef} className="splash-blast-overlay" />

      <button
        type="button"
        className="splash-skip-btn"
        onClick={complete}
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
}
