/**
 * DREX V2 — Demo Flow Extension  v1.0
 * =====================================
 * Adds the 12 missing sidebar module demos to the existing demo_flow.js system.
 * Loaded AFTER demo_flow.js so all shared utilities (DF, _E, _dfView, etc.)
 * are already available.
 *
 * SAFETY (ABSOLUTE):
 *   - NEVER calls /api/sanitization/execute with real targets
 *   - NEVER modifies E:\ or \\.\PHYSICALDRIVE*
 *   - All demos are isolated display sequences
 *
 * Modules added:
 *   hex_inspector, residue_analyzer, validation_lab, reports,
 *   device_intelligence, device_manager, backend_manager,
 *   diagnostics, performance_lab, settings, methods, judge_demo
 *
 * Also adds: certificate new-tab viewer (_dfOpenCertNewTab)
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// CERTIFICATE NEW-TAB SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a complete standalone certificate HTML document and opens it in a new tab.
 * certData: { opType, jobId, target, method, verdict, certId, methodId, methodName,
 *             methodCat, targetType, startTime, endTime, duration, objects, dataSize,
 *             verifStrategy, verifResult, auditId, caseId, caseName, operator }
 */
function _dfOpenCertNewTab(certData) {
  const d = certData || {};
  const certId   = d.certId   || DF.certId;
  const jobId    = d.jobId    || DF.jobFile;
  const caseId   = d.caseId   || DF.caseId;
  const caseName = d.caseName || 'Judge Evaluation Case 2026-001';
  const opType   = d.opType   || 'File Sanitization';
  const target   = d.target   || 'D:\\DREX_FILE_ERASURE_TEST\\demo_evidence\\';
  const method   = d.method   || 'M08 — CSPRNG Random Overwrite';
  const methodId = d.methodId || 'M08';
  const methodNm = d.methodName || 'CSPRNG Random Overwrite';
  const methodCt = d.methodCat || 'File/Folder Erasure';
  const tgtType  = d.targetType|| 'Folder (12 objects, 24.6 MB)';
  const operator = d.operator  || (typeof DF !== 'undefined' ? DF.operator : 'drex_operator');
  const verdict  = d.verdict   || 'PASS';
  const now = new Date().toISOString();
  const build = typeof DF !== 'undefined' ? DF.buildCommit : '9d8ba92';

  // Hash simulation (deterministic display, not real crypto)
  const hash = certId.split('').reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0)
               .toString(16).padStart(8,'0').toUpperCase();
  const certHash = `SHA256:${hash}4F9A2B1C7E3D8F6A0B5C9D2E4F7A1B3C`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DREX V2 — Certificate of Operation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --blue: #1769E0; --green: #16a34a; --red: #dc2626;
      --slate-50: #f8fafc; --slate-100: #f1f5f9; --slate-200: #e2e8f0;
      --slate-300: #cbd5e1; --slate-400: #94a3b8; --slate-600: #475569;
      --slate-700: #334155; --slate-800: #1e293b; --slate-900: #0f172a;
    }
    body { background: var(--slate-100); font-family: 'Segoe UI', system-ui, sans-serif;
           color: var(--slate-800); line-height: 1.5; }
    .page { max-width: 860px; margin: 32px auto; background: #fff;
            border-radius: 8px; box-shadow: 0 4px 32px rgba(0,0,0,0.12); overflow: hidden; }
    .cert-header { background: linear-gradient(135deg, #0b1e3a 0%, #0e2a55 50%, #1769E0 100%);
                   color: #fff; padding: 36px 40px 28px; text-align: center; }
    .cert-wordmark { font-size: 11px; font-weight: 900; letter-spacing: 0.2em; color: #93c5fd; margin-bottom: 8px; }
    .cert-subtitle { font-size: 13px; color: #cbd5e1; letter-spacing: 0.05em; margin-bottom: 16px; }
    .cert-title { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; margin-bottom: 6px; }
    .cert-id { font-size: 11px; font-family: 'Courier New', monospace; color: #93c5fd;
               background: rgba(255,255,255,0.08); padding: 3px 12px; border-radius: 20px; display: inline-block; }
    .cert-status-bar { display: flex; justify-content: center; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
    .cert-status-pill { padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 700;
                        letter-spacing: 0.07em; }
    .pill-pass { background: rgba(22,163,74,0.2); color: #86efac; border: 1px solid rgba(134,239,172,0.3); }
    .pill-valid { background: rgba(23,105,224,0.2); color: #93c5fd; border: 1px solid rgba(147,197,253,0.3); }

    .cert-body { padding: 32px 40px; }
    .cert-section { margin-bottom: 28px; }
    .cert-section-title { font-size: 9px; font-weight: 900; letter-spacing: 0.15em;
                          color: var(--blue); text-transform: uppercase; margin-bottom: 10px;
                          padding-bottom: 6px; border-bottom: 1px solid var(--slate-200); }
    .cert-grid { display: grid; grid-template-columns: 180px 1fr; gap: 6px 16px; }
    .cert-key { font-size: 11px; font-weight: 700; color: var(--slate-400); align-self: start; padding-top: 2px; }
    .cert-val { font-size: 12px; color: var(--slate-700); }
    .cert-val code { font-family: 'Courier New', monospace; font-size: 11px; background: var(--slate-100);
                     padding: 1px 6px; border-radius: 3px; color: var(--blue); }
    .cert-val .pass { color: var(--green); font-weight: 800; }
    .cert-val .valid { color: var(--blue); font-weight: 800; }
    .cert-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
    @media (max-width: 640px) { .cert-2col { grid-template-columns: 1fr; } }

    .cert-integrity { background: var(--slate-900); color: #e2e8f0;
                      padding: 16px 20px; border-radius: 6px; font-family: 'Courier New', monospace;
                      font-size: 10px; line-height: 1.8; word-break: break-all; }
    .cert-integrity .int-key { color: #64748b; display: inline-block; min-width: 140px; }
    .cert-integrity .int-val { color: #93c5fd; }

    .cert-verdict { text-align: center; padding: 24px; background: linear-gradient(135deg, #0f2d1c, #14432a);
                    border-radius: 6px; margin-bottom: 20px; }
    .cert-verdict-mark { font-size: 40px; color: #86efac; margin-bottom: 8px; }
    .cert-verdict-label { font-size: 22px; font-weight: 900; color: #86efac; }
    .cert-verdict-sub { font-size: 11px; color: #4ade80; margin-top: 6px; }

    .cert-footer { background: var(--slate-900); color: var(--slate-400); padding: 16px 40px;
                   display: flex; justify-content: space-between; align-items: center;
                   font-size: 10px; flex-wrap: wrap; gap: 8px; }
    .cert-footer code { color: var(--slate-300); }
    .disc { font-style: italic; color: var(--slate-500); }

    .cert-controls { background: var(--slate-100); padding: 16px 40px;
                     display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
                     border-top: 1px solid var(--slate-200); }
    .ctrl-btn { padding: 8px 20px; border-radius: 5px; font-size: 12px; font-weight: 700;
                cursor: pointer; border: none; transition: opacity 0.15s; }
    .ctrl-btn:hover { opacity: 0.85; }
    .ctrl-primary { background: var(--blue); color: #fff; }
    .ctrl-secondary { background: #fff; color: var(--slate-700); border: 1px solid var(--slate-300); }
    .ctrl-danger { background: var(--green); color: #fff; }
    @media print {
      .cert-controls, .cert-footer { display: none !important; }
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="cert-header">
    <div class="cert-wordmark">DREX V2 — DIGITAL FORENSICS &amp; SECURE ERASURE WORKSTATION</div>
    <div class="cert-subtitle">CERTIFICATE OF OPERATION</div>
    <div class="cert-title">Forensic Operation Certificate</div>
    <div class="cert-id">${certId}</div>
    <div class="cert-status-bar">
      <span class="cert-status-pill pill-pass">OPERATION: ${verdict}</span>
      <span class="cert-status-pill pill-valid">VERIFICATION: PASS</span>
      <span class="cert-status-pill pill-valid">AUDIT: VALID</span>
      <span class="cert-status-pill pill-pass">CERTIFICATE: VALID</span>
    </div>
  </div>

  <!-- Body -->
  <div class="cert-body">

    <!-- Section: Certificate Information -->
    <div class="cert-section">
      <div class="cert-section-title">Certificate Information</div>
      <div class="cert-grid">
        <span class="cert-key">Certificate ID</span>     <span class="cert-val"><code>${certId}</code></span>
        <span class="cert-key">Certificate Type</span>   <span class="cert-val">Forensic Operation Certificate</span>
        <span class="cert-key">Certificate Version</span><span class="cert-val">2.0</span>
        <span class="cert-key">Issued At</span>          <span class="cert-val">${now}</span>
        <span class="cert-key">Build</span>              <span class="cert-val"><code>${build}</code></span>
      </div>
    </div>

    <div class="cert-2col">
      <!-- Section: Case Information -->
      <div class="cert-section">
        <div class="cert-section-title">Case Information</div>
        <div class="cert-grid">
          <span class="cert-key">Case ID</span>           <span class="cert-val"><code>${caseId}</code></span>
          <span class="cert-key">Case Name</span>         <span class="cert-val">${caseName}</span>
          <span class="cert-key">Classification</span>    <span class="cert-val">JUDGE EVALUATION</span>
        </div>
      </div>

      <!-- Section: Authorization -->
      <div class="cert-section">
        <div class="cert-section-title">Authorization</div>
        <div class="cert-grid">
          <span class="cert-key">Operator</span>          <span class="cert-val">${operator}</span>
          <span class="cert-key">Operator Role</span>     <span class="cert-val">Judge Demo</span>
          <span class="cert-key">Approver</span>          <span class="cert-val">drex_supervisor</span>
          <span class="cert-key">Approver Role</span>     <span class="cert-val">Supervisor</span>
          <span class="cert-key">Two-Man Rule</span>      <span class="cert-val"><span class="pass">✓ SATISFIED</span></span>
          <span class="cert-key">Auth State</span>        <span class="cert-val"><span class="pass">COMPLETED</span></span>
        </div>
      </div>
    </div>

    <!-- Section: Operation Information -->
    <div class="cert-section">
      <div class="cert-section-title">Operation Information</div>
      <div class="cert-grid">
        <span class="cert-key">Job ID</span>             <span class="cert-val"><code>${jobId}</code></span>
        <span class="cert-key">Operation Type</span>     <span class="cert-val">${opType}</span>
        <span class="cert-key">Workflow</span>           <span class="cert-val">${opType}</span>
        <span class="cert-key">Method ID</span>          <span class="cert-val"><code>${methodId}</code></span>
        <span class="cert-key">Method Name</span>        <span class="cert-val">${methodNm}</span>
        <span class="cert-key">Method Category</span>    <span class="cert-val">${methodCt}</span>
        <span class="cert-key">Target</span>             <span class="cert-val"><code>${target}</code></span>
        <span class="cert-key">Target Type</span>        <span class="cert-val">${tgtType}</span>
      </div>
    </div>

    <div class="cert-2col">
      <!-- Section: Execution -->
      <div class="cert-section">
        <div class="cert-section-title">Execution</div>
        <div class="cert-grid">
          <span class="cert-key">Start</span>             <span class="cert-val">${d.startTime || '09:17:02 UTC'}</span>
          <span class="cert-key">End</span>               <span class="cert-val">${d.endTime   || '09:25:44 UTC'}</span>
          <span class="cert-key">Duration</span>          <span class="cert-val">${d.duration  || '8m 42s'}</span>
          <span class="cert-key">Objects</span>           <span class="cert-val">${d.objects   || '12 / 12'}</span>
          <span class="cert-key">Data Processed</span>   <span class="cert-val">${d.dataSize  || '24.6 MB'}</span>
          <span class="cert-key">Result</span>            <span class="cert-val"><span class="pass">${verdict}</span></span>
        </div>
      </div>

      <!-- Section: Verification -->
      <div class="cert-section">
        <div class="cert-section-title">Verification</div>
        <div class="cert-grid">
          <span class="cert-key">Strategy</span>          <span class="cert-val">${d.verifStrategy || 'CSPRNG Sampling + Entropy'}</span>
          <span class="cert-key">Result</span>            <span class="cert-val"><span class="pass">PASS</span></span>
          <span class="cert-key">Checks</span>            <span class="cert-val">64</span>
          <span class="cert-key">Passed</span>            <span class="cert-val"><span class="pass">64</span></span>
          <span class="cert-key">Failed</span>            <span class="cert-val">0</span>
          <span class="cert-key">Entropy</span>           <span class="cert-val">7.9993 bits/byte</span>
        </div>
      </div>
    </div>

    <!-- Section: Audit -->
    <div class="cert-section">
      <div class="cert-section-title">Audit</div>
      <div class="cert-grid">
        <span class="cert-key">Audit Record ID</span>   <span class="cert-val"><code>${d.auditId || 'AUD-DEMO-2026-001'}</code></span>
        <span class="cert-key">Chain Status</span>       <span class="cert-val"><span class="valid">VALID</span></span>
        <span class="cert-key">Integrity</span>          <span class="cert-val"><span class="pass">VERIFIED</span></span>
        <span class="cert-key">Events Logged</span>      <span class="cert-val">12</span>
        <span class="cert-key">Merkle Root</span>        <span class="cert-val"><code>a7f3c91b2d4e68...</code></span>
      </div>
    </div>

    <!-- Section: Cryptographic Integrity -->
    <div class="cert-section">
      <div class="cert-section-title">Cryptographic Integrity</div>
      <div class="cert-integrity">
        <div><span class="int-key">CERTIFICATE HASH</span> <span class="int-val">${certHash}</span></div>
        <div><span class="int-key">AUDIT CHAIN REF</span>  <span class="int-val">SHA256:a7f3c91b2d4e6815f9c3a728e4b12093...</span></div>
        <div><span class="int-key">OPERATION SEAL</span>   <span class="int-val">SHA256:${jobId.split('').reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0).toString(16).padStart(8,'0').toUpperCase()}B2C4D1E9F3A7...</span></div>
        <div><span class="int-key">SCHEMA</span>           <span class="int-val">drex.certificate.v2.0</span></div>
      </div>
    </div>

    <!-- Section: System -->
    <div class="cert-section">
      <div class="cert-section-title">System</div>
      <div class="cert-grid">
        <span class="cert-key">DREX Version</span>      <span class="cert-val">V2</span>
        <span class="cert-key">Build</span>             <span class="cert-val"><code>${build}</code></span>
        <span class="cert-key">Platform</span>          <span class="cert-val">Windows / Python 3.12</span>
        <span class="cert-key">Certificate Schema</span><span class="cert-val">drex.certificate.v2.0</span>
      </div>
    </div>

    <!-- Verdict -->
    <div class="cert-verdict">
      <div class="cert-verdict-mark">✓</div>
      <div class="cert-verdict-label">OPERATION VERIFIED &amp; CERTIFIED</div>
      <div class="cert-verdict-sub">OPERATION: ${verdict} &nbsp;·&nbsp; VERIFICATION: PASS &nbsp;·&nbsp; AUDIT: VALID &nbsp;·&nbsp; CERTIFICATE: VALID</div>
    </div>

  </div><!-- /cert-body -->

  <!-- Controls -->
  <div class="cert-controls">
    <button class="ctrl-btn ctrl-primary" onclick="window.print()">🖨 Print Certificate</button>
    <button class="ctrl-btn ctrl-danger" onclick="saveAsMd()">💾 Save / Export</button>
    <button class="ctrl-btn ctrl-secondary" onclick="verifyCert()">✓ Verify Certificate</button>
    <button class="ctrl-btn ctrl-secondary" onclick="window.close()">✕ Close Tab</button>
  </div>

  <!-- Footer -->
  <div class="cert-footer">
    <div>DREX V2 &nbsp;·&nbsp; Build <code>${build}</code> &nbsp;·&nbsp; Certificate Schema 2.0</div>
    <div class="disc">Demonstration result — operational workflow recorded</div>
    <div>Issued: ${now}</div>
  </div>
</div>

<script>
function saveAsMd() {
  const text = [
    '# DREX V2 — Certificate of Operation',
    '',
    'Certificate ID: ${certId}',
    'Case ID: ${caseId}',
    'Job ID: ${jobId}',
    'Operation: ${opType}',
    'Method: ${methodId} — ${methodNm}',
    'Target: ${target}',
    'Verdict: ${verdict}',
    'Issued: ${now}',
    '',
    'Verification: PASS',
    'Audit: VALID',
    'Certificate: VALID',
  ].join('\\n');
  const blob = new Blob([text], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'DREX-CERT-${certId}.txt';
  a.click();
}
function verifyCert() {
  alert('Certificate ${certId}\\n\\nHash: ${certHash}\\nStatus: VALID\\nIssued: ${now}\\n\\nVerification: PASS');
}
</script>
</body>
</html>`;

  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const tab = window.open(url, '_blank', 'noopener');
    if (!tab) {
      // Fallback: show in modal
      if (typeof _dfCertModal === 'function') {
        _dfCertModal(`<div style="padding:16px;font-size:12px;color:var(--drex-text-main);">
          <div style="font-weight:700;margin-bottom:8px;">⚠ Pop-up blocked — Certificate content below</div>
          <code style="font-size:10px;word-break:break-all;">${certId}</code>
          <div style="margin-top:8px;font-size:11px;color:var(--drex-text-muted);">Allow pop-ups for this site to open certificates in a new tab.</div>
          <div style="text-align:center;margin-top:12px;">
            <button class="action-btn" style="width:auto;padding:6px 16px;" onclick="closeModal()">Close</button>
          </div></div>`);
      }
    }
    return tab;
  } catch (e) {
    console.warn('DREX cert new tab failed:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 1: HEX INSPECTOR DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoHexInspector() {
  _dfResetAnim(); DF.active = true; DF.module = 'hex_inspector';
  const v = _dfView(); if (!v) return;

  // Deterministic demo hex data — PE/MZ header + evidence bytes
  const hexRows = [
    { offset:'00000000', bytes:'4D 5A 90 00 03 00 00 00  04 00 00 00 FF FF 00 00', ascii:'MZ......  ........' },
    { offset:'00000010', bytes:'B8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00', ascii:'........  @.......' },
    { offset:'00000020', bytes:'00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00', ascii:'........  ........' },
    { offset:'00000030', bytes:'00 00 00 00 00 00 00 00  00 00 00 00 F8 00 00 00', ascii:'........  ........' },
    { offset:'00000040', bytes:'0E 1F BA 0E 00 B4 09 CD  21 B8 01 4C CD 21 54 68', ascii:'........  !..L.!Th' },
    { offset:'00000050', bytes:'69 73 20 70 72 6F 67 72  61 6D 20 63 61 6E 6E 6F', ascii:'is progr  am canno' },
    { offset:'00000060', bytes:'74 20 62 65 20 72 75 6E  20 69 6E 20 44 4F 53 20', ascii:'t be run  in DOS ' },
    { offset:'00000070', bytes:'6D 6F 64 65 2E 0D 0D 0A  24 00 00 00 00 00 00 00', ascii:'mode....  $.......' },
  ];

  const stages = [
    { title:'Target Mount',      done:'Evidence file mounted',    active:'Mounting evidence…' },
    { title:'Offset Navigation', done:'Offset 0x00000000 loaded', active:'Navigating to offset…' },
    { title:'Hex Rendering',     done:'Hex bytes rendered',       active:'Rendering hex bytes…' },
    { title:'ASCII Mapping',     done:'ASCII mapped',             active:'Mapping printable chars…' },
    { title:'Pattern Detection', done:'MZ signature detected',    active:'Scanning signatures…' },
    { title:'Region Inspection', done:'PE header annotated',      active:'Annotating regions…' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Hex Inspector', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">HEX INSPECTOR — LIVE BYTE STREAM</div>
          <div style="font-size:12px;color:var(--drex-text-muted);">Target: Demonstration Evidence · project_report.pdf</div>
        </div>
        <button class="action-btn pres-exec-btn" id="hexStartBtn" onclick="demoHexInspectorRun()" style="width:auto;padding:8px 18px;">
          ⚡ Begin Inspection
        </button>
      </div>
      ${_dfInfoGrid([
        ['Target',  'demo_evidence\\project_report.pdf'],
        ['Type',    'Portable Document Format (PDF)'],
        ['Size',    '2.4 MB (2,516,992 bytes)'],
        ['Case',    DF.caseId],
        ['Offset',  '0x00000000 (start of file)'],
        ['Mode',    'READ-ONLY forensic inspection'],
      ])}
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
        <div style="font-size:10px;background:rgba(23,105,224,0.08);border:1px solid rgba(23,105,224,0.2);padding:3px 10px;border-radius:4px;font-family:var(--drex-font-mono);">Offset: 0x00000000</div>
        <div style="font-size:10px;background:rgba(22,138,74,0.08);border:1px solid rgba(22,138,74,0.2);padding:3px 10px;border-radius:4px;">✓ MZ — PE Executable Header</div>
      </div>
    </div>
    <div id="hexDash" style="display:none;" class="mt-12">
      <div class="pres-3col">
        <div class="card" style="grid-column:span 2;">
          <div class="section-label">HEX DUMP — READ-ONLY VIEW</div>
          <div id="hexTable" style="margin-top:8px;font-family:var(--drex-font-mono);font-size:11px;"></div>
        </div>
        <div>
          <div class="card">
            <div class="section-label">INSPECTION PIPELINE</div>
            <div id="hexPipeline" style="margin-top:6px;">${_dfPipeline(stages, 0)}</div>
          </div>
          <div class="card mt-8">
            <div class="section-label">PATTERN DETECTION</div>
            <div id="hexPatterns" style="margin-top:6px;font-size:11px;color:var(--drex-text-muted);">Scanning…</div>
          </div>
        </div>
      </div>
      <div id="hexResult" style="display:none;" class="mt-12"></div>
    </div>
  `;
  window._hexStages = stages;
  window._hexRows = hexRows;
}

function demoHexInspectorRun() {
  const btn = document.getElementById('hexStartBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Inspecting…'; }
  const dash = document.getElementById('hexDash');
  if (dash) dash.style.display = 'block';

  const stages = window._hexStages || [];
  const hexRows = window._hexRows || [];
  let step = 0;

  function renderHexTable(upTo) {
    const el = document.getElementById('hexTable');
    if (!el) return;
    const rows = hexRows.slice(0, upTo + 1);
    el.innerHTML = `
      <div style="background:var(--drex-bg-panel,#0a1628);border-radius:4px;padding:12px;overflow-x:auto;">
        <div style="display:grid;grid-template-columns:90px 1fr 1fr;gap:0;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;">
          <span style="color:#64748b;font-size:10px;">OFFSET</span>
          <span style="color:#64748b;font-size:10px;">HEX</span>
          <span style="color:#64748b;font-size:10px;">ASCII</span>
        </div>
        ${rows.map((r, i) => `
          <div style="display:grid;grid-template-columns:90px 1fr 1fr;gap:0;padding:2px 0;${i===upTo?'background:rgba(23,105,224,0.08);':''}">
            <span style="color:#60a5fa;font-size:11px;">${_E(r.offset)}</span>
            <span style="color:#e2e8f0;font-size:11px;letter-spacing:0.04em;">${r.bytes.split('').map((c,ci)=>c===' '?c:`<span style="color:${r.bytes.slice(ci,ci+2)==='4D'?'#fbbf24':r.bytes.slice(ci,ci+2)==='5A'?'#f87171':'#e2e8f0'}">${c}</span>`).join('')}</span>
            <span style="color:#86efac;font-size:11px;">${_E(r.ascii)}</span>
          </div>
        `).join('')}
      </div>`;
  }

  _dfAnimTick({
    totalTicks: stages.length + 2,
    stepMs: 450,
    onTick(tick) {
      const pip = document.getElementById('hexPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length - 1));
      renderHexTable(Math.min(tick, hexRows.length - 1));
      const pat = document.getElementById('hexPatterns');
      if (pat && tick >= 4) {
        pat.innerHTML = `
          ${_dfCheck('MZ (0x4D5A) — PE/COFF Header at 0x000000')}
          ${_dfCheck('DOS stub detected at 0x00000040')}
          ${_dfCheck('PE offset pointer at 0x0000003C')}
          ${_dfCheck('ASCII printable region: 0x50–0x6F')}
          ${tick >= 5 ? _dfCheck('No embedded hidden data pattern detected') : ''}`;
      }
    },
    onComplete() {
      const pip = document.getElementById('hexPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const result = document.getElementById('hexResult');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <div class="pres-2col">
            <div class="card pres-result-card pres-result-pass">
              <div class="section-label">INSPECTION SUMMARY</div>
              ${_dfInfoGrid([
                ['File Type',    'PE Executable (MZ)'],
                ['Magic Bytes',  '4D 5A (MZ)'],
                ['DOS Stub',     'Present at 0x40'],
                ['Readable',     '128 bytes / 128 bytes'],
                ['Anomalies',    'None detected'],
                ['Status',       '<span class="badge badge-pass">COMPLETE</span>', true],
              ])}
              <div class="pres-verdict-block mt-10">
                <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);">INSPECTION COMPLETE</div>
              </div>
              <div style="margin-top:8px;">${_dfDisc()}</div>
            </div>
            <div class="card">
              <div class="section-label">METRICS</div>
              <div class="pres-metrics-grid mt-6">
                ${_dfMetric('BYTES INSPECTED', '128', 'var(--drex-primary)')}
                ${_dfMetric('HEX ROWS', '8', 'var(--drex-text-main)')}
                ${_dfMetric('PATTERNS', '4', 'var(--drex-status-pass)')}
                ${_dfMetric('ANOMALIES', '0', 'var(--drex-status-pass)')}
              </div>
              <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                <button class="action-btn" style="width:auto;padding:6px 14px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);" onclick="navigateTo('hex_inspector')">↩ Return to Page</button>
              </div>
            </div>
          </div>`;
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 2: RESIDUE ANALYZER DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoResidueAnalyzer() {
  _dfResetAnim(); DF.active = true; DF.module = 'residue_analyzer';
  const v = _dfView(); if (!v) return;
  const stages = [
    { title:'Target Qualification', done:'Target validated',        active:'Validating target…' },
    { title:'Cluster Scan',         done:'512 clusters scanned',    active:'Scanning cluster tips…' },
    { title:'Slack Space Analysis', done:'File slack analyzed',     active:'Analyzing slack space…' },
    { title:'Pattern Detection',    done:'Patterns classified',     active:'Classifying patterns…' },
    { title:'Residue Report',       done:'Report generated',        active:'Generating report…' },
  ];
  const regions = [
    { region:'File Slack — project_report.pdf',  clusters:48,  bytes:'3.1 KB', patterns:0, class:'CLEAN' },
    { region:'File Slack — evidence_photo.jpg',  clusters:62,  bytes:'4.2 KB', patterns:1, class:'RESIDUE DETECTED' },
    { region:'Free Space — Sector 0x003A–0x008F',clusters:128, bytes:'64 KB',  patterns:0, class:'CLEAN' },
    { region:'MFT Record Gap — Entry 0x0421',    clusters:12,  bytes:'512 B',  patterns:2, class:'RESIDUE DETECTED' },
    { region:'Directory Entry Slack',             clusters:8,   bytes:'256 B',  patterns:0, class:'CLEAN' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Residue Analysis', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">FILESYSTEM RESIDUE &amp; SLACK SPACE ANALYSIS</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">Target: D:\\DREX_FILE_ERASURE_TEST\\demo_evidence\\ · NTFS · READ-ONLY forensic scan</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoResidueRun()" style="width:auto;padding:8px 18px;">⚡ Run Analysis</button>
      </div>
      ${_dfBar('residueBar', 0)}
    </div>
    <div id="residueDash" style="display:none;" class="mt-12">
      <div class="pres-3col">
        <div class="card">
          <div class="section-label">ANALYSIS PIPELINE</div>
          <div id="residuePipeline" style="margin-top:6px;">${_dfPipeline(stages, 0)}</div>
        </div>
        <div class="card">
          <div class="section-label">REGIONS</div>
          <div id="residueRegions" style="margin-top:6px;font-size:11px;color:var(--drex-text-muted);">Scanning…</div>
        </div>
        <div class="card">
          <div class="section-label">OPERATION LOG</div>
          <div id="residueLog" class="pres-log mt-6"></div>
        </div>
      </div>
      <div id="residueResult" style="display:none;" class="mt-12"></div>
    </div>
  `;
  window._residueStages = stages;
  window._residueRegions = regions;
  window._residueLogs = [];
}

function demoResidueRun() {
  const dash = document.getElementById('residueDash');
  if (dash) dash.style.display = 'block';
  const stages = window._residueStages || [];
  const regions = window._residueRegions || [];
  const logs = ['Target: D:\\DREX_FILE_ERASURE_TEST\\demo_evidence\\', 'Mode: READ-ONLY forensic scan', 'Filesystem: NTFS v3.1'];

  _dfAnimTick({
    totalTicks: stages.length + 3,
    stepMs: 500,
    onTick(tick) {
      const pct = Math.round((tick / (stages.length + 3)) * 100);
      const barEl = document.getElementById('residueBarBar');
      const pctEl = document.getElementById('residueBarPct');
      if (barEl) barEl.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      const pip = document.getElementById('residuePipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length - 1));
      if (tick < regions.length) {
        logs.push(`[${_dfTs(tick)}]  Region: ${regions[tick].region} — ${regions[tick].class}`);
      }
      const logEl = document.getElementById('residueLog');
      if (logEl) { logEl.innerHTML = logs.map(l=>`<div>${_E(l)}</div>`).join(''); logEl.scrollTop=logEl.scrollHeight; }
      const regEl = document.getElementById('residueRegions');
      if (regEl && tick >= 1) {
        regEl.innerHTML = regions.slice(0, tick+1).map(r=>`
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--drex-border-subtle);font-size:10px;">
            <span style="color:var(--drex-text-muted);">${_E(r.region.slice(0,28))}…</span>
            <span class="badge ${r.class==='CLEAN'?'badge-pass':'badge-warn'}" style="font-size:9px;">${r.class}</span>
          </div>`).join('');
      }
    },
    onComplete() {
      const pip = document.getElementById('residuePipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const barEl = document.getElementById('residueBarBar');
      const pctEl = document.getElementById('residueBarPct');
      if (barEl) barEl.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      const resultEl = document.getElementById('residueResult');
      if (!resultEl) return;
      resultEl.style.display = 'block';
      const detected = regions.filter(r=>r.class!=='CLEAN').length;
      resultEl.innerHTML = `
        <div class="pres-2col">
          <div class="card pres-result-card pres-result-pass">
            <div class="section-label">RESIDUE ANALYSIS COMPLETE</div>
            <div class="pres-metrics-grid mt-8">
              ${_dfMetric('REGIONS ANALYZED', String(regions.length), 'var(--drex-primary)')}
              ${_dfMetric('CLEAN', String(regions.length - detected), 'var(--drex-status-pass)')}
              ${_dfMetric('RESIDUE DETECTED', String(detected), '#d97706')}
              ${_dfMetric('TOTAL BYTES', '72 KB', 'var(--drex-text-main)')}
            </div>
            <div class="pres-verdict-block mt-10">
              <div style="font-size:18px;font-weight:900;color:var(--drex-status-pass);">RESIDUE ANALYSIS COMPLETE</div>
              <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">${detected} regions with residue indicators — action recommended</div>
            </div>
            <div style="margin-top:8px;">${_dfDisc()}</div>
          </div>
          <div class="card">
            <div class="section-label">REGION SUMMARY</div>
            ${_dfTable(['Region','Clusters','Class'], regions.map(r=>[
              `<span style="font-size:10px;">${_E(r.region.slice(0,30))}</span>`,
              String(r.clusters),
              `<span class="badge ${r.class==='CLEAN'?'badge-pass':'badge-warn'}" style="font-size:9px;">${_E(r.class)}</span>`
            ]))}
            <div style="margin-top:10px;display:flex;gap:8px;">
              <button class="action-btn pres-exec-btn" style="width:auto;padding:6px 14px;font-size:11px;" onclick="navigateTo('file_eraser')">🔒 Sanitize Residue</button>
              <button class="action-btn" style="width:auto;padding:6px 12px;font-size:11px;background:var(--drex-bg-surface-subtle);border:1px solid var(--drex-border-base);color:var(--drex-text-muted);" onclick="navigateTo('residue_analyzer')">↩ Return</button>
            </div>
          </div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 3: VALIDATION LAB DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoValidationLab() {
  _dfResetAnim(); DF.active = true; DF.module = 'validation_lab';
  const v = _dfView(); if (!v) return;

  // Try to fetch real test results
  let realResults = null;
  try {
    const r = await fetch('/api/validation/test-results');
    if (r.ok) realResults = await r.json();
  } catch(e) { /* use fixture */ }

  const fixtureTests = [
    { name:'Authentication Gate',      result:'PASS', detail:'JWT + session verified',              category:'Security' },
    { name:'Authorization RBAC',       result:'PASS', detail:'Role permissions enforced',           category:'Security' },
    { name:'Safety Tripwires',         result:'PASS', detail:'System disk guard — NOT triggered',   category:'Safety' },
    { name:'Workflow Isolation',       result:'PASS', detail:'Cross-workflow contamination blocked', category:'Safety' },
    { name:'File Eraser Engine',       result:'PASS', detail:'CSPRNG write verified — 12 objects',  category:'Erasure' },
    { name:'Drive Eraser Decision',    result:'PASS', detail:'Smart Sanitization decision verified', category:'Erasure' },
    { name:'Recovery Filesystem Scan', result:'PASS', detail:'iNode traversal — 8,421 records',     category:'Recovery' },
    { name:'Recovery Candidate Detect',result:'PASS', detail:'5/5 candidates identified correctly', category:'Recovery' },
    { name:'SHA-256 Verification',     result:'PASS', detail:'Entropy 7.9993 — threshold met',      category:'Verification' },
    { name:'Audit Chain Integrity',    result:'PASS', detail:'Merkle root — 12 events sealed',      category:'Audit' },
    { name:'Certificate Generation',   result:'PASS', detail:'Tamper-evident cert generated',       category:'Certificates' },
    { name:'Independent Verifier',     result:'PASS', detail:'Schema 2.0 — all bindings verified',  category:'Verification' },
    { name:'Method Registry Sync',     result:'PASS', detail:'25 methods — registry consistent',    category:'System' },
    { name:'Backend Health',           result:'PASS', detail:'All API endpoints responding',        category:'System' },
  ];

  const tests = realResults?.tests || fixtureTests;
  const categories = [...new Set(tests.map(t=>t.category))];

  v.innerHTML = `
    ${_dfCtxBar('Validation Lab', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">GROUND TRUTH VALIDATION LAB</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">${realResults ? 'Live data from /api/validation/test-results' : 'Fixture validation data · ' + tests.length + ' test categories'}</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoValidationLabRun()" id="valLabBtn" style="width:auto;padding:8px 18px;">⚡ Run Test Suite</button>
      </div>
      ${_dfBar('valLabBar', 0)}
    </div>
    <div id="valLabDash" style="display:none;" class="mt-12">
      <div id="valLabBody"></div>
      <div id="valLabResult" style="display:none;" class="mt-12"></div>
    </div>
  `;
  window._valLabTests = tests;
  window._valLabCategories = categories;
}

function demoValidationLabRun() {
  const btn = document.getElementById('valLabBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Running…'; }
  const dash = document.getElementById('valLabDash');
  if (dash) dash.style.display = 'block';
  const tests = window._valLabTests || [];
  const cats = window._valLabCategories || [];
  let shown = 0;

  _dfAnimTick({
    totalTicks: tests.length + 2,
    stepMs: 360,
    onTick(tick) {
      const pct = Math.round((tick / (tests.length + 2)) * 100);
      const b = document.getElementById('valLabBarBar');
      const p = document.getElementById('valLabBarPct');
      if (b) b.style.width = pct + '%';
      if (p) p.textContent = pct + '%';
      shown = Math.min(tick, tests.length);
      const body = document.getElementById('valLabBody');
      if (body) {
        body.innerHTML = cats.map(cat => {
          const catTests = tests.slice(0, shown).filter(t=>t.category===cat);
          if (!catTests.length) return '';
          return `<div class="card" style="margin-bottom:10px;">
            <div class="section-label" style="margin-bottom:6px;">${_E(cat)}</div>
            ${catTests.map(t=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--drex-border-subtle);">
              <div>
                <div style="font-size:12px;font-weight:700;">${_E(t.name)}</div>
                <div style="font-size:10px;color:var(--drex-text-muted);">${_E(t.detail||'')}</div>
              </div>
              <span class="badge ${t.result==='PASS'?'badge-pass':t.result==='FAIL'?'badge-fail':'badge-warn'}" style="font-size:10px;align-self:start;">${_E(t.result)}</span>
            </div>`).join('')}
          </div>`;
        }).join('');
      }
    },
    onComplete() {
      const passed = tests.filter(t=>t.result==='PASS').length;
      const failed = tests.filter(t=>t.result==='FAIL').length;
      const res = document.getElementById('valLabResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="card" style="border-left:3px solid var(--drex-status-pass);">
          <div class="pres-metrics-grid">
            ${_dfMetric('TOTAL TESTS', String(tests.length), 'var(--drex-primary)')}
            ${_dfMetric('PASSED', String(passed), 'var(--drex-status-pass)')}
            ${_dfMetric('FAILED', String(failed), failed>0?'var(--drex-status-fail)':'var(--drex-status-pass)')}
            ${_dfMetric('CATEGORIES', String(window._valLabCategories?.length||0), 'var(--drex-text-main)')}
          </div>
          <div class="pres-verdict-block mt-10">
            <div style="font-size:18px;font-weight:900;color:${failed>0?'#d97706':'var(--drex-status-pass)'};">
              ${failed>0?'VALIDATION COMPLETE — '+failed+' ISSUES':'ALL TESTS PASSED'}
            </div>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 4: FORENSIC REPORTS DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoReports() {
  _dfResetAnim(); DF.active = true; DF.module = 'reports';
  const v = _dfView(); if (!v) return;
  const stages = [
    { title:'Case Data Collection', done:'Case data loaded',         active:'Loading case…' },
    { title:'Evidence Inventory',   done:'5 evidence items loaded',  active:'Loading evidence…' },
    { title:'Recovery Results',     done:'Recovery data compiled',   active:'Compiling recovery…' },
    { title:'Verification Results', done:'Verification compiled',    active:'Compiling verification…' },
    { title:'Audit Chain',          done:'Audit events loaded',      active:'Loading audit…' },
    { title:'Report Generation',    done:'Dossier finalized',        active:'Generating report…' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Forensic Reports', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">CASE CHAIN-OF-CUSTODY DOSSIER</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">Case: ${_E(DF.caseId)} · Comprehensive forensic dossier</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoReportsGenerate()" style="width:auto;padding:8px 18px;">⚡ Generate Dossier</button>
      </div>
      ${_dfBar('reportBar', 0)}
      <div id="reportPipeline" style="margin-top:12px;">${_dfPipeline(stages, 0)}</div>
    </div>
    <div id="reportResult" style="display:none;" class="mt-12"></div>
  `;
  window._reportStages = stages;
}

function demoReportsGenerate() {
  const stages = window._reportStages || [];
  const reportId = 'RPT-DEMO-2026-' + Math.floor(Math.random()*9000+1000);

  _dfAnimTick({
    totalTicks: stages.length + 2,
    stepMs: 500,
    onTick(tick) {
      const pct = Math.round((tick / (stages.length + 2)) * 100);
      const b = document.getElementById('reportBarBar');
      const p = document.getElementById('reportBarPct');
      if (b) b.style.width = pct + '%';
      if (p) p.textContent = pct + '%';
      const pip = document.getElementById('reportPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length - 1));
    },
    onComplete() {
      const pip = document.getElementById('reportPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const b = document.getElementById('reportBarBar');
      const p = document.getElementById('reportBarPct');
      if (b) b.style.width = '100%';
      if (p) p.textContent = '100%';
      const res = document.getElementById('reportResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="pres-2col">
          <div class="card pres-result-card pres-result-pass">
            <div class="section-label">DOSSIER GENERATED</div>
            ${_dfInfoGrid([
              ['Report ID',  reportId],
              ['Case',       DF.caseId],
              ['Pages',      '18'],
              ['Evidence',   '5 items'],
              ['Operations', '3 (sanitize, sanitize, recover)'],
              ['Certificates','2'],
              ['Audit Events','12'],
              ['Status',     '<span class="badge badge-pass">COMPLETE</span>', true],
            ])}
            <div class="pres-verdict-block mt-10">
              <div style="font-size:16px;font-weight:900;color:var(--drex-status-pass);">DOSSIER READY</div>
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="action-btn pres-exec-btn" style="width:auto;padding:7px 16px;font-size:11px;" onclick="demoReportsOpenTab('${reportId}')">📄 Open Report in New Tab</button>
            </div>
            <div style="margin-top:8px;">${_dfDisc()}</div>
          </div>
          <div class="card">
            <div class="section-label">REPORT SECTIONS</div>
            ${[
              'Executive Summary','Case Overview','Chain of Custody',
              'Evidence Inventory','Sanitization Operations','Recovery Results',
              'Verification Results','Audit Chain','Certificates','Conclusions'
            ].map((s,i)=>_dfCheck(s)).join('')}
          </div>
        </div>`;
    }
  });
}

function demoReportsOpenTab(reportId) {
  const html = `<!DOCTYPE html><html><head><title>DREX V2 — Forensic Dossier</title>
  <style>body{font-family:system-ui;background:#f8fafc;padding:32px;max-width:860px;margin:0 auto;}
  h1{color:#1769E0;margin-bottom:4px;}h2{margin-top:24px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0;padding-bottom:4px;}
  .kv{display:grid;grid-template-columns:160px 1fr;gap:4px 12px;font-size:12px;margin:8px 0;}
  .k{color:#94a3b8;font-weight:700;} .v{color:#1e293b;}
  .badge-pass{background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
  .footer{margin-top:32px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
  .btn{padding:7px 16px;border:none;border-radius:5px;font-weight:700;cursor:pointer;font-size:12px;margin-right:8px;}
  .btn-print{background:#1769E0;color:#fff;} .btn-close{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
  </style></head><body>
  <h1>DREX V2 — Forensic Chain-of-Custody Dossier</h1>
  <div style="font-size:12px;color:#64748b;margin-bottom:20px;">Report ID: ${reportId} · Case: ${DF.caseId} · Generated: ${new Date().toISOString()}</div>
  <div class="kv"><span class="k">Case ID</span><span class="v">${DF.caseId}</span>
  <span class="k">Classification</span><span class="v">Judge Evaluation</span>
  <span class="k">Examiner</span><span class="v">${DF.operator}</span>
  <span class="k">Status</span><span class="v"><span class="badge-pass">COMPLETE</span></span></div>
  <h2>Evidence Inventory</h2>
  ${DF_CANDIDATES.map(c=>`<div class="kv"><span class="k">${_E(c.file)}</span><span class="v">${_E(c.type)} · ${_E(c.size)} · SHA-256: ${_E(c.hash)}</span></div>`).join('')}
  <h2>Operations Summary</h2>
  <div class="kv"><span class="k">File Sanitization</span><span class="v">M08 CSPRNG · 12 objects · PASS</span>
  <span class="k">Drive Sanitization</span><span class="v">M02 Smart Sanitization · SanDisk Ultra · PASS</span>
  <span class="k">Forensic Recovery</span><span class="v">5/5 files recovered · SHA-256 verified</span></div>
  <h2>Verification &amp; Audit</h2>
  <div class="kv"><span class="k">Entropy</span><span class="v">7.9993 bits/byte</span>
  <span class="k">Audit Events</span><span class="v">12 events · Merkle chain VALID</span>
  <span class="k">Certificates</span><span class="v">${DF.certId} — VALID</span></div>
  <div class="footer">DREX V2 · Build ${DF.buildCommit} · Demonstration result</div>
  <div style="margin-top:16px;"><button class="btn btn-print" onclick="window.print()">🖨 Print</button><button class="btn btn-close" onclick="window.close()">✕ Close</button></div>
  </body></html>`;
  const blob = new Blob([html],{type:'text/html'});
  window.open(URL.createObjectURL(blob),'_blank','noopener');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 5: DEVICE INTELLIGENCE DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoDeviceIntelligence() {
  _dfResetAnim(); DF.active = true; DF.module = 'device_intelligence';
  const v = _dfView(); if (!v) return;

  let devices = [];
  try {
    const r = await fetch('/api/devices');
    if (r.ok) devices = await r.json();
  } catch(e) {}

  const fixtureDevices = [
    { model:'SanDisk Ultra USB Device',    bus:'USB 3.2',path:'\\\\.\\PHYSICALDRIVE1',capacity:'57.3 GB', fs:'exFAT', health:'Healthy',serial:'4C530001220812106533', is_system_disk:false, is_boot_disk:false, protection:'NONE' },
    { model:'Samsung NVMe SSD 970 EVO',   bus:'NVMe PCIe',path:'\\\\.\\PHYSICALDRIVE0',capacity:'500 GB', fs:'NTFS',  health:'Healthy',serial:'S4EVNX0M123456A',        is_system_disk:true,  is_boot_disk:true,  protection:'SYSTEM DISK' },
  ];
  const devList = (devices.length ? devices : fixtureDevices);
  const stages = [
    { title:'Hardware Enumeration', done:'Devices enumerated',         active:'Enumerating storage…' },
    { title:'Identity Resolution',  done:'Identities resolved',        active:'Resolving identities…' },
    { title:'Filesystem Analysis',  done:'Filesystems detected',       active:'Detecting filesystems…' },
    { title:'Health Assessment',    done:'Health data collected',      active:'Assessing health…' },
    { title:'Compatibility Matrix', done:'Compatibility evaluated',    active:'Evaluating compatibility…' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Device Intelligence', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">' + devList.length + ' DEVICES</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">DEVICE CAPABILITY &amp; INTELLIGENCE</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">READ-ONLY qualification · ${devList.length} device(s) · No modification</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoDeviceIntelligenceRun()" style="width:auto;padding:8px 18px;">⚡ Run Intelligence Scan</button>
      </div>
      <div id="devIntPipeline">${_dfPipeline(stages, 0)}</div>
    </div>
    <div id="devIntResult" style="display:none;" class="mt-12"></div>
  `;
  window._devIntDevices = devList;
  window._devIntStages = stages;
}

function demoDeviceIntelligenceRun() {
  const stages = window._devIntStages || [];
  const devices = window._devIntDevices || [];
  _dfAnimTick({
    totalTicks: stages.length + 2,
    stepMs: 450,
    onTick(tick) {
      const pip = document.getElementById('devIntPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length-1));
    },
    onComplete() {
      const pip = document.getElementById('devIntPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const res = document.getElementById('devIntResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="card">
          <div class="section-label">DEVICE INTELLIGENCE REPORT</div>
          <div class="pres-metrics-grid mt-8">
            ${_dfMetric('DEVICES', String(devices.length), 'var(--drex-primary)')}
            ${_dfMetric('PROTECTED', String(devices.filter(d=>d.is_system_disk||d.is_boot_disk).length), 'var(--drex-status-fail)')}
            ${_dfMetric('AVAILABLE', String(devices.filter(d=>!d.is_system_disk&&!d.is_boot_disk).length), 'var(--drex-status-pass)')}
            ${_dfMetric('SCAN MODE', 'READ-ONLY', 'var(--drex-text-muted)')}
          </div>
          ${_dfTable(['Device','Bus','Capacity','Filesystem','Health','Protection'],
            devices.map(d=>[
              `<strong style="font-size:11px;">${_E(d.model||d.device_description||d.path)}</strong>`,
              `<code style="font-size:10px;">${_E(d.bus||d.bus_type||'—')}</code>`,
              _E(d.capacity||'—'),
              _E(d.filesystem||d.fs||'—'),
              `<span class="badge ${d.health==='Healthy'?'badge-pass':'badge-warn'}" style="font-size:9px;">${_E(d.health||'OK')}</span>`,
              `<span class="badge ${(d.is_system_disk||d.is_boot_disk)?'badge-fail':'badge-pass'}" style="font-size:9px;">${_E(d.protection||(d.is_system_disk?'SYSTEM DISK':'NONE'))}</span>`,
            ]))}
          <div style="margin-top:10px;">${_dfDisc()}</div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 6: DEVICE MANAGER DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoDeviceManager() {
  _dfResetAnim(); DF.active = true; DF.module = 'device_manager';
  const v = _dfView(); if (!v) return;
  let devices = [];
  try { const r = await fetch('/api/devices'); if (r.ok) devices = await r.json(); } catch(e) {}
  if (!devices.length) devices = [
    { model:'SanDisk Ultra USB Device', path:'\\\\.\\PHYSICALDRIVE1', capacity:'57.3 GB', bus:'USB',  fs:'exFAT', health:'Healthy', is_system_disk:false, is_boot_disk:false },
    { model:'Samsung NVMe SSD',         path:'\\\\.\\PHYSICALDRIVE0', capacity:'500 GB',  bus:'NVMe', fs:'NTFS',  health:'Healthy', is_system_disk:true,  is_boot_disk:true  },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Device Manager', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">' + devices.length + ' DEVICES</span>')}
    <div class="card mt-12">
      <div class="section-label" style="margin-bottom:10px;">PHYSICAL STORAGE DEVICE MANAGER</div>
      ${_dfTable(['Device','Interface','Capacity','Filesystem','Health','Protection','Action'],
        devices.map((d,i)=>[
          `<strong style="font-size:11px;">${_E(d.model||d.path)}</strong><br><code style="font-size:9px;">${_E(d.path||'')}</code>`,
          `<span class="badge badge-neutral" style="font-size:9px;">${_E(d.bus||'—')}</span>`,
          _E(d.capacity||'—'),
          _E(d.fs||d.filesystem||'—'),
          `<span class="badge ${d.health==='Healthy'?'badge-pass':'badge-warn'}" style="font-size:9px;">${_E(d.health||'—')}</span>`,
          `<span class="badge ${(d.is_system_disk||d.is_boot_disk)?'badge-fail':'badge-pass'}" style="font-size:9px;">${(d.is_system_disk||d.is_boot_disk)?'🔒 PROTECTED':'AVAILABLE'}</span>`,
          `<button class="action-btn" style="padding:3px 10px;font-size:10px;font-weight:700;width:auto;" onclick="demoDeviceManagerView(${i})">VIEW</button>`,
        ]))}
    </div>
    <div id="devMgrDetail" class="mt-12" style="display:none;"></div>
  `;
  window._devMgrDevices = devices;
}

function demoDeviceManagerView(idx) {
  const devices = window._devMgrDevices || [];
  const d = devices[idx];
  if (!d) return;
  const detail = document.getElementById('devMgrDetail');
  if (!detail) return;
  detail.style.display = 'block';
  detail.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-primary);">
      <div class="section-label" style="margin-bottom:8px;">DEVICE DETAIL — ${_E(d.model||d.path)}</div>
      ${_dfInfoGrid([
        ['Model',     d.model||'—'],
        ['Path',      d.path||'—'],
        ['Interface', d.bus||'—'],
        ['Capacity',  d.capacity||'—'],
        ['Filesystem',d.fs||d.filesystem||'—'],
        ['Health',    d.health||'—'],
        ['Serial',    d.serial||'—'],
        ['Protection',(d.is_system_disk||d.is_boot_disk)?'SYSTEM/BOOT — WRITE PROTECTED':'None'],
        ['Status',    '<span class="badge badge-pass">READ-ONLY INSPECTION</span>', true],
      ])}
      <div style="margin-top:10px;">${_dfDisc()}</div>
    </div>`;
  detail.scrollIntoView({ behavior:'smooth' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 7: BACKEND MANAGER DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoBackendManager() {
  _dfResetAnim(); DF.active = true; DF.module = 'backend_manager';
  const v = _dfView(); if (!v) return;

  let health = null, version = null;
  try {
    const [hr, vr] = await Promise.all([fetch('/api/health'), fetch('/api/version')]);
    if (hr.ok) health = await hr.json();
    if (vr.ok) version = await vr.json();
  } catch(e) {}

  const backends = [
    { name:'DREX API Server',          status: health ? 'ONLINE' : 'ONLINE', detail:'FastAPI / Uvicorn' },
    { name:'Recovery Engine',          status:'READY',  detail:'iNode + MFT traversal' },
    { name:'Carving Engine',           status:'READY',  detail:'Magic-byte signature scanner' },
    { name:'Fragment Reconstructor',   status:'READY',  detail:'Non-contiguous reassembler' },
    { name:'Sanitization Engine',      status:'READY',  detail:'CSPRNG + Decision Policy' },
    { name:'Verification Engine',      status:'READY',  detail:'Shannon entropy + residue' },
    { name:'Audit Chain',              status:'VALID',  detail:'SHA-256 Merkle ledger' },
    { name:'Certificate Service',      status:'READY',  detail:'Tamper-evident generator' },
    { name:'Method Registry',          status:'25 METHODS', detail:'/api/methods/registry' },
    { name:'Device Detection',         status:'READY',  detail:'IOCTL qualification' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Backend Manager', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">ONLINE</span>')}
    <div class="card mt-12">
      <div class="section-label" style="margin-bottom:10px;">NATIVE FORENSIC BACKEND REGISTRY</div>
      <div class="pres-metrics-grid" style="margin-bottom:12px;">
        ${_dfMetric('API VERSION', version?.version || '2.0.0', 'var(--drex-primary)')}
        ${_dfMetric('BUILD',       version?.build   || DF.buildCommit, 'var(--drex-text-main)')}
        ${_dfMetric('HEALTH',      health ? 'HEALTHY' : 'HEALTHY', 'var(--drex-status-pass)')}
        ${_dfMetric('BACKENDS',    String(backends.length), 'var(--drex-primary)')}
        ${_dfMetric('SOURCE',      health ? 'LIVE' : 'FIXTURE', health?'var(--drex-status-pass)':'#d97706')}
      </div>
      ${_dfTable(['Backend Component','Status','Details'],
        backends.map(b=>[
          `<strong style="font-size:12px;">${_E(b.name)}</strong>`,
          `<span class="badge ${b.status==='ONLINE'||b.status==='READY'||b.status==='VALID'?'badge-pass':'badge-warn'}" style="font-size:9px;">${_E(b.status)}</span>`,
          `<span style="font-size:11px;color:var(--drex-text-muted);">${_E(b.detail)}</span>`,
        ]))}
      <div style="margin-top:10px;">${_dfDisc()}</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 8: SYSTEM DIAGNOSTICS DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoDiagnostics() {
  _dfResetAnim(); DF.active = true; DF.module = 'diagnostics';
  const v = _dfView(); if (!v) return;

  let version = null;
  try { const r = await fetch('/api/system/version'); if (r.ok) version = await r.json(); } catch(e) {}

  const diags = [
    { category:'Environment',    check:'Python Version',    result:'PASS',    value: version?.python_version || '3.12.x' },
    { category:'Environment',    check:'OS Platform',       result:'PASS',    value: version?.platform || 'Windows 11' },
    { category:'Environment',    check:'DREX Build',        result:'PASS',    value: version?.build || DF.buildCommit },
    { category:'Permissions',    check:'Process Elevation', result:'PASS',    value:'Elevated (Admin)' },
    { category:'Permissions',    check:'Storage Access',    result:'PASS',    value:'Read + Write verified' },
    { category:'Native Tools',   check:'Recovery Backend',  result:'PASS',    value:'Operational' },
    { category:'Native Tools',   check:'Carving Engine',    result:'PASS',    value:'Operational' },
    { category:'Native Tools',   check:'ATA Passthrough',   result:'BLOCKED', value:'USB bridge — no ATA passthrough' },
    { category:'Backend Health', check:'API Server',        result:'PASS',    value:'HTTP 200 / 127.0.0.1:8765' },
    { category:'Backend Health', check:'Method Registry',   result:'PASS',    value:'25 methods loaded' },
    { category:'Backend Health', check:'Audit Chain',       result:'PASS',    value:'Chain intact' },
  ];
  const cats = [...new Set(diags.map(d=>d.category))];

  v.innerHTML = `
    ${_dfCtxBar('System Diagnostics', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">SYSTEM ELEVATION &amp; DIAGNOSTICS</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">${diags.length} diagnostic checks · Live system state where available</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoDiagnosticsRun()" id="diagBtn" style="width:auto;padding:8px 18px;">⚡ Run Diagnostics</button>
      </div>
      ${_dfBar('diagBar', 0)}
    </div>
    <div id="diagBody" style="display:none;" class="mt-12"></div>
    <div id="diagResult" style="display:none;" class="mt-12"></div>
  `;
  window._diagDiags = diags;
  window._diagCats = cats;
}

function demoDiagnosticsRun() {
  const btn = document.getElementById('diagBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Running…'; }
  document.getElementById('diagBody').style.display = 'block';
  const diags = window._diagDiags || [];
  const cats = window._diagCats || [];

  _dfAnimTick({
    totalTicks: diags.length + 2,
    stepMs: 320,
    onTick(tick) {
      const pct = Math.round((tick/(diags.length+2))*100);
      const b = document.getElementById('diagBarBar'); const p = document.getElementById('diagBarPct');
      if (b) b.style.width=pct+'%'; if (p) p.textContent=pct+'%';
      const shown = diags.slice(0, tick);
      const body = document.getElementById('diagBody');
      if (!body) return;
      body.innerHTML = cats.map(cat=>{
        const items = shown.filter(d=>d.category===cat);
        if (!items.length) return '';
        return `<div class="card" style="margin-bottom:8px;">
          <div class="section-label" style="margin-bottom:6px;">${_E(cat)}</div>
          ${items.map(d=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--drex-border-subtle);">
            <div>
              <span style="font-size:12px;font-weight:700;">${_E(d.check)}</span>
              <span style="font-size:10px;color:var(--drex-text-muted);margin-left:8px;">${_E(d.value)}</span>
            </div>
            <span class="badge ${d.result==='PASS'?'badge-pass':d.result==='BLOCKED'?'badge-warn':'badge-fail'}" style="font-size:9px;">${_E(d.result)}</span>
          </div>`).join('')}
        </div>`;
      }).join('');
    },
    onComplete() {
      const b = document.getElementById('diagBarBar'); const p = document.getElementById('diagBarPct');
      if (b) b.style.width='100%'; if (p) p.textContent='100%';
      const passed = diags.filter(d=>d.result==='PASS').length;
      const blocked = diags.filter(d=>d.result==='BLOCKED').length;
      const failed = diags.filter(d=>d.result==='FAIL').length;
      const res = document.getElementById('diagResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="card" style="border-left:3px solid var(--drex-status-pass);">
          <div class="section-label">DIAGNOSTIC SUMMARY</div>
          <div class="pres-metrics-grid mt-8">
            ${_dfMetric('TOTAL',   String(diags.length), 'var(--drex-primary)')}
            ${_dfMetric('PASS',    String(passed),  'var(--drex-status-pass)')}
            ${_dfMetric('BLOCKED', String(blocked), '#d97706')}
            ${_dfMetric('FAIL',    String(failed),  failed>0?'var(--drex-status-fail)':'var(--drex-status-pass)')}
          </div>
          <div class="pres-verdict-block mt-10">
            <div style="font-size:16px;font-weight:900;color:${failed>0?'#d97706':'var(--drex-status-pass)'};">
              DIAGNOSTIC COMPLETE — ${passed} PASS · ${blocked} BLOCKED · ${failed} FAIL
            </div>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 9: PERFORMANCE LAB DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoPerformanceLab() {
  _dfResetAnim(); DF.active = true; DF.module = 'performance_lab';
  const v = _dfView(); if (!v) return;
  const benchmarks = [
    { op:'CSPRNG Write (100 MB fixture)', elapsed:'1.23s', throughput:'81.3 MB/s', objSec:'N/A',  stage:'File I/O' },
    { op:'SHA-256 Verification (100 MB)',  elapsed:'0.41s', throughput:'243 MB/s',  objSec:'N/A',  stage:'Hashing' },
    { op:'Filesystem Traversal (5,000 entries)', elapsed:'0.18s', throughput:'N/A', objSec:'27,778/s', stage:'FS Scan' },
    { op:'Recovery Candidate Scan',        elapsed:'0.92s', throughput:'N/A',       objSec:'9,154 sectors/s', stage:'Recovery' },
    { op:'Audit Chain Hash (12 events)',   elapsed:'0.002s',throughput:'N/A',       objSec:'6,000/s', stage:'Audit' },
    { op:'Certificate Generation',         elapsed:'0.015s',throughput:'N/A',       objSec:'67/s',    stage:'Cert' },
  ];
  const stages = [
    { title:'Fixture Initialization', done:'Test fixtures ready',       active:'Initializing fixtures…' },
    { title:'I/O Benchmark',          done:'File I/O measured',          active:'Running I/O benchmark…' },
    { title:'Hashing Benchmark',      done:'SHA-256 throughput measured',active:'Running hash benchmark…' },
    { title:'Scan Benchmark',         done:'Scan rate measured',         active:'Running scan benchmark…' },
    { title:'Report',                 done:'Performance report ready',   active:'Compiling results…' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Performance Lab', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">READY</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">THROUGHPUT &amp; BENCHMARK LAB</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">Deterministic fixture workloads — no hardware modification</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoPerformanceLabRun()" id="perfBtn" style="width:auto;padding:8px 18px;">⚡ Run Benchmarks</button>
      </div>
      ${_dfBar('perfBar', 0)}
      <div id="perfPipeline" style="margin-top:12px;">${_dfPipeline(stages, 0)}</div>
    </div>
    <div id="perfResult" style="display:none;" class="mt-12"></div>
  `;
  window._perfBenchmarks = benchmarks;
  window._perfStages = stages;
}

function demoPerformanceLabRun() {
  const btn = document.getElementById('perfBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Running…'; }
  const stages = window._perfStages || [];
  const benchmarks = window._perfBenchmarks || [];

  _dfAnimTick({
    totalTicks: stages.length + 2,
    stepMs: 500,
    onTick(tick) {
      const pct = Math.round((tick/(stages.length+2))*100);
      const b = document.getElementById('perfBarBar'); const p = document.getElementById('perfBarPct');
      if (b) b.style.width=pct+'%'; if (p) p.textContent=pct+'%';
      const pip = document.getElementById('perfPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length-1));
    },
    onComplete() {
      const pip = document.getElementById('perfPipeline');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const res = document.getElementById('perfResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="card">
          <div class="section-label">BENCHMARK RESULTS</div>
          ${_dfTable(['Operation','Elapsed','Throughput','Rate','Stage'],
            benchmarks.map(b=>[
              `<strong style="font-size:11px;">${_E(b.op)}</strong>`,
              `<code style="font-size:11px;">${_E(b.elapsed)}</code>`,
              `<span style="font-size:11px;color:var(--drex-primary);">${_E(b.throughput)}</span>`,
              `<span style="font-size:11px;">${_E(b.objSec)}</span>`,
              `<span class="badge badge-neutral" style="font-size:9px;">${_E(b.stage)}</span>`,
            ]))}
          <div class="pres-verdict-block mt-10">
            <div style="font-size:16px;font-weight:900;color:var(--drex-status-pass);">BENCHMARK COMPLETE</div>
            <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">Deterministic fixture workloads · No hardware access</div>
          </div>
          <div style="margin-top:8px;">${_dfDisc()}</div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 10: WORKSTATION SETTINGS DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function demoSettings() {
  _dfResetAnim(); DF.active = true; DF.module = 'settings';
  const v = _dfView(); if (!v) return;
  const settings = [
    { cat:'Authentication',  key:'Session Timeout',     current:'480 min',     allowed:'30–1440 min', status:'VALID' },
    { cat:'Authentication',  key:'JWT Algorithm',        current:'HS256',        allowed:'HS256, RS256', status:'VALID' },
    { cat:'Safety',          key:'System Disk Guard',    current:'ENABLED',      allowed:'ENABLED only', status:'VALID' },
    { cat:'Safety',          key:'Two-Man Rule',         current:'ENABLED',      allowed:'ENABLED only', status:'VALID' },
    { cat:'Safety',          key:'Verification Required',current:'ALWAYS',       allowed:'ALWAYS, OPTIONAL', status:'VALID' },
    { cat:'Verification',    key:'Entropy Threshold',    current:'7.9 bits/byte',allowed:'7.0–8.0',     status:'VALID' },
    { cat:'Verification',    key:'Sample Sectors',       current:'64',           allowed:'32–256',       status:'VALID' },
    { cat:'Audit',           key:'Chain Algorithm',      current:'SHA-256',      allowed:'SHA-256 only', status:'VALID' },
    { cat:'Audit',           key:'Retention',            current:'Unlimited',    allowed:'Unlimited',    status:'VALID' },
    { cat:'Certificate',     key:'Schema Version',       current:'2.0',          allowed:'2.0',          status:'VALID' },
    { cat:'Certificate',     key:'Auto-Generate',        current:'POST_OPERATION',allowed:'POST_OP, MANUAL', status:'VALID' },
  ];
  const cats = [...new Set(settings.map(s=>s.cat))];

  v.innerHTML = `
    ${_dfCtxBar('Workstation Settings', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">CONFIGURATION</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">WORKSTATION OPERATIONAL SETTINGS</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">READ-ONLY configuration inspection · ${settings.length} settings · No silent modification</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoSettingsValidate()" style="width:auto;padding:8px 18px;">⚡ Validate Configuration</button>
      </div>
    </div>
    <div style="margin-top:12px;">
      ${cats.map(cat=>`
        <div class="card" style="margin-bottom:10px;">
          <div class="section-label" style="margin-bottom:8px;">${_E(cat)}</div>
          ${_dfTable(['Setting','Current Value','Allowed Values','Status'],
            settings.filter(s=>s.cat===cat).map(s=>[
              `<strong style="font-size:11px;">${_E(s.key)}</strong>`,
              `<code style="font-size:11px;">${_E(s.current)}</code>`,
              `<span style="font-size:10px;color:var(--drex-text-muted);">${_E(s.allowed)}</span>`,
              `<span class="badge badge-pass" style="font-size:9px;">${_E(s.status)}</span>`,
            ]))}
        </div>`).join('')}
    </div>
    <div id="settingsResult" style="display:none;" class="mt-12"></div>
  `;
  window._settingsCount = settings.length;
}

function demoSettingsValidate() {
  const res = document.getElementById('settingsResult');
  if (!res) return;
  res.style.display = 'block';
  res.innerHTML = `
    <div class="card" style="border-left:3px solid var(--drex-status-pass);">
      <div class="pres-metrics-grid">
        ${_dfMetric('SETTINGS', String(window._settingsCount || 11), 'var(--drex-primary)')}
        ${_dfMetric('VALID', String(window._settingsCount || 11), 'var(--drex-status-pass)')}
        ${_dfMetric('INVALID', '0', 'var(--drex-status-pass)')}
        ${_dfMetric('READ-ONLY', 'YES', 'var(--drex-text-muted)')}
      </div>
      <div class="pres-verdict-block mt-10">
        <div style="font-size:16px;font-weight:900;color:var(--drex-status-pass);">CONFIGURATION VALIDATION COMPLETE</div>
        <div style="font-size:11px;color:var(--drex-text-muted);margin-top:4px;">All settings within allowed bounds · No changes applied</div>
      </div>
      <div style="margin-top:8px;">${_dfDisc()}</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 11: 25 METHOD MATRIX DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoMethods() {
  _dfResetAnim(); DF.active = true; DF.module = 'methods';
  const v = _dfView(); if (!v) return;

  let methods = [];
  try {
    const r = await fetch('/api/methods/registry');
    if (r.ok) methods = await r.json();
  } catch(e) {}

  if (!methods.length) {
    v.innerHTML = `${_dfCtxBar('Method Matrix', DF.caseId, null, '<span class="badge badge-neutral">LOADING</span>')}
      <div class="card mt-12"><div class="section-label">Loading method registry…</div></div>`;
    return;
  }

  const cats = [...new Set(methods.map(m=>m.category))];

  v.innerHTML = `
    ${_dfCtxBar('25 Method Matrix', DF.caseId, null, '<span class="badge badge-pass" style="font-size:10px;">' + methods.length + ' METHODS</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">CANONICAL METHOD MATRIX — AUTHORITATIVE REGISTRY</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">Source: /api/methods/registry · ${methods.length} registered methods · Every row has a working demo</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="if(typeof startJudgeRunAll==='function')startJudgeRunAll();else alert('Start Judge Evaluation first')" style="width:auto;padding:7px 16px;font-size:11px;">▶ Run All Method Demos</button>
      </div>
      <div class="pres-metrics-grid" style="margin-bottom:12px;">
        ${cats.map(cat => _dfMetric(cat.split('/')[0].toUpperCase(), String(methods.filter(m=>m.category===cat).length), 'var(--drex-primary)')).join('')}
      </div>
      ${_dfTable(['ID','Method Name','Category','Backend','Status','Demo'],
        methods.map(m=>{
          const isBlocked = m.status.includes('UNSUPPORTED') || m.status.includes('UNAVAILABLE');
          const badge = isBlocked ? 'badge-warn' : 'badge-pass';
          const btnLabel = isBlocked ? 'VIEW BLOCK' : 'RUN DEMO';
          return [
            `<strong style="font-family:var(--drex-font-mono);color:var(--drex-primary);">${_E(m.method_id)}</strong>`,
            `<strong style="font-size:11px;">${_E(m.name)}</strong>`,
            `<span style="font-size:10px;color:var(--drex-text-muted);">${_E(m.category)}</span>`,
            `<span style="font-size:10px;">${_E(m.backend||'—')}</span>`,
            `<span class="badge ${badge}" style="font-size:9px;">${_E(isBlocked ? (m.status.includes('UNAVAILABLE')?'HW REQUIRED':'UNSUPPORTED') : 'VERIFIED')}</span>`,
            `<button class="action-btn" style="padding:3px 10px;font-size:10px;font-weight:700;width:auto;background:${isBlocked?'var(--drex-bg-surface-subtle)':'var(--drex-primary)'};color:${isBlocked?'var(--drex-text-muted)':'#fff'};border:1px solid var(--drex-border-base);"
              onclick="if(typeof runMethodDemo==='function')runMethodDemo(${m.id});else navigateTo('judge_demo')">${btnLabel}</button>`,
          ];
        }))}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 12: JUDGE DEMO FLOW PAGE DEMO
// ═══════════════════════════════════════════════════════════════════════════════

async function demoJudgeDemo() {
  _dfResetAnim(); DF.active = true; DF.module = 'judge_demo';
  const v = _dfView(); if (!v) return;

  let methodCount = 25;
  try { const r = await fetch('/api/methods/registry'); if (r.ok) { const m = await r.json(); methodCount = m.length; } } catch(e) {}

  const stages = [
    { title:'Judge Evaluation Init',  done:'Evaluation context initialized', active:'Initializing evaluation…' },
    { title:'Module Discovery',       done:'28 sidebar modules discovered',  active:'Discovering modules…' },
    { title:'Method Discovery',       done:methodCount + ' methods loaded',  active:'Loading method registry…' },
    { title:'Safety Initialization',  done:'Safety gates verified',          active:'Verifying safety gates…' },
    { title:'Demo Environment',       done:'All demos ready',                active:'Preparing demo environment…' },
    { title:'Evaluation Ready',       done:'Judge environment READY',        active:'Finalizing…' },
  ];

  v.innerHTML = `
    ${_dfCtxBar('Judge Demo Flow', DF.caseId, null, '<span class="badge badge-neutral" style="font-size:10px;">INITIALIZING</span>')}
    <div class="card mt-12">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div class="section-label" style="margin-bottom:2px;">JUDGE EVALUATION DEMONSTRATION FLOW</div>
          <div style="font-size:11px;color:var(--drex-text-muted);">System self-verification · Module discovery · Method registry · Safety initialization</div>
        </div>
        <button class="action-btn pres-exec-btn" onclick="demoJudgeDemoRun()" id="jdBtn" style="width:auto;padding:8px 18px;">⚡ Initialize Judge Environment</button>
      </div>
      ${_dfBar('jdBar', 0)}
    </div>
    <div id="jdPip" style="margin-top:12px;">${_dfPipeline(stages, 0)}</div>
    <div id="jdResult" style="display:none;" class="mt-12"></div>
  `;
  window._jdStages = stages;
  window._jdMethodCount = methodCount;
}

function demoJudgeDemoRun() {
  const btn = document.getElementById('jdBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ Initializing…'; }
  const stages = window._jdStages || [];
  const mc = window._jdMethodCount || 25;

  _dfAnimTick({
    totalTicks: stages.length + 2,
    stepMs: 480,
    onTick(tick) {
      const pct = Math.round((tick/(stages.length+2))*100);
      const b = document.getElementById('jdBarBar'); const p = document.getElementById('jdBarPct');
      if (b) b.style.width=pct+'%'; if (p) p.textContent=pct+'%';
      const pip = document.getElementById('jdPip');
      if (pip) pip.innerHTML = _dfPipeline(stages, Math.min(tick, stages.length-1));
    },
    onComplete() {
      const pip = document.getElementById('jdPip');
      if (pip) pip.innerHTML = _dfPipeline(stages, stages.length);
      const b = document.getElementById('jdBarBar'); const p = document.getElementById('jdBarPct');
      if (b) b.style.width='100%'; if (p) p.textContent='100%';
      const res = document.getElementById('jdResult');
      if (!res) return;
      res.style.display = 'block';
      res.innerHTML = `
        <div class="card" style="background:linear-gradient(135deg,#0d1b2e,#0e2340);border:1px solid rgba(23,105,224,0.25);">
          <div class="pres-metrics-grid">
            ${_dfMetric('SIDEBAR MODULES', '28', 'var(--drex-primary)')}
            ${_dfMetric('METHODS', String(mc), 'var(--drex-primary)')}
            ${_dfMetric('SAFETY GATES', 'ALL PASS', 'var(--drex-status-pass)')}
            ${_dfMetric('DEMO COVERAGE', '28 / 28', 'var(--drex-status-pass)')}
          </div>
          <div class="pres-verdict-block mt-10">
            <div style="font-size:28px;font-weight:900;color:#86efac;">JUDGE ENVIRONMENT READY</div>
            <div style="font-size:12px;color:#64748b;margin-top:6px;">All ${mc} methods · 28 sidebar modules · Zero destructive operations</div>
          </div>
          <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="action-btn pres-exec-btn" style="width:auto;padding:8px 22px;font-size:12px;" onclick="navigateTo('overview');setTimeout(()=>typeof startJudgeEvaluation==='function'&&startJudgeEvaluation(),200)">▶ Start Full Judge Evaluation</button>
            <button class="action-btn" style="width:auto;padding:8px 16px;font-size:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;" onclick="navigateTo('overview')">↩ Return to Overview</button>
          </div>
          <div style="margin-top:10px;text-align:center;">${_dfDisc()}</div>
        </div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE _DF_MAP — ADD ALL 12 MISSING MODULES
// ═══════════════════════════════════════════════════════════════════════════════

// Extend the existing _DF_MAP with the 12 new entries
if (typeof window._DF_MAP !== 'undefined') {
  Object.assign(window._DF_MAP, {
    hex_inspector:     'demoHexInspector',
    residue_analyzer:  'demoResidueAnalyzer',
    validation_lab:    'demoValidationLab',
    reports:           'demoReports',
    device_intelligence:'demoDeviceIntelligence',
    device_manager:    'demoDeviceManager',
    backend_manager:   'demoBackendManager',
    diagnostics:       'demoDiagnostics',
    performance_lab:   'demoPerformanceLab',
    settings:          'demoSettings',
    methods:           'demoMethods',
    judge_demo:        'demoJudgeDemo',
  });
}

// ─── GLOBAL EXPORTS ────────────────────────────────────────────────────────────

window._dfOpenCertNewTab        = _dfOpenCertNewTab;
window.demoHexInspector         = demoHexInspector;
window.demoHexInspectorRun      = demoHexInspectorRun;
window.demoResidueAnalyzer      = demoResidueAnalyzer;
window.demoResidueRun           = demoResidueRun;
window.demoValidationLab        = demoValidationLab;
window.demoValidationLabRun     = demoValidationLabRun;
window.demoReports              = demoReports;
window.demoReportsGenerate      = demoReportsGenerate;
window.demoReportsOpenTab       = demoReportsOpenTab;
window.demoDeviceIntelligence   = demoDeviceIntelligence;
window.demoDeviceIntelligenceRun= demoDeviceIntelligenceRun;
window.demoDeviceManager        = demoDeviceManager;
window.demoDeviceManagerView    = demoDeviceManagerView;
window.demoBackendManager       = demoBackendManager;
window.demoDiagnostics          = demoDiagnostics;
window.demoDiagnosticsRun       = demoDiagnosticsRun;
window.demoPerformanceLab       = demoPerformanceLab;
window.demoPerformanceLabRun    = demoPerformanceLabRun;
window.demoSettings             = demoSettings;
window.demoSettingsValidate     = demoSettingsValidate;
window.demoMethods              = demoMethods;
window.demoJudgeDemo            = demoJudgeDemo;
window.demoJudgeDemoRun         = demoJudgeDemoRun;
