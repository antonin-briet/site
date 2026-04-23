/**
 * gantt.js — Composant Gantt réutilisable
 * Usage: renderGantt('gantt-container-id', projects, currentProjectId)
 */

// Données globales de tous les projets du portfolio
const PORTFOLIO_PROJECTS = [
  { id: 'vlan',          label: '01 · VLAN',           start: '2024-10', end: '2024-10', type: 'tp' },
  { id: 'windows',       label: '02 · Windows Server',  start: '2024-11', end: '2025-01', type: 'tp' },
  { id: 'apache',        label: '03 · Apache',          start: '2025-02', end: '2025-02', type: 'tp' },
  { id: 'pfsense',       label: '04 · pfSense',         start: '2025-04', end: '2025-04', type: 'tp' },
  { id: 'v2si',          label: '05 · V2SI Alternance', start: '2024-09', end: '2026-07', type: 'stage' },
  { id: 'homelab',       label: '06 · Homelab',         start: '2026-03', end: '2026-04', type: 'homelab' },
];

function renderGantt(containerId, currentId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Période : sept 2024 → juil 2026 (22 mois)
  const START_YEAR = 2024, START_MONTH = 9;  // Sept 2024
  const TOTAL_MONTHS = 23; // Sept 2024 → Juil 2026

  const months = [];
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const m = (START_MONTH - 1 + i) % 12;
    const y = START_YEAR + Math.floor((START_MONTH - 1 + i) / 12);
    months.push({ month: m + 1, year: y });
  }

  // Labels mois courts
  const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  // Convertit 'YYYY-MM' en index de colonne
  function toCol(str) {
    const [y, m] = str.split('-').map(Number);
    return (y - START_YEAR) * 12 + (m - START_MONTH);
  }

  // Calcule position "aujourd'hui"
  const now = new Date();
  const todayCol = (now.getFullYear() - START_YEAR) * 12 + (now.getMonth() + 1 - START_MONTH);
  const todayPct = Math.max(0, Math.min(100, (todayCol / TOTAL_MONTHS) * 100));

  // HTML header mois — affiche seulement Jan et le mois de départ
  let monthsHTML = `<div class="gantt-months" style="grid-template-columns:repeat(${TOTAL_MONTHS},1fr)">`;
  months.forEach(({ month, year }, i) => {
    const show = month === 1 || i === 0 || (i === TOTAL_MONTHS - 1);
    monthsHTML += `<div class="gantt-month">${show ? (month === 1 || i === 0 ? MONTH_LABELS[month-1] + ' ' + year : MONTH_LABELS[month-1]) : ''}</div>`;
  });
  monthsHTML += '</div>';

  // HTML rows
  let rowsHTML = '';
  PORTFOLIO_PROJECTS.forEach(proj => {
    const startCol = Math.max(0, toCol(proj.start));
    const endCol   = Math.min(TOTAL_MONTHS, toCol(proj.end) + 1);
    const leftPct  = (startCol / TOTAL_MONTHS) * 100;
    const widthPct = ((endCol - startCol) / TOTAL_MONTHS) * 100;

    const isCurrent = proj.id === currentId;
    let barClass = isCurrent ? 'gantt-bar current-project' : 'gantt-bar other-project';
    if (!isCurrent && proj.type === 'stage')   barClass = 'gantt-bar bar-stage';
    if (!isCurrent && proj.type === 'homelab') barClass = 'gantt-bar bar-homelab';

    // bg cells
    let cellsHTML = '';
    months.forEach(() => { cellsHTML += '<div class="gantt-track-cell"></div>'; });

    rowsHTML += `
      <div class="gantt-row">
        <div class="gantt-label" title="${proj.label}">${proj.label}</div>
        <div class="gantt-track" style="grid-template-columns:repeat(${TOTAL_MONTHS},1fr)">
          <div class="gantt-track-bg" style="grid-template-columns:repeat(${TOTAL_MONTHS},1fr)">${cellsHTML}</div>
          <div class="${barClass}" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%"></div>
          ${todayPct > 0 && todayPct < 100 ? `<div class="gantt-today" style="left:${todayPct.toFixed(2)}%"></div>` : ''}
        </div>
      </div>`;
  });

  container.innerHTML = `
    <div class="gantt-wrap">
      <div class="gantt">
        ${monthsHTML}
        ${rowsHTML}
        <div class="gantt-legend">
          <div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:var(--accent)"></div> Projet actuel</div>
          <div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:var(--surface-2);border:1px solid var(--border)"></div> Autre TP</div>
          <div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.3)"></div> Alternance</div>
          <div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.3)"></div> Homelab</div>
        </div>
      </div>
    </div>`;
}
