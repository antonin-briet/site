/**
 * gantt.js — Diagramme de Gantt SVG pleine largeur
 * renderGantt('container-id', 'project-id')
 */

const GANTT_DATA = [
  { id: 'v2si',        num:'01', label: 'V2SI — Alternance & Stages',   start:[2024,9],  end:[2026,7],  color:'#22c55e' },
  { id: 'vlan',        num:'02', label: 'VLAN & Routage inter-VLAN',    start:[2024,10], end:[2024,10], color:'#3b82f6' },
  { id: 'windows',     num:'03', label: 'Windows Server / AD',          start:[2024,11], end:[2025,1],  color:'#8b5cf6' },
  { id: 'apache',      num:'04', label: 'Serveur Web Apache',           start:[2025,2],  end:[2025,2],  color:'#06b6d4' },
  { id: 'pfsense',     num:'05', label: 'Pare-feu pfSense',             start:[2025,4],  end:[2025,4],  color:'#f59e0b' },
  { id: 'vaultwarden', num:'06', label: 'Vaultwarden',                  start:[2026,3],  end:[2026,4],  color:'#ec4899' },
  { id: 'adguard',     num:'07', label: 'AdGuard Home',                 start:[2026,3],  end:[2026,4],  color:'#10b981' },
  { id: 'caddy',       num:'08', label: 'Caddy + DNS Cloudflare',       start:[2026,3],  end:[2026,4],  color:'#f97316' },
  { id: 'tailscale',   num:'09', label: 'Tailscale VPN Zero Trust',     start:[2026,3],  end:[2026,4],  color:'#6366f1' },
  { id: 'backup',      num:'10', label: 'Backup 3-2-1',                 start:[2026,3],  end:[2026,4],  color:'#14b8a6' },
  { id: 'securite',    num:'11', label: 'Sécurité réseau Linux',        start:[2026,3],  end:[2026,4],  color:'#ef4444' },
];

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const O_Y = 2024, O_M = 9, N_M = 23; // Sep 2024 → Jul 2026

function mIdx(y, m) { return (y - O_Y) * 12 + (m - O_M); }

function renderGantt(containerId, currentId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // SVG dimensions — responsive via viewBox
  const LBL   = 190;  // label column width
  const ROW_H = 38;
  const BAR_H = 20;
  const HDR_H = 28;
  const PAD   = 12;
  const W     = 960;
  const TRACK = W - LBL - PAD * 2;
  const N     = GANTT_DATA.length;
  const H     = HDR_H + N * ROW_H + PAD;

  // Today
  const now = new Date();
  const todayI = mIdx(now.getFullYear(), now.getMonth() + 1);
  const todayX = LBL + PAD + (Math.max(0, Math.min(N_M, todayI)) / N_M) * TRACK;
  const showToday = todayI >= 0 && todayI <= N_M;

  let defs = `<defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  let svgContent = '';

  // ── Background stripes (alternating rows)
  GANTT_DATA.forEach((_, i) => {
    const y = HDR_H + i * ROW_H;
    if (i % 2 === 0)
      svgContent += `<rect x="0" y="${y}" width="${W}" height="${ROW_H}" fill="rgba(255,255,255,0.015)"/>`;
  });

  // ── Month grid
  for (let i = 0; i <= N_M; i++) {
    const x = LBL + PAD + (i / N_M) * TRACK;
    const tm = O_M - 1 + i;
    const m  = tm % 12;
    const y  = O_Y + Math.floor(tm / 12);
    const isJan = m === 0;

    svgContent += `<line x1="${x.toFixed(1)}" y1="${HDR_H}" x2="${x.toFixed(1)}" y2="${H}"
      stroke="${isJan ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}"
      stroke-width="${isJan ? 1 : 0.5}"/>`;

    const show = i === 0 || isJan || i % 3 === 0;
    if (show) {
      const lbl = isJan ? `Jan ${y}` : MONTHS_FR[m];
      svgContent += `<text x="${(x+3).toFixed(1)}" y="${HDR_H - 6}"
        font-size="${isJan ? 10 : 9}"
        fill="${isJan ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}"
        font-weight="${isJan ? 700 : 500}"
        font-family="DM Sans, sans-serif">${lbl}</text>`;
    }
  }

  // ── Header separator
  svgContent += `<line x1="0" y1="${HDR_H}" x2="${W}" y2="${HDR_H}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  svgContent += `<line x1="${LBL}" y1="0" x2="${LBL}" y2="${H}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;

  // ── Rows
  GANTT_DATA.forEach((proj, i) => {
    const isCurrent = proj.id === currentId;
    const rowY  = HDR_H + i * ROW_H;
    const midY  = rowY + ROW_H / 2;
    const barY  = midY - (isCurrent ? BAR_H : BAR_H - 6) / 2;
    const barHi = isCurrent ? BAR_H : BAR_H - 6;

    const s = Math.max(0, mIdx(proj.start[0], proj.start[1]));
    const e = Math.min(N_M, mIdx(proj.end[0], proj.end[1]) + 1);
    const bx = LBL + PAD + (s / N_M) * TRACK;
    const bw = Math.max(8, ((e - s) / N_M) * TRACK);

    // Row highlight for current
    if (isCurrent)
      svgContent += `<rect x="0" y="${rowY}" width="${W}" height="${ROW_H}" fill="${proj.color}" fill-opacity="0.07"/>`;

    // Row bottom separator
    svgContent += `<line x1="${LBL}" y1="${rowY + ROW_H}" x2="${W - PAD}" y2="${rowY + ROW_H}" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`;

    // Num badge
    svgContent += `<text x="${8}" y="${midY + 4}" font-size="9"
      fill="${isCurrent ? proj.color : 'rgba(255,255,255,0.2)'}"
      font-weight="800" font-family="Syne, sans-serif">${proj.num}</text>`;

    // Label
    const maxLblChars = 24;
    const lbl = proj.label.length > maxLblChars ? proj.label.slice(0, maxLblChars - 1) + '…' : proj.label;
    svgContent += `<text x="${30}" y="${midY + 4}" font-size="${isCurrent ? 11 : 10}"
      fill="${isCurrent ? '#fff' : 'rgba(255,255,255,0.35)'}"
      font-weight="${isCurrent ? 600 : 400}"
      font-family="DM Sans, sans-serif">${lbl}</text>`;

    // Color dot
    svgContent += `<circle cx="${LBL - 10}" cy="${midY}" r="${isCurrent ? 4 : 3}"
      fill="${proj.color}" fill-opacity="${isCurrent ? 1 : 0.45}"/>`;

    // Track background
    svgContent += `<rect x="${LBL + PAD}" y="${midY - 3}" width="${TRACK}" height="6"
      fill="rgba(255,255,255,0.04)" rx="3"/>`;

    // Bar glow (current only)
    if (isCurrent)
      svgContent += `<rect x="${bx.toFixed(1)}" y="${barY.toFixed(1)}" width="${bw.toFixed(1)}" height="${barHi}"
        fill="${proj.color}" fill-opacity="0.3" rx="4" filter="url(#glow)"/>`;

    // Bar
    svgContent += `<rect x="${bx.toFixed(1)}" y="${barY.toFixed(1)}" width="${bw.toFixed(1)}" height="${barHi}"
      fill="${proj.color}" fill-opacity="${isCurrent ? 1 : 0.35}" rx="${isCurrent ? 4 : 3}"/>`;

    // Bar label
    if (bw > 50) {
      const maxC = Math.floor(bw / 6.5);
      const bLbl = proj.label.length > maxC ? proj.label.slice(0, maxC - 1) + '…' : proj.label;
      svgContent += `<text x="${(bx + 7).toFixed(1)}" y="${(midY + 4).toFixed(1)}" font-size="9"
        fill="rgba(255,255,255,${isCurrent ? 0.95 : 0.7})" font-weight="${isCurrent ? 700 : 500}"
        font-family="DM Sans, sans-serif">${bLbl}</text>`;
    }
  });

  // ── Today line
  if (showToday) {
    svgContent += `<line x1="${todayX.toFixed(1)}" y1="${HDR_H - 4}" x2="${todayX.toFixed(1)}" y2="${H}"
      stroke="#f87171" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8"/>`;
    svgContent += `<text x="${(todayX + 4).toFixed(1)}" y="${HDR_H + 11}" font-size="8"
      fill="#f87171" font-weight="700" font-family="DM Sans, sans-serif">Aujourd'hui</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;display:block">${defs}${svgContent}</svg>`;

  // ── Legend — one entry per project
  const legendItems = GANTT_DATA.map(proj => {
    const isCurrent = proj.id === currentId;
    return `<div style="display:flex;align-items:center;gap:6px;opacity:${isCurrent ? 1 : 0.55}">
      <div style="width:10px;height:10px;border-radius:2px;background:${proj.color};flex-shrink:0"></div>
      <span style="font-size:0.72rem;color:${isCurrent ? '#fff' : 'var(--text-dim)'};font-weight:${isCurrent ? 600 : 400};white-space:nowrap">${proj.num} · ${proj.label}</span>
    </div>`;
  }).join('');

  const todayLegend = showToday
    ? `<div style="display:flex;align-items:center;gap:6px;margin-top:0.5rem">
        <div style="width:2px;height:12px;background:#f87171;border-radius:1px;flex-shrink:0"></div>
        <span style="font-size:0.72rem;color:var(--text-dim)">Aujourd'hui</span>
      </div>` : '';

  container.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
      <div style="padding:1rem 1.5rem 0.75rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
        <div>
          <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent)">Sept. 2024 → Juil. 2026</div>
        </div>
      </div>
      <div style="overflow-x:auto;padding:0.5rem 0">${svg}</div>
      <div style="padding:1rem 1.5rem;border-top:1px solid var(--border)">
        <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:0.75rem">Légende</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.4rem 1.5rem">
          ${legendItems}
        </div>
        ${todayLegend}
      </div>
    </div>`;
}
