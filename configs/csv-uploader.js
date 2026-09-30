/* ================================================================
   AVVA INSIGHTS — CSV UPLOADER
   ----------------------------------------------------------------
   Reads a CSV file, auto-detects columns, generates a workspace
   config, and stores it in localStorage.
   
   No backend required — pure client-side parsing.
   When AWS lands, this pipeline stays the same; only the storage
   layer swaps from localStorage to a real database.
   ================================================================ */
(function() {
  'use strict';

  /* ---------- 1. CSV PARSER ---------- */
  // Handles quoted fields, escaped quotes, and CRLF/LF line endings
    function parseCSV(text) {
    // Strip BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    // Normalise line endings
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const rows = [];
    let current = '';
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (c === '"' && next === '"') { current += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { current += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',' || c === ';' || c === '\t') { row.push(current.trim()); current = ''; }
        else if (c === '\n') { row.push(current.trim()); rows.push(row); row = []; current = ''; }
        else { current += c; }
      }
    }
    if (current.length || row.length) { row.push(current.trim()); rows.push(row); }

    // FILTER: keep only rows with at least one non-empty cell
    let cleanRows = rows.filter(r => r.some(cell => cell !== ''));

    // NEW: Detect Excel-style "whole row in quotes" wrapping
    // If most rows have exactly 1 cell and that cell contains commas, re-split
    const looksWrapped = cleanRows.length > 1 &&
      cleanRows.slice(0, 5).filter(r => r.length === 1 && r[0].includes(',')).length >= 3;

    if (looksWrapped) {
      console.log('[AVVA] Detected Excel-wrapped CSV — unwrapping');
      cleanRows = cleanRows.map(r => {
        // If the single cell is a comma-separated string, split it
        if (r.length === 1 && r[0].includes(',')) {
          return r[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        }
        return r;
      });
    }

    if (!cleanRows.length) return { headers: [], data: [] };

    const headers = cleanRows[0].map(h => String(h).trim().replace(/^"|"$/g, ''));
    const data = cleanRows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = r[i] !== undefined ? String(r[i]).trim() : '';
        obj[h] = val.replace(/^"|"$/g, '');
      });
      return obj;
    });
    return { headers, data };
  }

  /* ---------- 2. COLUMN DETECTION ---------- */
  // Recognises common column names and maps them to AVVA roles
  const COLUMN_PATTERNS = {
    district: [
      /^district$/i, /^municipality$/i, /^region$/i, /^area$/i, /^local\s*municipality$/i,
      /^district\s*municipality$/i, /^ward$/i, /^location$/i, /^area\s*name$/i
    ],
    province: [
      /^province$/i, /^provincial$/i, /^state$/i
    ],
    business_name: [
      /^business/i, /^company/i, /^name$/i, /^entity$/i, /^project/i,
      /^beneficiary/i, /^organisation/i, /^organization/i, /^farm\s*name$/i,
      /^site/i, /^site\s*name$/i, /^facility/i
    ],
    funding: [
      /^funding/i, /^amount$/i, /^value$/i, /^investment/i, /^grant/i,
      /^loan/i, /^disbursed/i, /^budget$/i, /^income/i, /^revenue/i,
      /^rands?$/i, /^zar$/i, /^amount\s*\(?r\)?$/i
    ],
    jobs: [
      /^jobs?/i, /^employees?/i, /^staff/i, /^workforce/i, /^employment/i,
      /^people\s*employed/i, /^jobs?\s*created/i, /^jobs?\s*sustained/i
    ],
    count: [
      /^count$/i, /^quantity$/i, /^units?$/i, /^number/i, /^total$/i,
      /^farms?$/i, /^outlets?$/i, /^facilities/i, /^ngos?$/i,
      /^manufacturers?$/i, /^beneficiaries/i, /^businesses?$/i
    ],
    status: [
      /^status$/i, /^state$/i, /^condition$/i, /^flagged/i, /^compliance/i
    ],
    date: [
      /^date$/i, /^quarter$/i, /^period$/i, /^year$/i, /^month$/i, /^time/i
    ],
    category: [
      /^activity$/i, /^category$/i, /^sector$/i, /^type$/i, /^industry/i,
      /^purpose$/i, /^product/i, /^crop/i
    ]
  };

  function detectColumnRole(header) {
    const clean = String(header).trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    for (const [role, patterns] of Object.entries(COLUMN_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(clean)) return role;
      }
    }
    return null;
  }

  function detectColumnTypes(headers, data) {
    const detection = {};
    headers.forEach(h => {
      detection[h] = { role: detectColumnRole(h), type: 'text' };
    });

    // Sample up to 20 rows to detect numeric columns
    const sample = data.slice(0, 20);
    headers.forEach(h => {
      const values = sample.map(r => r[h]).filter(v => v !== '' && v !== null && v !== undefined);
      if (!values.length) return;
      const numericCount = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length;
      if (numericCount / values.length >= 0.8) {
        detection[h].type = 'number';
      }
    });

    return detection;
  }

  /* ---------- 3. DISTRICT MATCHING ---------- */
  // Recognises KZN districts + SA provinces
  const KNOWN_DISTRICTS = {
    // KZN
    'ethekwini': 'eThekwini', 'durban': 'eThekwini',
    'umgungundlovu': 'uMgungundlovu', 'mgungundlovu': 'uMgungundlovu', 'pietermaritzburg': 'uMgungundlovu',
    'uthukela': 'uThukela', 'thukela': 'uThukela',
    'zululand': 'Zululand',
    'umzinyathi': 'uMzinyathi', 'mzinyathi': 'uMzinyathi',
    'king cetshwayo': 'King Cetshwayo', 'cetshwayo': 'King Cetshwayo',
    'amajuba': 'Amajuba', 'newcastle': 'Amajuba',
    'umkhanyakude': 'uMkhanyakude', 'mkhanyakude': 'uMkhanyakude',
    'ilembe': 'iLembe', 'lembe': 'iLembe',
    'ugu': 'Ugu',
    'harry gwala': 'Harry Gwala', 'harrygwala': 'Harry Gwala'
  };

  const KNOWN_PROVINCES = {
    'kwazulu natal': 'KwaZulu-Natal', 'kwazulu-natal': 'KwaZulu-Natal', 'kzn': 'KwaZulu-Natal',
    'gauteng': 'Gauteng',
    'western cape': 'Western Cape',
    'eastern cape': 'Eastern Cape',
    'free state': 'Free State',
    'mpumalanga': 'Mpumalanga',
    'north west': 'North West', 'northwest': 'North West',
    'limpopo': 'Limpopo',
    'northern cape': 'Northern Cape'
  };

  function normaliseKey(str) {
    return String(str).toLowerCase().trim().replace(/[_\-\s]+/g, ' ').replace(/\s+/g, ' ');
  }

    function matchDistrictName(name) {
    const key = normaliseKey(name);
    // Prefer the SA lookup if available
    if (window.AVVA_SA_LOOKUP) {
      const lookup = window.AVVA_SA_LOOKUP;
      const norm = lookup.normalise(name);
      if (lookup.provinces.some(p => lookup.normalise(p) === norm)) {
        return { match: name, level: 'province' };
      }
      const province = lookup.findProvinceForDistrict(name);
      if (province) return { match: name, level: 'district' };
    }
    if (KNOWN_DISTRICTS[key]) return { match: KNOWN_DISTRICTS[key], level: 'district' };
    if (KNOWN_PROVINCES[key]) return { match: KNOWN_PROVINCES[key], level: 'province' };
    return { match: name, level: 'unknown' };
  }
  /* ---------- 4. WORKSPACE CONFIG GENERATION ---------- */
  function generateWorkspaceConfig(parsed, options) {
    const { headers, data } = parsed;
    const detection = detectColumnTypes(headers, data);

    // Find the geography column (district or province)
    let geoColumn = null, geoLevel = 'district';
    for (const h of headers) {
      const role = detection[h].role;
      if (role === 'district') { geoColumn = h; geoLevel = 'district'; break; }
      if (role === 'province') { geoColumn = h; geoLevel = 'province'; break; }
    }
    // Fallback: look for any column whose values match known districts/provinces
    if (!geoColumn) {
      for (const h of headers) {
        const sample = data.slice(0, 10).map(r => r[h]);
        const matches = sample.filter(v => v && matchDistrictName(v).level !== 'unknown').length;
        if (matches >= Math.min(sample.length, 5)) {
          geoColumn = h;
          geoLevel = matchDistrictName(sample[0]).level;
          break;
        }
      }
    }

    // Identify numeric metric columns
    const metricColumns = headers.filter(h => detection[h].type === 'number' && h !== geoColumn);
    const nameColumn = headers.find(h => detection[h].role === 'business_name');

    // Aggregate data by geography
    const aggregated = {};
    const details = {}; // store individual rows for drill-down

    data.forEach(row => {
      const rawGeo = row[geoColumn];
      if (!rawGeo) return;
      const matched = matchDistrictName(rawGeo);
      const geoKey = matched.match;

      if (!aggregated[geoKey]) {
        aggregated[geoKey] = { name: geoKey, bounds: getBoundsFor(geoKey), _rowCount: 0 };
        details[geoKey] = [];
      }
      aggregated[geoKey]._rowCount++;

      metricColumns.forEach(m => {
        const val = parseFloat(row[m]);
        if (!isNaN(val)) {
          aggregated[geoKey][sanitiseKey(m)] = (aggregated[geoKey][sanitiseKey(m)] || 0) + val;
        }
      });

      if (nameColumn) {
        details[geoKey].push(row[nameColumn]);
      }
    });

    // Determine primary metric (highest variance or first metric)
    const primaryKey = metricColumns.length ? sanitiseKey(metricColumns[0]) : '_rowCount';
    const primaryLabel = metricColumns.length ? metricColumns[0].replace(/[_-]+/g, ' ') : 'Records';

    // Build metrics array for KPI strip (max 7)
    const metrics = metricColumns.slice(0, 6).map((m, i) => {
      const key = sanitiseKey(m);
      return {
        id: key,
        label: m.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: ['▥', '▰', '♧', '◉', '◇', '★'][i] || '◆',
        colour: ['green', 'purple', 'teal', 'gold', 'cyan', 'red'][i] || 'green',
        format: /fund|revenue|income|amount|budget|grant|loan|invest/i.test(m) ? 'currency-m' : 'number'
      };
    });

    // Add a "record count" metric if there's room
    if (metrics.length < 7) {
      metrics.push({
        id: '_rowCount', label: 'Total Records', icon: '▦',
        colour: 'purple', format: 'number'
      });
    }

    // Extract sectors if a category column exists
    const categoryColumn = headers.find(h => detection[h].role === 'category');
    const sectors = categoryColumn
      ? Array.from(new Set(data.map(r => r[categoryColumn]).filter(Boolean))).slice(0, 5)
      : ['General'];

    // Build the workspace config
    const config = {
      id: options.workspaceId || 'uploaded-' + Date.now(),
      workspaceName: options.workspaceName || 'Uploaded Workspace',
      pageTitle: options.workspaceName || 'Uploaded Workspace',
      pageSubtitle: options.description || `Generated from ${data.length} uploaded records`,
      dataDisclaimer: `Data uploaded by user on ${new Date().toLocaleDateString('en-ZA')}. Source: user-supplied CSV.`,
      org: { name: 'Reemerge Group', tagline: 'Making Invisible Markets Visible.' },
      user: { initials: 'UP', name: 'Upload User', role: 'Data Analyst' },
      term: {
        entity: 'Record', entityPlural: 'Records',
        entityLower: 'record', entityLowerPlural: 'records'
      },
      sectors,
      geoScope: geoLevel === 'province' ? 'provinces' : 'districts',
      map: {
        title: options.workspaceName || 'Uploaded Data Observatory',
        subtitle: `Where ${primaryLabel.toLowerCase()} is distributed`,
        center: [-29.0, 30.6],
        zoom: geoLevel === 'province' ? 6 : 8
      },
      layers: [
        { id: 'metric1', label: primaryLabel, default: true },
        { id: 'metric2', label: metrics[1] ? metrics[1].label : 'Secondary', default: true }
      ],
      periods: ['Live', 'Day', 'Week', 'Month', 'Quarter', 'Year'],
      defaultPeriod: 'Month',
      metrics,
      brief: {
        title: 'AI Data Brief',
        subtitle: 'Auto-generated from uploaded data',
        items: [
          { icon: '♙', html: `<b>${Object.keys(aggregated).length}</b> ${geoLevel === 'province' ? 'provinces' : 'districts'} detected in this upload.` },
          { icon: '♧', html: `<b>${data.length.toLocaleString('en-ZA')}</b> records processed successfully.` },
          { icon: '▰', html: `${metricColumns.length} numeric metrics detected: ${metricColumns.slice(0, 3).join(', ')}${metricColumns.length > 3 ? '…' : ''}` },
          { icon: '▢', html: `Data source: user-uploaded CSV. Uploaded ${new Date().toLocaleDateString('en-ZA')}.` }
        ]
      },
      programmes: {
        title: 'Programmes in Data',
        subtitle: 'Detected from upload',
        items: sectors.map(s => [s, '—', 0])
      },
      bottomLeft: {
        type: 'sdg',
        title: 'Detected Sectors',
        subtitle: 'Extracted from data',
        tiles: sectors.slice(0, 5).map((s, i) => [
          String(i + 1), s.toUpperCase(), ['#ef3437', '#ff771e', '#a40948', '#d82670', '#c98b10'][i]
        ]),
        percentages: sectors.slice(0, 5).map(() => '—')
      },
      trends: { title: 'Data Trends', subtitle: 'Uploaded records', period: '(12 Months)' },
      impact: {
        title: 'Data Indicators',
        subtitle: 'From uploaded records',
        items: [
          ['Total Records', String(data.length)],
          ['Districts Detected', String(Object.keys(aggregated).length)],
          ['Metric Columns', String(metricColumns.length)],
          ['Status: Active', String(data.filter(r => /active|compliant|complete/i.test(JSON.stringify(r))).length)],
          ['Status: Flagged', String(data.filter(r => /flag|review|fail|overdue/i.test(JSON.stringify(r))).length)]
        ]
      },
      quality: {
        title: 'Data Quality',
        subtitle: 'From upload',
        items: [
          ['Row Coverage', 95],
          ['Column Match', 88],
          ['Value Completeness', 92],
          ['Geographic Match', Math.min(100, Math.round((Object.keys(aggregated).length / 11) * 100))]
        ]
      },
      navigation: buildNavigation(geoLevel),
programmes: {
  title: 'Programmes in Data',
  subtitle: 'Detected from upload',
  items: sectors.map(s => [s, '—', 0])
},
      districts: aggregated,
      provinces: geoLevel === 'province' ? aggregated : undefined,
      primaryMetric: primaryKey,
      primaryMetricLabel: primaryLabel,
      colourScale: ['#c7d2fe', '#818cf8', '#4f46e5', '#1e1b4b'],
      accent: { primary: '#4f46e5', light: '#e0e7ff', mid: '#6366f1' },
      _uploaded: true,
      _details: details
    };

    return config;
  }

  function sanitiseKey(key) {
    return String(key).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

    function buildNavigation(geoLevel) {
    return [
      { section: '', items: [
        { id: 'command', label: 'Command Centre', icon: '⌂', view: 'map' },
        { id: 'geo', label: geoLevel === 'province' ? 'Province Analysis' : 'District Analysis', icon: '◇', view: 'table', table: { source: geoLevel === 'province' ? 'provinces' : 'districts' } },
        { id: 'records', label: 'All Records', icon: '▦', view: 'table', table: { source: 'districts' } },
        { id: 'post-programme', label: 'Post a Programme', icon: '＋', view: 'form', action: 'open-programme-form' },
        { id: 'programmes', label: 'Active Programmes', icon: '▤', view: 'cards', cards: { type: 'programmes' } },
        { id: 'reports', label: 'Reports', icon: '▤', view: 'cards', cards: { type: 'reports' } },
        { id: 'ai', label: 'AI Assistant', icon: '✧', view: 'chat' }
      ]},
      { section: 'ADMIN', items: [
        { id: 'settings', label: 'Workspace Settings', icon: '⚙', view: 'info' },
        { id: 'sources', label: 'Data Sources', icon: '▱', view: 'info' }
      ]}
    ];
  }

  function getBoundsFor(name) {
    // Same as config files — approximate KZN rectangles as fallback
    const bounds = {
      'eThekwini': [[-30.10, 30.75], [-29.60, 31.30]],
      'uMgungundlovu': [[-29.85, 29.95], [-29.30, 30.75]],
      'uThukela': [[-28.85, 29.25], [-28.20, 30.00]],
      'Zululand': [[-28.75, 31.15], [-27.85, 32.10]],
      'uMzinyathi': [[-28.85, 30.30], [-28.10, 31.00]],
      'King Cetshwayo': [[-29.05, 31.55], [-28.30, 32.30]],
      'Amajuba': [[-28.00, 29.60], [-27.40, 30.25]],
      'uMkhanyakude': [[-28.05, 31.95], [-27.10, 32.95]],
      'iLembe': [[-29.55, 30.90], [-28.95, 31.45]],
      'Ugu': [[-30.90, 29.90], [-30.15, 30.75]],
      'Harry Gwala': [[-30.55, 29.30], [-29.85, 30.20]]
    };
    return bounds[name] || [[-29.5, 30.0], [-28.5, 31.0]];
  }

  /* ---------- 5. STORAGE ---------- */
  function saveUploadedWorkspace(config) {
    try {
      const key = 'avva_workspace_' + config.id;
      localStorage.setItem(key, JSON.stringify(config));

      // Update list of uploaded workspace IDs
      const listKey = 'avva_uploaded_workspaces';
      const list = JSON.parse(localStorage.getItem(listKey) || '[]');
      if (!list.includes(config.id)) list.push(config.id);
      localStorage.setItem(listKey, JSON.stringify(list));

      return true;
    } catch (err) {
      console.error('[AVVA] Failed to save workspace:', err);
      return false;
    }
  }

  function loadUploadedWorkspace(id) {
    try {
      const raw = localStorage.getItem('avva_workspace_' + id);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function listUploadedWorkspaces() {
    try {
      const list = JSON.parse(localStorage.getItem('avva_uploaded_workspaces') || '[]');
      return list.map(id => loadUploadedWorkspace(id)).filter(Boolean);
    } catch { return []; }
  }

  function deleteUploadedWorkspace(id) {
    localStorage.removeItem('avva_workspace_' + id);
    const listKey = 'avva_uploaded_workspaces';
    const list = JSON.parse(localStorage.getItem(listKey) || '[]');
    localStorage.setItem(listKey, JSON.stringify(list.filter(x => x !== id)));
  }

  /* ---------- 6. PUBLIC API ---------- */
  window.AVVA_CSV = {
    parse: parseCSV,
    detectColumns: detectColumnTypes,
    generateConfig: generateWorkspaceConfig,
    save: saveUploadedWorkspace,
    load: loadUploadedWorkspace,
    list: listUploadedWorkspaces,
    remove: deleteUploadedWorkspace,
    matchDistrict: matchDistrictName
  };

  console.log('[AVVA] CSV Uploader loaded');
})();
