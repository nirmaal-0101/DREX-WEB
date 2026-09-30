/**
 * DREX V2 — Universal In-Page Demo Flow System v2.0
 * ===================================================
 * Replaces the current page viewport with a complete, operational-quality
 * demonstration of that module's functionality.
 *
 * Architecture: Each demoXxx() replaces appView innerHTML — same pattern as
 * presRenderFileEraser() / presRenderRecovery() in presentation.js.
 *
 * SAFETY: Zero calls to destructive API endpoints.
 * SAFETY: Never modifies E:\ or PHYSICALDRIVE*.
 * SAFETY: Completely isolated from real STATE.
 */

// ─── SHARED DEMO CONTEXT ──────────────────────────────────────────────────────

const DF = {
  active: false,
  module: null,
  phase: 'IDLE',
  _animTimer: null,
  _logLines: [],
  startTime: null,
  // Deterministic IDs
  caseId:   'CASE-DEMO-2026-001',
  jobFile:  'JOB-DEMO-8F4A91',
  jobDrive: 'SAN-DEMO-74A821',
  jobRec:   'REC-DEMO-74B812',
  certId:   'DREX-CERT-DEMO-8F4A91C2',
  planId:   'PLAN-DEMO-A3F7B2',
  buildCommit: '9d8ba92',
  get operator() {
    return (typeof STATE !== 'undefined' && STATE.currentRole)
      ? STATE.currentRole.replace(/_/g, ' ') : 'drex_operator';
  },
};

// ─── DETERMINISTIC DEMO DATA ──────────────────────────────────────────────────

const DF_TARGET = {
  path: 'D:\\DREX_FILE_ERASURE_TEST\\demo_evidence\\',
  short: 'demo_evidence',
  type: 'Folder', objects: 12, size: '24.6 MB', fs: 'NTFS',
};

const DF_DEVICE = {
  model: 'SanDisk Ultra USB Device', path: '\\\\.\\PHYSICALDRIVE1',
  capacity: '57.3 GB', bus: 'USB', fs: 'exFAT', serial: '4C530001220812106533',
  health: 'Healthy', partitions: 1,
};

const DF_CANDIDATES = [
  { id:'rc01', file:'project_report.pdf',    type:'PDF',    size:'2.4 MB', offset:'0x0002A400', conf:98, frag:'None',   status:'RECOVERABLE', hash:'a7f3c9...d82e1b' },
  { id:'rc02', file:'evidence_photo_01.jpg', type:'JPEG',   size:'4.8 MB', offset:'0x0018F200', conf:96, frag:'None',   status:'RECOVERABLE', hash:'b2e4d1...f93a27' },
  { id:'rc03', file:'database_backup.db',    type:'SQLite', size:'8.2 MB', offset:'0x003A1200', conf:94, frag:'Low',    status:'RECOVERABLE', hash:'c8f1a6...e47b39' },
  { id:'rc04', file:'presentation.pptx',     type:'PPTX',   size:'5.1 MB', offset:'0x006B9100', conf:91, frag:'Low',    status:'RECOVERABLE', hash:'d4a7e2...c15f48' },
  { id:'rc05', file:'source_archive.zip',    type:'ZIP',    size:'3.7 MB', offset:'0x008A4100', conf:89, frag:'Medium', status:'RECOVERABLE', hash:'e9b3f5...a26d51' },
];

const DF_SIGS = [
  { type:'PDF',    magic:'0x25504446 (%PDF)', count:4 },
  { type:'JPEG',   magic:'0xFFD8FFE0 (JFIF)', count:3 },
  { type:'PNG',    magic:'0x89504E47 (PNG)',  count:2 },
  { type:'DOCX',   magic:'0x504B0304 (PK)',   count:2 },
  { type:'PPTX',   magic:'0x504B0304 (PK)',   count:1 },
  { type:'ZIP',    magic:'0x504B0304 (PK)',   count:3 },
  { type:'SQLite', magic:'0x53514C69',        count:2 },
];

const DF_AUDIT_EVENTS = [
  { ts:'09:14:02', event:'CASE_CREATED',           actor:'drex_operator',   detail:'Case CASE-DEMO-2026-001 initialized' },
  { ts:'09:14:18', event:'TARGET_IDENTIFIED',       actor:'drex_operator',   detail:'Target demo_evidence\\ qualified and boundary-checked' },
  { ts:'09:15:01', event:'PLAN_CREATED',            actor:'drex_operator',   detail:'Plan PLAN-DEMO-A3F7B2 generated, method M02 selected' },
  { ts:'09:16:44', event:'AUTHORIZATION_COMPLETED', actor:'drex_supervisor', detail:'Two-Man Rule verified — operator + supervisor' },
  { ts:'09:17:02', event:'FILE_OPERATION_STARTED',  actor:'system',          detail:'JOB-DEMO-8F4A91 dispatched — M08 CSPRNG' },
  { ts:'09:25:44', event:'FILE_OPERATION_COMPLETE', actor:'system',          detail:'12/12 objects sanitized, verification PASS' },
  { ts:'09:26:02', event:'DRIVE_OPERATION_STARTED', actor:'system',          detail:'SAN-DEMO-74A821 dispatched — M02 Smart Sanitization' },
  { ts:'09:45:49', event:'DRIVE_OPERATION_COMPLETE',actor:'system',          detail:'Surface verified, entropy 7.9993, verdict PASS' },
  { ts:'09:46:12', event:'RECOVERY_STARTED',        actor:'drex_operator',   detail:'REC-DEMO-74B812 — 5 candidates selected' },
  { ts:'09:52:31', event:'RECOVERY_COMPLETE',       actor:'system',          detail:'5/5 files recovered, SHA-256 verified' },
  { ts:'09:53:01', event:'EVIDENCE_CREATED',        actor:'system',          detail:'5 evidence items sealed in vault' },
  { ts:'09:53:44', event:'CERTIFICATE_GENERATED',   actor:'system',          detail:'DREX-CERT-DEMO-8F4A91C2 issued' },
];

const DF_VALIDATION = [
  { name:'Authentication',       result:'PASS', detail:'JWT + session token verified' },
  { name:'Authorization',        result:'PASS', detail:'Role-based access control active' },
  { name:'Safety Tripwires',     result:'PASS', detail:'System disk protection — NOT triggered' },
  { name:'Workflow Isolation',   result:'PASS', detail:'Cross-workflow contamination — BLOCKED' },
  { name:'Audit Chain Integrity',result:'PASS', detail:'SHA-256 Merkle root verified' },
  { name:'Recovery Engine',      result:'PASS', detail:'Filesystem traversal — operational' },
  { name:'Certificate Security', result:'PASS', detail:'Tamper-evident hash — VALID' },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const _E = s => (typeof esc === 'function' ? esc(String(s ?? '')) : String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])));

function _dfTs(offsetSec = 0) {
  const d = new Date((DF.startTime || Date.now()) + offsetSec * 1000);
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

function _dfView() { return document.getElementById('appView'); }

function _dfDisc() {
  return `<span style="font-size:10px;color:var(--drex-text-subtle);letter-spacing:0.03em;font-style:italic;">Demonstration result</span>`;
}

function _dfMetric(label, value, color) {
  return `<div class="pres-metric-tile">
    <div class="pres-metric-label">${_E(label)}</div>
    <div class="pres-metric-value" style="color:${color || 'var(--drex-text-main)'};">${value}</div>
  </div>`;
}

function _dfCheck(text, done = true) {
  const c = done ? 'var(--drex-status-pass)' : 'var(--drex-text-muted)';
  return `<div class="pres-check-item">
    <span style="color:${c};font-weight:800;font-size:13px;min-width:16px;">${done ? '✓' : '○'}</span>
    <span style="color:${done ? 'var(--drex-text-main)' : 'var(--drex-text-muted)'};font-size:12px;">${_E(text)}</span>
  </div>`;
}

function _dfBar(id, pct) {
  return `<div class="pres-progress-bar-wrap">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
      <span class="pres-meta-k">PROGRESS</span>
      <span id="${id}Pct" style="font-size:12px;font-weight:700;color:var(--drex-primary);">${pct}%</span>
    </div>
    <div class="pres-progress-track"><div id="${id}Bar" class="pres-progress-fill" style="width:${pct}%;"></div></div>
  </div>`;
}

function _dfPipeline(stages, activeIdx) {
  return stages.map((s, i) => {
    const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
    const icons = { done:'✓', active:'●', pending:'○' };
    const colors = { done:'var(--drex-status-pass)', active:'var(--drex-primary)', pending:'var(--drex-text-muted)' };
    const bg = state === 'active' ? 'rgba(23,105,224,0.05)' : 'transparent';
    const detail = state === 'done' ? (s.done || '') : state === 'active' ? (s.active || '') : '';
    return `<div class="pres-pipeline-stage pres-pipeline-${state}" style="background:${bg};">
      <div class="pres-pipeline-icon" style="color:${colors[state]};">${icons[state]}</div>
      <div class="pres-pipeline-body">
        <div class="pres-pipeline-num">PHASE ${String(i+1).padStart(2,'0')}</div>
        <div class="pres-pipeline-title" style="color:${state==='pending'?'var(--drex-text-muted)':'var(--drex-text-main)'};">${_E(s.title)}</div>
        ${detail ? `<div class="pres-pipeline-detail">${_E(detail)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function _dfTable(headers, rows) {
  return `<table class="pres-candidate-table">
    <thead><tr>${headers.map(h => `<th>${_E(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function _dfCtxBar(op, caseId, jobId, statusBadge) {
  return `<div class="pres-context-bar">
    <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>${_E(op)}</span></div>
    <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
    ${jobId ? `<div class="pres-ctx-item"><span class="pres-ctx-label">JOB</span><code>${_E(jobId)}</code></div>` : ''}
    <div class="pres-ctx-sep"></div>
    ${statusBadge}
  </div>`;
}

function _dfInfoGrid(rows) {
  return `<div class="pres-info-grid">${rows.map(([k, v, accent]) =>
    `<span class="pres-info-label">${_E(k)}</span><span class="pres-info-val${accent ? ' pres-info-accent' : ''}">${accent ? v : _E(v)}</span>`
  ).join('')}</div>`;
}

function _dfLog(lines) {
  return `<div class="pres-log">${lines.map(l => `<div>${_E(l)}</div>`).join('')}</div>`;
}

function _dfCertModal(certHtml) {
  const box = document.getElementById('modalBox');
  const overlay = document.getElementById('modalOverlay');
  if (!box || !overlay) return;
  box.innerHTML = certHtml;
  overlay.style.display = 'grid';
}

function _dfAnimTick(config) {
  // config: { steps, totalTicks, stepMs, onTick, onComplete }
  let tick = 0;
  function run() {
    config.onTick(tick);
    tick++;
    if (tick <= config.totalTicks) {
      DF._animTimer = setTimeout(run, config.stepMs || 480);
    } else {
      if (config.onComplete) config.onComplete();
    }
  }
  run();
}

function _dfResetAnim() {
  if (DF._animTimer) { clearTimeout(DF._animTimer); DF._animTimer = null; }
  DF._logLines = [];
  DF.startTime = Date.now();
}

// ─── DEMO BUTTON INJECTION (called by navigateTo post-render) ─────────────────
// Maps viewId → demo entry function name. Used in app.js injection code.

window._DF_MAP = {
  overview:              'demoOverview',
  cases:                 'demoCases',
  sanitization_planner:  'demoPlanner',
  file_eraser:           'demoFileEraser',
  drive_eraser:          'demoDriveEraser',
  active_operations:     'demoActiveOps',
  recovery:              'demoRecovery',
  carving:               'demoCarving',
  fragments:             'demoFragments',
  damaged_media:         'demoDamagedMedia',
  vault:                 'demoVault',
  audit:                 'demoAudit',
  certificates:          'demoCertificates',
  verifier:              'demoVerifier',
  system_validation:     'demoSystemValidation',
  verification:          'demoVerification',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. OVERVIEW DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoOverview() {
  _dfResetAnim(); DF.active = true; DF.module = 'overview';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Platform Overview', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">ACTIVE SESSION</span>')}

    <div class="card mt-12" style="background:linear-gradient(135deg,#0B1F3A 0%,#15325B 60%,#1769E0 100%);color:#fff;border:0;box-shadow:var(--drex-shadow-elevated);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.1em;color:#93c5fd;">DREX V2 — DIGITAL FORENSICS &amp; SECURE ERASURE WORKSTATION</div>
          <div style="font-size:22px;font-weight:900;margin:8px 0 4px;letter-spacing:-0.01em;">Platform Capability Overview</div>
          <div style="color:#94a3b8;font-size:12px;">Integrated secure storage erasure, forensic recovery, evidence assurance &amp; certification.</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="action-btn" style="width:auto;padding:8px 16px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.25);font-size:12px;" onclick="demoOverviewRunSequence()">▶ Start Platform Demo</button>
          <button class="action-btn" style="width:auto;padding:8px 14px;background:rgba(255,255,255,0.08);color:#94a3b8;border:1px solid rgba(255,255,255,0.15);font-size:11px;" onclick="navigateTo('overview')">↩ Exit Demo</button>
        </div>
      </div>
    </div>

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">PLATFORM STATUS</div>
        <div id="dfOverviewMetrics" class="pres-metrics-grid mt-6">
          ${_dfMetric('ACTIVE CASE', DF.caseId.split('-').slice(-1)[0], 'var(--drex-primary)')}
          ${_dfMetric('OPERATIONS', '3 Completed', 'var(--drex-status-pass)')}
          ${_dfMetric('EVIDENCE', '5 Items', '#8e44ad')}
          ${_dfMetric('CERTIFICATES', '1 Issued', 'var(--drex-status-pass)')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">WORKFLOW MODULES</div>
        <div style="margin-top:6px;">
          ${[
            ['🔒','Drive Eraser','Physical storage sanitization'],
            ['📁','File Eraser','Logical file/folder sanitization'],
            ['📋','Sanitization Planner','Method analysis & planning'],
            ['🔍','Forensic Recovery','Filesystem &amp; raw carving'],
            ['📦','Evidence Vault','SHA-256 integrity chain'],
            ['📜','Certificates','Tamper-evident issuance'],
          ].map(([icon, name, desc]) => `<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-bottom:1px solid var(--drex-border-subtle);">
            <span style="font-size:15px;">${icon}</span>
            <div><div style="font-size:12px;font-weight:700;">${name}</div><div style="font-size:10px;color:var(--drex-text-muted);">${desc}</div></div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">COMPLIANCE STANDARDS</div>
        <div style="margin-top:6px;">
          ${['NIST SP 800-88 (Clear/Purge/Destroy)','IEEE 2883 (Secure Storage Erase)','DoD 5220.22-M (3/7-pass)','NIST SP 800-86 (Forensic Guidance)','ISO/IEC 27040 (Storage Security)'].map(s => _dfCheck(s)).join('')}
        </div>
      </div>
    </div>

    <div id="dfOverviewSequence" class="card mt-12" style="display:none;"></div>
  `;
}

function demoOverviewRunSequence() {
  const el = document.getElementById('dfOverviewSequence');
  if (!el) return;
  el.style.display = 'block';
  _dfResetAnim();
  const phases = [
    'Case Registration', 'Target Identification', 'Sanitization Planning',
    'Two-Man Authorization', 'Secure Erasure Execution', 'Forensic Recovery',
    'Evidence Sealing', 'Audit Chain Finalization', 'Certificate Issuance',
  ];
  let active = 0;
  el.innerHTML = `<div class="section-label">PLATFORM WORKFLOW DEMONSTRATION</div><div id="dfOvPipeline" style="margin-top:8px;"></div>
    <div class="pres-metrics-grid mt-10" id="dfOvMetrics"></div>
    <div style="margin-top:10px;">${_dfDisc()}</div>`;
  function tick() {
    const p = document.getElementById('dfOvPipeline');
    const m = document.getElementById('dfOvMetrics');
    if (p) p.innerHTML = _dfPipeline(phases.map(t => ({title:t, done:'Completed', active:'In progress…'})), active);
    if (m) m.innerHTML =
      _dfMetric('PHASE', `${Math.min(active+1, phases.length)} / ${phases.length}`, 'var(--drex-primary)') +
      _dfMetric('STATUS', active >= phases.length ? 'COMPLETE' : 'RUNNING', active >= phases.length ? 'var(--drex-status-pass)' : 'var(--drex-primary)') +
      _dfMetric('CASE', DF.caseId, 'var(--drex-text-main)') +
      _dfMetric('ELAPSED', `00:${String(active * 3).padStart(2,'0')}`, 'var(--drex-text-main)');
    active++;
    if (active <= phases.length) DF._animTimer = setTimeout(tick, 600);
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CASES & TIMELINE DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoCases() {
  _dfResetAnim(); DF.active = true; DF.module = 'cases';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Cases & Timeline', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">ACTIVE</span>')}

    <div class="card mt-12" style="border-left:4px solid var(--drex-primary);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <div class="section-label" style="margin-bottom:4px;">ACTIVE CASE</div>
          <div style="font-size:18px;font-weight:900;">${DF.caseId}</div>
          <div style="font-size:12px;color:var(--drex-text-muted);margin-top:2px;">Forensic Investigation — Demo Evidence Set</div>
        </div>
        <button class="action-btn" style="width:auto;padding:8px 18px;background:var(--drex-primary);color:#fff;font-size:12px;font-weight:700;" onclick="demoCasesRunTimeline()">▶ Run Case Timeline</button>
      </div>
      ${_dfInfoGrid([
        ['Examiner', DF.operator],
        ['Organization', 'NTRO Forensic Unit'],
        ['Opened', _dfTs(0)],
        ['Status', '<span class="badge badge-pass">ACTIVE</span>', true],
        ['Operations', '3 completed'],
        ['Evidence', '5 items sealed'],
      ])}
    </div>

    <div id="dfCaseTimeline" style="display:none;" class="mt-12"></div>
  `;
}

function demoCasesRunTimeline() {
  const el = document.getElementById('dfCaseTimeline');
  if (!el) return;
  el.style.display = 'block';
  _dfResetAnim();
  const events = DF_AUDIT_EVENTS;
  let shown = 0;
  el.innerHTML = `
    <div class="card">
      <div class="section-label">CASE TIMELINE</div>
      <div id="dfTimelineBody" style="margin-top:10px;"></div>
    </div>
    <div id="dfCaseSummary" style="display:none;" class="mt-12"></div>
  `;
  function tick() {
    const body = document.getElementById('dfTimelineBody');
    if (body && shown < events.length) {
      const e = events[shown];
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--drex-border-subtle);animation:pres-fade-in .25s ease;';
      div.innerHTML = `
        <div style="min-width:70px;font-family:var(--drex-font-mono);font-size:11px;color:var(--drex-text-muted);padding-top:1px;">${e.ts}</div>
        <div style="min-width:10px;"><span style="color:var(--drex-status-pass);font-weight:900;">✓</span></div>
        <div>
          <div style="font-size:12px;font-weight:700;">${_E(e.event)}</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">${_E(e.detail)}</div>
          <div style="font-size:10px;color:var(--drex-text-subtle);margin-top:1px;">Actor: ${_E(e.actor)}</div>
        </div>`;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      shown++;
      DF._animTimer = setTimeout(tick, 350);
    } else {
      const summary = document.getElementById('dfCaseSummary');
      if (summary) {
        summary.style.display = 'block';
        summary.innerHTML = `<div class="card" style="border-left:3px solid var(--drex-status-pass);">
          <div class="section-label">CASE COMPLETE</div>
          <div class="pres-metrics-grid mt-6">
            ${_dfMetric('EVENTS', String(events.length), 'var(--drex-primary)')}
            ${_dfMetric('OPERATIONS', '3', 'var(--drex-status-pass)')}
            ${_dfMetric('EVIDENCE', '5 items', 'var(--drex-status-pass)')}
            ${_dfMetric('CERTIFICATE', 'Issued', 'var(--drex-status-pass)')}
          </div>
          <div style="margin-top:10px;text-align:center;"><span class="badge badge-pass" style="font-size:13px;padding:6px 20px;">CASE LIFECYCLE COMPLETE</span></div>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-main);" onclick="demoCasesViewCert()">📜 View Certificate</button>
            <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoCases()">↻ Reset</button>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>
        </div>`;
      }
    }
  }
  tick();
}

function demoCasesViewCert() { _dfShowCertModal('Case Lifecycle Certificate', DF.jobFile, DF_TARGET.path, 'M08/M02/M17', 'COMPLETE'); }

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SANITIZATION PLANNER DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoPlanner() {
  _dfResetAnim(); DF.active = true; DF.module = 'planner';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Sanitization Planner', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">IDLE</span>')}

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">TARGET INTELLIGENCE</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Path', DF_DEVICE.path],
          ['Capacity', DF_DEVICE.capacity],
          ['Bus Type', DF_DEVICE.bus],
          ['Filesystem', DF_DEVICE.fs],
          ['Serial', DF_DEVICE.serial],
          ['Health', DF_DEVICE.health],
          ['Partitions', String(DF_DEVICE.partitions)],
        ])}
      </div>
      <div class="card">
        <div class="section-label">DEVICE INTELLIGENCE</div>
        <div style="margin-top:6px;">
          ${_dfCheck('Bus topology: USB Mass Storage')}
          ${_dfCheck('Media type: Flash / NAND')}
          ${_dfCheck('TRIM support: Not applicable (USB bridge)', false)}
          ${_dfCheck('ATA Secure Erase: Blocked (USB bridge)', false)}
          ${_dfCheck('NVMe Sanitize: Not applicable', false)}
          ${_dfCheck('Software overwrite: Compatible')}
          ${_dfCheck('Multi-pass strategy: Available')}
          ${_dfCheck('Full-surface readback: Available')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">SAFETY ANALYSIS</div>
        <div style="margin-top:6px;">
          ${_dfCheck('System disk protection — NOT triggered')}
          ${_dfCheck('Boot disk protection — NOT triggered')}
          ${_dfCheck('Protected path check — CLEAR')}
          ${_dfCheck('Target boundary validation — PASS')}
          ${_dfCheck('Hardware compatibility — VERIFIED')}
          ${_dfCheck('Case binding — ' + DF.caseId)}
          ${_dfCheck('Two-Man authorization — REQUIRED')}
        </div>
      </div>
    </div>

    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div class="section-label" style="margin-bottom:0;">METHOD ANALYSIS</div>
        <button class="action-btn" style="width:auto;padding:6px 16px;background:var(--drex-primary);color:#fff;font-size:11px;font-weight:700;" onclick="demoPlannerAnalyze()">▶ Analyze &amp; Recommend</button>
      </div>
      ${_dfTable(
        ['ID', 'Method', 'Compatibility', 'Verification', 'Status'],
        [
          ['<strong>M01</strong>', 'NIST SP 800-88 Policy Engine', '<span class="badge badge-pass">COMPATIBLE</span>', 'Policy-driven', '<span class="badge badge-neutral">AVAILABLE</span>'],
          ['<strong>M02</strong>', 'Smart Sanitization', '<span class="badge badge-pass">★ RECOMMENDED</span>', 'Full surface readback', '<span class="badge badge-pass">RECOMMENDED</span>'],
          ['<strong>M03</strong>', 'Device-Native Sanitize', '<span class="badge badge-fail">BLOCKED</span>', 'Firmware command', '<span class="badge badge-fail">USB BRIDGE</span>'],
          ['<strong>M04</strong>', 'ATA Secure Erase', '<span class="badge badge-fail">BLOCKED</span>', 'ATA Security Cmd', '<span class="badge badge-fail">NOT SATA</span>'],
          ['<strong>M05</strong>', 'NVMe Secure Erase', '<span class="badge badge-fail">BLOCKED</span>', 'NVMe Sanitize', '<span class="badge badge-fail">NOT NVME</span>'],
          ['<strong>M06</strong>', 'IEEE 2883 Purge', '<span class="badge badge-pass">COMPATIBLE</span>', 'Standard purge', '<span class="badge badge-neutral">AVAILABLE</span>'],
          ['<strong>M07</strong>', 'Verified Overwrite', '<span class="badge badge-pass">COMPATIBLE</span>', 'Multi-pass + verify', '<span class="badge badge-neutral">AVAILABLE</span>'],
        ]
      )}
    </div>

    <div id="dfPlannerResult" style="display:none;" class="mt-12"></div>
  `;
}

function demoPlannerAnalyze() {
  const el = document.getElementById('dfPlannerResult');
  if (!el) return;
  el.style.display = 'block';
  _dfResetAnim();
  DF._logLines = [];
  el.innerHTML = `
    <div class="pres-2col">
      <div class="card" style="border-left:3px solid var(--drex-primary);">
        <div class="section-label">RECOMMENDATION ENGINE</div>
        <div style="margin-top:10px;text-align:center;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.1em;color:var(--drex-text-muted);">RECOMMENDED METHOD</div>
          <div style="font-size:22px;font-weight:900;color:var(--drex-primary);margin:8px 0;">M02</div>
          <div style="font-size:14px;font-weight:700;">Smart Sanitization</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">Auto-selected multi-tier evaluation for optimal compliance</div>
        </div>
        ${_dfInfoGrid([
          ['Algorithm', 'Auto-Selected Multi-Tier'],
          ['Passes', 'Auto (policy-driven)'],
          ['Verification', 'Full surface readback'],
          ['Throughput', '~48 MB/s estimated'],
          ['Est. Duration', '~20 min for 57.3 GB'],
        ])}
      </div>
      <div class="card">
        <div class="section-label">ANALYSIS LOG</div>
        <div id="dfPlannerLog" class="pres-log mt-6"></div>
      </div>
    </div>
    <div id="dfPlanReady" style="display:none;" class="card mt-12" style="border-left:3px solid var(--drex-status-pass);">
    </div>
  `;
  const logLines = [
    'Target device detected: SanDisk Ultra USB Device',
    'Bus topology: USB Mass Storage',
    'Media type: Flash / NAND (inferred)',
    'ATA Secure Erase: BLOCKED (USB bridge present)',
    'NVMe Sanitize: NOT APPLICABLE',
    'Firmware sanitize: NOT SUPPORTED (USB bridge)',
    'Software overwrite strategy: ELIGIBLE',
    'Multi-tier evaluation: M02 Smart Sanitization selected',
    'Safety gates: All clear',
    'Plan ID: ' + DF.planId + ' generated',
    'Status: PLAN READY — awaiting authorization',
  ];
  let i = 0;
  function tick() {
    if (i < logLines.length) {
      DF._logLines.push(`[${_dfTs(i * 0.8)}]  ${logLines[i]}`);
      const logEl = document.getElementById('dfPlannerLog');
      if (logEl) { logEl.innerHTML = DF._logLines.map(l => `<div>${_E(l)}</div>`).join(''); logEl.scrollTop = logEl.scrollHeight; }
      i++;
      DF._animTimer = setTimeout(tick, 400);
    } else {
      const ready = document.getElementById('dfPlanReady');
      if (ready) {
        ready.style.display = 'block';
        ready.style.borderLeft = '3px solid var(--drex-status-pass)';
        ready.innerHTML = `<div class="section-label">GENERATED PLAN</div>
          ${_dfInfoGrid([
            ['Plan ID', DF.planId],
            ['Target', DF_DEVICE.model + ' (' + DF_DEVICE.path + ')'],
            ['Method', 'M02 — Smart Sanitization'],
            ['Verification', 'Full surface readback'],
            ['Safety', '<span class="badge badge-pass">ALL GATES CLEAR</span>', true],
            ['Authorization', '<span class="badge badge-warn">TWO-MAN RULE REQUIRED</span>', true],
            ['Status', '<span class="badge badge-pass">PLAN READY</span>', true],
          ])}
          <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="action-btn" style="width:auto;padding:7px 18px;background:var(--drex-primary);color:#fff;font-size:12px;font-weight:700;" onclick="navigateTo('drive_eraser')">→ Proceed to Drive Eraser</button>
            <button class="action-btn" style="width:auto;padding:7px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoPlanner()">↻ Reset</button>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>`;
      }
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FILE & FOLDER ERASER — delegates to existing presRenderFileEraser()
// ═══════════════════════════════════════════════════════════════════════════════

function demoFileEraser() {
  if (typeof presRenderFileEraser === 'function') {
    presRenderFileEraser();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DRIVE ERASER — delegates to existing presRenderDriveSanitization()
// ═══════════════════════════════════════════════════════════════════════════════

function demoDriveEraser() {
  if (typeof presRenderDriveSanitization === 'function') {
    presRenderDriveSanitization();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ACTIVE OPERATIONS DEMO
// ═══════════════════════════════════════════════════════════════════════════════

const DF_JOBS = [
  { id: 'JOB-DEMO-8F4A91', type: 'File Sanitization',  target: DF_TARGET.short,    method: 'M08', status: 'COMPLETE', pct: 100, elapsed: '00:08.42', throughput: '2.91 MB/s' },
  { id: 'SAN-DEMO-74A821', type: 'Drive Sanitization', target: DF_DEVICE.model,    method: 'M02', status: 'COMPLETE', pct: 100, elapsed: '19:47.12', throughput: '48.2 MB/s' },
  { id: 'REC-DEMO-74B812', type: 'Forensic Recovery',  target: DF_DEVICE.model,    method: 'M17', status: 'COMPLETE', pct: 100, elapsed: '00:06.14', throughput: '—' },
];

function demoActiveOps() {
  _dfResetAnim(); DF.active = true; DF.module = 'active_ops';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Active Operations', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">MONITORING</span>')}

    <div class="pres-metrics-grid mt-12">
      ${_dfMetric('TOTAL JOBS', '3', 'var(--drex-primary)')}
      ${_dfMetric('COMPLETED', '3 / 3', 'var(--drex-status-pass)')}
      ${_dfMetric('RUNNING', '0', 'var(--drex-text-muted)')}
      ${_dfMetric('FAILED', '0', 'var(--drex-status-pass)')}
    </div>

    <div class="mt-12">
      ${DF_JOBS.map(j => `
        <div class="card" style="margin-bottom:10px;border-left:3px solid var(--drex-status-pass);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-family:var(--drex-font-mono);font-size:13px;font-weight:700;">${j.id}</div>
              <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">${_E(j.type)} · ${_E(j.target)} · Method ${j.method}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="font-size:11px;color:var(--drex-text-muted);">${j.elapsed}</span>
              <span class="badge badge-pass">${j.status}</span>
            </div>
          </div>
          <div class="pres-progress-bar-wrap" style="margin-top:8px;">
            <div class="pres-progress-track"><div class="pres-progress-fill" style="width:${j.pct}%;"></div></div>
          </div>
          <div style="margin-top:6px;display:flex;gap:16px;font-size:10px;color:var(--drex-text-muted);">
            <span>Progress: <strong style="color:var(--drex-status-pass);">${j.pct}%</strong></span>
            <span>Throughput: <strong>${j.throughput}</strong></span>
          </div>
          <button class="action-btn" style="width:auto;padding:4px 12px;font-size:11px;margin-top:8px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-main);" onclick="demoActiveOpsDetail('${j.id}')">View Details →</button>
        </div>
      `).join('')}
    </div>

    <div id="dfActiveDetail" style="display:none;" class="mt-12"></div>
  `;
}

function demoActiveOpsDetail(jobId) {
  const job = DF_JOBS.find(j => j.id === jobId);
  if (!job) return;
  const el = document.getElementById('dfActiveDetail');
  if (!el) return;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth' });
  const stages = ['Job Dispatched','Target Validated','Method Applied','Overwrite Complete','Readback Verification','Audit Recorded','Certificate Generated'];
  el.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-primary);">
      <div class="section-label">JOB DETAIL — ${_E(job.id)}</div>
      <div class="pres-3col mt-10">
        <div>
          ${_dfInfoGrid([
            ['Job ID', job.id],
            ['Type', job.type],
            ['Target', job.target],
            ['Method', job.method],
            ['Elapsed', job.elapsed],
            ['Throughput', job.throughput],
            ['Status', '<span class="badge badge-pass">' + job.status + '</span>', true],
          ])}
        </div>
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.07em;color:var(--drex-text-muted);margin-bottom:6px;">EXECUTION TIMELINE</div>
          ${_dfPipeline(stages.map(t => ({title:t, done:'Completed', active:'In progress'})), stages.length)}
        </div>
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.07em;color:var(--drex-text-muted);margin-bottom:6px;">OPERATION LOG</div>
          ${_dfLog([
            `[${_dfTs(0)}]  Job ${job.id} dispatched`,
            `[${_dfTs(1)}]  Target validated: ${job.target}`,
            `[${_dfTs(2)}]  Method: ${job.method} loaded`,
            `[${_dfTs(3)}]  Processing started`,
            `[${_dfTs(5)}]  50% complete`,
            `[${_dfTs(7)}]  100% complete — verifying`,
            `[${_dfTs(8)}]  Readback: PASS`,
            `[${_dfTs(8)}]  Audit updated · Certificate ready`,
          ])}
        </div>
      </div>
      <div style="margin-top:10px;">${_dfDisc()}</div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. FORENSIC RECOVERY — delegates to existing presRenderRecovery()
// ═══════════════════════════════════════════════════════════════════════════════

function demoRecovery() {
  if (typeof presRenderRecovery === 'function') {
    presRenderRecovery();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. RAW FILE CARVING DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoCarving() {
  _dfResetAnim(); DF.active = true; DF.module = 'carving';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Raw File Carving', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">IDLE</span>')}

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">CARVING TARGET</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Path', DF_DEVICE.path],
          ['Capacity', DF_DEVICE.capacity],
          ['Bus', DF_DEVICE.bus],
          ['Filesystem', DF_DEVICE.fs],
          ['Scan Mode', 'Full Surface'],
        ])}
      </div>
      <div class="card">
        <div class="section-label">SIGNATURE DATABASE</div>
        <div style="margin-top:6px;">
          ${DF_SIGS.map(s => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--drex-border-subtle);font-size:12px;">
            <div><strong>${_E(s.type)}</strong> <code style="font-size:10px;">${_E(s.magic)}</code></div>
            <span class="badge badge-pass">${s.count}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">CARVING ENGINE CONFIG</div>
        <div style="margin-top:6px;">
          ${_dfCheck('Magic-byte header detection')}
          ${_dfCheck('Footer / EOF boundary detection')}
          ${_dfCheck('Unallocated region scanning')}
          ${_dfCheck('Header/footer correlation')}
          ${_dfCheck('Partial file extraction')}
          ${_dfCheck('Fragmentation detection')}
        </div>
      </div>
    </div>

    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" onclick="demoCarvingRun()">▶ Start Surface Carving</button>
      <span style="font-size:11px;color:var(--drex-text-muted);">7 signature types · Full surface scan · ${DF_DEVICE.capacity}</span>
    </div>

    <div id="dfCarvingDashboard" style="display:none;" class="mt-12"></div>
  `;
}

function demoCarvingRun() {
  const dash = document.getElementById('dfCarvingDashboard');
  if (!dash) return;
  dash.style.display = 'block';
  _dfResetAnim();
  const STAGES = [
    { title:'Target Lock',       done:'Device handle acquired',     active:'Acquiring device handle…'   },
    { title:'Sector Analysis',   done:'120.1M sectors scanned',     active:'Scanning sector table…'     },
    { title:'Signature Scan',    done:'3,912 signatures detected',  active:'Matching magic bytes…'      },
    { title:'Header Detection',  done:'All header types validated', active:'Correlating boundaries…'    },
    { title:'Candidate Extract', done:'17 candidates extracted',    active:'Extracting candidates…'     },
    { title:'Classification',    done:'13 extractable / 4 partial', active:'Classifying results…'      },
  ];
  const LOG = [
    [0,'Device handle: ' + DF_DEVICE.path],
    [0,'Scan mode: Full surface — ' + DF_DEVICE.capacity],
    [1,'Sector analysis started'],
    [2,'120,125,440 total sectors'],
    [2,'21,713,152 unallocated sectors'],
    [3,'3,912 signatures in unallocated regions'],
    [4,'PDF: 4 · JPEG: 3 · PNG: 2 · Office: 4 · SQLite: 2 · PCAP: 1 · other: 1'],
    [5,'Header boundary correlation complete'],
    [6,'17 extraction candidates identified'],
    [7,'Candidate extraction complete: 13 full + 4 partial'],
  ];
  const TOTAL = 9;
  let step = 0;
  dash.innerHTML = `
    <div class="card pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div><div class="section-label" style="margin-bottom:2px;">CARVING ENGINE — ACTIVE</div>
        <div style="font-size:15px;font-weight:800;">Raw Surface Carving — ${DF_DEVICE.capacity}</div></div>
        <span id="dfCarvBadge" class="badge badge-running">EXECUTING</span>
      </div>
    </div>
    ${_dfBar('dfCarv', 0)}
    <div class="pres-3col mt-12">
      <div class="card"><div class="section-label">CARVING PIPELINE</div><div id="dfCarvPipeline" style="margin-top:6px;"></div></div>
      <div class="card"><div class="section-label">LIVE METRICS</div><div id="dfCarvMetrics" class="pres-metrics-grid mt-6"></div></div>
      <div class="card"><div class="section-label">CARVING LOG</div><div id="dfCarvLog" class="pres-log mt-6"></div></div>
    </div>
    <div id="dfCarvResults" style="display:none;" class="mt-12"></div>
  `;
  function tick() {
    const stageIdx = [0,0,1,1,2,3,4,4,5,5][step] ?? 5;
    const pct = Math.round((step / TOTAL) * 100);
    const barEl = document.getElementById('dfCarvBar');
    const pctEl = document.getElementById('dfCarvPct');
    if (barEl) barEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    const pip = document.getElementById('dfCarvPipeline');
    if (pip) pip.innerHTML = _dfPipeline(STAGES, stageIdx);
    const metrics = document.getElementById('dfCarvMetrics');
    if (metrics) metrics.innerHTML =
      _dfMetric('SECTORS SCANNED', step > 1 ? '120.1M' : '—', 'var(--drex-primary)') +
      _dfMetric('SIGNATURES', step > 2 ? '3,912' : '—', 'var(--drex-primary)') +
      _dfMetric('CANDIDATES', step > 4 ? '17' : '—', 'var(--drex-text-main)') +
      _dfMetric('PROGRESS', pct + '%', 'var(--drex-primary)');
    LOG.filter(e => e[0] === step).forEach(e => { DF._logLines.push(`[${_dfTs(step*1.5)}]  ${e[1]}`); });
    const logEl = document.getElementById('dfCarvLog');
    if (logEl) { logEl.innerHTML = DF._logLines.map(l => `<div>${_E(l)}</div>`).join(''); logEl.scrollTop = logEl.scrollHeight; }
    step++;
    if (step <= TOTAL) {
      DF._animTimer = setTimeout(tick, 520);
    } else {
      const badge = document.getElementById('dfCarvBadge');
      if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      if (barEl) barEl.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      _demoCarvingResults();
    }
  }
  tick();
}

function _demoCarvingResults() {
  const el = document.getElementById('dfCarvResults');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-status-pass);">
      <div class="section-label">CARVING RESULTS — 17 CANDIDATES</div>
      ${_dfTable(
        ['File', 'Type', 'Size', 'Offset', 'Confidence', 'Fragment', 'Status'],
        DF_CANDIDATES.map(c => [
          _E(c.file), c.type, c.size, `<code style="font-size:10px;">${c.offset}</code>`,
          `<span style="font-weight:700;color:var(--drex-status-pass);">${c.conf}%</span>`,
          c.frag, '<span class="badge badge-pass">RECOVERABLE</span>'
        ]).concat([
          ['system_dump.bin','BIN','1.6 MB','<code style="font-size:10px;">0x01D20A00</code>','<span style="font-weight:700;color:#d97706;">68%</span>','High','<span class="badge badge-warn">PARTIAL</span>'],
          ['encrypted_archive.7z','7Z','4.3 MB','<code style="font-size:10px;">0x01EA0C00</code>','<span style="font-weight:700;color:#d97706;">65%</span>','High','<span class="badge badge-warn">PARTIAL</span>'],
        ])
      )}
      <div style="margin-top:12px;display:flex;gap:8px;border-top:1px solid var(--drex-border-subtle);padding-top:12px;">
        <button class="action-btn pres-exec-btn" style="width:auto;padding:7px 18px;font-size:12px;" onclick="navigateTo('recovery')">→ Open Recovery Engine</button>
        <button class="action-btn" style="width:auto;padding:7px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoCarving()">↻ Reset</button>
      </div>
      <div style="margin-top:8px;">${_dfDisc()}</div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. FRAGMENT RECOVERY DEMO
// ═══════════════════════════════════════════════════════════════════════════════

const DF_FRAGS = [
  { id:'FR01', file:'source_archive.zip',    segs:3, sz:'3.7 MB', status:'RECONSTRUCTED' },
  { id:'FR02', file:'system_dump.bin',       segs:4, sz:'1.6 MB', status:'RECONSTRUCTED' },
  { id:'FR03', file:'network_capture.pcap',  segs:2, sz:'6.2 MB', status:'RECONSTRUCTED' },
  { id:'FR04', file:'encrypted_archive.7z',  segs:3, sz:'4.3 MB', status:'RECONSTRUCTED' },
  { id:'FR05', file:'registry_hive.reg',     segs:2, sz:'0.3 MB', status:'RECONSTRUCTED' },
  { id:'FR06', file:'vm_snapshot.vmdk',      segs:5, sz:'9.4 MB', status:'PARTIAL',      },
];

function demoFragments() {
  _dfResetAnim(); DF.active = true; DF.module = 'fragments';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Fragment Recovery', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">IDLE</span>')}

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">FRAGMENT ANALYSIS SOURCE</div>
        ${_dfInfoGrid([
          ['Source', DF_DEVICE.model],
          ['Path', DF_DEVICE.path],
          ['Candidates', '17'],
          ['Fragmented', '6'],
          ['Reconstructable', '5'],
        ])}
        <div class="pres-metrics-grid mt-10">
          ${_dfMetric('CANDIDATES', '17', 'var(--drex-primary)')}
          ${_dfMetric('FRAGMENTED', '6', 'var(--drex-status-warn)')}
          ${_dfMetric('RECONSTRUCTABLE', '5', 'var(--drex-status-pass)')}
          ${_dfMetric('CONTIGUOUS', '11', 'var(--drex-text-main)')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">FRAGMENT MAP</div>
        <div style="margin-top:6px;">
          ${DF_FRAGS.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--drex-border-subtle);">
            <div>
              <div style="font-size:12px;font-weight:700;">${_E(f.file)}</div>
              <div style="font-size:10px;color:var(--drex-text-muted);">${f.segs} segments · ${f.sz}</div>
            </div>
            <span class="badge ${f.status === 'RECONSTRUCTED' ? 'badge-neutral' : 'badge-warn'}">${f.status === 'RECONSTRUCTED' ? 'MAPPED' : 'PARTIAL'}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">RECONSTRUCTION ENGINE</div>
        <div style="margin-top:6px;">
          ${_dfCheck('Cluster chain analysis')}
          ${_dfCheck('Sector adjacency mapping')}
          ${_dfCheck('Header boundary detection')}
          ${_dfCheck('Content continuity analysis')}
          ${_dfCheck('Entropy transition mapping')}
          ${_dfCheck('Sequence ordering validation')}
        </div>
      </div>
    </div>

    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" onclick="demoFragmentsRun()">▶ Start Reconstruction</button>
      <span style="font-size:11px;color:var(--drex-text-muted);">6 fragmented files · 19 total segments · 5 reconstructable</span>
    </div>
    <div id="dfFragDash" style="display:none;" class="mt-12"></div>
  `;
}

function demoFragmentsRun() {
  const dash = document.getElementById('dfFragDash');
  if (!dash) return;
  dash.style.display = 'block';
  _dfResetAnim();
  const STAGES = [
    { title:'Fragment Discovery',   done:'19 segments mapped',          active:'Mapping fragment table…' },
    { title:'Group Formation',      done:'5 groups identified',         active:'Grouping by file signature…' },
    { title:'Sequence Analysis',    done:'Ordering validated',          active:'Analysing sequence order…' },
    { title:'Reconstruction',       done:'5/5 files reconstructed',     active:'Reassembling segments…' },
    { title:'Integrity Verification',done:'SHA-256 verified',           active:'Verifying integrity…' },
  ];
  const LOG = [
    [0,'Fragment discovery started — 17 candidates'],
    [1,'6 fragmented files identified (14 contiguous skipped)'],
    [2,'19 non-contiguous segments mapped'],
    [3,'Entropy transition mapping complete'],
    [4,'[1/5] source_archive.zip — 3 segments → reassembled'],
    [4,'[2/5] system_dump.bin — 4 segments → reassembled'],
    [5,'[3/5] network_capture.pcap — 2 segments → reassembled'],
    [6,'[4/5] encrypted_archive.7z — 3 segments → reassembled'],
    [7,'[5/5] registry_hive.reg — 2 segments → reassembled'],
    [8,'vm_snapshot.vmdk — 5 segments — PARTIAL (corrupt footer)'],
    [9,'Integrity verification: SHA-256 — 5/5 PASS'],
  ];
  const TOTAL = 10;
  let step = 0;
  dash.innerHTML = `
    <div class="card pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div><div class="section-label" style="margin-bottom:2px;">RECONSTRUCTION ENGINE — ACTIVE</div>
        <div style="font-size:15px;font-weight:800;">Fragment Reassembly — 6 Files, 19 Segments</div></div>
        <span id="dfFragBadge" class="badge badge-running">EXECUTING</span>
      </div>
    </div>
    ${_dfBar('dfFrag', 0)}
    <div class="pres-3col mt-12">
      <div class="card"><div class="section-label">RECONSTRUCTION PIPELINE</div><div id="dfFragPipeline" style="margin-top:6px;"></div></div>
      <div class="card"><div class="section-label">LIVE METRICS</div><div id="dfFragMetrics" class="pres-metrics-grid mt-6"></div></div>
      <div class="card"><div class="section-label">RECONSTRUCTION LOG</div><div id="dfFragLog" class="pres-log mt-6"></div></div>
    </div>
    <div id="dfFragResults" style="display:none;" class="mt-12"></div>
  `;
  function tick() {
    const stageIdx = [0,0,1,2,2,3,3,3,3,4,4][step] ?? 4;
    const pct = Math.round((step / TOTAL) * 100);
    const barEl = document.getElementById('dfFragBar'); if (barEl) barEl.style.width = pct + '%';
    const pctEl = document.getElementById('dfFragPct'); if (pctEl) pctEl.textContent = pct + '%';
    const pip = document.getElementById('dfFragPipeline'); if (pip) pip.innerHTML = _dfPipeline(STAGES, stageIdx);
    const reconstructed = Math.min(5, Math.round(step > 3 ? (step - 3) * 1.5 : 0));
    const metrics = document.getElementById('dfFragMetrics');
    if (metrics) metrics.innerHTML =
      _dfMetric('SEGMENTS', step > 1 ? '19' : '—', 'var(--drex-primary)') +
      _dfMetric('GROUPS', step > 1 ? '5' : '—', 'var(--drex-text-main)') +
      _dfMetric('RECONSTRUCTED', reconstructed + ' / 5', reconstructed === 5 ? 'var(--drex-status-pass)' : 'var(--drex-text-main)') +
      _dfMetric('INTEGRITY', step >= TOTAL ? 'PASS' : '—', 'var(--drex-status-pass)');
    LOG.filter(e => e[0] === step).forEach(e => { DF._logLines.push(`[${_dfTs(step * 0.9)}]  ${e[1]}`); });
    const logEl = document.getElementById('dfFragLog');
    if (logEl) { logEl.innerHTML = DF._logLines.map(l => `<div>${_E(l)}</div>`).join(''); logEl.scrollTop = logEl.scrollHeight; }
    step++;
    if (step <= TOTAL) {
      DF._animTimer = setTimeout(tick, 500);
    } else {
      const badge = document.getElementById('dfFragBadge'); if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      _demoFragResults();
    }
  }
  tick();
}

function _demoFragResults() {
  const el = document.getElementById('dfFragResults');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="pres-2col">
      <div class="card" style="border-left:3px solid var(--drex-status-pass);">
        <div class="section-label">RECONSTRUCTION RESULTS</div>
        ${_dfTable(
          ['ID', 'File', 'Segments', 'Size', 'Status'],
          DF_FRAGS.map(f => [
            f.id, _E(f.file), String(f.segs), f.sz,
            f.status === 'RECONSTRUCTED'
              ? '<span class="badge badge-pass">RECONSTRUCTED</span>'
              : '<span class="badge badge-warn">PARTIAL</span>'
          ])
        )}
      </div>
      <div class="card" style="border-left:3px solid var(--drex-status-pass);">
        <div class="section-label">VERIFICATION</div>
        <div style="margin-top:6px;">
          ${_dfCheck('5 / 5 files reconstructed')}
          ${_dfCheck('14 contiguous + 5 fragmented processed')}
          ${_dfCheck('SHA-256 hash verified for all 5')}
          ${_dfCheck('1 partial file documented (vmdk)')}
        </div>
        <div class="pres-verdict-block mt-10">
          <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">PASS</div>
          <div style="font-size:10px;color:var(--drex-text-muted);margin-top:2px;">5 / 5 FILES RECONSTRUCTED</div>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoFragments()">↻ Reset</button>
        </div>
        <div style="margin-top:8px;">${_dfDisc()}</div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. DAMAGED MEDIA DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoDamagedMedia() {
  _dfResetAnim(); DF.active = true; DF.module = 'damaged_media';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Damaged Media Recovery', DF.caseId, null, '<span class="badge badge-warn" style="font-size:10px;">PARTIAL READ</span>')}

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">MEDIA HEALTH ANALYSIS</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Path', DF_DEVICE.path],
          ['Capacity', DF_DEVICE.capacity],
          ['Readability', '<span class="badge badge-warn">PARTIAL (99.76%)</span>', true],
          ['Bad Regions', '<span class="badge badge-fail">DETECTED</span>', true],
          ['Strategy', 'Adaptive Multi-Pass'],
        ])}
      </div>
      <div class="card">
        <div class="section-label">SECTOR MAP</div>
        <div class="pres-metrics-grid mt-6">
          ${_dfMetric('TOTAL SECTORS', '120,125,440', 'var(--drex-primary)')}
          ${_dfMetric('READABLE', '119,842,112', 'var(--drex-status-pass)')}
          ${_dfMetric('BAD SECTORS', '283,328', 'var(--drex-status-fail)')}
          ${_dfMetric('READABILITY', '99.76%', 'var(--drex-status-pass)')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">READABLE REGIONS</div>
        <div style="margin-top:6px;">
          ${_dfCheck('0x00000000–0x0E200000 · 226 MB · READABLE')}
          ${_dfCheck('0x0E200000–0x0E400000 · 2 MB · BAD', false)}
          ${_dfCheck('0x0E400000–0x38C00000 · 680 MB · READABLE')}
          ${_dfCheck('0x38C00000–0x39000000 · 4 MB · BAD', false)}
          ${_dfCheck('0x39000000–END · remainder · READABLE')}
        </div>
      </div>
    </div>

    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" onclick="demoDamagedMediaRun()">▶ Start Adaptive Recovery</button>
      <span style="font-size:11px;color:var(--drex-text-muted);">283,328 bad sectors · Adaptive multi-pass retry strategy</span>
    </div>
    <div id="dfDmgDash" style="display:none;" class="mt-12"></div>
  `;
}

function demoDamagedMediaRun() {
  const dash = document.getElementById('dfDmgDash');
  if (!dash) return;
  dash.style.display = 'block';
  _dfResetAnim();
  const STAGES = [
    { title:'Media Identification',    done:'Device identified',                 active:'Identifying device…' },
    { title:'Sector Mapping',          done:'120.1M sectors mapped',             active:'Mapping readable regions…' },
    { title:'Pass 1 — Standard Read', done:'99.64% sectors readable',           active:'Standard read pass…' },
    { title:'Pass 2 — Reduced Speed', done:'+1,024 sectors recovered',          active:'Reduced speed retry…' },
    { title:'Pass 3 — Sector-by-Sector', done:'+512 additional sectors',        active:'Sector-by-sector retry…' },
    { title:'Candidate Extraction',   done:'5 candidates extracted',            active:'Extracting candidates…' },
    { title:'Integrity Verification', done:'SHA-256 verified',                  active:'Verifying integrity…' },
  ];
  const LOG = [
    [0,'Media identification: ' + DF_DEVICE.model],
    [1,'Sector map: 120,125,440 total sectors'],
    [2,'Pass 1: Standard read — 119,557,760 sectors readable'],
    [3,'Pass 2: Reduced speed retry — 283,328 bad sectors'],
    [4,'Pass 2 result: +1,024 sectors recovered'],
    [5,'Pass 3: Sector-by-sector — +512 more sectors'],
    [6,'Final readable: 119,842,112 / 120,125,440 (99.76%)'],
    [7,'Candidate extraction started — 5 recoverable files'],
    [8,'5/5 candidates extracted'],
    [9,'Integrity: SHA-256 verified for all 5'],
  ];
  const TOTAL = 10;
  let step = 0;
  dash.innerHTML = `
    <div class="card pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div><div class="section-label" style="margin-bottom:2px;">DAMAGED MEDIA RECOVERY — ACTIVE</div>
        <div style="font-size:15px;font-weight:800;">Adaptive Multi-Pass Recovery</div></div>
        <span id="dfDmgBadge" class="badge badge-running">EXECUTING</span>
      </div>
    </div>
    ${_dfBar('dfDmg', 0)}
    <div class="pres-3col mt-12">
      <div class="card"><div class="section-label">RECOVERY PIPELINE</div><div id="dfDmgPipeline" style="margin-top:6px;"></div></div>
      <div class="card"><div class="section-label">LIVE METRICS</div><div id="dfDmgMetrics" class="pres-metrics-grid mt-6"></div></div>
      <div class="card"><div class="section-label">RECOVERY LOG</div><div id="dfDmgLog" class="pres-log mt-6"></div></div>
    </div>
    <div id="dfDmgResults" style="display:none;" class="mt-12"></div>
  `;
  function tick() {
    const stageIdx = [0,1,2,2,3,4,4,5,5,6,6][step] ?? 6;
    const pct = Math.round((step / TOTAL) * 100);
    const barEl = document.getElementById('dfDmgBar'); if (barEl) barEl.style.width = pct + '%';
    const pctEl = document.getElementById('dfDmgPct'); if (pctEl) pctEl.textContent = pct + '%';
    const pip = document.getElementById('dfDmgPipeline'); if (pip) pip.innerHTML = _dfPipeline(STAGES, stageIdx);
    const metrics = document.getElementById('dfDmgMetrics');
    if (metrics) metrics.innerHTML =
      _dfMetric('READABILITY', step > 5 ? '99.76%' : step > 1 ? '99.64%' : '—', 'var(--drex-status-pass)') +
      _dfMetric('BAD SECTORS', step > 1 ? '283,328' : '—', 'var(--drex-status-fail)') +
      _dfMetric('RECOVERED', step > 4 ? '+1,536' : '—', 'var(--drex-status-warn)') +
      _dfMetric('CANDIDATES', step > 7 ? '5' : '—', 'var(--drex-status-pass)');
    LOG.filter(e => e[0] === step).forEach(e => { DF._logLines.push(`[${_dfTs(step * 1.2)}]  ${e[1]}`); });
    const logEl = document.getElementById('dfDmgLog');
    if (logEl) { logEl.innerHTML = DF._logLines.map(l => `<div>${_E(l)}</div>`).join(''); logEl.scrollTop = logEl.scrollHeight; }
    step++;
    if (step <= TOTAL) {
      DF._animTimer = setTimeout(tick, 550);
    } else {
      const badge = document.getElementById('dfDmgBadge'); if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      _demoDmgResults();
    }
  }
  tick();
}

function _demoDmgResults() {
  const el = document.getElementById('dfDmgResults');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="pres-2col">
      <div class="card" style="border-left:3px solid var(--drex-status-pass);">
        <div class="section-label">RECOVERY CANDIDATES</div>
        ${_dfTable(
          ['File', 'Type', 'Size', 'Confidence', 'Status'],
          DF_CANDIDATES.map(c => [
            _E(c.file), c.type, c.size,
            `<span style="font-weight:700;color:var(--drex-status-pass);">${c.conf}%</span>`,
            '<span class="badge badge-pass">RECOVERABLE</span>'
          ])
        )}
      </div>
      <div class="card">
        <div class="section-label">MEDIA RECOVERY REPORT</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Readability', '99.76%'],
          ['Bad Sectors', '283,328 mapped'],
          ['Recovered', '+1,536 sectors (passes 2+3)'],
          ['Candidates', '5 recoverable files'],
          ['Strategy', 'Adaptive 3-pass'],
          ['Integrity', '<span class="badge badge-pass">SHA-256 VERIFIED</span>', true],
        ])}
        <div class="pres-verdict-block mt-10">
          <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">PASS</div>
          <div style="font-size:10px;color:var(--drex-text-muted);margin-top:2px;">DAMAGED MEDIA RECOVERY COMPLETE</div>
        </div>
        <div style="margin-top:10px;">${_dfDisc()}</div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. EVIDENCE VAULT DEMO
// ═══════════════════════════════════════════════════════════════════════════════

const DF_EVIDENCE = [
  { id:'EV-DEMO-001', file:'project_report.pdf',    type:'PDF',    size:'2.4 MB', hash:'a7f3c9b2d8e1f4a6c9b2d8e1f4a6c9b2', integrity:'VALID' },
  { id:'EV-DEMO-002', file:'evidence_photo_01.jpg', type:'JPEG',   size:'4.8 MB', hash:'b2e4d1f3a6c9b2e4d1f3a6c9b2e4d1f3', integrity:'VALID' },
  { id:'EV-DEMO-003', file:'database_backup.db',    type:'SQLite', size:'8.2 MB', hash:'c8f1a6e4b3d2c8f1a6e4b3d2c8f1a6e4', integrity:'VALID' },
  { id:'EV-DEMO-004', file:'presentation.pptx',     type:'PPTX',   size:'5.1 MB', hash:'d4a7e2b1c9f3d4a7e2b1c9f3d4a7e2b1', integrity:'VALID' },
  { id:'EV-DEMO-005', file:'source_archive.zip',    type:'ZIP',    size:'3.7 MB', hash:'e9b3f5a2d8c6e9b3f5a2d8c6e9b3f5a2', integrity:'VALID' },
];

function demoVault() {
  _dfResetAnim(); DF.active = true; DF.module = 'vault';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Evidence Vault', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">SEALED</span>')}

    <div class="pres-2col mt-12">
      <div class="card" style="border-left:3px solid var(--drex-primary);">
        <div class="section-label">EVIDENCE COLLECTION</div>
        ${_dfInfoGrid([
          ['Case ID', DF.caseId],
          ['Evidence Items', '5'],
          ['Chain Status', '<span class="badge badge-pass">INTACT</span>', true],
          ['Hash Algorithm', 'SHA-256'],
          ['Sealed', _dfTs(0)],
          ['Examiner', DF.operator],
        ])}
        <button class="action-btn" style="width:auto;padding:7px 16px;background:var(--drex-primary);color:#fff;font-size:12px;font-weight:700;margin-top:12px;" onclick="demoVaultVerify()">▶ Verify Integrity Chain</button>
      </div>
      <div class="card">
        <div class="section-label">EVIDENCE INVENTORY</div>
        <div style="margin-top:6px;">
          ${DF_EVIDENCE.map(e => `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--drex-border-subtle);cursor:pointer;" onclick="demoVaultDetail('${e.id}')">
            <div>
              <div style="font-size:12px;font-weight:700;">${_E(e.file)}</div>
              <div style="font-size:10px;color:var(--drex-text-muted);">${e.id} · ${e.type} · ${e.size}</div>
            </div>
            <span class="badge badge-pass">${e.integrity}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div id="dfVaultDetail" style="display:none;" class="mt-12"></div>
    <div id="dfVaultVerify" style="display:none;" class="mt-12"></div>
  `;
}

function demoVaultDetail(evId) {
  const ev = DF_EVIDENCE.find(e => e.id === evId);
  if (!ev) return;
  const el = document.getElementById('dfVaultDetail');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-primary);">
      <div class="section-label">EVIDENCE DETAIL — ${_E(ev.id)}</div>
      <div class="pres-2col mt-10">
        <div>${_dfInfoGrid([
          ['Evidence ID', ev.id],
          ['Filename', ev.file],
          ['Type', ev.type],
          ['Size', ev.size],
          ['Case', DF.caseId],
          ['Recovery Job', DF.jobRec],
          ['Sealed', _dfTs(52*60)],
          ['Integrity', '<span class="badge badge-pass">' + ev.integrity + '</span>', true],
        ])}</div>
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.07em;color:var(--drex-text-muted);margin-bottom:6px;">SHA-256 HASH</div>
          <code style="font-size:10px;word-break:break-all;line-height:1.6;">${ev.hash}</code>
          <div style="margin-top:10px;">${_dfCheck('Hash computed at acquisition')}</div>
          <div>${_dfCheck('Hash verified against stored value')}</div>
          <div>${_dfCheck('No post-acquisition modification detected')}</div>
          <div style="margin-top:8px;">${_dfDisc()}</div>
        </div>
      </div>
    </div>
  `;
  el.scrollIntoView({ behavior: 'smooth' });
}

function demoVaultVerify() {
  const el = document.getElementById('dfVaultVerify');
  if (!el) return;
  el.style.display = 'block';
  _dfResetAnim();
  let verified = 0;
  el.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-status-pass);">
      <div class="section-label">INTEGRITY VERIFICATION — SHA-256 CHAIN</div>
      <div id="dfVaultVerItems" style="margin-top:8px;"></div>
      <div id="dfVaultVerResult" style="display:none;margin-top:12px;"></div>
    </div>
  `;
  function tick() {
    if (verified < DF_EVIDENCE.length) {
      const ev = DF_EVIDENCE[verified];
      const container = document.getElementById('dfVaultVerItems');
      if (container) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--drex-border-subtle);animation:pres-fade-in .2s ease;';
        row.innerHTML = `<div><div style="font-size:12px;font-weight:700;">${_E(ev.file)}</div>
          <div style="font-size:10px;color:var(--drex-text-muted);">SHA-256: ${ev.hash}</div></div>
          <span class="badge badge-pass">✓ VERIFIED</span>`;
        container.appendChild(row);
      }
      verified++;
      DF._animTimer = setTimeout(tick, 380);
    } else {
      const result = document.getElementById('dfVaultVerResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `<div class="pres-verdict-block">
          <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">EVIDENCE VERIFIED</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">5 / 5 items · SHA-256 chain intact · No tampering detected</div>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoVault()">↻ Reset</button>
        </div>
        <div style="margin-top:8px;">${_dfDisc()}</div>`;
      }
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. AUDIT TRAIL DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoAudit() {
  _dfResetAnim(); DF.active = true; DF.module = 'audit';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Audit Trail', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">SEALED</span>')}

    <div class="pres-2col mt-12">
      <div class="card">
        <div class="section-label">AUDIT CHAIN SUMMARY</div>
        ${_dfInfoGrid([
          ['Case', DF.caseId],
          ['Events', String(DF_AUDIT_EVENTS.length)],
          ['Chain Status', '<span class="badge badge-pass">VALID</span>', true],
          ['Chain Root', 'SHA-256: e4a7f3...b28c91'],
          ['Sealed', new Date().toISOString().slice(0,19).replace('T',' ')],
        ])}
        <button class="action-btn" style="width:auto;padding:7px 16px;background:var(--drex-primary);color:#fff;font-size:12px;font-weight:700;margin-top:12px;" onclick="demoAuditVerify()">▶ Verify Audit Chain</button>
      </div>
      <div class="card">
        <div class="section-label">AUDIT EVENT STREAM</div>
        <div style="margin-top:6px;max-height:400px;overflow-y:auto;">
          ${DF_AUDIT_EVENTS.map((e, i) => `
            <div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--drex-border-subtle);" onclick="demoAuditEventDetail(${i})" style="cursor:pointer;">
              <div style="min-width:68px;font-family:var(--drex-font-mono);font-size:10px;color:var(--drex-text-muted);">${e.ts}</div>
              <div style="color:var(--drex-status-pass);font-weight:900;font-size:11px;min-width:12px;">✓</div>
              <div>
                <div style="font-size:11px;font-weight:700;">${_E(e.event)}</div>
                <div style="font-size:10px;color:var(--drex-text-muted);">${_E(e.detail)}</div>
                <div style="font-size:9px;color:var(--drex-text-subtle);">actor: ${_E(e.actor)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div id="dfAuditDetail" style="display:none;" class="mt-12"></div>
    <div id="dfAuditVerify" style="display:none;" class="mt-12"></div>
  `;
}

function demoAuditEventDetail(idx) {
  const e = DF_AUDIT_EVENTS[idx];
  const el = document.getElementById('dfAuditDetail');
  if (!el || !e) return;
  el.style.display = 'block';
  el.innerHTML = `<div class="card" style="border-left:3px solid var(--drex-primary);">
    <div class="section-label">EVENT DETAIL — ${_E(e.event)}</div>
    ${_dfInfoGrid([
      ['Timestamp', e.ts],
      ['Event', e.event],
      ['Actor', e.actor],
      ['Detail', e.detail],
      ['Case', DF.caseId],
      ['Integrity', '<span class="badge badge-pass">HASH VALID</span>', true],
    ])}
    <div style="margin-top:8px;">${_dfDisc()}</div>
  </div>`;
  el.scrollIntoView({ behavior: 'smooth' });
}

function demoAuditVerify() {
  const el = document.getElementById('dfAuditVerify');
  if (!el) return;
  el.style.display = 'block';
  _dfResetAnim();
  let verified = 0;
  el.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-status-pass);">
      <div class="section-label">MERKLE CHAIN VERIFICATION</div>
      <div id="dfAuditChainItems" style="margin-top:8px;"></div>
      <div id="dfAuditChainResult" style="display:none;margin-top:12px;"></div>
    </div>
  `;
  function tick() {
    if (verified < DF_AUDIT_EVENTS.length) {
      const e = DF_AUDIT_EVENTS[verified];
      const container = document.getElementById('dfAuditChainItems');
      if (container) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--drex-border-subtle);font-size:12px;animation:pres-fade-in .2s ease;';
        row.innerHTML = `<div><strong>${_E(e.event)}</strong> <span style="font-size:10px;color:var(--drex-text-muted);">· ${e.ts} · ${_E(e.actor)}</span></div>
          <span class="badge badge-pass">✓ HASH OK</span>`;
        container.appendChild(row);
      }
      verified++;
      DF._animTimer = setTimeout(tick, 300);
    } else {
      const result = document.getElementById('dfAuditChainResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div class="pres-2col">
            <div>${_dfInfoGrid([
              ['Events Verified', String(DF_AUDIT_EVENTS.length)],
              ['Chain Root', 'e4a7f3...b28c91'],
              ['Anomalies', 'None detected'],
              ['Chain Status', '<span class="badge badge-pass">VALID</span>', true],
            ])}</div>
            <div><div class="pres-verdict-block">
              <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">AUDIT CHAIN VALID</div>
              <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">${DF_AUDIT_EVENTS.length} events · 0 anomalies · Tamper-evident</div>
            </div></div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoAudit()">↻ Reset</button>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>`;
      }
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. CERTIFICATES DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoCertificates() {
  _dfResetAnim(); DF.active = true; DF.module = 'certificates';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Certificate Center', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">READY</span>')}

    <div class="pres-2col mt-12">
      <div class="card">
        <div class="section-label">CERTIFICATE GENERATION PIPELINE</div>
        <div id="dfCertPipeline" style="margin-top:6px;">
          ${_dfPipeline([
            { title:'Collect Case Data',       done:'Case data gathered',   active:'Reading case data…' },
            { title:'Collect Operation Data',  done:'Operation confirmed',  active:'Reading operation…' },
            { title:'Collect Verification',    done:'Verification loaded',  active:'Loading verification…' },
            { title:'Collect Audit Record',    done:'Audit chain loaded',   active:'Reading audit…' },
            { title:'Compute Integrity',       done:'Hash computed',        active:'Computing SHA-256…' },
            { title:'Finalize Certificate',    done:'Certificate issued',   active:'Finalizing…' },
          ], 0)}
        </div>
        <button class="action-btn pres-exec-btn" style="margin-top:14px;" id="dfCertGenBtn" onclick="demoCertificatesGenerate()">▶ Generate Certificate</button>
      </div>
      <div class="card">
        <div class="section-label">CERTIFICATE REQUEST</div>
        ${_dfInfoGrid([
          ['Certificate Type', 'Sanitization Completion Certificate'],
          ['Case', DF.caseId],
          ['Operation', DF.jobDrive],
          ['Target', DF_DEVICE.model + ' (' + DF_DEVICE.path + ')'],
          ['Method', 'M02 — Smart Sanitization'],
          ['Operator', DF.operator],
          ['Approver', 'drex_supervisor'],
          ['Status', '<span class="badge badge-neutral">PENDING GENERATION</span>', true],
        ])}
      </div>
    </div>

    <div id="dfCertResult" style="display:none;" class="mt-12"></div>
  `;
}

function demoCertificatesGenerate() {
  const btn = document.getElementById('dfCertGenBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Generating…'; }
  _dfResetAnim();
  const STAGES = [
    { title:'Collect Case Data',       done:'Case data gathered',   active:'Reading case data…' },
    { title:'Collect Operation Data',  done:'Operation confirmed',  active:'Reading operation…' },
    { title:'Collect Verification',    done:'Verification loaded',  active:'Loading verification…' },
    { title:'Collect Audit Record',    done:'Audit chain loaded',   active:'Reading audit…' },
    { title:'Compute Integrity',       done:'Hash computed',        active:'Computing SHA-256…' },
    { title:'Finalize Certificate',    done:'Certificate issued',   active:'Finalizing…' },
  ];
  let step = 0;
  function tick() {
    const pip = document.getElementById('dfCertPipeline');
    if (pip) pip.innerHTML = _dfPipeline(STAGES, step);
    step++;
    if (step <= STAGES.length) {
      DF._animTimer = setTimeout(tick, 500);
    } else {
      const result = document.getElementById('dfCertResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div class="card" style="border-left:3px solid var(--drex-status-pass);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <div class="section-label" style="margin-bottom:0;">CERTIFICATE GENERATED</div>
              <span class="badge badge-pass">${DF.certId}</span>
            </div>
            ${_dfFullCertificate('Physical Drive Sanitization', DF.jobDrive, DF_DEVICE.model + ' (' + DF_DEVICE.path + ')', 'M02 — Smart Sanitization', 'PASS')}
            <div style="margin-top:14px;display:flex;gap:10px;border-top:1px solid var(--drex-border-subtle);padding-top:12px;">
              <button class="action-btn pres-exec-btn" style="width:auto;padding:7px 18px;font-size:12px;" onclick="demoCertificatesVerify()">✓ Verify Certificate</button>
              <button class="action-btn" style="width:auto;padding:7px 16px;font-size:11px;background:#166534;color:#bbf7d0;border:none;" onclick="_dfOpenCertNewTab&&_dfOpenCertNewTab({opType:'Physical Drive Sanitization',jobId:DF.jobDrive,target:DF_DEVICE&&DF_DEVICE.model,methodId:'M02',methodName:'Smart Sanitization',methodCat:'Drive Erasure'})">🔗 View Certificate (New Tab)</button>
              <button class="action-btn" style="width:auto;padding:7px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoCertificates()">↻ Reset</button>
            </div>
          </div>
        `;
        result.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  tick();
}

function demoCertificatesVerify() { demoVerifier(); }

// ═══════════════════════════════════════════════════════════════════════════════
// 14. INDEPENDENT VERIFIER DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoVerifier() {
  _dfResetAnim(); DF.active = true; DF.module = 'verifier';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Independent Verifier', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">IDLE</span>')}

    <div class="pres-2col mt-12">
      <div class="card">
        <div class="section-label">CERTIFICATE TO VERIFY</div>
        ${_dfInfoGrid([
          ['Certificate ID', DF.certId],
          ['Type', 'Sanitization Completion Certificate'],
          ['Issued', _dfTs(0)],
          ['Case', DF.caseId],
          ['Operation', DF.jobDrive],
          ['Target', DF_DEVICE.model + ' (' + DF_DEVICE.path + ')'],
        ])}
        <button class="action-btn pres-exec-btn" style="margin-top:14px;" onclick="demoVerifierRun()">▶ Begin Verification</button>
      </div>
      <div class="card">
        <div class="section-label">VERIFICATION PIPELINE</div>
        <div id="dfVerPipeline" style="margin-top:6px;">
          ${_dfPipeline([
            { title:'Load Certificate',    done:'', active:'' },
            { title:'Verify Structure',    done:'', active:'' },
            { title:'Case Binding',        done:'', active:'' },
            { title:'Operation Binding',   done:'', active:'' },
            { title:'Verification Record', done:'', active:'' },
            { title:'Audit Record',        done:'', active:'' },
            { title:'Integrity Hash',      done:'', active:'' },
          ], 0)}
        </div>
      </div>
    </div>
    <div id="dfVerResult" style="display:none;" class="mt-12"></div>
  `;
}

function demoVerifierRun() {
  _dfResetAnim();
  const STAGES = [
    { title:'Load Certificate',    done:'Certificate loaded successfully',       active:'Loading certificate…' },
    { title:'Verify Structure',    done:'Schema valid — all fields present',     active:'Checking schema…' },
    { title:'Case Binding',        done:'Case ' + DF.caseId + ' verified',      active:'Checking case binding…' },
    { title:'Operation Binding',   done:'Job ' + DF.jobDrive + ' verified',     active:'Checking operation…' },
    { title:'Verification Record', done:'Readback PASS confirmed',              active:'Loading verification…' },
    { title:'Audit Record',        done:'Audit chain hash matches',             active:'Checking audit chain…' },
    { title:'Integrity Hash',      done:'SHA-256 tamper-seal verified',         active:'Recomputing hash…' },
  ];
  let step = 0;
  function tick() {
    const pip = document.getElementById('dfVerPipeline');
    if (pip) pip.innerHTML = _dfPipeline(STAGES, step);
    step++;
    if (step <= STAGES.length) {
      DF._animTimer = setTimeout(tick, 480);
    } else {
      const result = document.getElementById('dfVerResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div class="pres-2col">
            <div class="card" style="border-left:3px solid var(--drex-status-pass);">
              <div class="section-label">VERIFICATION REPORT</div>
              ${_dfInfoGrid([
                ['Certificate', DF.certId],
                ['Structure', '<span class="badge badge-pass">VALID</span>', true],
                ['Case Binding', '<span class="badge badge-pass">VERIFIED</span>', true],
                ['Operation', '<span class="badge badge-pass">VERIFIED</span>', true],
                ['Audit Chain', '<span class="badge badge-pass">INTACT</span>', true],
                ['Integrity Seal', '<span class="badge badge-pass">MATCH</span>', true],
                ['Tampering', '<span class="badge badge-pass">NONE DETECTED</span>', true],
              ])}
            </div>
            <div class="card">
              <div class="pres-verdict-block" style="margin-top:0;">
                <div style="font-size:28px;font-weight:900;color:var(--drex-status-pass);">✓</div>
                <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);margin-top:4px;">CERTIFICATE VALID</div>
                <div style="font-size:11px;color:var(--drex-text-muted);margin-top:6px;">All 7 verification checks passed · No tampering detected</div>
              </div>
              <div style="margin-top:14px;display:flex;gap:8px;">
                <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoVerifier()">↻ Reset</button>
              </div>
              <div style="margin-top:8px;">${_dfDisc()}</div>
            </div>
          </div>
        `;
        result.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. SYSTEM VALIDATION DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoSystemValidation() {
  _dfResetAnim(); DF.active = true; DF.module = 'system_validation';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('System Validation', 'DREX-V2 INTEGRITY SUITE', null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}

    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
        <div>
          <div class="section-label" style="margin-bottom:4px;">SYSTEM VALIDATION SUITE</div>
          <div style="font-size:12px;color:var(--drex-text-muted);">7 critical invariant checks covering authentication, safety, isolation, and integrity.</div>
        </div>
        <button class="action-btn pres-exec-btn" id="dfSysValBtn" onclick="demoSystemValidationRun()">▶ Run Validation Suite</button>
      </div>
      <div id="dfSysValChecks">
        ${DF_VALIDATION.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--drex-border-subtle);">
          <div><div style="font-size:13px;font-weight:700;">${_E(c.name)}</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">${_E(c.detail)}</div></div>
          <span class="badge badge-neutral">PENDING</span>
        </div>`).join('')}
      </div>
    </div>
    <div id="dfSysValResult" style="display:none;" class="mt-12"></div>
  `;
}

function demoSystemValidationRun() {
  const btn = document.getElementById('dfSysValBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Running…'; }
  _dfResetAnim();
  let idx = 0;
  function tick() {
    if (idx < DF_VALIDATION.length) {
      const container = document.getElementById('dfSysValChecks');
      if (container) {
        const rows = container.querySelectorAll('div[style*="border-bottom"]');
        if (rows[idx]) {
          const badge = rows[idx].querySelector('.badge');
          if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'PASS'; }
        }
      }
      idx++;
      DF._animTimer = setTimeout(tick, 400);
    } else {
      const result = document.getElementById('dfSysValResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div class="pres-2col">
            <div class="card" style="border-left:3px solid var(--drex-status-pass);">
              <div class="section-label">VALIDATION SUMMARY</div>
              <div class="pres-metrics-grid mt-6">
                ${_dfMetric('TOTAL CHECKS', String(DF_VALIDATION.length), 'var(--drex-primary)')}
                ${_dfMetric('PASSED', String(DF_VALIDATION.length), 'var(--drex-status-pass)')}
                ${_dfMetric('FAILED', '0', 'var(--drex-status-pass)')}
                ${_dfMetric('COVERAGE', '100%', 'var(--drex-status-pass)')}
              </div>
            </div>
            <div class="card">
              <div class="pres-verdict-block" style="margin-top:0;">
                <div style="font-size:28px;font-weight:900;color:var(--drex-status-pass);">✓</div>
                <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);margin-top:4px;">SYSTEM VALID</div>
                <div style="font-size:11px;color:var(--drex-text-muted);margin-top:6px;">All ${DF_VALIDATION.length} invariants passed · Zero failures</div>
              </div>
              <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoSystemValidation()">↻ Reset</button>
              </div>
              <div style="margin-top:8px;">${_dfDisc()}</div>
            </div>
          </div>
        `;
        result.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. VERIFICATION & ENTROPY DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoVerification() {
  _dfResetAnim(); DF.active = true; DF.module = 'verification';
  const v = _dfView(); if (!v) return;
  v.innerHTML = `
    ${_dfCtxBar('Verification & Entropy', DF.caseId, DF.jobDrive, '<span class="badge badge-neutral" style="font-size:10px;">IDLE</span>')}

    <div class="pres-3col mt-12">
      <div class="card">
        <div class="section-label">VERIFICATION TARGET</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Path', DF_DEVICE.path],
          ['Capacity', DF_DEVICE.capacity],
          ['Bus', DF_DEVICE.bus],
          ['Job', DF.jobDrive],
          ['Method', 'M02 — Smart Sanitization'],
        ])}
      </div>
      <div class="card">
        <div class="section-label">VERIFICATION STRATEGY</div>
        <div style="margin-top:6px;">
          ${_dfCheck('Full surface readback')}
          ${_dfCheck('Byte-level comparison')}
          ${_dfCheck('Shannon entropy analysis')}
          ${_dfCheck('Statistical uniformity test')}
          ${_dfCheck('Zero-residue detection')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">PRE-VERIFICATION CHECKS</div>
        <div style="margin-top:6px;">
          ${_dfCheck('Device handle: acquired')}
          ${_dfCheck('Capacity match: 57.3 GB')}
          ${_dfCheck('Write operation: confirmed complete')}
          ${_dfCheck('Readback engine: initialized')}
        </div>
      </div>
    </div>

    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" onclick="demoVerificationRun()">▶ Start Verification</button>
      <span style="font-size:11px;color:var(--drex-text-muted);">Full surface readback + entropy analysis · ${DF_DEVICE.capacity}</span>
    </div>
    <div id="dfVerifDash" style="display:none;" class="mt-12"></div>
  `;
}

function demoVerificationRun() {
  const dash = document.getElementById('dfVerifDash');
  if (!dash) return;
  dash.style.display = 'block';
  _dfResetAnim();
  const STAGES = [
    { title:'Readback Initialization', done:'Readback engine ready',        active:'Initializing readback…' },
    { title:'Surface Readback',        done:'57.3 GB read — 0 mismatches', active:'Reading surface…' },
    { title:'Entropy Sampling',        done:'7.9993 bits/byte measured',   active:'Computing entropy…' },
    { title:'Statistical Analysis',    done:'Uniformity: PASS',            active:'Running chi-square…' },
    { title:'Zero Residue Check',      done:'No residual patterns found',  active:'Checking residue…' },
    { title:'Verdict Finalization',    done:'Verdict: PASS',               active:'Finalizing…' },
  ];
  const TOTAL = 8;
  let step = 0;
  dash.innerHTML = `
    <div class="card pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div><div class="section-label" style="margin-bottom:2px;">VERIFICATION ENGINE — ACTIVE</div>
        <div style="font-size:15px;font-weight:800;">Full Surface Readback + Entropy Analysis</div></div>
        <span id="dfVerifBadge" class="badge badge-running">EXECUTING</span>
      </div>
    </div>
    ${_dfBar('dfVerif', 0)}
    <div class="pres-3col mt-12">
      <div class="card"><div class="section-label">VERIFICATION PIPELINE</div><div id="dfVerifPipeline" style="margin-top:6px;"></div></div>
      <div class="card"><div class="section-label">LIVE METRICS</div><div id="dfVerifMetrics" class="pres-metrics-grid mt-6"></div></div>
      <div class="card"><div class="section-label">VERIFICATION LOG</div><div id="dfVerifLog" class="pres-log mt-6"></div></div>
    </div>
    <div id="dfVerifResults" style="display:none;" class="mt-12"></div>
  `;
  const LOG = [
    [0,'Readback engine initialized'], [0,'Target: ' + DF_DEVICE.path],
    [1,'Surface readback started — ' + DF_DEVICE.capacity],
    [2,'25% scanned — 0 mismatches'], [3,'50% scanned — 0 mismatches'],
    [4,'75% scanned — 0 mismatches'], [5,'100% scanned — 57.3 GB — 0 mismatches'],
    [5,'Entropy sampling started — 4,096 sample windows'],
    [6,'Shannon entropy: 7.9993 bits/byte (max 8.0000)'],
    [6,'Chi-square uniformity: PASS'],
    [7,'Zero residue check: PASS'],
    [8,'Verdict: PASS — surface verified'],
  ];
  function tick() {
    const stageIdx = [0,1,1,2,2,3,4,5,5][step] ?? 5;
    const pct = Math.round((step / TOTAL) * 100);
    const barEl = document.getElementById('dfVerifBar'); if (barEl) barEl.style.width = pct + '%';
    const pctEl = document.getElementById('dfVerifPct'); if (pctEl) pctEl.textContent = pct + '%';
    const pip = document.getElementById('dfVerifPipeline'); if (pip) pip.innerHTML = _dfPipeline(STAGES, stageIdx);
    const gbRead = ((step / TOTAL) * 57.3).toFixed(1);
    const metrics = document.getElementById('dfVerifMetrics');
    if (metrics) metrics.innerHTML =
      _dfMetric('GB READ', gbRead + ' GB', 'var(--drex-primary)') +
      _dfMetric('MISMATCHES', '0', 'var(--drex-status-pass)') +
      _dfMetric('ENTROPY', step >= 6 ? '7.9993' : '—', 'var(--drex-status-pass)') +
      _dfMetric('PROGRESS', pct + '%', 'var(--drex-primary)');
    LOG.filter(e => e[0] === step).forEach(e => { DF._logLines.push(`[${_dfTs(step * 32)}]  ${e[1]}`); });
    const logEl = document.getElementById('dfVerifLog');
    if (logEl) { logEl.innerHTML = DF._logLines.map(l => `<div>${_E(l)}</div>`).join(''); logEl.scrollTop = logEl.scrollHeight; }
    step++;
    if (step <= TOTAL) {
      DF._animTimer = setTimeout(tick, 560);
    } else {
      const badge = document.getElementById('dfVerifBadge'); if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      _demoVerifResults();
    }
  }
  tick();
}

function _demoVerifResults() {
  const el = document.getElementById('dfVerifResults');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="pres-2col">
      <div class="card" style="border-left:3px solid var(--drex-status-pass);">
        <div class="section-label">VERIFICATION REPORT</div>
        ${_dfInfoGrid([
          ['Device', DF_DEVICE.model],
          ['Capacity Read', DF_DEVICE.capacity],
          ['Bytes Read', '61.55 GB (57.3 binary)'],
          ['Mismatches', '0'],
          ['Match Rate', '100.00%'],
          ['Shannon Entropy', '7.9993 bits/byte'],
          ['Deviation from Max', '0.0007'],
          ['Uniformity', '<span class="badge badge-pass">PASS</span>', true],
          ['Zero Residue', '<span class="badge badge-pass">PASS</span>', true],
          ['Overall Verdict', '<span class="badge badge-pass">PASS</span>', true],
        ])}
      </div>
      <div class="card">
        <div class="pres-verdict-block" style="margin-top:0;">
          <div style="font-size:28px;font-weight:900;color:var(--drex-status-pass);">✓</div>
          <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);margin-top:4px;">VERIFICATION COMPLETE</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:6px;">Surface verified · Entropy confirmed · Zero residue</div>
        </div>
        <div class="pres-metrics-grid mt-10">
          ${_dfMetric('ENTROPY', '7.9993', 'var(--drex-status-pass)')}
          ${_dfMetric('MISMATCHES', '0', 'var(--drex-status-pass)')}
          ${_dfMetric('COVERAGE', '100%', 'var(--drex-status-pass)')}
          ${_dfMetric('VERDICT', 'PASS', 'var(--drex-status-pass)')}
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="action-btn pres-exec-btn" style="width:auto;padding:7px 18px;font-size:12px;" onclick="_dfShowCertModal('Verification Certificate', DF.jobDrive, DF_DEVICE.path, 'M02 Full Readback', 'PASS')">📜 Generate Certificate</button>
          <button class="action-btn" style="width:auto;padding:7px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);margin-left:auto;" onclick="demoVerification()">↻ Reset</button>
        </div>
        <div style="margin-top:8px;">${_dfDisc()}</div>
      </div>
    </div>
  `;
}

// ─── SHARED CERTIFICATE RENDERER (full document, in-page) ─────────────────────

function _dfFullCertificate(opType, jobId, target, method, verdict) {
  return `<div class="pres-cert">
    <div class="pres-cert-header">
      <div class="pres-cert-wordmark">DREX V2</div>
      <div class="pres-cert-submark">Digital Forensics &amp; Secure Erasure Workstation</div>
      <div class="pres-cert-title">${_E(opType)} Certificate</div>
      <div class="pres-cert-id">Certificate ID: ${DF.certId}</div>
    </div>
    <div class="pres-cert-body">
      <div class="pres-cert-section">
        <div class="pres-cert-section-title">CASE INFORMATION</div>
        ${_dfInfoGrid([
          ['Case ID', DF.caseId],
          ['Job ID', jobId],
          ['Operator', DF.operator],
          ['Approver', 'drex_supervisor'],
          ['Timestamp', new Date().toISOString()],
          ['Build', DF.buildCommit],
        ])}
      </div>
      <div class="pres-cert-section">
        <div class="pres-cert-section-title">TARGET</div>
        ${_dfInfoGrid([['Path/Device', target], ['Method', method]])}
      </div>
      <div class="pres-cert-section">
        <div class="pres-cert-section-title">RESULT</div>
        ${_dfInfoGrid([
          ['Execution', '<span class="badge badge-pass">SUCCESS</span>', true],
          ['Verification', '<span class="badge badge-pass">PASS</span>', true],
          ['Audit Chain', '<span class="badge badge-pass">VALID</span>', true],
          ['Integrity', '<span class="badge badge-pass">TAMPER-EVIDENT SEAL VALID</span>', true],
        ])}
      </div>
    </div>
    <div class="pres-cert-footer">
      <div>DREX V2 &nbsp;·&nbsp; Build <code>${DF.buildCommit}</code></div>
      <div>${_dfDisc()}</div>
    </div>
  </div>`;
}

function _dfShowCertModal(opType, jobId, target, method, verdict) {
  const box = document.getElementById('modalBox');
  const overlay = document.getElementById('modalOverlay');
  if (!box || !overlay) return;
  box.innerHTML = `${_dfFullCertificate(opType, jobId, target, method, verdict)}
    <div style="text-align:center;margin-top:14px;">
      <button class="action-btn" style="width:auto;padding:7px 20px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);font-size:12px;" onclick="closeModal()">Close</button>
    </div>`;
  overlay.style.display = 'grid';
}

// ─── GLOBAL EXPORTS ────────────────────────────────────────────────────────────

window.DF = DF;
window._DF_MAP = window._DF_MAP;
window.demoOverview = demoOverview;
window.demoOverviewRunSequence = demoOverviewRunSequence;
window.demoCases = demoCases;
window.demoCasesRunTimeline = demoCasesRunTimeline;
window.demoCasesViewCert = demoCasesViewCert;
window.demoPlanner = demoPlanner;
window.demoPlannerAnalyze = demoPlannerAnalyze;
window.demoFileEraser = demoFileEraser;
window.demoDriveEraser = demoDriveEraser;
window.demoActiveOps = demoActiveOps;
window.demoActiveOpsDetail = demoActiveOpsDetail;
window.demoRecovery = demoRecovery;
window.demoCarving = demoCarving;
window.demoCarvingRun = demoCarvingRun;
window.demoFragments = demoFragments;
window.demoFragmentsRun = demoFragmentsRun;
window.demoDamagedMedia = demoDamagedMedia;
window.demoDamagedMediaRun = demoDamagedMediaRun;
window.demoVault = demoVault;
window.demoVaultDetail = demoVaultDetail;
window.demoVaultVerify = demoVaultVerify;
window.demoAudit = demoAudit;
window.demoAuditEventDetail = demoAuditEventDetail;
window.demoAuditVerify = demoAuditVerify;
window.demoCertificates = demoCertificates;
window.demoCertificatesGenerate = demoCertificatesGenerate;
window.demoCertificatesVerify = demoCertificatesVerify;
window.demoVerifier = demoVerifier;
window.demoVerifierRun = demoVerifierRun;
window.demoSystemValidation = demoSystemValidation;
window.demoSystemValidationRun = demoSystemValidationRun;
window.demoVerification = demoVerification;
window.demoVerificationRun = demoVerificationRun;
window._dfShowCertModal = _dfShowCertModal;
window._dfFullCertificate = _dfFullCertificate;
