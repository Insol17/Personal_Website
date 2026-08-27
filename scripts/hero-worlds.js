/* v47 — authoritative WORLDS renderer.
   Based on the requested Yellowtail calligraphy + directional liquid displacement.
   A real DOM fallback stays visible until the canvas has actually painted. */
(() => {
  const OWNER = 'v47';
  const W = 780;
  const H = 300;
  let mounted = false;

  function mountHeroWorlds() {
    if (mounted) return;
    const h1 = document.querySelector('.hero-copy h1');
    if (!h1) return;
    mounted = true;

    const currentFirst = h1.querySelector(':scope > span:first-child');
    const line1Text = (currentFirst?.textContent || 'I DESIGN').trim() || 'I DESIGN';

    // Rebuild the two-line title once. This removes canvases left by retired engines.
    h1.replaceChildren();
    const line1 = document.createElement('span');
    line1.className = 'hero-design-line-v47';
    line1.textContent = line1Text;

    const wrap = document.createElement('span');
    wrap.className = 'hero-worlds-liquid hero-worlds-liquid-v47';
    wrap.dataset.worldsOwner = OWNER;
    wrap.innerHTML = '<span class="hero-worlds-a11y-v47">WORLDS</span><span class="hero-worlds-fallback-v47" aria-hidden="true">WORLDS</span><canvas aria-hidden="true"></canvas>';
    h1.append(line1, wrap);
    h1.setAttribute('aria-label', `${line1Text} WORLDS`);

    const canvas = wrap.querySelector('canvas');
    const fallback = wrap.querySelector('.hero-worlds-fallback-v47');
    const a11y = wrap.querySelector('.hero-worlds-a11y-v47');
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return; // DOM fallback remains visible.

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = canvas.width;
    srcCanvas.height = canvas.height;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) return;
    srcCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    let currentText = 'WORLDS';
    let sourceData = null;
    let prevX = null;
    let prevY = null;
    let raf = 0;
    let droplets = 0;

    function drawSource() {
      srcCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      srcCtx.clearRect(0, 0, W, H);
      const fontSize = 170;
      srcCtx.font = `400 ${fontSize}px 'Yellowtail', 'Brush Script MT', 'Segoe Script', cursive`;
      srcCtx.textBaseline = 'alphabetic';
      const metrics = srcCtx.measureText(currentText);
      const ascent = metrics.actualBoundingBoxAscent || 128;
      const descent = metrics.actualBoundingBoxDescent || 46;
      const x = (W - metrics.width) / 2;
      const baseline = (H + ascent - descent) / 2 + 2;

      // White calligraphy only. The material comes from light falloff, not a colour gradient.
      srcCtx.save();
      srcCtx.shadowColor = 'rgba(255,255,255,.22)';
      srcCtx.shadowBlur = 18;
      srcCtx.fillStyle = 'rgba(255,255,255,.94)';
      srcCtx.fillText(currentText, x, baseline);
      srcCtx.restore();
      srcCtx.fillStyle = '#fff';
      srcCtx.fillText(currentText, x, baseline);
      srcCtx.lineWidth = 0.75;
      srcCtx.strokeStyle = 'rgba(255,255,255,.58)';
      srcCtx.strokeText(currentText, x, baseline);

      sourceData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(srcCanvas, 0, 0, W, H);
      wrap.classList.add('is-canvas-ready');
      fallback?.setAttribute('aria-hidden', 'true');
    }

    const GRID = 7;
    const COLS = Math.ceil(W / GRID) + 1;
    const ROWS = Math.ceil(H / GRID) + 1;
    const dispX = new Float32Array(COLS * ROWS);
    const dispY = new Float32Array(COLS * ROWS);
    const PUSH_RADIUS = 26;
    const PUSH_STRENGTH = 1.8;
    const MAX_DISP = 30;
    const RELAX = 0.84;
    const EPS = 0.15;
    const index = (col, row) => row * COLS + col;

    function pushField(mx, my, vx, vy) {
      if (!vx && !vy) return;
      const minCol = Math.max(0, Math.floor((mx - PUSH_RADIUS) / GRID));
      const maxCol = Math.min(COLS - 1, Math.ceil((mx + PUSH_RADIUS) / GRID));
      const minRow = Math.max(0, Math.floor((my - PUSH_RADIUS) / GRID));
      const maxRow = Math.min(ROWS - 1, Math.ceil((my + PUSH_RADIUS) / GRID));

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cx = col * GRID;
          const cy = row * GRID;
          const ox = cx - mx;
          const oy = cy - my;
          const distance = Math.hypot(ox, oy);
          if (distance > PUSH_RADIUS) continue;
          const falloff = (1 - distance / PUSH_RADIUS) ** 2;
          const i = index(col, row);
          dispX[i] += vx * falloff * PUSH_STRENGTH;
          dispY[i] += vy * falloff * PUSH_STRENGTH;
          const magnitude = Math.hypot(dispX[i], dispY[i]);
          if (magnitude > MAX_DISP) {
            const scale = MAX_DISP / magnitude;
            dispX[i] *= scale;
            dispY[i] *= scale;
          }
        }
      }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function relaxAndBounds() {
      let minCol = COLS, maxCol = -1, minRow = ROWS, maxRow = -1;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = index(col, row);
          dispX[i] *= RELAX;
          dispY[i] *= RELAX;
          if (Math.abs(dispX[i]) < EPS) dispX[i] = 0;
          if (Math.abs(dispY[i]) < EPS) dispY[i] = 0;
          if (dispX[i] || dispY[i]) {
            minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col);
            minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
          }
        }
      }
      if (maxCol < 0) return null;
      return {
        x0: Math.max(0, (minCol - 1) * GRID),
        y0: Math.max(0, (minRow - 1) * GRID),
        x1: Math.min(W, (maxCol + 2) * GRID),
        y1: Math.min(H, (maxRow + 2) * GRID)
      };
    }

    function sampleDisp(px, py) {
      const gx = px / GRID, gy = py / GRID;
      const c0 = Math.max(0, Math.min(COLS - 2, Math.floor(gx)));
      const r0 = Math.max(0, Math.min(ROWS - 2, Math.floor(gy)));
      const c1 = c0 + 1, r1 = r0 + 1;
      const tx = Math.max(0, Math.min(1, gx - c0));
      const ty = Math.max(0, Math.min(1, gy - r0));
      const i00 = index(c0, r0), i10 = index(c1, r0), i01 = index(c0, r1), i11 = index(c1, r1);
      const dx0 = dispX[i00] * (1 - tx) + dispX[i10] * tx;
      const dx1 = dispX[i01] * (1 - tx) + dispX[i11] * tx;
      const dy0 = dispY[i00] * (1 - tx) + dispY[i10] * tx;
      const dy1 = dispY[i01] * (1 - tx) + dispY[i11] * tx;
      return [dx0 * (1 - ty) + dx1 * ty, dy0 * (1 - ty) + dy1 * ty];
    }

    function renderDistortedRegion(box) {
      if (!sourceData) return;
      const x0 = Math.floor(box.x0 * DPR), y0 = Math.floor(box.y0 * DPR);
      const x1 = Math.ceil(box.x1 * DPR), y1 = Math.ceil(box.y1 * DPR);
      const width = x1 - x0, height = y1 - y0;
      if (width <= 0 || height <= 0) return;
      const region = ctx.createImageData(width, height);
      const out = region.data;
      const src = sourceData.data;
      const bufferWidth = canvas.width, bufferHeight = canvas.height;

      for (let y = 0; y < height; y++) {
        const py = y0 + y, pyCss = py / DPR;
        for (let x = 0; x < width; x++) {
          const px = x0 + x, pxCss = px / DPR;
          const [dx, dy] = sampleDisp(pxCss, pyCss);
          const sx = Math.round(px - dx * DPR), sy = Math.round(py - dy * DPR);
          const oi = (y * width + x) * 4;
          if (sx >= 0 && sx < bufferWidth && sy >= 0 && sy < bufferHeight) {
            const si = (sy * bufferWidth + sx) * 4;
            out[oi] = src[si]; out[oi + 1] = src[si + 1]; out[oi + 2] = src[si + 2]; out[oi + 3] = src[si + 3];
          }
        }
      }
      ctx.putImageData(region, x0, y0);
    }

    function frame() {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(srcCanvas, 0, 0, W, H);
      const box = relaxAndBounds();
      if (box) {
        renderDistortedRegion(box);
        raf = requestAnimationFrame(frame);
      }
    }

    function isOverInk(cssX, cssY) {
      if (!sourceData) return false;
      const bx = Math.round(cssX * DPR), by = Math.round(cssY * DPR);
      if (bx < 0 || bx >= canvas.width || by < 0 || by >= canvas.height) return false;
      return sourceData.data[(by * canvas.width + bx) * 4 + 3] > 40;
    }

    function spawnDroplet(clientX, clientY) {
      if (droplets >= 7) return;
      droplets++;
      const dot = document.createElement('i');
      dot.className = 'hero-worlds-droplet-v47';
      dot.style.left = `${clientX}px`;
      dot.style.top = `${clientY}px`;
      const size = 4 + Math.random() * 5;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      document.body.appendChild(dot);
      const angle = Math.random() * Math.PI * 2;
      const distance = 16 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance + 38;
      const animation = dot.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: .9 },
        { transform: `translate(calc(-50% + ${tx * .5}px),calc(-50% + ${ty * .35}px)) scale(.82)`, opacity: 1, offset: .38 },
        { transform: `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.18)`, opacity: 0 }
      ], { duration: 520 + Math.random() * 180, easing: 'cubic-bezier(.22,.68,.35,1)' });
      animation.onfinish = () => { droplets--; dot.remove(); };
    }

    wrap.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const mx = (event.clientX - rect.left) * (W / rect.width);
      const my = (event.clientY - rect.top) * (H / rect.height);
      if (prevX !== null) pushField(mx, my, mx - prevX, my - prevY);
      prevX = mx; prevY = my;
      if (Math.random() < .42 && isOverInk(mx, my)) spawnDroplet(event.clientX, event.clientY);
    }, { passive: true });
    wrap.addEventListener('pointerleave', () => { prevX = prevY = null; });

    window.__heroWorldsEngine = {
      setText(value) {
        currentText = (String(value || 'WORLDS').trim() || 'WORLDS');
        a11y.textContent = currentText;
        fallback.textContent = currentText;
        h1.setAttribute('aria-label', `${line1.textContent} ${currentText}`);
        drawSource();
      },
      push: pushField,
      owner: OWNER
    };

    const start = () => {
      try { drawSource(); } catch (error) { console.warn('WORLDS canvas fallback active', error); }
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && sourceData) {
        requestAnimationFrame(() => {
          pushField(W * .45, H * .52, 7, -1);
          setTimeout(() => pushField(W * .53, H * .52, -5, 1), 70);
        });
      }
    };

    if (document.fonts?.load) {
      Promise.race([
        document.fonts.load("400 170px 'Yellowtail'"),
        new Promise(resolve => setTimeout(resolve, 1400))
      ]).then(start, start);
    } else {
      start();
    }
  }

  // Deferred runtime scripts finish before DOMContentLoaded. Mount after them and own the slot.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(mountHeroWorlds), { once: true });
  } else {
    requestAnimationFrame(mountHeroWorlds);
  }
})();
