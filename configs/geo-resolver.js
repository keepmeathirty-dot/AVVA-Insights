/* ================================================================
   AVVA INSIGHTS — GEO RESOLVER
   ----------------------------------------------------------------
   Loads the correct boundary file based on the requested level,
   matches CSV names to feature names, and caches results.
   ================================================================ */
(function() {
  'use strict';

  const FILES = {
    province: 'geo/sa-provinces.geojson',
    district: 'geo/sa-districts.geojson',
    municipality: 'geo/sa-municipalities.geojson',
    ward: 'geo/sa-wards.geojson'
  };

  const NAME_FIELDS = {
    province: 'adm1_name',
    district: 'adm2_name',
    municipality: 'adm3_name',
    ward: 'adm4_name'
  };

  const _cache = {};       // { level: { normalisedName: geometry } }
  const _loading = {};     // { level: Promise }

  function normaliseName(str) {
    if (!str) return '';
    return String(str).toLowerCase()
      .replace(/[_\-\s]+/g, '')
      .replace(/municipality|district|metropolitan|metro|cityof|city|ward/g, '')
      .replace(/^0+/, '')
      .trim();
  }

  function loadLevel(level) {
    if (_cache[level]) return Promise.resolve(_cache[level]);
    if (_loading[level]) return _loading[level];

    const url = FILES[level];
    if (!url) return Promise.resolve(null);

    console.log('[AVVA] Loading', level, 'boundaries from', url);

    _loading[level] = fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        const lookup = {};
        const nameField = NAME_FIELDS[level];
        data.features.forEach(f => {
          const raw = f.properties[nameField] || '';
          const key = normaliseName(raw);
          if (key) {
            lookup[key] = {
              geometry: f.geometry,
              name: raw,
              properties: f.properties
            };
          }
        });
        _cache[level] = lookup;
        console.log('[AVVA] Loaded', Object.keys(lookup).length, level, 'boundaries');
        return lookup;
      })
      .catch(err => {
        console.warn('[AVVA] Failed to load', level, ':', err);
        _cache[level] = {};
        return {};
      });

    return _loading[level];
  }

  function findMatch(level, requestedName) {
    const lookup = _cache[level];
    if (!lookup) return null;
    const key = normaliseName(requestedName);
    if (lookup[key]) return lookup[key];
    // Partial match: try to find a feature whose name contains or is contained by
    for (const [k, v] of Object.entries(lookup)) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    return null;
  }

  function clearCache() {
    Object.keys(_cache).forEach(k => delete _cache[k]);
    Object.keys(_loading).forEach(k => delete _loading[k]);
  }

  window.AVVA_GEO = {
    load: loadLevel,
    findMatch,
    normaliseName,
    clearCache,
    NAME_FIELDS,
    FILES
  };

  console.log('[AVVA] Geo resolver loaded');
})();
