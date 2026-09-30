/**
 * DREX V2 — Demonstration Workflow Engine
 * ========================================
 * Isolated non-destructive workflow for judging/demonstration.
 * Uses deterministic presentation data.
 * SAFETY: Never calls destructive API endpoints.
 * SAFETY: Never modifies E:\ or PHYSICALDRIVE*.
 */

// ─── STATE ───────────────────────────────────────────────────────────────────

const PRES = {
  active: false,
  flow: null,
  phase: 'IDLE',
  jobId: 'JOB-DEMO-8F4A91',
  recJobId: 'REC-DEMO-74B812',
  certId: 'DREX-DEMO-8F4A91C2',
  caseId: 'CASE-DEMO-2026-001',
  operator: null,
  buildCommit: '9d8ba92',
  startTime: null,
  _animTimer: null,
  _logLines: [],
  _logCollapsed: false,
  recoveryCandidatesSelected: new Set(),
  selectedDetail: null,
};

// ─── DETERMINISTIC DATA ───────────────────────────────────────────────────────

const PRES_ERASER = {
  target:       'D:\\DREX_FILE_ERASURE_TEST\\demo_evidence\\',
  targetShort:  'demo_evidence',
  type:         'Folder',
  objects:      12,
  size:         '24.6 MB',
  sizeBytes:    25796812,
  fs:           'NTFS',
  methodId:     8,
  method:       'M08 — CSPRNG Random Overwrite',
  methodShort:  'M08',
  category:     'Logical File Sanitization',
  algorithm:    'CSPRNG (OS Entropy Pool)',
  passes:       1,
  verification: 'Byte-read-back sampling',
  throughput:   '2.91 MB/s',
  elapsed:      '00:08.42',
  verDuration:  '1.82 s',
};

const PRES_CANDIDATES = [
  { id:'rc01', file:'project_report.pdf',    type:'PDF',    size:'2.4 MB', bytes:2516582,  offset:'0x0002A400', conf:98, frag:'Low',    status:'RECOVERABLE', sig:'%PDF-1.7 header' },
  { id:'rc02', file:'evidence_photo_01.jpg', type:'JPEG',   size:'4.8 MB', bytes:5033164,  offset:'0x0018F200', conf:96, frag:'None',   status:'RECOVERABLE', sig:'0xFFD8FFE0 JFIF'  },
  { id:'rc03', file:'database_backup.db',    type:'SQLite', size:'8.2 MB', bytes:8598118,  offset:'0x003A1200', conf:94, frag:'Low',    status:'RECOVERABLE', sig:'SQLite 3 magic'    },
  { id:'rc04', file:'presentation.pptx',     type:'PPTX',   size:'5.1 MB', bytes:5347737,  offset:'0x006B9100', conf:91, frag:'Low',    status:'RECOVERABLE', sig:'PK 0x504B0304'    },
  { id:'rc05', file:'source_archive.zip',    type:'ZIP',    size:'3.7 MB', bytes:3880755,  offset:'0x008A4100', conf:89, frag:'Medium', status:'RECOVERABLE', sig:'PK 0x504B0304'    },
  { id:'rc06', file:'financial_ledger.xlsx',  type:'XLSX',   size:'1.2 MB', bytes:1258291,  offset:'0x00BF2800', conf:87, frag:'Low',    status:'RECOVERABLE', sig:'PK 0x504B0304'    },
  { id:'rc07', file:'memo_confidential.docx', type:'DOCX',   size:'0.8 MB', bytes:838860,   offset:'0x00D41600', conf:85, frag:'None',   status:'RECOVERABLE', sig:'PK 0x504B0304'    },
  { id:'rc08', file:'evidence_photo_02.png',  type:'PNG',    size:'3.1 MB', bytes:3250585,  offset:'0x00EA3400', conf:83, frag:'Low',    status:'RECOVERABLE', sig:'0x89504E47 PNG'   },
  { id:'rc09', file:'audit_log_2025.csv',     type:'CSV',    size:'0.4 MB', bytes:419430,   offset:'0x011A0200', conf:81, frag:'None',   status:'RECOVERABLE', sig:'UTF-8 CSV heuristic'},
  { id:'rc10', file:'security_config.json',   type:'JSON',   size:'0.1 MB', bytes:104857,   offset:'0x012B0800', conf:79, frag:'None',   status:'RECOVERABLE', sig:'JSON object heuristic'},
  { id:'rc11', file:'network_capture.pcap',   type:'PCAP',   size:'6.2 MB', bytes:6501171,  offset:'0x013C1000', conf:77, frag:'Medium', status:'RECOVERABLE', sig:'0xD4C3B2A1 pcap'  },
  { id:'rc12', file:'deleted_notes.txt',      type:'TXT',    size:'0.05 MB',bytes:52428,    offset:'0x019F0400', conf:75, frag:'None',   status:'RECOVERABLE', sig:'UTF-8 text heuristic'},
  { id:'rc13', file:'backup_image.bmp',       type:'BMP',    size:'2.8 MB', bytes:2936012,  offset:'0x01A40600', conf:72, frag:'Low',    status:'RECOVERABLE', sig:'0x424D BMP header'},
  { id:'rc14', file:'system_dump.bin',        type:'BIN',    size:'1.6 MB', bytes:1677721,  offset:'0x01D20A00', conf:68, frag:'High',   status:'PARTIAL',     sig:'Raw binary (heuristic)'},
  { id:'rc15', file:'encrypted_archive.7z',   type:'7Z',     size:'4.3 MB', bytes:4509715,  offset:'0x01EA0C00', conf:65, frag:'High',   status:'PARTIAL',     sig:'0x377ABCAF 7-Zip' },
  { id:'rc16', file:'registry_hive.reg',      type:'REG',    size:'0.3 MB', bytes:314572,   offset:'0x022B1400', conf:61, frag:'Medium', status:'PARTIAL',     sig:'regf header'      },
  { id:'rc17', file:'vm_snapshot.vmdk',       type:'VMDK',   size:'9.4 MB', bytes:9856614,  offset:'0x024C1800', conf:55, frag:'High',   status:'PARTIAL',     sig:'KDMV sparse extent'},
];

const PRES_SCAN = {
  dirs: '842', fsRecs: '14,218', entries: '8,421', sigs: '3,912', candidates: 17
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const _E = s => (typeof esc === 'function' ? esc(String(s ?? '')) : String(s ?? '').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])));

function _ts(offsetSec = 0) {
  const d = new Date((PRES.startTime || Date.now()) + offsetSec * 1000);
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

function _view() { return document.getElementById('appView'); }

function _confColor(c) {
  if (c >= 90) return 'var(--drex-status-pass)';
  if (c >= 70) return '#d97706';
  return 'var(--drex-text-muted)';
}

function _fragColor(f) {
  if (f === 'None' || f === 'Low') return 'var(--drex-status-pass)';
  if (f === 'Medium') return '#d97706';
  return 'var(--drex-status-fail)';
}

// Compact "Demonstration Result" disclosure — unobtrusive, professional
function _demoDisclosure() {
  return `<span style="font-size:10px;color:var(--drex-text-subtle);letter-spacing:0.03em;font-style:italic;">Demonstration result</span>`;
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function _metricTile(label, value, color) {
  return `<div class="pres-metric-tile">
    <div class="pres-metric-label">${_E(label)}</div>
    <div class="pres-metric-value" style="color:${color||'var(--drex-text-main)'};">${value}</div>
  </div>`;
}

function _statusRow(label, value, badgeClass) {
  return `<div class="pres-status-row">
    <span class="pres-status-label">${_E(label)}</span>
    <span class="${badgeClass ? 'badge '+badgeClass : 'pres-status-val'}">${value}</span>
  </div>`;
}

function _checkItem(text, done) {
  const icon = done ? '✓' : '○';
  const color = done ? 'var(--drex-status-pass)' : 'var(--drex-text-muted)';
  return `<div class="pres-check-item">
    <span style="color:${color};font-weight:800;font-size:13px;min-width:16px;">${icon}</span>
    <span style="color:${done?'var(--drex-text-main)':'var(--drex-text-muted)'};font-size:12px;">${_E(text)}</span>
  </div>`;
}

function _pipelineStage(num, title, state, detail) {
  // state: 'done' | 'active' | 'pending'
  const icons = { done: '✓', active: '●', pending: '○' };
  const colors = { done: 'var(--drex-status-pass)', active: 'var(--drex-primary)', pending: 'var(--drex-text-muted)' };
  const bg = state === 'active' ? 'rgba(23,105,224,0.05)' : 'transparent';
  return `<div class="pres-pipeline-stage pres-pipeline-${state}" style="background:${bg};">
    <div class="pres-pipeline-icon" style="color:${colors[state]};">${icons[state]}</div>
    <div class="pres-pipeline-body">
      <div class="pres-pipeline-num">PHASE ${String(num).padStart(2,'0')}</div>
      <div class="pres-pipeline-title" style="color:${state==='pending'?'var(--drex-text-muted)':'var(--drex-text-main)'};">${_E(title)}</div>
      ${detail ? `<div class="pres-pipeline-detail">${_E(detail)}</div>` : ''}
    </div>
  </div>`;
}

function _renderPipeline(containerId, stages, activeIdx) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = stages.map((s, i) => {
    const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
    const detail = state === 'done' ? s.doneText : state === 'active' ? s.activeText : '';
    return _pipelineStage(i+1, s.title, state, detail);
  }).join('');
}

// ─── FILE ERASER ENTRY ───────────────────────────────────────────────────────

function presRenderFileEraser() {
  if (PRES._animTimer) { clearTimeout(PRES._animTimer); PRES._animTimer = null; }
  PRES.active = true;
  PRES.flow = 'FILE_ERASER';
  PRES.phase = 'READY';
  PRES.startTime = Date.now();
  PRES.operator = (typeof STATE !== 'undefined' && STATE.currentRole) ? STATE.currentRole.replace(/_/g,' ') : 'Forensic Analyst';
  PRES.buildCommit = (typeof STATE !== 'undefined' && STATE.buildCommit) || '9d8ba92';
  PRES._logLines = [];

  const v = _view(); if (!v) return;
  const d = PRES_ERASER;

  v.innerHTML = `
    <!-- Context Bar -->
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>File &amp; Folder Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${PRES.caseId}</code></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">JOB</span><code>${PRES.jobId}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-pass" style="font-size:10px;">READY</span></div>
    </div>

    <!-- Main 3-Column Layout -->
    <div class="pres-3col mt-12">

      <!-- Col 1: Target -->
      <div class="card">
        <div class="section-label">TARGET</div>
        <div class="pres-info-grid" style="margin-top:8px;">
          <span class="pres-info-label">Path</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;word-break:break-all;">${_E(d.target)}</span>
          <span class="pres-info-label">Type</span><span class="pres-info-val">${d.type}</span>
          <span class="pres-info-label">Objects</span><span class="pres-info-val pres-info-accent">${d.objects}</span>
          <span class="pres-info-label">Logical Size</span><span class="pres-info-val pres-info-accent">${d.size}</span>
          <span class="pres-info-label">Filesystem</span><span class="pres-info-val">${d.fs}</span>
          <span class="pres-info-label">Safety</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASSED</span></span>
          <span class="pres-info-label">Protection</span><span class="pres-info-val" style="color:var(--drex-status-pass);font-size:11px;font-weight:600;">Active</span>
        </div>
        <div style="margin-top:12px;display:flex;gap:6px;">
          <button class="action-btn" style="width:auto;padding:4px 12px;font-size:11px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);">Browse File</button>
          <button class="action-btn" style="width:auto;padding:4px 12px;font-size:11px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);">Browse Folder</button>
        </div>
      </div>

      <!-- Col 2: Method -->
      <div class="card">
        <div class="section-label">METHOD</div>
        <div style="margin-top:8px;">
          <div style="font-size:22px;font-weight:900;color:var(--drex-primary);letter-spacing:-0.01em;">M08</div>
          <div style="font-size:13px;font-weight:700;color:var(--drex-text-main);margin-top:2px;">CSPRNG Random Overwrite</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">${d.category}</div>
        </div>
        <div class="pres-info-grid" style="margin-top:10px;">
          <span class="pres-info-label">Algorithm</span><span class="pres-info-val" style="font-size:11px;">${d.algorithm}</span>
          <span class="pres-info-label">Passes</span><span class="pres-info-val">${d.passes}</span>
          <span class="pres-info-label">Verification</span><span class="pres-info-val" style="font-size:11px;">${d.verification}</span>
          <span class="pres-info-label">Status</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">AVAILABLE</span></span>
        </div>
        <p style="font-size:11px;color:var(--drex-text-muted);margin-top:10px;line-height:1.5;border-top:1px solid var(--drex-border-subtle);padding-top:8px;">
          Overwrites target file data with cryptographically secure pseudo-random bytes drawn from the OS entropy pool. Produces maximum entropy in overwritten regions.
        </p>
      </div>

      <!-- Col 3: Case -->
      <div class="card">
        <div class="section-label">CASE</div>
        <div class="pres-info-grid" style="margin-top:8px;">
          <span class="pres-info-label">Case ID</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${PRES.caseId}</span>
          <span class="pres-info-label">Status</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">ACTIVE</span></span>
          <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(PRES.operator)}</span>
          <span class="pres-info-label">Authorization</span><span class="pres-info-val" style="color:var(--drex-status-pass);font-size:11px;font-weight:600;">Valid</span>
          <span class="pres-info-label">Audit</span><span class="pres-info-val" style="color:var(--drex-status-pass);font-size:11px;font-weight:600;">Ready</span>
          <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${PRES.jobId}</span>
          <span class="pres-info-label">Build</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${PRES.buildCommit}</span>
        </div>
      </div>
    </div>

    <!-- Pre-Execution Validation -->
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div class="section-label" style="margin-bottom:0;">PRE-EXECUTION VALIDATION</div>
        <span class="badge badge-pass" style="font-size:10px;">READY</span>
      </div>
      <div class="pres-checklist-grid">
        ${['Target detected','Target type verified','Target boundary verified','Protected path check','System volume protection','Method compatibility','Case binding','Authentication','Safety policy'].map(c=>_checkItem(c,true)).join('')}
      </div>
    </div>

    <!-- Execute Button -->
    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" id="presExecBtn" onclick="presStartEraserExecution()">
        ⚡ Execute Secure Overwrite
      </button>
      <span style="font-size:11px;color:var(--drex-text-muted);">All preflight checks passed · M08 · ${d.objects} objects · ${d.size}</span>
    </div>

    <!-- Operation Dashboard (revealed on execute) -->
    <div id="presOpDashboard" style="display:none;"></div>
  `;
}

// ─── EXECUTE ─────────────────────────────────────────────────────────────────

function presStartEraserExecution() {
  PRES.phase = 'EXECUTING';
  PRES.startTime = Date.now();
  const btn = document.getElementById('presExecBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Executing…'; }

  const dash = document.getElementById('presOpDashboard');
  if (!dash) return;
  dash.style.display = 'block';

  const d = PRES_ERASER;
  dash.innerHTML = `
    <!-- Job Header -->
    <div class="card mt-12 pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">ACTIVE OPERATION</div>
          <div style="font-size:16px;font-weight:800;color:var(--drex-text-main);">File &amp; Folder Sanitization</div>
        </div>
        <span id="presJobBadge" class="badge badge-running">EXECUTING</span>
      </div>
      <div class="pres-job-meta">
        <div><span class="pres-meta-k">JOB</span><code>${PRES.jobId}</code></div>
        <div><span class="pres-meta-k">CASE</span><code>${PRES.caseId}</code></div>
        <div><span class="pres-meta-k">METHOD</span>${d.method}</div>
        <div><span class="pres-meta-k">TARGET</span>${d.targetShort}</div>
        <div><span class="pres-meta-k">STARTED</span><span id="presStartedTs">${_ts()}</span></div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="pres-progress-bar-wrap mt-10">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span class="pres-meta-k">PROGRESS</span>
        <span id="presProgPct" style="font-size:12px;font-weight:700;color:var(--drex-primary);">0%</span>
      </div>
      <div class="pres-progress-track"><div id="presProgBar" class="pres-progress-fill" style="width:0%;"></div></div>
    </div>

    <!-- Main 3-column: Pipeline + Metrics + Log -->
    <div class="pres-3col mt-12">

      <!-- Pipeline -->
      <div class="card">
        <div class="section-label">OPERATION PIPELINE</div>
        <div id="presPipeline" style="margin-top:6px;"></div>
      </div>

      <!-- Metrics -->
      <div class="card">
        <div class="section-label">LIVE METRICS</div>
        <div id="presMetrics" class="pres-metrics-grid mt-6"></div>
      </div>

      <!-- Log -->
      <div class="card" style="overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="section-label">OPERATION LOG</div>
          <button onclick="presToggleLog()" style="background:none;border:none;cursor:pointer;font-size:10px;color:var(--drex-text-muted);padding:2px 4px;" id="presLogToggleBtn">▾ collapse</button>
        </div>
        <div id="presLogWrap">
          <div id="presLog" class="pres-log mt-6"></div>
        </div>
      </div>
    </div>

    <!-- Verification + Audit + Result (hidden until complete) -->
    <div id="presPostOp" style="display:none;"></div>
  `;

  _presAnimateEraser();
}

function presToggleLog() {
  PRES._logCollapsed = !PRES._logCollapsed;
  const wrap = document.getElementById('presLogWrap');
  const btn = document.getElementById('presLogToggleBtn');
  if (wrap) wrap.style.display = PRES._logCollapsed ? 'none' : '';
  if (btn) btn.textContent = PRES._logCollapsed ? '▸ expand' : '▾ collapse';
}

// ─── ERASER ANIMATION ─────────────────────────────────────────────────────────

function _presAnimateEraser() {
  const d = PRES_ERASER;
  const STAGES = [
    { title:'Target Preparation',    doneText:'Target initialized',                  activeText:'Initializing target…'           },
    { title:'Object Enumeration',    doneText:`${d.objects} objects identified`,      activeText:'Scanning target directory…'     },
    { title:'Secure Processing',     doneText:`${d.objects}/${d.objects} processed`,  activeText:'Applying CSPRNG overwrite…'     },
    { title:'Verification',          doneText:'All checks passed',                   activeText:'Running byte-read-back check…'  },
    { title:'Audit Finalization',    doneText:'Audit record sealed',                 activeText:'Finalizing audit chain…'        },
    { title:'Certificate Eligibility',doneText:'Certificate ready',                  activeText:'Evaluating certificate eligibility…'},
  ];

  const LOG_EVENTS = [
    [0, 'Target path validated'],
    [0, 'Safety gates passed'],
    [1, `Method ${d.methodShort} loaded`],
    [1, 'Target enumeration started'],
    [2, `${d.objects} objects discovered`],
    [3, 'Processing object 01/12'],
    [4, 'Processing object 06/12'],
    [5, 'Processing object 12/12'],
    [6, 'Write operations finalized'],
    [7, 'Verification sampling started'],
    [8, 'Byte-read-back complete'],
    [9, 'Audit chain updated'],
  ];

  const TOTAL = 13;
  const STEP_MS = 550;
  let step = 0;

  function tick() {
    const stageIdx = [0,0,1,1,2,2,2,2,3,4,5,6,6][step] ?? 6;
    const pct = Math.round((step / TOTAL) * 100);

    // Progress bar
    const bar = document.getElementById('presProgBar');
    const pct_el = document.getElementById('presProgPct');
    if (bar) bar.style.width = pct + '%';
    if (pct_el) pct_el.textContent = pct + '%';

    // Pipeline
    _renderPipeline('presPipeline', STAGES, stageIdx);

    // Metrics
    const processed = Math.min(d.objects, Math.round((step/TOTAL)*d.objects));
    const dataMB = ((processed/d.objects)*24.6).toFixed(1);
    const elapsed = ((step * STEP_MS)/1000).toFixed(1).padStart(4,'0');
    const metricsEl = document.getElementById('presMetrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        _metricTile('OBJECTS', `${processed} / ${d.objects}`, 'var(--drex-text-main)') +
        _metricTile('DATA', `${dataMB} MB`, 'var(--drex-text-main)') +
        _metricTile('PROGRESS', `${pct}%`, 'var(--drex-primary)') +
        _metricTile('THROUGHPUT', step>2 ? d.throughput : '—', 'var(--drex-text-main)') +
        _metricTile('FAILED', '0', 'var(--drex-status-pass)') +
        _metricTile('ELAPSED', `00:${elapsed}`, 'var(--drex-text-main)');
    }

    // Log
    const logEl = document.getElementById('presLog');
    LOG_EVENTS.filter(e => e[0] === step).forEach(e => {
      PRES._logLines.push(`${_ts(step*(STEP_MS/1000))}  ${e[1]}`);
    });
    if (logEl) {
      logEl.innerHTML = PRES._logLines.map(l=>`<div>${_E(l)}</div>`).join('');
      logEl.scrollTop = logEl.scrollHeight;
    }

    step++;
    if (step <= TOTAL) {
      PRES._animTimer = setTimeout(tick, STEP_MS);
    } else {
      // Complete
      PRES.phase = 'COMPLETE';
      if (bar) bar.style.width = '100%';
      if (pct_el) pct_el.textContent = '100%';
      const badge = document.getElementById('presJobBadge');
      if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      _presShowPostOp();
    }
  }
  tick();
}

// ─── POST-OPERATION PANELS ───────────────────────────────────────────────────

function _presShowPostOp() {
  const d = PRES_ERASER;
  const postOp = document.getElementById('presPostOp');
  if (!postOp) return;
  postOp.style.display = 'block';

  postOp.innerHTML = `
    <!-- Verification + Audit row -->
    <div class="pres-2col mt-12">

      <!-- Verification -->
      <div class="card pres-result-card pres-result-pass">
        <div class="section-label">VERIFICATION ENGINE</div>
        <div class="pres-checklist-grid mt-6" style="grid-template-columns:1fr;">
          ${['Object count consistency','Byte-count consistency','Operation state consistency','Integrity check sample'].map(c=>_checkItem(c,true)).join('')}
        </div>
        <div class="pres-verdict-block mt-10">
          <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">PASS</div>
          <div style="font-size:10px;color:var(--drex-text-muted);margin-top:2px;">VERIFICATION RESULT</div>
        </div>
        <div class="pres-info-grid mt-8">
          <span class="pres-info-label">Objects verified</span><span class="pres-info-val">${d.objects} / ${d.objects}</span>
          <span class="pres-info-label">Bytes verified</span><span class="pres-info-val">${d.size}</span>
          <span class="pres-info-label">Duration</span><span class="pres-info-val">${d.verDuration}</span>
        </div>
        <div style="margin-top:8px;">${_demoDisclosure()}</div>
      </div>

      <!-- Audit -->
      <div class="card">
        <div class="section-label">AUDIT RECORD</div>
        <div class="pres-info-grid mt-6">
          <span class="pres-info-label">Event</span><span class="pres-info-val" style="font-size:11px;">FILE_ERASURE_COMPLETED</span>
          <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${PRES.caseId}</span>
          <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${PRES.jobId}</span>
          <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(PRES.operator)}</span>
          <span class="pres-info-label">Method</span><span class="pres-info-val">${d.methodShort}</span>
          <span class="pres-info-label">Target</span><span class="pres-info-val">${d.targetShort}</span>
          <span class="pres-info-label">Result</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">SUCCESS</span></span>
          <span class="pres-info-label">Verification</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASS</span></span>
          <span class="pres-info-label">Timestamp</span><span class="pres-info-val" style="font-size:10px;">${new Date().toISOString()}</span>
        </div>
        <div style="margin-top:10px;padding:6px 10px;background:rgba(22,138,74,0.06);border:1px solid var(--drex-status-pass-border);border-radius:4px;text-align:center;">
          <span style="font-size:11px;font-weight:700;color:var(--drex-status-pass);">AUDIT CHAIN · VALID</span>
        </div>
      </div>
    </div>

    <!-- Completion Card -->
    <div class="card mt-12 pres-completion-card">
      <div class="pres-completion-header">
        <div>
          <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);">OPERATION COMPLETE</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">All stages finalized successfully</div>
        </div>
        <div class="pres-completion-checks">
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Execution complete</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Verification passed</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Audit finalized</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Certificate ready</div>
        </div>
      </div>
      <div class="pres-completion-summary mt-10">
        ${_metricTile('TARGET', d.targetShort, 'var(--drex-text-main)')}
        ${_metricTile('METHOD', d.method, 'var(--drex-text-main)')}
        ${_metricTile('OBJECTS', `${d.objects} / ${d.objects}`, 'var(--drex-status-pass)')}
        ${_metricTile('DATA', d.size, 'var(--drex-text-main)')}
        ${_metricTile('FAILURES', '0', 'var(--drex-status-pass)')}
        ${_metricTile('VERIFICATION', 'PASS', 'var(--drex-status-pass)')}
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;border-top:1px solid var(--drex-border-subtle);padding-top:12px;">
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);padding:8px 16px;font-size:12px;">View Audit</button>
        <button class="action-btn pres-exec-btn" style="width:auto;padding:8px 20px;font-size:12px;" onclick="presShowCertificate()">📜 Generate Certificate</button>
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-muted);border:1px solid var(--drex-border-base);padding:8px 14px;font-size:11px;margin-left:auto;" onclick="presRenderFileEraser()">↻ Reset</button>
      </div>
    </div>
  `;
}

// ─── CERTIFICATE VIEWER ───────────────────────────────────────────────────────

function presShowCertificate() {
  const d = PRES_ERASER;
  const box = document.getElementById('modalBox');
  const overlay = document.getElementById('modalOverlay');
  if (!box || !overlay) return;

  box.innerHTML = `
    <div class="pres-cert" style="max-width:580px;">
      <!-- Cert Header -->
      <div class="pres-cert-header">
        <div class="pres-cert-wordmark">DREX V2</div>
        <div class="pres-cert-submark">Digital Forensics &amp; Secure Erasure Workstation</div>
        <div class="pres-cert-title">Demonstration Certificate</div>
        <div class="pres-cert-id">Certificate ID: ${PRES.certId}</div>
      </div>

      <!-- Body -->
      <div class="pres-cert-body">
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">CASE INFORMATION</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${PRES.caseId}</span>
            <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${PRES.jobId}</span>
            <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(PRES.operator)}</span>
            <span class="pres-info-label">Timestamp</span><span class="pres-info-val" style="font-size:10px;">${new Date().toISOString()}</span>
          </div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">TARGET</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Path</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(d.target)}</span>
            <span class="pres-info-label">Type</span><span class="pres-info-val">${d.type}</span>
            <span class="pres-info-label">Objects</span><span class="pres-info-val">${d.objects}</span>
            <span class="pres-info-label">Logical Size</span><span class="pres-info-val">${d.size}</span>
          </div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">METHOD</div>
          <div style="font-weight:700;font-size:13px;color:var(--drex-text-main);">${d.method}</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">${d.category}</div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">RESULT</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Execution</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">SUCCESS</span></span>
            <span class="pres-info-label">Verification</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASS</span></span>
            <span class="pres-info-label">Audit</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">VALID</span></span>
            <span class="pres-info-label">Objects</span><span class="pres-info-val">${d.objects} / ${d.objects}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pres-cert-footer">
        <div>DREX V2 &nbsp;·&nbsp; Build <code>${PRES.buildCommit}</code></div>
        <div>${_demoDisclosure()}</div>
      </div>

      <div style="text-align:center;margin-top:14px;">
        <button class="action-btn" style="width:auto;padding:7px 20px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);font-size:12px;" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
  overlay.style.display = 'grid';
}

// ─── FORENSIC RECOVERY ENTRY ──────────────────────────────────────────────────

function presRenderRecovery() {
  if (PRES._animTimer) { clearTimeout(PRES._animTimer); PRES._animTimer = null; }
  PRES.active = true;
  PRES.flow = 'RECOVERY';
  PRES.phase = 'READY';
  PRES.startTime = Date.now();
  PRES.operator = (typeof STATE !== 'undefined' && STATE.currentRole) ? STATE.currentRole.replace(/_/g,' ') : 'Forensic Analyst';
  PRES.buildCommit = (typeof STATE !== 'undefined' && STATE.buildCommit) || '9d8ba92';
  PRES._logLines = [];
  PRES.recoveryCandidatesSelected = new Set();
  PRES.selectedDetail = null;

  const v = _view(); if (!v) return;

  v.innerHTML = `
    <!-- Context Bar -->
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Forensic Recovery</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${PRES.caseId}</code></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">JOB</span><code>${PRES.recJobId}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-pass" style="font-size:10px;">READY</span></div>
    </div>

    <!-- Target Panel -->
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
        <div>
          <div class="section-label">RECOVERY TARGET</div>
          <div style="font-size:16px;font-weight:800;margin-top:4px;color:var(--drex-text-main);">Demo Evidence Volume</div>
        </div>
        <span class="badge badge-pass">READY</span>
      </div>
      <div class="pres-info-grid mt-10" style="max-width:420px;">
        <span class="pres-info-label">Filesystem</span><span class="pres-info-val">NTFS</span>
        <span class="pres-info-label">Scan Mode</span><span class="pres-info-val">Smart Recovery</span>
        <span class="pres-info-label">Engine</span><span class="pres-info-val">DREX Forensic Recovery Engine</span>
        <span class="pres-info-label">Status</span><span class="pres-info-val" style="color:var(--drex-status-pass);font-weight:600;">Ready</span>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;align-items:center;">
        <button class="action-btn pres-exec-btn" id="presStartScanBtn" style="width:auto;padding:9px 22px;font-size:13px;" onclick="presStartRecoveryScan()">⌕ Start Scan</button>
        <span style="font-size:11px;color:var(--drex-text-muted);">Smart Recovery · NTFS · M18</span>
      </div>
    </div>

    <!-- Scan Dashboard -->
    <div id="presScanDash" style="display:none;"></div>

    <!-- Candidate Table -->
    <div id="presCandidateSection" style="display:none;"></div>

    <!-- Detail Panel -->
    <div id="presCandidateDetail" style="display:none;"></div>

    <!-- Recovery Job -->
    <div id="presRecJobSection" style="display:none;"></div>

    <!-- Results -->
    <div id="presRecResults" style="display:none;"></div>
  `;
}

// ─── SCAN ANIMATION ───────────────────────────────────────────────────────────

function presStartRecoveryScan() {
  PRES.phase = 'SCANNING';
  PRES.startTime = Date.now();
  const btn = document.getElementById('presStartScanBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⌕ Scanning…'; }

  const dash = document.getElementById('presScanDash');
  if (!dash) return;
  dash.style.display = 'block';

  dash.innerHTML = `
    <div class="pres-2col mt-12">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div class="section-label">FORENSIC ANALYSIS</div>
          <span id="presScanBadge" class="badge badge-running">SCANNING</span>
        </div>
        <div id="presScanPipeline"></div>
      </div>
      <div class="card">
        <div class="section-label">SCAN METRICS</div>
        <div id="presScanMetrics" class="pres-metrics-grid mt-6"></div>
        <div style="margin-top:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span class="pres-meta-k">SCAN PROGRESS</span>
            <span id="presScanPct" style="font-size:12px;font-weight:700;color:var(--drex-primary);">0%</span>
          </div>
          <div class="pres-progress-track"><div id="presScanBar" class="pres-progress-fill" style="width:0%;"></div></div>
        </div>
      </div>
    </div>
  `;

  _presAnimateScan();
}

function _presAnimateScan() {
  const sc = PRES_SCAN;
  const STAGES = [
    { title:'Target Identification',    doneText:'Volume identified',                      activeText:'Identifying volume…'          },
    { title:'Filesystem Analysis',      doneText:`${sc.fsRecs} records parsed`,            activeText:'Parsing MFT records…'         },
    { title:'Deleted Entry Analysis',   doneText:`${sc.entries} entries inspected`,        activeText:'Scanning deleted entries…'    },
    { title:'Signature Analysis',       doneText:`${sc.sigs} signatures matched`,          activeText:'Matching file signatures…'    },
    { title:'Candidate Classification', doneText:`${sc.candidates} candidates classified`, activeText:'Classifying candidates…'      },
  ];

  const TOTAL = 12;
  const STEP_MS = 450;
  let step = 0;

  function tick() {
    const stageIdx = [0,0,1,2,2,3,3,4,4,4,5,5,5][step] ?? 5;
    const pct = Math.round((step/TOTAL)*100);

    const bar = document.getElementById('presScanBar');
    const pctEl = document.getElementById('presScanPct');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    _renderPipeline('presScanPipeline', STAGES, stageIdx);

    const prog = step/TOTAL;
    const dirs = Math.round(prog*842);
    const recs = Math.round(prog*14218);
    const ents = Math.round(prog*8421);
    const sigs = Math.round(prog*3912);
    const cands = step >= TOTAL ? 17 : Math.round(prog*17);

    const metricsEl = document.getElementById('presScanMetrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        _metricTile('DIRECTORIES', dirs.toLocaleString(), 'var(--drex-text-main)') +
        _metricTile('FS RECORDS', recs.toLocaleString(), 'var(--drex-text-main)') +
        _metricTile('ENTRIES', ents.toLocaleString(), 'var(--drex-text-main)') +
        _metricTile('SIGNATURES', sigs.toLocaleString(), 'var(--drex-text-main)') +
        _metricTile('CANDIDATES', String(cands), 'var(--drex-primary)');
    }

    step++;
    if (step <= TOTAL) {
      PRES._animTimer = setTimeout(tick, STEP_MS);
    } else {
      PRES.phase = 'CANDIDATES';
      const badge = document.getElementById('presScanBadge');
      if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      _presShowCandidates();
    }
  }
  tick();
}

// ─── CANDIDATE TABLE ──────────────────────────────────────────────────────────

function _presShowCandidates() {
  const section = document.getElementById('presCandidateSection');
  if (!section) return;
  section.style.display = 'block';

  section.innerHTML = `
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <div>
          <div class="section-label">RECOVERY CANDIDATES</div>
          <div style="font-size:14px;font-weight:800;color:var(--drex-text-main);">${PRES_CANDIDATES.length} artifacts discovered</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span id="presSelCount" style="font-size:11px;color:var(--drex-text-muted);">0 selected</span>
          <button class="action-btn" style="width:auto;padding:5px 14px;font-size:11px;background:var(--drex-primary);color:#fff;font-weight:700;" onclick="presSelectTop5()">Select Top 5</button>
          ${_demoDisclosure()}
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table class="pres-candidate-table">
          <thead>
            <tr>
              <th style="width:28px;"></th>
              <th>FILE</th>
              <th>TYPE</th>
              <th>SIZE</th>
              <th>OFFSET</th>
              <th>CONF.</th>
              <th>FRAG.</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody id="presCandsBody">
            ${PRES_CANDIDATES.map(c => `
              <tr id="presRow_${c.id}" onclick="presClickCandidate('${c.id}')" style="cursor:pointer;">
                <td style="text-align:center;"><input type="checkbox" id="presChk_${c.id}" onclick="event.stopPropagation();presToggleCandidate('${c.id}')"></td>
                <td><span style="font-family:var(--drex-font-mono);font-size:11px;font-weight:600;">${_E(c.file)}</span></td>
                <td><span class="badge badge-neutral" style="font-size:9px;">${c.type}</span></td>
                <td style="font-size:11px;">${c.size}</td>
                <td style="font-family:var(--drex-font-mono);font-size:10px;color:var(--drex-text-muted);">${c.offset}</td>
                <td style="font-weight:700;color:${_confColor(c.conf)};">${c.conf}%</td>
                <td style="font-size:11px;color:${_fragColor(c.frag)};">${c.frag}</td>
                <td><span class="badge ${c.status==='RECOVERABLE'?'badge-pass':'badge-warn'}" style="font-size:9px;">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;align-items:center;border-top:1px solid var(--drex-border-subtle);padding-top:10px;">
        <button class="action-btn pres-exec-btn" id="presRecoverBtn" style="width:auto;padding:9px 22px;font-size:13px;" onclick="presStartRecovery()" disabled>⚡ Recover Selected</button>
        <span style="font-size:11px;color:var(--drex-text-muted);" id="presRecoverHint">Select candidates to recover</span>
      </div>
    </div>
  `;
}

function presClickCandidate(id) {
  presToggleCandidate(id);
  const c = PRES_CANDIDATES.find(x=>x.id===id);
  if (c) _presShowCandidateDetail(c);
}

function presToggleCandidate(id) {
  if (PRES.recoveryCandidatesSelected.has(id)) {
    PRES.recoveryCandidatesSelected.delete(id);
  } else {
    PRES.recoveryCandidatesSelected.add(id);
  }
  const chk = document.getElementById(`presChk_${id}`);
  if (chk) chk.checked = PRES.recoveryCandidatesSelected.has(id);
  const row = document.getElementById(`presRow_${id}`);
  if (row) row.style.background = PRES.recoveryCandidatesSelected.has(id) ? 'rgba(23,105,224,0.05)' : '';

  const cnt = PRES.recoveryCandidatesSelected.size;
  const countEl = document.getElementById('presSelCount');
  if (countEl) countEl.textContent = `${cnt} selected`;
  const btn = document.getElementById('presRecoverBtn');
  if (btn) btn.disabled = cnt === 0;
  const hint = document.getElementById('presRecoverHint');
  if (hint) hint.textContent = cnt > 0 ? `${cnt} file${cnt>1?'s':''} ready to recover` : 'Select candidates to recover';
}

function presSelectTop5() {
  PRES.recoveryCandidatesSelected = new Set(['rc01','rc02','rc03','rc04','rc05']);
  PRES_CANDIDATES.forEach(c => {
    const chk = document.getElementById(`presChk_${c.id}`);
    const row = document.getElementById(`presRow_${c.id}`);
    const sel = PRES.recoveryCandidatesSelected.has(c.id);
    if (chk) chk.checked = sel;
    if (row) row.style.background = sel ? 'rgba(23,105,224,0.05)' : '';
  });
  const countEl = document.getElementById('presSelCount');
  if (countEl) countEl.textContent = '5 selected';
  const btn = document.getElementById('presRecoverBtn');
  if (btn) btn.disabled = false;
  const hint = document.getElementById('presRecoverHint');
  if (hint) hint.textContent = '5 files ready to recover';
}

function _presShowCandidateDetail(c) {
  const detail = document.getElementById('presCandidateDetail');
  if (!detail) return;
  detail.style.display = 'block';
  detail.innerHTML = `
    <div class="card mt-10" style="border-left:3px solid var(--drex-primary);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div>
          <div class="section-label">CANDIDATE DETAIL</div>
          <div style="font-weight:700;font-size:13px;margin-top:2px;">${_E(c.file)}</div>
        </div>
        <span class="badge ${c.status==='RECOVERABLE'?'badge-pass':'badge-warn'}" style="font-size:9px;">${c.status}</span>
      </div>
      <div class="pres-info-grid">
        <span class="pres-info-label">Type</span><span class="pres-info-val">${c.type}</span>
        <span class="pres-info-label">Size</span><span class="pres-info-val">${c.size}</span>
        <span class="pres-info-label">Offset</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${c.offset}</span>
        <span class="pres-info-label">Signature</span><span class="pres-info-val" style="font-size:11px;">${_E(c.sig)}</span>
        <span class="pres-info-label">Confidence</span><span class="pres-info-val" style="font-weight:700;color:${_confColor(c.conf)};">${c.conf}%</span>
        <span class="pres-info-label">Fragmentation</span><span class="pres-info-val" style="color:${_fragColor(c.frag)};">${c.frag}</span>
      </div>
    </div>
  `;
}

// ─── RECOVERY JOB ─────────────────────────────────────────────────────────────

function presStartRecovery() {
  PRES.phase = 'RECOVERING';
  const selected = PRES_CANDIDATES.filter(c => PRES.recoveryCandidatesSelected.has(c.id));
  const btn = document.getElementById('presRecoverBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Recovering…'; }

  const section = document.getElementById('presRecJobSection');
  if (!section) return;
  section.style.display = 'block';

  const JOB_EVENTS = [
    'Candidate list validated',
    'Output destination verified',
    'File structures reconstructed',
    'Content extracted and assembled',
    'Integrity verification completed',
  ];

  section.innerHTML = `
    <div class="card mt-12 pres-job-header" style="border-left:3px solid var(--drex-primary);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div>
          <div class="section-label">RECOVERY JOB</div>
          <div style="font-size:16px;font-weight:800;color:var(--drex-text-main);">Recovering ${selected.length} files</div>
        </div>
        <span id="presRecJobBadge" class="badge badge-running">RECOVERING</span>
      </div>
      <div class="pres-job-meta">
        <div><span class="pres-meta-k">JOB</span><code>${PRES.recJobId}</code></div>
        <div><span class="pres-meta-k">CASE</span><code>${PRES.caseId}</code></div>
        <div><span class="pres-meta-k">SELECTED</span>${selected.length} files</div>
      </div>
      <div style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span class="pres-meta-k">PROGRESS</span>
          <span id="presRecPct" style="font-size:12px;font-weight:700;color:var(--drex-primary);">0%</span>
        </div>
        <div class="pres-progress-track"><div id="presRecBar" class="pres-progress-fill" style="width:0%;"></div></div>
      </div>
      <div id="presRecEvents" style="margin-top:10px;"></div>
    </div>
  `;

  let step = 0;
  function tick() {
    const pct = Math.round(((step+1)/(JOB_EVENTS.length+1))*100);
    const bar = document.getElementById('presRecBar');
    const pctEl = document.getElementById('presRecPct');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    const evEl = document.getElementById('presRecEvents');
    if (evEl && step < JOB_EVENTS.length) {
      evEl.innerHTML += `<div class="pres-check-item"><span style="color:var(--drex-status-pass);font-weight:800;font-size:13px;min-width:16px;">✓</span><span style="font-size:12px;">${JOB_EVENTS[step]}</span></div>`;
    }
    step++;
    if (step <= JOB_EVENTS.length) {
      PRES._animTimer = setTimeout(tick, 550);
    } else {
      const badge = document.getElementById('presRecJobBadge');
      if (badge) { badge.className = 'badge badge-pass'; badge.textContent = 'COMPLETE'; }
      const evEl2 = document.getElementById('presRecEvents');
      if (evEl2) {
        evEl2.innerHTML += `<div style="margin-top:8px;padding:8px 12px;background:var(--drex-status-pass-soft);border:1px solid var(--drex-status-pass-border);border-radius:4px;font-weight:700;color:var(--drex-status-pass);font-size:12px;">Recovery complete — ${selected.length} / ${selected.length} objects</div>`;
      }
      _presShowRecoveryResults(selected);
    }
  }
  tick();
}

// ─── RECOVERY RESULTS ─────────────────────────────────────────────────────────

function _presShowRecoveryResults(selected) {
  PRES.phase = 'RESULTS';
  const section = document.getElementById('presRecResults');
  if (!section) return;
  section.style.display = 'block';

  const totalBytes = selected.reduce((a,c) => a+c.bytes, 0);
  const totalMB = (totalBytes/(1024*1024)).toFixed(1);

  section.innerHTML = `
    <div class="pres-2col mt-12">
      <!-- Summary -->
      <div class="card pres-result-card pres-result-pass">
        <div class="section-label">RECOVERY SUMMARY</div>
        <div class="pres-metrics-grid mt-8">
          ${_metricTile('CANDIDATES', String(PRES_CANDIDATES.length), 'var(--drex-text-main)')}
          ${_metricTile('SELECTED', String(selected.length), 'var(--drex-text-main)')}
          ${_metricTile('RECOVERED', String(selected.length), 'var(--drex-status-pass)')}
          ${_metricTile('FAILED', '0', 'var(--drex-status-pass)')}
          ${_metricTile('DATA', totalMB+' MB', 'var(--drex-text-main)')}
          ${_metricTile('VERIFICATION', 'PASS', 'var(--drex-status-pass)')}
        </div>
        <div style="margin-top:8px;">${_demoDisclosure()}</div>
      </div>

      <!-- Evidence List -->
      <div class="card">
        <div class="section-label">RECOVERED EVIDENCE</div>
        <div style="margin-top:8px;">
          ${selected.map(c => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--drex-border-subtle);font-size:12px;">
              <span style="color:var(--drex-status-pass);font-weight:900;">✓</span>
              <span style="font-weight:600;flex:1;">${_E(c.file)}</span>
              <span class="badge badge-neutral" style="font-size:9px;">${c.type}</span>
              <span style="color:var(--drex-text-muted);font-size:11px;min-width:50px;text-align:right;">${c.size}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:12px;display:flex;gap:10px;border-top:1px solid var(--drex-border-subtle);padding-top:10px;">
          <button class="action-btn pres-exec-btn" style="width:auto;padding:8px 20px;font-size:12px;" onclick="presShowRecoveryReport()">📋 Generate Report</button>
          <button class="action-btn" style="width:auto;padding:8px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-muted);border:1px solid var(--drex-border-base);margin-left:auto;" onclick="presRenderRecovery()">↻ Reset</button>
        </div>
      </div>
    </div>
  `;
}

// ─── RECOVERY REPORT ──────────────────────────────────────────────────────────

function presShowRecoveryReport() {
  const selected = PRES_CANDIDATES.filter(c => PRES.recoveryCandidatesSelected.has(c.id));
  const totalBytes = selected.reduce((a,c) => a+c.bytes, 0);
  const totalMB = (totalBytes/(1024*1024)).toFixed(1);
  const box = document.getElementById('modalBox');
  const overlay = document.getElementById('modalOverlay');
  if (!box || !overlay) return;

  box.innerHTML = `
    <div class="pres-cert" style="max-width:580px;">
      <div class="pres-cert-header">
        <div class="pres-cert-wordmark">DREX V2</div>
        <div class="pres-cert-submark">Digital Forensics &amp; Secure Erasure Workstation</div>
        <div class="pres-cert-title">Forensic Recovery Report</div>
        <div class="pres-cert-id">Job ID: ${PRES.recJobId}</div>
      </div>

      <div class="pres-cert-body">
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">CASE &amp; SCAN</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${PRES.caseId}</span>
            <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${PRES.recJobId}</span>
            <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(PRES.operator)}</span>
            <span class="pres-info-label">Timestamp</span><span class="pres-info-val" style="font-size:10px;">${new Date().toISOString()}</span>
          </div>
        </div>
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">TARGET</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Volume</span><span class="pres-info-val">Demo Evidence Volume</span>
            <span class="pres-info-label">Filesystem</span><span class="pres-info-val">NTFS</span>
            <span class="pres-info-label">Engine</span><span class="pres-info-val">DREX Forensic Recovery Engine</span>
          </div>
        </div>
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">SCAN RESULTS</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Candidates found</span><span class="pres-info-val">${PRES_CANDIDATES.length}</span>
            <span class="pres-info-label">Selected</span><span class="pres-info-val">${selected.length}</span>
            <span class="pres-info-label">Recovered</span><span class="pres-info-val pres-info-accent">${selected.length}</span>
            <span class="pres-info-label">Failed</span><span class="pres-info-val" style="color:var(--drex-status-pass);">0</span>
            <span class="pres-info-label">Data recovered</span><span class="pres-info-val">${totalMB} MB</span>
            <span class="pres-info-label">Verification</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASS</span></span>
          </div>
        </div>
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">RECOVERED OBJECTS</div>
          ${selected.map(c=>`<div style="padding:3px 0;font-size:12px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--drex-border-subtle);">
            <span style="color:var(--drex-status-pass);font-weight:800;">✓</span>
            <span style="flex:1;">${_E(c.file)}</span>
            <span style="color:var(--drex-text-muted);font-size:11px;">${c.conf}% confidence</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="pres-cert-footer">
        <div>DREX V2 &nbsp;·&nbsp; Build <code>${PRES.buildCommit}</code></div>
        <div>${_demoDisclosure()}</div>
      </div>

      <div style="text-align:center;margin-top:14px;">
        <button class="action-btn" style="width:auto;padding:7px 20px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);font-size:12px;" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
  overlay.style.display = 'grid';
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVE SANITIZATION GUIDED DEMONSTRATION WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════════
// SAFETY: This workflow is COMPLETELY ISOLATED from the real drive sanitization
// engine. It NEVER calls /api/sanitization/execute, NEVER issues ATA/NVMe
// commands, NEVER modifies E:\ or \\.\PHYSICALDRIVE*.
// ═══════════════════════════════════════════════════════════════════════════════

const DRIVE_DEMO = {
  active: false,
  phase: 'IDLE', // IDLE → TARGET → PREFLIGHT → AUTH_STEP1 → AUTH_STEP2 → AUTH_REVIEW → EXECUTING → VERIFICATION → AUDIT → COMPLETE
  jobId: 'SAN-DEMO-74A821',
  certId: 'DREX-DEMO-SAN-74A821',
  operator: null,
  approver: null,
  _animTimer: null,
  _logLines: [],
};

function _getDriveDemoTarget() {
  // Pull real device info from STATE if available, with safe defaults
  const dev = (typeof STATE !== 'undefined' && STATE.devices && STATE.devices.length > 0)
    ? STATE.devices.find(d => !d.is_system_disk && !d.is_boot_disk) || STATE.devices[0]
    : null;
  return {
    model:     dev ? dev.model           : 'SanDisk Ultra USB Device',
    path:      dev ? dev.device_path     : '\\\\.\\PHYSICALDRIVE1',
    letter:    dev ? (dev.drive_letter || 'E:') : 'E:',
    capacity:  dev ? dev.capacity_human  : '57.3 GB',
    capacityGB: dev ? parseFloat(dev.capacity_human) || 57.3 : 57.3,
    bus:       dev ? dev.bus_type        : 'USB',
    serial:    dev ? dev.serial_number   : 'A1B2C3D4E5',
    fs:        dev ? (dev.filesystem || 'exFAT') : 'exFAT',
    partition: dev ? (dev.partition_style || 'MBR') : 'MBR',
    isSystem:  dev ? dev.is_system_disk  : false,
    isBoot:    dev ? dev.is_boot_disk    : false,
    health:    'HEALTHY',
  };
}

function _getDriveDemoCase() {
  if (typeof STATE !== 'undefined' && STATE.activeCase) {
    return STATE.activeCase.case_id || STATE.activeCase.case_number || 'CASE-DEMO-2026-001';
  }
  return typeof getActiveCaseId === 'function' ? (getActiveCaseId() || 'CASE-DEMO-2026-001') : 'CASE-DEMO-2026-001';
}

function _getDriveDemoMethod() {
  const mid = (typeof STATE !== 'undefined' && STATE.selectedDriveMethod) ? STATE.selectedDriveMethod : 2;
  const registry = {
    1: { id:'M01', name:'NIST SP 800-88 Policy Engine',  cat:'Physical Drive Sanitization', desc:'Standards-authoritative policy dispatcher coordinating block overwrite and firmware sanitization.', compat:'All qualified block devices', verification:'Policy-governed readback', authReq:'Two-Man Authorization' },
    2: { id:'M02', name:'Smart Sanitization',             cat:'Physical Drive Sanitization', desc:'Automated multi-tier evaluation selecting optimal compliant sanitization based on bus topology and media.', compat:'All storage media types', verification:'Automated multi-pass verification', authReq:'Two-Man Authorization' },
    3: { id:'M03', name:'Device-Native Sanitize',          cat:'Physical Drive Sanitization', desc:'Firmware-level hardware sanitize executing block erase or cryptographic scramble inside drive controller.', compat:'ATA/NVMe with Sanitize support', verification:'Firmware status verification', authReq:'Two-Man Authorization' },
    4: { id:'M04', name:'ATA Secure Erase',               cat:'Physical Drive Sanitization', desc:'Direct firmware-level ATA security erase unit command. Requires SATA/ATA direct controller.', compat:'SATA/ATA (not USB bridge)', verification:'Post-erase readback', authReq:'Two-Man Authorization' },
    5: { id:'M05', name:'NVMe Secure Erase',              cat:'Physical Drive Sanitization', desc:'High-performance NVMe Sanitize Crypto/Block Erase via PCIe controller.', compat:'PCIe NVMe (non-system)', verification:'NVMe sanitize log verification', authReq:'Two-Man Authorization' },
    6: { id:'M06', name:'IEEE 2883 Purge',                 cat:'Physical Drive Sanitization', desc:'Modern IEEE 2883-2022 storage sanitization standard for solid-state and non-volatile memory.', compat:'Supported SSD/NVMe', verification:'IEEE standard verification', authReq:'Two-Man Authorization' },
    7: { id:'M07', name:'Verified Overwrite',             cat:'Physical Drive Sanitization', desc:'Multi-pass or single-pass physical block overwrite with full write verification and cryptographic hashing.', compat:'All block devices', verification:'Full readback + SHA-256', authReq:'Two-Man Authorization' },
  };
  return registry[mid] || registry[2];
}

// ─── PHASE 1: ENTRY — TARGET + METHOD + PREFLIGHT ─────────────────────────────

function presRenderDriveSanitization() {
  if (DRIVE_DEMO._animTimer) { clearTimeout(DRIVE_DEMO._animTimer); DRIVE_DEMO._animTimer = null; }
  DRIVE_DEMO.active = true;
  DRIVE_DEMO.phase = 'TARGET';
  DRIVE_DEMO.operator = (typeof STATE !== 'undefined' && STATE.currentRole) ? STATE.currentRole.replace(/_/g,' ') : 'Forensic Analyst';
  DRIVE_DEMO.approver = null;
  DRIVE_DEMO._logLines = [];

  const v = _view(); if (!v) return;
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();

  v.innerHTML = `
    <!-- Context Bar -->
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Physical Drive Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">JOB</span><code>${DRIVE_DEMO.jobId}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-warn" style="font-size:10px;">AUTHORIZATION REQUIRED</span></div>
    </div>

    <!-- Main 3-Column: Target, Method, Case -->
    <div class="pres-3col mt-12">

      <!-- Col 1: Target Device -->
      <div class="card">
        <div class="section-label">TARGET DEVICE</div>
        <div style="margin-top:6px;font-size:15px;font-weight:800;color:var(--drex-text-main);">${_E(t.model)}</div>
        <div class="pres-info-grid" style="margin-top:10px;">
          <span class="pres-info-label">Device</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(t.path)}</span>
          <span class="pres-info-label">Drive Letter</span><span class="pres-info-val">${_E(t.letter)}</span>
          <span class="pres-info-label">Capacity</span><span class="pres-info-val pres-info-accent">${_E(t.capacity)}</span>
          <span class="pres-info-label">Interface</span><span class="pres-info-val">${_E(t.bus)}</span>
          <span class="pres-info-label">Filesystem</span><span class="pres-info-val">${_E(t.fs)}</span>
          <span class="pres-info-label">Partition</span><span class="pres-info-val">${_E(t.partition)}</span>
          <span class="pres-info-label">Serial</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(t.serial)}</span>
          <span class="pres-info-label">System Disk</span><span class="pres-info-val"><span class="badge ${t.isSystem?'badge-fail':'badge-pass'}" style="font-size:9px;">${t.isSystem?'YES':'NO'}</span></span>
          <span class="pres-info-label">Boot Device</span><span class="pres-info-val"><span class="badge ${t.isBoot?'badge-fail':'badge-pass'}" style="font-size:9px;">${t.isBoot?'YES':'NO'}</span></span>
          <span class="pres-info-label">Health</span><span class="pres-info-val" style="color:var(--drex-status-pass);font-weight:600;">${_E(t.health)}</span>
          <span class="pres-info-label">Safety</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">QUALIFIED TARGET</span></span>
        </div>
      </div>

      <!-- Col 2: Method -->
      <div class="card">
        <div class="section-label">SANITIZATION METHOD</div>
        <div style="margin-top:8px;">
          <div style="font-size:22px;font-weight:900;color:var(--drex-primary);letter-spacing:-0.01em;">${m.id}</div>
          <div style="font-size:13px;font-weight:700;color:var(--drex-text-main);margin-top:2px;">${_E(m.name)}</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">${_E(m.cat)}</div>
        </div>
        <div class="pres-info-grid" style="margin-top:10px;">
          <span class="pres-info-label">Category</span><span class="pres-info-val" style="font-size:11px;">${_E(m.cat)}</span>
          <span class="pres-info-label">Compatibility</span><span class="pres-info-val" style="font-size:11px;">${_E(m.compat)}</span>
          <span class="pres-info-label">Verification</span><span class="pres-info-val" style="font-size:11px;">${_E(m.verification)}</span>
          <span class="pres-info-label">Authorization</span><span class="pres-info-val"><span class="badge badge-warn" style="font-size:9px;">${_E(m.authReq)}</span></span>
        </div>
        <p style="font-size:11px;color:var(--drex-text-muted);margin-top:10px;line-height:1.5;border-top:1px solid var(--drex-border-subtle);padding-top:8px;">
          ${_E(m.desc)}
        </p>
      </div>

      <!-- Col 3: Case & Preflight -->
      <div class="card">
        <div class="section-label">CASE &amp; PREFLIGHT</div>
        <div class="pres-info-grid" style="margin-top:8px;">
          <span class="pres-info-label">Case ID</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${_E(caseId)}</span>
          <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
          <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${DRIVE_DEMO.jobId}</span>
        </div>
        <div style="margin-top:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--drex-text-muted);margin-bottom:6px;">SANITIZATION PREFLIGHT</div>
          <div class="pres-checklist-grid" style="grid-template-columns:1fr;">
            ${['Target device detected','Device identity confirmed','Capacity identified','Interface identified','System-disk protection','Boot-device protection','Method compatibility','Case binding','Authorization policy','Safety policy'].map(c=>_checkItem(c,true)).join('')}
          </div>
        </div>
        <div style="margin-top:10px;padding:6px 10px;background:rgba(22,138,74,0.06);border:1px solid var(--drex-status-pass-border);border-radius:4px;text-align:center;">
          <span style="font-size:11px;font-weight:700;color:var(--drex-status-pass);">PREFLIGHT COMPLETE · TARGET ELIGIBLE</span>
        </div>
      </div>
    </div>

    <!-- Proceed to Authorization -->
    <div style="margin-top:14px;display:flex;align-items:center;gap:12px;">
      <button class="action-btn pres-exec-btn" style="width:auto;padding:8px 24px;font-size:12px;" onclick="presDriveAuthStep1()">
        Proceed to Two-Man Authorization →
      </button>
      <span style="font-size:11px;color:var(--drex-text-muted);">All preflight checks passed · ${m.id} · ${_E(t.model)}</span>
    </div>
  `;
}

// ─── PHASE 2: TWO-MAN AUTHORIZATION STEP 1 ────────────────────────────────────

function presDriveAuthStep1() {
  DRIVE_DEMO.phase = 'AUTH_STEP1';
  const v = _view(); if (!v) return;
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();
  const cleanTarget = t.path.replace(/[:\\//.]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
  const phrase = `ERASE-${cleanTarget}-PERMANENT`;

  v.innerHTML = `
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Physical Drive Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-warn" style="font-size:10px;">TWO-MAN RULE · STEP 1</span></div>
    </div>

    <div class="card mt-12">
      <div style="color:var(--drex-status-fail);font-weight:800;font-size:12px;letter-spacing:0.08em;">⚠ CRITICAL DESTRUCTIVE OPERATION · TWO-MAN RULE</div>
      <h3 style="font-size:17px;margin:4px 0 8px;">Dual Authorization Physical Drive Sanitization</h3>

      <!-- Stepper -->
      <div style="display:flex;gap:8px;margin-bottom:12px;background:rgba(0,0,0,0.03);padding:8px 12px;border-radius:4px;font-size:11px;">
        <div id="ddStep1Ind" style="font-weight:700;color:var(--drex-primary);">● STEP 1: Operator Confirmation</div>
        <div style="color:var(--drex-text-muted);">→</div>
        <div id="ddStep2Ind" style="color:var(--drex-text-muted);">○ STEP 2: Independent Approver</div>
      </div>

      <p style="font-size:12px;color:var(--drex-text-muted);margin-bottom:8px;">
        Target Device: <strong>${_E(t.model)} (<code>${_E(t.path)}</code>)</strong>.<br>
        Selected Method: <strong>${m.id} — ${_E(m.name)}</strong> · Bound Case: <strong>${_E(caseId)}</strong>.
      </p>

      <div class="pres-info-grid" style="margin-bottom:12px;">
        <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
        <span class="pres-info-label">Role</span><span class="pres-info-val">${_E((typeof STATE !== 'undefined' && STATE.currentRole) || 'JUDGE_DEMO')}</span>
        <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${_E(caseId)}</span>
      </div>

      <!-- Phrase Entry -->
      <div style="font-size:11px;font-weight:700;color:var(--drex-text-muted);margin-bottom:4px;">OPERATOR VERIFICATION PHRASE:</div>
      <div class="safety-phrase-box">${phrase}</div>
      <input type="text" id="ddPhraseInput" class="safety-input" placeholder="Type exact phrase here..." autocomplete="off" style="margin-top:6px;">
      <div style="font-size:10px;color:var(--drex-text-muted);margin-top:2px;">
        Required: <code style="font-size:10px;background:#f1f5f9;padding:1px 4px;border-radius:2px;user-select:all;cursor:pointer;">${phrase}</code>
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
        <button class="action-btn" style="width:auto;background:#e2e8f0;color:#334155;" onclick="presRenderDriveSanitization()">← Back</button>
        <button class="action-btn" style="width:auto;background:var(--drex-primary);color:#fff;" id="ddStep1Btn" disabled onclick="presDriveAuthStep1Submit()">Submit Step 1 (Operator)</button>
      </div>
    </div>
  `;

  // Enable button when phrase matches
  const input = document.getElementById('ddPhraseInput');
  const btn = document.getElementById('ddStep1Btn');
  if (input && btn) {
    input.addEventListener('input', () => {
      const match = input.value.trim().toUpperCase() === phrase || input.value.trim().replace(/:/g,'_').toUpperCase() === phrase;
      btn.disabled = !match;
    });
  }
}

function presDriveAuthStep1Submit() {
  DRIVE_DEMO.phase = 'AUTH_STEP2';
  presDriveAuthStep2();
}

// ─── PHASE 3: TWO-MAN AUTHORIZATION STEP 2 ────────────────────────────────────

function presDriveAuthStep2() {
  const v = _view(); if (!v) return;
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();

  v.innerHTML = `
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Physical Drive Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-warn" style="font-size:10px;">TWO-MAN RULE · STEP 2</span></div>
    </div>

    <div class="card mt-12">
      <div style="color:var(--drex-status-fail);font-weight:800;font-size:12px;letter-spacing:0.08em;">⚠ CRITICAL DESTRUCTIVE OPERATION · TWO-MAN RULE</div>
      <h3 style="font-size:17px;margin:4px 0 8px;">Dual Authorization Physical Drive Sanitization</h3>

      <!-- Stepper -->
      <div style="display:flex;gap:8px;margin-bottom:12px;background:rgba(0,0,0,0.03);padding:8px 12px;border-radius:4px;font-size:11px;">
        <div style="font-weight:700;color:var(--drex-status-pass);">✓ STEP 1: Operator Confirmed</div>
        <div style="color:var(--drex-text-muted);">→</div>
        <div style="font-weight:700;color:var(--drex-primary);">● STEP 2: Independent Approver</div>
      </div>

      <div style="padding:8px 12px;background:#ecfdf5;border:1px solid #10b981;border-radius:4px;color:#065f46;font-size:11px;margin-bottom:10px;">
        ✓ <strong>STEP 1 VERIFIED:</strong> Operator confirmed safety phrase. Awaiting Independent Approver authorization.
      </div>

      <div class="grid grid-2" style="gap:8px;">
        <div>
          <label style="font-size:10px;font-weight:700;color:var(--drex-text-muted);display:block;margin-bottom:2px;">APPROVER USERNAME</label>
          <input type="text" id="ddApproverUser" class="safety-input" value="admin" style="padding:6px;font-size:11px;">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:var(--drex-text-muted);display:block;margin-bottom:2px;">APPROVER PASSWORD</label>
          <input type="password" id="ddApproverPass" class="safety-input" value="admin123" style="padding:6px;font-size:11px;">
        </div>
      </div>
      <div style="margin-top:6px;">
        <label style="font-size:10px;font-weight:700;color:var(--drex-text-muted);display:block;margin-bottom:2px;">APPROVER NOTES</label>
        <input type="text" id="ddApproverNotes" class="safety-input" value="Authorized for guided demonstration workflow" style="padding:6px;font-size:11px;">
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
        <button class="action-btn" style="width:auto;background:#e2e8f0;color:#334155;" onclick="presDriveAuthStep1()">← Back to Step 1</button>
        <button class="action-btn" style="width:auto;background:var(--drex-status-fail);color:#fff;" onclick="presDriveAuthStep2Submit()">Approve &amp; Proceed (Step 2)</button>
      </div>
    </div>
  `;
}

function presDriveAuthStep2Submit() {
  DRIVE_DEMO.approver = document.getElementById('ddApproverUser')?.value || 'admin';
  DRIVE_DEMO.phase = 'AUTH_REVIEW';
  presDriveAuthReview();
}

// ─── PHASE 4: AUTHORIZATION REVIEW ────────────────────────────────────────────

function presDriveAuthReview() {
  const v = _view(); if (!v) return;
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();

  v.innerHTML = `
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Physical Drive Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-pass" style="font-size:10px;">✓ TWO-MAN AUTHORIZED</span></div>
    </div>

    <div class="card mt-12">
      <div class="section-label">FINAL AUTHORIZATION REVIEW</div>
      <h3 style="font-size:16px;margin:4px 0 10px;color:var(--drex-text-main);">Two-Man Authorization Complete</h3>

      <div class="pres-2col" style="gap:16px;">
        <div class="pres-info-grid">
          <span class="pres-info-label">Target</span><span class="pres-info-val" style="font-weight:700;">${_E(t.model)}</span>
          <span class="pres-info-label">Physical Device</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(t.path)}</span>
          <span class="pres-info-label">Capacity</span><span class="pres-info-val">${_E(t.capacity)}</span>
          <span class="pres-info-label">Method</span><span class="pres-info-val">${m.id} — ${_E(m.name)}</span>
          <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${_E(caseId)}</span>
        </div>
        <div class="pres-info-grid">
          <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
          <span class="pres-info-label">Approver</span><span class="pres-info-val">${_E(DRIVE_DEMO.approver)}</span>
          <span class="pres-info-label">Authorization</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">TWO-MAN APPROVED</span></span>
          <span class="pres-info-label">Safety</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASSED</span></span>
          <span class="pres-info-label">Preflight</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">10 / 10 CHECKS</span></span>
        </div>
      </div>

      <div style="margin-top:16px;display:flex;align-items:center;gap:12px;">
        <button class="action-btn pres-exec-btn" style="width:auto;padding:10px 28px;font-size:13px;font-weight:800;" onclick="presDriveBeginExecution()">
          ⚡ BEGIN SANITIZATION WORKFLOW
        </button>
        <span style="font-size:11px;color:var(--drex-text-muted);">This will NOT execute against the physical device</span>
      </div>
      <div style="margin-top:6px;">${_demoDisclosure()}</div>
    </div>
  `;
}

// ─── PHASE 5: EXECUTION ───────────────────────────────────────────────────────

function presDriveBeginExecution() {
  DRIVE_DEMO.phase = 'EXECUTING';
  DRIVE_DEMO.startTime = Date.now();
  DRIVE_DEMO._logLines = [];

  const v = _view(); if (!v) return;
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();

  v.innerHTML = `
    <div class="pres-context-bar">
      <div class="pres-ctx-item"><span class="pres-ctx-label">OPERATION</span><span>Physical Drive Sanitization</span></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">CASE</span><code>${_E(caseId)}</code></div>
      <div class="pres-ctx-item"><span class="pres-ctx-label">JOB</span><code>${DRIVE_DEMO.jobId}</code></div>
      <div class="pres-ctx-sep"></div>
      <div class="pres-ctx-item"><span class="badge badge-running" style="font-size:10px;" id="ddCtxBadge">EXECUTING</span></div>
      <div class="pres-ctx-item" style="margin-left:auto;">${_demoDisclosure()}</div>
    </div>

    <!-- Job Header -->
    <div class="card mt-12 pres-job-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">ACTIVE SANITIZATION OPERATION</div>
          <div style="font-size:16px;font-weight:800;color:var(--drex-text-main);">Physical Drive Sanitization</div>
        </div>
        <span id="ddJobBadge" class="badge badge-running">EXECUTING</span>
      </div>
      <div class="pres-job-meta">
        <div><span class="pres-meta-k">JOB</span><code>${DRIVE_DEMO.jobId}</code></div>
        <div><span class="pres-meta-k">CASE</span><code>${_E(caseId)}</code></div>
        <div><span class="pres-meta-k">METHOD</span>${m.id} — ${_E(m.name)}</div>
        <div><span class="pres-meta-k">TARGET</span>${_E(t.model)}</div>
        <div><span class="pres-meta-k">STARTED</span><span id="ddStartTs">${_ts()}</span></div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="pres-progress-bar-wrap mt-10">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span class="pres-meta-k">PROGRESS</span>
        <span id="ddProgPct" style="font-size:12px;font-weight:700;color:var(--drex-primary);">0%</span>
      </div>
      <div class="pres-progress-track"><div id="ddProgBar" class="pres-progress-fill" style="width:0%;"></div></div>
    </div>

    <!-- 3-column: Pipeline + Metrics + Log -->
    <div class="pres-3col mt-12">

      <!-- Pipeline -->
      <div class="card">
        <div class="section-label">OPERATION PIPELINE</div>
        <div id="ddPipeline" style="margin-top:6px;"></div>
      </div>

      <!-- Metrics -->
      <div class="card">
        <div class="section-label">LIVE METRICS</div>
        <div id="ddMetrics" class="pres-metrics-grid mt-6"></div>
      </div>

      <!-- Log -->
      <div class="card" style="overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="section-label">OPERATION LOG</div>
          <button onclick="presDriveToggleLog()" style="background:none;border:none;cursor:pointer;font-size:10px;color:var(--drex-text-muted);padding:2px 4px;" id="ddLogToggleBtn">▾ collapse</button>
        </div>
        <div id="ddLogWrap">
          <div id="ddLog" class="pres-log mt-6"></div>
        </div>
      </div>
    </div>

    <!-- Post-Op (hidden) -->
    <div id="ddPostOp" style="display:none;"></div>
  `;

  _presDriveAnimate();
}

let _ddLogCollapsed = false;
function presDriveToggleLog() {
  _ddLogCollapsed = !_ddLogCollapsed;
  const wrap = document.getElementById('ddLogWrap');
  const btn = document.getElementById('ddLogToggleBtn');
  if (wrap) wrap.style.display = _ddLogCollapsed ? 'none' : '';
  if (btn) btn.textContent = _ddLogCollapsed ? '▸ expand' : '▾ collapse';
}

// ─── EXECUTION ANIMATION ──────────────────────────────────────────────────────

function _presDriveAnimate() {
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const capGB = t.capacityGB;

  const STAGES = [
    { title:'Target Lock',          doneText:'Device handle acquired',               activeText:'Acquiring exclusive device handle…' },
    { title:'Pre-Flight',           doneText:'All checks passed',                    activeText:'Running preflight validation…'     },
    { title:'Authorization',        doneText:'Two-Man Rule satisfied',               activeText:'Verifying dual authorization…'     },
    { title:'Sanitization',         doneText:'All sectors processed',                activeText:'Processing addressable sectors…'   },
    { title:'Verification',         doneText:'Verification complete',                activeText:'Running verification sequence…'    },
    { title:'Audit',                doneText:'Audit chain sealed',                   activeText:'Finalizing audit record…'          },
    { title:'Certificate',          doneText:'Certificate ready',                    activeText:'Generating certificate…'           },
  ];

  const LOG_EVENTS = [
    [0,  'Target identity verified'],
    [0,  'Safety policy loaded'],
    [1,  `Method ${m.id} selected`],
    [1,  'Preflight completed'],
    [2,  'Operator authorization verified'],
    [2,  'Independent authorization verified'],
    [3,  'Operation initialized'],
    [4,  'Sanitization workflow started'],
    [6,  'Processing address range 0x00000000–0x1FFFFFFF'],
    [8,  'Processing address range 0x20000000–0x3FFFFFFF'],
    [10, 'Processing address range 0x40000000–0x7FFFFFFF'],
    [12, 'Processing complete — all sectors addressed'],
    [13, 'Verification initialized'],
    [14, 'Verification sequence complete'],
    [15, 'Audit chain updated'],
    [16, 'Certificate eligibility confirmed'],
  ];

  const TOTAL = 18;
  const STEP_MS = 600;
  let step = 0;

  function tick() {
    const stageMap = [0,0,1,1,2,2,3,3,3,3,3,3,3,4,4,5,6,6,7];
    const stageIdx = stageMap[step] ?? 7;
    const pct = Math.min(100, Math.round((step / TOTAL) * 100));

    // Progress
    const bar = document.getElementById('ddProgBar');
    const pctEl = document.getElementById('ddProgPct');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    // Pipeline
    _renderPipeline('ddPipeline', STAGES, Math.min(stageIdx, STAGES.length - 1));

    // Metrics
    const dataGB = ((pct / 100) * capGB).toFixed(1);
    const elapsed = ((step * STEP_MS) / 1000).toFixed(0);
    const elapsedStr = `00:${String(elapsed).padStart(2, '0')}`;
    const speed = step > 3 ? ((parseFloat(dataGB) / (elapsed || 1)) * 1024).toFixed(0) : '—';
    const metricsEl = document.getElementById('ddMetrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        _metricTile('CAPACITY', t.capacity, 'var(--drex-text-main)') +
        _metricTile('RANGE', step > 2 ? 'ACTIVE' : 'READY', step > 2 ? 'var(--drex-primary)' : 'var(--drex-text-muted)') +
        _metricTile('PROGRESS', pct + '%', 'var(--drex-primary)') +
        _metricTile('PROCESSED', dataGB + ' GB', 'var(--drex-text-main)') +
        _metricTile('SPEED', speed === '—' ? '—' : speed + ' MB/s', 'var(--drex-text-main)') +
        _metricTile('FAILED', '0', 'var(--drex-status-pass)') +
        _metricTile('SKIPPED', '0', 'var(--drex-status-pass)') +
        _metricTile('ELAPSED', elapsedStr, 'var(--drex-text-main)');
    }

    // Log
    const logEl = document.getElementById('ddLog');
    LOG_EVENTS.filter(e => e[0] === step).forEach(e => {
      DRIVE_DEMO._logLines.push(`${_ts(step * (STEP_MS / 1000))}  ${e[1]}`);
    });
    if (logEl) {
      logEl.innerHTML = DRIVE_DEMO._logLines.map(l => `<div>${_E(l)}</div>`).join('');
      logEl.scrollTop = logEl.scrollHeight;
    }

    step++;
    if (step <= TOTAL) {
      DRIVE_DEMO._animTimer = setTimeout(tick, STEP_MS);
    } else {
      DRIVE_DEMO.phase = 'COMPLETE';
      if (bar) bar.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      const jobBadge = document.getElementById('ddJobBadge');
      const ctxBadge = document.getElementById('ddCtxBadge');
      if (jobBadge) { jobBadge.className = 'badge badge-pass'; jobBadge.textContent = 'COMPLETE'; }
      if (ctxBadge) { ctxBadge.className = 'badge badge-pass'; ctxBadge.textContent = 'COMPLETE'; ctxBadge.style.fontSize = '10px'; }
      _presDriveShowPostOp();
    }
  }
  tick();
}

// ─── POST-OPERATION ───────────────────────────────────────────────────────────

function _presDriveShowPostOp() {
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();
  const postOp = document.getElementById('ddPostOp');
  if (!postOp) return;
  postOp.style.display = 'block';

  postOp.innerHTML = `
    <!-- Verification + Audit -->
    <div class="pres-2col mt-12">

      <!-- Verification -->
      <div class="card pres-result-card pres-result-pass">
        <div class="section-label">SANITIZATION VERIFICATION</div>
        <div class="pres-checklist-grid mt-6" style="grid-template-columns:1fr;">
          ${['Operation state consistency','Target identity consistency','Method consistency','Authorization consistency','Demonstration verification sequence'].map(c=>_checkItem(c,true)).join('')}
        </div>
        <div class="pres-verdict-block mt-10">
          <div style="font-size:20px;font-weight:900;color:var(--drex-status-pass);">PASS</div>
          <div style="font-size:10px;color:var(--drex-text-muted);margin-top:2px;">VERIFICATION RESULT</div>
        </div>
        <div class="pres-info-grid mt-8">
          <span class="pres-info-label">Checks</span><span class="pres-info-val">5 / 5</span>
          <span class="pres-info-label">Operation</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">COMPLETE</span></span>
        </div>
        <div style="margin-top:8px;">${_demoDisclosure()}</div>
      </div>

      <!-- Audit -->
      <div class="card">
        <div class="section-label">AUDIT FINALIZATION</div>
        <div class="pres-info-grid mt-6">
          <span class="pres-info-label">Event</span><span class="pres-info-val" style="font-size:11px;">DRIVE_SANITIZATION_COMPLETED</span>
          <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${_E(caseId)}</span>
          <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:11px;">${DRIVE_DEMO.jobId}</span>
          <span class="pres-info-label">Target</span><span class="pres-info-val">${_E(t.model)}</span>
          <span class="pres-info-label">Method</span><span class="pres-info-val">${m.id}</span>
          <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
          <span class="pres-info-label">Approver</span><span class="pres-info-val">${_E(DRIVE_DEMO.approver)}</span>
          <span class="pres-info-label">Authorization</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">TWO-MAN</span></span>
          <span class="pres-info-label">Result</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">SUCCESS</span></span>
          <span class="pres-info-label">Verification</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASS</span></span>
          <span class="pres-info-label">Integrity</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">VALID</span></span>
          <span class="pres-info-label">Audit Chain</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">VALID</span></span>
          <span class="pres-info-label">Timestamp</span><span class="pres-info-val" style="font-size:10px;">${new Date().toISOString()}</span>
        </div>
        <div style="margin-top:10px;padding:6px 10px;background:rgba(22,138,74,0.06);border:1px solid var(--drex-status-pass-border);border-radius:4px;text-align:center;">
          <span style="font-size:11px;font-weight:700;color:var(--drex-status-pass);">AUDIT CHAIN · VALID</span>
        </div>
      </div>
    </div>

    <!-- Completion Card -->
    <div class="card mt-12 pres-completion-card">
      <div class="pres-completion-header">
        <div>
          <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);">SANITIZATION WORKFLOW COMPLETE</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">All stages finalized · Two-Man Authorization satisfied</div>
        </div>
        <div class="pres-completion-checks">
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Execution complete</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Verification passed</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Audit finalized</div>
          <div style="color:var(--drex-status-pass);font-weight:700;font-size:12px;">✓ Certificate ready</div>
        </div>
      </div>
      <div class="pres-completion-summary mt-10">
        ${_metricTile('TARGET', _E(t.model), 'var(--drex-text-main)')}
        ${_metricTile('METHOD', m.id + ' — ' + _E(m.name), 'var(--drex-text-main)')}
        ${_metricTile('AUTHORIZATION', 'Two-Man Rule', 'var(--drex-status-pass)')}
        ${_metricTile('VERIFICATION', 'PASS', 'var(--drex-status-pass)')}
        ${_metricTile('AUDIT', 'VALID', 'var(--drex-status-pass)')}
        ${_metricTile('CERTIFICATE', 'READY', 'var(--drex-primary)')}
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;border-top:1px solid var(--drex-border-subtle);padding-top:12px;flex-wrap:wrap;">
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);padding:8px 16px;font-size:12px;">View Audit</button>
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);padding:8px 16px;font-size:12px;">View Verification</button>
        <button class="action-btn pres-exec-btn" style="width:auto;padding:8px 20px;font-size:12px;" onclick="presDriveShowCertificate()">📜 Generate Certificate</button>
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-muted);border:1px solid var(--drex-border-base);padding:8px 14px;font-size:11px;" onclick="presRenderDriveSanitization()">↻ New Operation</button>
        <button class="action-btn" style="width:auto;background:var(--drex-bg-surface-subtle);color:var(--drex-text-muted);border:1px solid var(--drex-border-base);padding:8px 14px;font-size:11px;" onclick="navigateTo('drive_eraser')">← Return to Drive Eraser</button>
      </div>
      <div style="margin-top:8px;">${_demoDisclosure()}</div>
    </div>
  `;
}

// ─── DRIVE CERTIFICATE ────────────────────────────────────────────────────────

function presDriveShowCertificate() {
  const t = _getDriveDemoTarget();
  const m = _getDriveDemoMethod();
  const caseId = _getDriveDemoCase();
  const box = document.getElementById('modalBox');
  const overlay = document.getElementById('modalOverlay');
  if (!box || !overlay) return;

  box.innerHTML = `
    <div class="pres-cert" style="max-width:600px;">
      <!-- Cert Header -->
      <div class="pres-cert-header">
        <div class="pres-cert-wordmark">DREX V2</div>
        <div class="pres-cert-submark">Digital Forensics &amp; Secure Erasure Workstation</div>
        <div class="pres-cert-title">Sanitization Workflow Certificate</div>
        <div class="pres-cert-id">Certificate ID: ${DRIVE_DEMO.certId}</div>
      </div>

      <!-- Body -->
      <div class="pres-cert-body">
        <div class="pres-cert-section">
          <div class="pres-cert-section-title">CASE INFORMATION</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Case</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${_E(caseId)}</span>
            <span class="pres-info-label">Job</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);">${DRIVE_DEMO.jobId}</span>
            <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
            <span class="pres-info-label">Approver</span><span class="pres-info-val">${_E(DRIVE_DEMO.approver)}</span>
            <span class="pres-info-label">Timestamp</span><span class="pres-info-val" style="font-size:10px;">${new Date().toISOString()}</span>
          </div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">TARGET DEVICE</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Device</span><span class="pres-info-val" style="font-weight:700;">${_E(t.model)}</span>
            <span class="pres-info-label">Path</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(t.path)}</span>
            <span class="pres-info-label">Capacity</span><span class="pres-info-val">${_E(t.capacity)}</span>
            <span class="pres-info-label">Interface</span><span class="pres-info-val">${_E(t.bus)}</span>
            <span class="pres-info-label">Serial</span><span class="pres-info-val" style="font-family:var(--drex-font-mono);font-size:10px;">${_E(t.serial)}</span>
          </div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">METHOD</div>
          <div style="font-weight:700;font-size:13px;color:var(--drex-text-main);">${m.id} — ${_E(m.name)}</div>
          <div style="font-size:11px;color:var(--drex-text-muted);margin-top:2px;">${_E(m.cat)}</div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">AUTHORIZATION</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Type</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">TWO-MAN AUTHORIZATION</span></span>
            <span class="pres-info-label">Operator</span><span class="pres-info-val">${_E(DRIVE_DEMO.operator)}</span>
            <span class="pres-info-label">Independent Approver</span><span class="pres-info-val">${_E(DRIVE_DEMO.approver)}</span>
          </div>
        </div>

        <div class="pres-cert-section">
          <div class="pres-cert-section-title">RESULT</div>
          <div class="pres-info-grid">
            <span class="pres-info-label">Execution</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">SUCCESS</span></span>
            <span class="pres-info-label">Verification</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">PASS</span></span>
            <span class="pres-info-label">Audit</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">VALID</span></span>
            <span class="pres-info-label">Integrity</span><span class="pres-info-val"><span class="badge badge-pass" style="font-size:9px;">VALID</span></span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pres-cert-footer">
        <div>DREX V2 &nbsp;·&nbsp; Build <code>${(typeof PRES !== 'undefined' && PRES.buildCommit) || '9d8ba92'}</code></div>
        <div>${_demoDisclosure()}</div>
      </div>

      <div style="text-align:center;margin-top:14px;">
        <button class="action-btn" style="width:auto;padding:7px 20px;background:var(--drex-bg-surface-subtle);color:var(--drex-text-main);border:1px solid var(--drex-border-base);font-size:12px;" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
  overlay.style.display = 'grid';
}

// ─── GLOBAL EXPORTS ───────────────────────────────────────────────────────────

window.presRenderFileEraser   = presRenderFileEraser;
window.presStartEraserExecution = presStartEraserExecution;
window.presToggleLog          = presToggleLog;
window.presShowCertificate    = presShowCertificate;
window.presRenderRecovery     = presRenderRecovery;
window.presStartRecoveryScan  = presStartRecoveryScan;
window.presClickCandidate     = presClickCandidate;
window.presToggleCandidate    = presToggleCandidate;
window.presSelectTop5         = presSelectTop5;
window.presStartRecovery      = presStartRecovery;
window.presShowRecoveryReport = presShowRecoveryReport;

// Drive Sanitization Demo
window.presRenderDriveSanitization = presRenderDriveSanitization;
window.presDriveAuthStep1          = presDriveAuthStep1;
window.presDriveAuthStep1Submit    = presDriveAuthStep1Submit;
window.presDriveAuthStep2          = presDriveAuthStep2;
window.presDriveAuthStep2Submit    = presDriveAuthStep2Submit;
window.presDriveAuthReview         = presDriveAuthReview;
window.presDriveBeginExecution     = presDriveBeginExecution;
window.presDriveToggleLog          = presDriveToggleLog;
window.presDriveShowCertificate    = presDriveShowCertificate;
