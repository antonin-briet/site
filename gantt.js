/**
 * gantt.js — Composant Gantt portfolio
 */

const GANTT_PROJECTS = [
  { id: 'vlan',        label: 'VLAN & Routage',         start: [2024,10], end: [2024,10], color: '#3b82f6' },
  { id: 'windows',     label: 'Windows Server / AD',     start: [2024,11], end: [2025, 1], color: '#8b5cf6' },
  { id: 'apache',      label: 'Serveur Web Apache',      start: [2025, 2], end: [2025, 2], color: '#06b6d4' },
  { id: 'pfsense',     label: 'Pare-feu pfSense',        start: [2025, 4], end: [2025, 4], color: '#f59e0b' },
  { id: 'vaultwarden', label: 'Vaultwarden',             start: [2026, 3], end: [2026, 4], color: '#ec4899' },
  { id: 'adguard',     label: 'AdGuard Home',            start: [2026, 3], end: [2026, 4], color: '#10b981' },
  { id: 'caddy',       label: 'Caddy + DNS Cloudflare',  start: [2026, 3], end: [2026, 4], color: '#f97316' },
  { id: 'tailscale',   label: 'VPN Zero Trust Tailscale',start: [2026, 3], end: [2026, 4], color: '#6366f1' },
  { id: 'backup',      label: 'Backup 3-2-1',            start: [2026, 3], end: [2026, 4], color: '#14b8a6' },
  { id: 'securite',    label: 'Sécurité réseau Linux',   start: [2026, 3], end: [2026, 4], color: '#ef4444' },
  { id: 'v2si',        label: 'V2SI Alternance',         start: [2024, 9], end: [2026, 7], color: '#22c55e' },
];

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

// Timeline: Sep 2024 → Jul 2026 = 23 mois
const T_START = { y: 2024, m: 9 };
const T_TOTAL = 23;

function monthIndex(y, m) {
  return (y - T_START.y) * 12 + (m - T_START.m);
}

function renderGantt(containerId, currentId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Today marker
  const now = new Date();
  const todayIdx = monthIndex(now.getFullYear(), now.getMonth() + 1);
  const todayPct = Math.max(0, Math.min(100, (todayIdx / T_TOTAL) * 100));

  // Find current project color
  const currentProj = GANTT_PROJECTS.find(p => p.id === currentId);
  const currentColor = currentProj ? currentProj.color : '#3b82f6';

  // Build months header — show label every 3 months or year boundary
  let headerCells = '';
  for (let i = 0; i < T_TOTAL; i++) {
    const totalM = T_START.m - 1 + i;
    const m = totalM % 12;
    const y = T_START.y + Math.floor(totalM / 12);
    const isJan = m === 0;
    const show = (i === 0) || isJan || (i % 3 === 0);
    const label = show ? (isJan ? `Jan ${y}` : MONTHS_FR[m]) : '';
    const borderStyle = isJan ? '2px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)';
    headerCells += `<div style="grid-column:${i+1};border-left:${borderStyle};padding:0 4px;font-size:0.6rem;font-weight:${isJan?700:600};color:${isJan?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.25)'};white-space:nowrap;overflow:hidden">${label}</div>`;
  }

  // Build rows
  let rows = '';
  const sorted = [...GANTT_PROJECTS].sort((a, b) => {
    const ai = monthIndex(a.start[0], a.start[1]);
    const bi = monthIndex(b.start[0], b.start[1]);
    return ai - bi;
  });

  sorted.forEach(proj => {
    const isCurrent = proj.id === currentId;
    const startIdx = Math.max(0, monthIndex(proj.start[0], proj.start[1]));
    const endIdx   = Math.min(T_TOTAL, monthIndex(proj.end[0], proj.end[1]) + 1);
    const span     = Math.max(1, endIdx - startIdx);

    const opacity = isCurrent ? '1' : '0.32';
    const barH    = isCurrent ? '26px' : '18px';
    const barTop  = isCurrent ? '5px' : '9px';
    const shadow  = isCurrent ? `0 0 12px ${proj.color}55` : 'none';
    const labelColor = isCurrent ? '#fff' : 'rgba(255,255,255,0.5)';
    const labelW  = isCurrent ? '140px' : '140px';
    const labelFw = isCurrent ? '600' : '400';
    const labelFs = isCurrent ? '0.83rem' : '0.78rem';

    // vertical grid cells
    let cells = '';
    for (let i = 0; i < T_TOTAL; i++) {
      const totalM = T_START.m - 1 + i;
      const m = totalM % 12;
      const isJan = m === 0;
      cells += `<div style="grid-column:${i+1};border-left:${isJan?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(255,255,255,0.04)'};height:36px"></div>`;
    }

    rows += `
    <div style="display:flex;align-items:center;gap:0;margin-bottom:2px">
      <div style="width:150px;flex-shrink:0;font-size:${labelFs};font-weight:${labelFw};color:${labelColor};padding-right:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:${opacity}" title="${proj.label}">${proj.label}</div>
      <div style="flex:1;position:relative;height:36px">
        <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(${T_TOTAL},1fr)">${cells}</div>
        <div style="position:absolute;left:${(startIdx/T_TOTAL*100).toFixed(2)}%;width:${(span/T_TOTAL*100).toFixed(2)}%;top:${barTop};height:${barH};background:${proj.color};opacity:${opacity};border-radius:4px;box-shadow:${shadow};display:flex;align-items:center;padding:0 8px;overflow:hidden">
          ${isCurrent ? `<span style="font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${proj.label}</span>` : ''}
        </div>
        ${todayPct > 0 && todayPct < 100 ? `<div style="position:absolute;top:0;bottom:0;left:${todayPct.toFixed(2)}%;width:1.5px;background:rgba(255,80,80,0.7);z-index:5"></div>` : ''}
      </div>
    </div>`;
  });

  el.innerHTML = `
<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
  <div style="padding:1rem 1.5rem 0.6rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
    <div>
      <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:0.2rem">Planning · BTS SIO SISR</div>
      <div style="font-size:0.82rem;color:var(--text-muted);font-weight:300">Sept. 2024 → Juil. 2026</div>
    </div>
    <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:6px;font-size:0.72rem;color:var(--text-dim)">
        <div style="width:20px;height:8px;border-radius:3px;background:${currentColor}"></div>
        Projet actuel
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:0.72rem;color:var(--text-dim)">
        <div style="width:20px;height:8px;border-radius:3px;background:rgba(255,255,255,0.15)"></div>
        Autres projets
      </div>
      ${todayPct > 0 && todayPct < 100 ? `<div style="display:flex;align-items:center;gap:6px;font-size:0.72rem;color:var(--text-dim)"><div style="width:2px;height:12px;background:rgba(255,80,80,0.7);border-radius:1px"></div>Aujourd'hui</div>` : ''}
    </div>
  </div>
  <div style="padding:1rem 1.5rem 1.25rem;overflow-x:auto">
    <div style="min-width:520px">
      <div style="display:flex;margin-bottom:4px">
        <div style="width:150px;flex-shrink:0"></div>
        <div style="flex:1;display:grid;grid-template-columns:repeat(${T_TOTAL},1fr);height:20px">${headerCells}</div>
      </div>
      ${rows}
    </div>
  </div>
</div>`;
}
