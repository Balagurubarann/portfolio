/* ========================
   BARAN PORTFOLIO – SCRIPT.JS
   ======================== */

/* ─── THEME TOGGLE ─────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Light is default; check localStorage
const savedTheme = localStorage.getItem('baran-theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('baran-theme', next);
  // Re-init canvas colors
  if (renderer) renderFrame();
});

/* ─── MOBILE MENU ───────────────────────────────────────── */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileLinks.forEach(l => {
  l.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ─── NAVBAR SCROLL ────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── CUSTOM CURSOR ────────────────────────────────────── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '54px'; ring.style.height = '54px';
    ring.style.opacity = '.3';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '36px'; ring.style.height = '36px';
    ring.style.opacity = '.5';
  });
});

/* ─── SCROLL REVEAL ────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ─── ACTIVE NAV LINK ──────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));

/* ─── 3D HERO CANVAS ───────────────────────────────────── */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

// Resize
function resizeCanvas() {
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = container.clientWidth + 'px';
  canvas.style.height = container.clientHeight + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 3D geometry: rotating code-cube with orbiting particles
let t = 0;
let renderer = true;

// Cube vertices (unit cube centered at origin)
const cubeVerts = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1]
];
const cubeEdges = [
  [0,1],[1,2],[2,3],[3,0], // back
  [4,5],[5,6],[6,7],[7,4], // front
  [0,4],[1,5],[2,6],[3,7]  // sides
];
const cubeFaces = [
  [0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]
];

// Floating code labels
const labels = ['<React/>', 'TS', 'Node', 'SQL', 'AI', 'MCP', 'RAG', 'Flask'];

// Orbiting particles
const PARTICLE_COUNT = 60;
const particles = Array.from({length: PARTICLE_COUNT}, (_, i) => ({
  theta: Math.random() * Math.PI * 2,
  phi: Math.random() * Math.PI,
  r: 130 + Math.random() * 60,
  size: 1 + Math.random() * 2.5,
  speed: 0.002 + Math.random() * 0.008,
  opacity: 0.2 + Math.random() * 0.6
}));

// Label orbiters
const labelOrbiters = labels.map((txt, i) => ({
  txt,
  angle: (i / labels.length) * Math.PI * 2,
  r: 160 + (i % 3) * 20,
  speed: (0.003 + (i * 0.0007)) * (i % 2 === 0 ? 1 : -1),
  y: -40 + (i % 4) * 25
}));

function project(x, y, z, cx, cy, scale) {
  const fov = 600;
  const zOff = 400;
  const pz = z + zOff;
  const px = (x / pz) * fov * scale + cx;
  const py = (y / pz) * fov * scale + cy;
  return { x: px, y: py, z: pz };
}

function rotate3D(x, y, z, rx, ry) {
  // Rotate around Y
  let nx = x * Math.cos(ry) + z * Math.sin(ry);
  let ny = y;
  let nz = -x * Math.sin(ry) + z * Math.cos(ry);
  // Rotate around X
  let fx = nx;
  let fy = ny * Math.cos(rx) - nz * Math.sin(rx);
  let fz = ny * Math.sin(rx) + nz * Math.cos(rx);
  return [fx, fy, fz];
}

function renderFrame() {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  const cx = W / 2, cy = H / 2;
  const isDark = html.getAttribute('data-theme') === 'dark';

  const accentColor = isDark ? '#7C3AED' : '#C4622D';
  const accentFaint = isDark ? 'rgba(124,58,237,' : 'rgba(196,98,45,';
  const textColor = isDark ? 'rgba(240,238,248,' : 'rgba(26,24,20,';
  const gridColor = isDark ? 'rgba(124,58,237,0.08)' : 'rgba(196,98,45,0.06)';

  ctx.clearRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridSize = 36;
  for (let gx = cx % gridSize; gx < W; gx += gridSize) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = cy % gridSize; gy < H; gy += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  const rx = Math.sin(t * 0.4) * 0.3 + t * 0.25;
  const ry = t * 0.35;
  const scale = Math.min(W, H) / 560;
  const cubeSize = 72 * scale;

  // Project cube vertices
  const projected = cubeVerts.map(([x,y,z]) => {
    const [rx3, ry3, rz3] = rotate3D(x * cubeSize, y * cubeSize, z * cubeSize, rx, ry);
    return project(rx3, ry3, rz3, cx, cy, 1);
  });

  // Draw faces (sorted by depth for painter's algo)
  const facesWithDepth = cubeFaces.map(face => {
    const avgZ = face.reduce((s, vi) => s + projected[vi].z, 0) / face.length;
    return { face, avgZ };
  });
  facesWithDepth.sort((a, b) => b.avgZ - a.avgZ);

  facesWithDepth.forEach(({ face, avgZ }) => {
    const pts = face.map(vi => projected[vi]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const alpha = isDark ? 0.08 : 0.05;
    ctx.fillStyle = accentFaint + alpha + ')';
    ctx.fill();
  });

  // Draw edges
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5 * scale;
  cubeEdges.forEach(([a, b]) => {
    const pa = projected[a], pb = projected[b];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  });

  // Vertices dots
  projected.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
  });

  // Orbiting particles
  ctx.save();
  particles.forEach(p => {
    p.theta += p.speed;
    const x3 = p.r * Math.sin(p.phi) * Math.cos(p.theta) * scale;
    const y3 = p.r * Math.cos(p.phi) * scale;
    const z3 = p.r * Math.sin(p.phi) * Math.sin(p.theta) * scale;
    const [rx3, ry3, rz3] = rotate3D(x3, y3, z3, 0, 0);
    const proj = project(rx3, ry3, rz3, cx, cy, 1);
    const depthAlpha = Math.max(0.05, 1 - (proj.z - 300) / 600);
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, p.size * scale * depthAlpha, 0, Math.PI * 2);
    ctx.fillStyle = accentFaint + (p.opacity * depthAlpha) + ')';
    ctx.fill();
  });
  ctx.restore();

  // Label orbiters
  ctx.font = `bold ${Math.max(9, 11 * scale)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  labelOrbiters.forEach(lo => {
    lo.angle += lo.speed;
    const ox = Math.cos(lo.angle) * lo.r * scale;
    const oy = lo.y * scale + Math.sin(lo.angle * 0.6) * 12 * scale;
    const x = cx + ox;
    const y = cy + oy;
    const dist = Math.sqrt(ox * ox + oy * oy);
    const alpha = Math.max(0.3, Math.min(0.9, 1 - (dist / (210 * scale))));

    // Pill background
    const tw = ctx.measureText(lo.txt).width;
    const ph = 18 * scale, pw = tw + 16 * scale;
    ctx.fillStyle = accentFaint + (alpha * 0.15) + ')';
    ctx.beginPath();
    ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, 5 * scale);
    ctx.fill();
    ctx.strokeStyle = accentFaint + (alpha * 0.5) + ')';
    ctx.lineWidth = 0.8 * scale;
    ctx.stroke();

    ctx.fillStyle = textColor + alpha + ')';
    ctx.fillText(lo.txt, x, y);
  });

  // Center glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 * scale);
  grd.addColorStop(0, accentFaint + '0.12)');
  grd.addColorStop(1, accentFaint + '0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, 90 * scale, 0, Math.PI * 2);
  ctx.fill();

  t += 0.008;
  requestAnimationFrame(renderFrame);
}
renderFrame();

/* ─── SKILL CARD HOVER SOUND RIPPLE ────────────────────── */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mouseenter', function(e) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      width:40px; height:40px;
      top:50%; left:50%;
      transform:translate(-50%,-50%) scale(0);
      background:var(--accent-light);
      animation:rippleOut .5s ease-out forwards;
      pointer-events:none; z-index:0;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// Inject ripple keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleOut {
    to { transform: translate(-50%,-50%) scale(4); opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ─── TYPEWRITER HERO SUBTITLE ──────────────────────────── */
const phrases = [
  'Full Stack MERN Developer',
  'AI Engineering Enthusiast',
  'MCP & RAG Explorer',
  'Immediate Joiner ⚡'
];
const eyebrow = document.querySelector('.hero-eyebrow');
if (eyebrow) {
  let pi = 0, ci = 0, deleting = false;
  function typeLoop() {
    const phrase = phrases[pi];
    if (!deleting) {
      eyebrow.textContent = phrase.substring(0, ci + 1);
      ci++;
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
    } else {
      eyebrow.textContent = phrase.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 40 : 65);
  }
  setTimeout(typeLoop, 1200);
}

/* ─── SMOOTH ANCHOR SCROLL ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── CONTACT CIRCLE ANIMATED SVG TAGS ─────────────────── */
const contactSvgTags = document.querySelectorAll('.contact-svg circle + text');
let contactAngle = 0;
