/**
 * gantt.js — Diagramme de Gantt SVG
 * Utilisation : renderGantt('container-id', 'project-id')
 */

const GANTT_DATA = [
  { id: 'v2si',        label: 'V2SI Alternance',          start: [2024,9],  end: [2026,7],  color: '#22c55e' },
  { id: 'vlan',        label: 'VLAN & Routage',           start: [2024,10], end: [2024,10], color: '#3b82f6' },
  { id: 'windows',     label: 'Windows Server / AD',      start: [2024,11], end: [2025,1],  color: '#8b5cf6' },
  { id: 'apache',      label: 'Serveur Web Apache',       start: [2025,2],  end: [2025,2],  color: '#06b6d4' },
  { id: 'pfsense',     label: 'Pare-feu pfSense',         start: [2025,4],  end: [2025,4],  color: '#f59e0b' },
  { id: 'vaultwarden', label: 'Vaultwarden',              start: [2026,3],  end: [2026,4],  color: '#ec4899' },
  { id: 'adguard',     label: 'AdGuard Home',             start: [2026,3],  end: [2026,4],  color: '#10b981' },
  { id: 'caddy',       label: 'Caddy + DNS Cloudflare',   start: [2026,3],  end: [2026,4],  color: '#f97316' },
  { id: 'tailscale',   label: 'Tailscale VPN',            start: [2026,3],  end: [2026,4],  color: '#6366f1' },
  { id: 'backup',      label: 'Backup 3-2-1',             start: [2026,3],  end: [2026,4],  color: '#14b8a6' },
  { id: 'securite',    label: 'Sécurité réseau',          start: [2026,3],  end: [2026,4],  color: '#ef4444' },
];

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const ORIGIN_Y  = 2024;
const ORIGIN_M  = 9;   // Septembre 2024
const N_MONTHS  = 23;  // Sep 2024 → Jul 2026

function mIdx(y, m) {
  return (y - ORIGIN_Y) * 12 + (m - ORIGIN_M);
}

function renderGantt(containerId, currentId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const LABEL_W  = 160;
  const ROW_H    = 34;
  const BAR_H    = 18;
  const HEADER_H = 32;
  const PAD_L    = 16;
  const PAD_R    = 16;
  const CHART_W  = 700; // total SVG width
  const TRACK_W  = CHART_W - LABEL_W - PAD_L - PAD_R;
  const N        = GANTT_DATA.length;
  const SVG_H    = HEADER_H + N * ROW_H + 20;

  // Today
  const now = new Date();
  const todayIdx = mIdx(now.getFullYear(), now.getMonth() + 1);
  const todayX   = LABEL_W + PAD_L + (todayIdx / N_MONTHS) * TRACK_W;
  const showToday = todayIdx >= 0 && todayIdx <= N_MONTHS;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${CHART_W} ${SVG_H}" style="font-family:'DM Sans',sans-serif;display:block">`;

  // ── Background
  svg += `<rect width="${CHART_W}" height="${SVG_H}" fill="var(--surface)" rx="0"/>`;

  // ── Month grid lines + headers
  for (let i = 0; i <= N_MONTHS; i++) {
    const x = LABEL_W + PAD_L + (i / N_MONTHS) * TRACK_W;
    const totalM = ORIGIN_M - 1 + i;
    const m = totalM % 12;
    const y = ORIGIN_Y + Math.floor(totalM / 12);
    const isJan = (m === 0);
    const isFirst = (i === 0);

    // vertical grid line
    const lineColor = isJan ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)';
    svg += `<line x1="${x}" y1="${HEADER_H}" x2="${x}" y2="${SVG_H-10}" stroke="${lineColor}" stroke-width="${isJan?1.5:0.5}"/>`;

    // month label — show every 3 months or Jan
    if (isFirst || isJan || i % 3 === 0) {
      const label = isJan ? `Jan ${y}` : MONTHS_FR[m];
      const fw = isJan ? '700' : '500';
      const fc = isJan ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)';
      svg += `<text x="${x + 3}" y="${HEADER_H - 8}" font-size="9" fill="${fc}" font-weight="${fw}">${label}</text>`;
    }
  }

  // ── Header separator
  svg += `<line x1="0" y1="${HEADER_H}" x2="${CHART_W}" y2="${HEADER_H}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;

  // ── Rows
  GANTT_DATA.forEach((proj, idx) => {
    const isCurrent = proj.id === currentId;
    const rowY = HEADER_H + idx * ROW_H;
    const barY = rowY + (ROW_H - BAR_H) / 2;

    const startIdx = Math.max(0, mIdx(proj.start[0], proj.start[1]));
    const endIdx   = Math.min(N_MONTHS, mIdx(proj.end[0], proj.end[1]) + 1);
    const barX     = LABEL_W + PAD_L + (startIdx / N_MONTHS) * TRACK_W;
    const barW     = Math.max(6, ((endIdx - startIdx) / N_MONTHS) * TRACK_W);

    // Row bg highlight if current
    if (isCurrent) {
      svg += `<rect x="0" y="${rowY}" width="${CHART_W}" height="${ROW_H}" fill="${proj.color}" fill-opacity="0.06"/>`;
    }

    // Row separator
    svg += `<line x1="${LABEL_W}" y1="${rowY + ROW_H}" x2="${CHART_W - PAD_R}" y2="${rowY + ROW_H}" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`;

    // Label
    const labelOpacity = isCurrent ? '1' : '0.4';
    const labelFw = isCurrent ? '600' : '400';
    const labelFs = isCurrent ? '11' : '10';
    const labelColor = isCurrent ? '#ffffff' : 'rgba(255,255,255,0.7)';
    svg += `<text x="${PAD_L}" y="${rowY + ROW_H/2 + 4}" font-size="${labelFs}" fill="${labelColor}" font-weight="${labelFw}" fill-opacity="${labelOpacity}">${proj.label}</text>`;

    // Color dot on label side
    svg += `<circle cx="${LABEL_W - 10}" cy="${rowY + ROW_H/2}" r="${isCurrent ? 4 : 3}" fill="${proj.color}" fill-opacity="${isCurrent ? 1 : 0.4}"/>`;

    // Bar background track
    const trackX = LABEL_W + PAD_L;
    svg += `<rect x="${trackX}" y="${barY + 6}" width="${TRACK_W}" height="${BAR_H - 12}" fill="rgba(255,255,255,0.03)" rx="3"/>`;

    // Bar
    const barOpacity = isCurrent ? '1' : '0.3';
    const barActualH = isCurrent ? BAR_H : BAR_H - 6;
    const barActualY = isCurrent ? barY : barY + 3;
    svg += `<rect x="${barX}" y="${barActualY}" width="${barW}" height="${barActualH}" fill="${proj.color}" fill-opacity="${barOpacity}" rx="${isCurrent ? 4 : 3}"/>`;

    // Glow on current bar
    if (isCurrent) {
      svg += `<rect x="${barX}" y="${barActualY}" width="${barW}" height="${barActualH}" fill="${proj.color}" fill-opacity="0.25" rx="4" filter="url(#glow)"/>`;
    }

    // Bar label if wide enough
    if (isCurrent && barW > 40) {
      const maxChars = Math.floor(barW / 6.5);
      const barLabel = proj.label.length > maxChars ? proj.label.slice(0, maxChars - 1) + '…' : proj.label;
      svg += `<text x="${barX + 7}" y="${barActualY + barActualH/2 + 4}" font-size="9" fill="rgba(255,255,255,0.95)" font-weight="700">${barLabel}</text>`;
    }
  });

  // ── Today line
  if (showToday) {
    svg += `<line x1="${todayX}" y1="${HEADER_H}" x2="${todayX}" y2="${SVG_H - 10}" stroke="#f87171" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    svg += `<text x="${todayX + 3}" y="${HEADER_H + 10}" font-size="8" fill="#f87171" font-weight="700">Aujourd'hui</text>`;
  }

  // ── Defs (glow filter)
  svg = svg.replace('<svg ', `<svg `) + `
  <defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  svg += '</svg>';

  // Légende
  const currentProj = GANTT_DATA.find(p => p.id === currentId);
  const legendHTML = `
    <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;padding:0.75rem 1rem;border-top:1px solid var(--border);font-size:0.72rem;color:var(--text-dim)">
      ${currentProj ? `<span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${currentProj.color}"></span>Projet actuel</span>` : ''}
      <span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:rgba(255,255,255,0.15)"></span>Autres projets</span>
      ${showToday ? `<span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:2px;height:12px;background:#f87171;border-radius:1px"></span>Aujourd'hui</span>` : ''}
    </div>`;

  container.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
      <div style="padding:1rem 1.25rem 0.75rem;border-bottom:1px solid var(--border)">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:0.2rem">Planning · BTS SIO SISR</div>
        <div style="font-size:0.82rem;color:var(--text-muted);font-weight:300">Sept. 2024 → Juil. 2026</div>
      </div>
      <div style="overflow-x:auto;padding:0.75rem 0">${svg}</div>
      ${legendHTML}
    </div>`;
}
