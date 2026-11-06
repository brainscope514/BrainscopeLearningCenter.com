// Hero neural-network canvas: drifting nodes linked by glowing lines, attracted to the pointer,
// with a share of nodes converging into the logo's "brain" region. Vanilla canvas, no dependencies.

export interface NeuralCanvasOptions {
  /** Element whose centre marks the brain region nodes converge toward. */
  anchor?: Element | null;
  /** Element that receives pointer events (usually the hero section). */
  pointerTarget?: HTMLElement;
  /** Render a single static frame (no drifting nodes). */
  staticFrame?: boolean;
  /**
   * With staticFrame: every few seconds a small point of light travels along the existing network lines into
   * the brain region ("knowledge flowing into a mind"). Off for prefers-reduced-motion; paused off-screen.
   */
  pulses?: boolean;
}

interface Pulse {
  /** Polyline of node positions, ending inside the brain. */
  pts: { x: number; y: number }[];
  /** Cumulative length at each point. */
  acc: number[];
  len: number;
  start: number;
  duration: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  /** Home position inside the brain region; null for free-drifting nodes. */
  hx: number | null;
  hy: number | null;
}

const COLORS = ['#A166FF', '#A166FF', '#8A5CFF', '#6A2CFF', '#00B8FF'];
const LINE_RGB = '161, 102, 255';
const BRAIN_LINE_RGB = '0, 184, 255';
const BRAIN_SHARE = 0.32;
const POINTER_RADIUS = 170;

export function createNeuralCanvas(canvas: HTMLCanvasElement, options: NeuralCanvasOptions = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { destroy: () => {} };
  const { anchor = null, pointerTarget = canvas.parentElement ?? canvas, staticFrame = false, pulses: withPulses = false } = options;

  let width = 0;
  let height = 0;
  let linkDist = 120;
  let nodes: Node[] = [];
  let brain = { x: 0, y: 0, rx: 0, ry: 0 };
  const pointer = { x: 0, y: 0, active: false };
  let rafId = 0;
  let last = 0;
  let inView = true;
  let pageVisible = !document.hidden;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  /** Particle cap per CLAUDE.md: ≤ 60 on mobile, ≤ 140 on desktop, scaled by area. */
  const nodeCount = () => {
    const mobile = width < 768;
    const byArea = Math.round((width * height) / (mobile ? 6500 : 9500));
    return Math.max(24, Math.min(mobile ? 60 : 140, byArea));
  };

  const measureBrain = () => {
    const c = canvas.getBoundingClientRect();
    const a = anchor?.getBoundingClientRect();
    if (a && a.width > 0) {
      brain = { x: a.left - c.left + a.width / 2, y: a.top - c.top + a.height / 2, rx: a.width / 2, ry: a.height / 2 };
    } else {
      const rtl = document.documentElement.dir === 'rtl';
      brain = { x: width * (rtl ? 0.28 : 0.72), y: height * 0.42, rx: width * 0.1, ry: height * 0.14 };
    }
  };

  const homeInBrain = () => {
    const t = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random());
    return { hx: brain.x + Math.cos(t) * brain.rx * d, hy: brain.y + Math.sin(t) * brain.ry * d };
  };

  const build = () => {
    const count = nodeCount();
    nodes = Array.from({ length: count }, (_, i) => {
      const inBrain = i < count * BRAIN_SHARE;
      const home = inBrain ? homeInBrain() : { hx: null, hy: null };
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.15, 0.15),
        r: inBrain ? rand(1.4, 2.6) : rand(1, 2.1),
        color: COLORS[i % COLORS.length]!,
        ...home,
      };
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    // DPR capped at 2 (1.5 on phones: ~44% fewer pixels to fill on mid-range Android).
    const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 768 ? 1.5 : 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    linkDist = width < 768 ? 95 : 125;
    measureBrain();
    build();
  };

  const step = (dt: number) => {
    const pr2 = POINTER_RADIUS * POINTER_RADIUS;
    for (const n of nodes) {
      if (n.hx !== null && n.hy !== null) {
        // Spring toward home inside the brain, plus a little wobble so it stays alive.
        n.vx += (n.hx - n.x) * 0.0016 * dt + rand(-0.012, 0.012);
        n.vy += (n.hy - n.y) * 0.0016 * dt + rand(-0.012, 0.012);
      }
      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < pr2 && d2 > 1) {
          const f = (1 - d2 / pr2) * 0.035 * dt;
          const d = Math.sqrt(d2);
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }
      n.vx *= 0.975;
      n.vy *= 0.975;
      // Keep free nodes from stalling.
      if (n.hx === null && Math.abs(n.vx) + Math.abs(n.vy) < 0.08) {
        n.vx += rand(-0.03, 0.03);
        n.vy += rand(-0.03, 0.03);
      }
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -20) n.x = width + 20;
      else if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      else if (n.y > height + 20) n.y = -20;
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const ld2 = linkDist * linkDist;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > ld2) continue;
        const alpha = (1 - d2 / ld2) * 0.55;
        const brainLink = a.hx !== null && b.hx !== null;
        ctx.strokeStyle = `rgba(${brainLink ? BRAIN_LINE_RGB : LINE_RGB}, ${brainLink ? alpha * 0.8 : alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      // Soft halo: a larger, faint disc (cheaper than shadowBlur).
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const frame = (now: number) => {
    // Phones run at ~30 fps: half the main-thread work, still smooth for slow drifting nodes.
    if (width < 768 && now - last < 30) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min((now - last) / 16.67, 3); // normalised to 60 fps, clamped after stalls
    last = now;
    step(dt);
    draw();
    rafId = requestAnimationFrame(frame);
  };

  const shouldRun = () => !staticFrame && inView && pageVisible;
  const start = () => {
    if (rafId || !shouldRun()) return;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const renderStatic = () => {
    for (let i = 0; i < 160; i++) step(1); // settle nodes into the brain before the single frame
    draw();
  };

  // ---- Signal pulses (static mode) ------------------------------------------------------------------------
  const PULSE_RGB = '0, 184, 255';
  const backdrop = document.createElement('canvas'); // snapshot of the settled network, redrawn under pulses
  let pulses: Pulse[] = [];
  let arrivals: { x: number; y: number; t: number }[] = [];
  let nextSpawn = 0;
  let pulseRaf = 0;

  const snapshot = () => {
    backdrop.width = canvas.width;
    backdrop.height = canvas.height;
    backdrop.getContext('2d')?.drawImage(canvas, 0, 0);
  };

  /** Walk from an outer node along visible links, always moving closer to the brain, until it gets there. */
  const buildPath = (): Pulse | null => {
    const ld2 = linkDist * linkDist;
    const dist = (n: Node) => Math.hypot(n.x - brain.x, n.y - brain.y);
    const starts = nodes.filter((n) => n.hx === null && dist(n) > Math.max(brain.rx, brain.ry) * 1.6 && n.x > 0 && n.x < width && n.y > 0 && n.y < height);
    for (let attempt = 0; attempt < 12 && starts.length; attempt++) {
      let cur = starts[Math.floor(Math.random() * starts.length)]!;
      const path: Node[] = [cur];
      while (path.length < 14) {
        let best: Node | null = null;
        let bestD = dist(cur) - 6; // must make progress toward the brain
        for (const n of nodes) {
          if (n === cur) continue;
          const dx = n.x - cur.x;
          const dy = n.y - cur.y;
          if (dx * dx + dy * dy > ld2) continue;
          const d = dist(n);
          if (d < bestD) {
            bestD = d;
            best = n;
          }
        }
        if (!best) break;
        path.push(best);
        cur = best;
        if (best.hx !== null && dist(best) < Math.max(brain.rx, brain.ry) * 0.85) break;
      }
      const end = path[path.length - 1]!;
      if (path.length >= 4 && end.hx !== null) {
        const pts = path.map((n) => ({ x: n.x, y: n.y }));
        const acc = [0];
        for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
        const len = acc[acc.length - 1]!;
        return { pts, acc, len, start: 0, duration: Math.min(4200, Math.max(2200, len * 7)) };
      }
    }
    return null;
  };

  const pointAt = (p: Pulse, dist: number) => {
    const d = Math.max(0, Math.min(p.len, dist));
    let i = 1;
    while (i < p.acc.length - 1 && p.acc[i]! < d) i++;
    const a = p.pts[i - 1]!;
    const b = p.pts[i]!;
    const seg = p.acc[i]! - p.acc[i - 1]! || 1;
    const t = (d - p.acc[i - 1]!) / seg;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };

  const drawPulses = (now: number) => {
    const dpr = canvas.width / (width || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backdrop, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of pulses) {
      const k = (now - p.start) / p.duration;
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease-in-out
      const head = eased * p.len;
      // Fading trail: samples behind the head.
      for (let s = 0; s <= 10; s++) {
        const pt = pointAt(p, head - s * 5);
        ctx.fillStyle = `rgba(${PULSE_RGB}, ${0.75 * (1 - s / 10)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2 * (1 - s / 14), 0, Math.PI * 2);
        ctx.fill();
      }
      const h = pointAt(p, head);
      ctx.fillStyle = `rgba(${PULSE_RGB}, 0.18)`;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    // Arrival: a soft ring opens where the signal reaches the brain.
    for (const a of arrivals) {
      const k = (now - a.t) / 900;
      ctx.strokeStyle = `rgba(${PULSE_RGB}, ${0.6 * (1 - k)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4 + k * 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const pulseFrame = (now: number) => {
    if (now >= nextSpawn && pulses.length < 2) {
      const p = buildPath();
      if (p) {
        p.start = now;
        pulses.push(p);
      }
      nextSpawn = now + 2600 + Math.random() * 1800;
    }
    for (const p of pulses) {
      if (now - p.start >= p.duration) {
        const end = p.pts[p.pts.length - 1]!;
        arrivals.push({ x: end.x, y: end.y, t: now });
        canvas.dispatchEvent(new CustomEvent('signal-arrive')); // lets the hero light up the brain
      }
    }
    pulses = pulses.filter((p) => now - p.start < p.duration);
    arrivals = arrivals.filter((a) => now - a.t < 900);
    drawPulses(now);
    pulseRaf = requestAnimationFrame(pulseFrame);
  };
  const pulsesShouldRun = () => staticFrame && withPulses && inView && pageVisible;
  const startPulses = () => {
    if (pulseRaf || !pulsesShouldRun()) return;
    nextSpawn = performance.now() + 900;
    pulseRaf = requestAnimationFrame(pulseFrame);
  };
  const stopPulses = () => {
    cancelAnimationFrame(pulseRaf);
    pulseRaf = 0;
    pulses = [];
    arrivals = [];
  };

  // Pointer / touch attraction (coordinates relative to the canvas).
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  };
  const onPointerLeave = () => (pointer.active = false);

  const io = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting;
    if (shouldRun()) start();
    else stop();
    if (pulsesShouldRun()) startPulses();
    else stopPulses();
  });
  const onVisibility = () => {
    pageVisible = !document.hidden;
    if (shouldRun()) start();
    else stop();
    if (pulsesShouldRun()) startPulses();
    else stopPulses();
  };
  let resizeTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      stopPulses();
      resize();
      if (staticFrame) {
        renderStatic();
        snapshot();
        startPulses();
      }
    }, 150);
  });

  resize();
  if (staticFrame) {
    renderStatic();
    if (withPulses) {
      snapshot();
      document.addEventListener('visibilitychange', onVisibility);
      io.observe(canvas);
    }
  } else {
    pointerTarget.addEventListener('pointermove', onPointerMove, { passive: true });
    pointerTarget.addEventListener('pointerleave', onPointerLeave);
    pointerTarget.addEventListener('pointercancel', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    io.observe(canvas);
    start();
  }
  ro.observe(canvas);

  return {
    destroy() {
      stop();
      stopPulses();
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(resizeTimer);
      pointerTarget.removeEventListener('pointermove', onPointerMove);
      pointerTarget.removeEventListener('pointerleave', onPointerLeave);
      pointerTarget.removeEventListener('pointercancel', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
