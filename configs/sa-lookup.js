/* ================================================================
   AVVA INSIGHTS — SOUTH AFRICA GEOGRAPHIC LOOKUP
   ----------------------------------------------------------------
   Maps district names to provinces, municipality names to districts.
   Used by geo-resolver.js to determine which boundary file to load
   and by csv-uploader.js to auto-detect data level.
   ================================================================ */
window.AVVA_SA_LOOKUP = {
  // All 9 provinces
  provinces: [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
  ],

  // Districts mapped to their provinces (52 total)
  districtToProvince: {
    "Alfred Nzo": "Eastern Cape",
    "Amathole": "Eastern Cape",
    "Buffalo City": "Eastern Cape",
    "Chris Hani": "Eastern Cape",
    "Joe Gqabi": "Eastern Cape",
    "Nelson Mandela Bay": "Eastern Cape",
    "OR Tambo": "Eastern Cape",
    "Sarah Baartman": "Eastern Cape",
    "Fezile Dabi": "Free State",
    "Lejweleputswa": "Free State",
    "Mangaung": "Free State",
    "Thabo Mofutsanyana": "Free State",
    "Xhariep": "Free State",
    "City of Ekurhuleni": "Gauteng",
    "City of Johannesburg": "Gauteng",
    "City of Tshwane": "Gauteng",
    "Sedibeng": "Gauteng",
    "West Rand": "Gauteng",
    "Amajuba": "KwaZulu-Natal",
    "eThekwini": "KwaZulu-Natal",
    "Harry Gwala": "KwaZulu-Natal",
    "iLembe": "KwaZulu-Natal",
    "King Cetshwayo": "KwaZulu-Natal",
    "Ugu": "KwaZulu-Natal",
    "uMgungundlovu": "KwaZulu-Natal",
    "uMkhanyakude": "KwaZulu-Natal",
    "uMzinyathi": "KwaZulu-Natal",
    "uThukela": "KwaZulu-Natal",
    "Zululand": "KwaZulu-Natal",
    "Capricorn": "Limpopo",
    "Mopani": "Limpopo",
    "Sekhukhune": "Limpopo",
    "Vhembe": "Limpopo",
    "Waterberg": "Limpopo",
    "Ehlanzeni": "Mpumalanga",
    "Gert Sibande": "Mpumalanga",
    "Nkangala": "Mpumalanga",
    "Bojanala Platinum": "North West",
    "Dr Kenneth Kaunda": "North West",
    "Dr Ruth Segomotsi Mompati": "North West",
    "Ngaka Modiri Molema": "North West",
    "Frances Baard": "Northern Cape",
    "John Taolo Gaetsewe": "Northern Cape",
    "Namakwa": "Northern Cape",
    "Pixley ka Seme": "Northern Cape",
    "ZF Mgcawu": "Northern Cape",
    "Cape Winelands": "Western Cape",
    "Central Karoo": "Western Cape",
    "Garden Route": "Western Cape",
    "Overberg": "Western Cape",
    "West Coast": "Western Cape",
    "City of Cape Town": "Western Cape"
  },

  // Normalise a name for comparison
  normalise(str) {
    if (!str) return '';
    return String(str).toLowerCase()
      .replace(/[_\-\s]+/g, '')
      .replace(/municipality|district|metropolitan|metro|cityof|city/g, '')
      .trim();
  },

  // Find which province a district belongs to (fuzzy)
  findProvinceForDistrict(districtName) {
    const target = this.normalise(districtName);
    for (const [district, province] of Object.entries(this.districtToProvince)) {
      if (this.normalise(district) === target) return province;
    }
    // Partial match fallback
    for (const [district, province] of Object.entries(this.districtToProvince)) {
      const d = this.normalise(district);
      if (d.includes(target) || target.includes(d)) return province;
    }
    return null;
  },

  // Detect which administrative level a set of district names is at
  detectLevel(names) {
    if (!names || !names.length) return 'district';
    const sample = names.slice(0, 20);
    let provinceCount = 0, districtCount = 0;
    for (const name of sample) {
      const norm = this.normalise(name);
      if (this.provinces.some(p => this.normalise(p) === norm)) { provinceCount++; continue; }
      if (this.findProvinceForDistrict(name)) { districtCount++; continue; }
    }
    if (provinceCount >= sample.length * 0.6) return 'province';
    if (districtCount >= sample.length * 0.6) return 'district';
    return 'municipality'; // default assumption
  }
};
