// ============================================================
//  FarmaBogotá — App principal
//  Demo Abbott · Mapa Leaflet + GeoJSON + localStorage
// ============================================================

(() => {
  'use strict';

  // ----- Storage -----
  const STORAGE_KEY = 'farmabogota.pharmacies.v1';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  let pharmacies = load();
  let currentLoc = null;
  let currentFilter = '';
  let counter = pharmacies.length ? Math.max(...pharmacies.map(p => p.id || 0)) : 0;

  // ----- Elementos DOM -----
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const listEl = $('#list');
  const filterLoc = $('#filter-loc');
  const modalBackdrop = $('#modal-backdrop');
  const modalClose = $('#modal-close');
  const btnCancel = $('#btn-cancel');
  const form = $('#form');
  const locName = $('#loc-name');
  const locCount = $('#loc-count');
  const toast = $('#toast');
  const toastMsg = $('#toast-msg');
  const countPins = $('#count-pins');
  const countLoc = $('#count-loc');

  // ----- Mapa Leaflet -----
  const map = L.map('map', {
    center: [4.655, -74.085],
    zoom: 12,
    minZoom: 10,
    maxZoom: 16,
    zoomControl: true,
    attributionControl: true,
  });

  // Tiles de OpenStreetMap (mapa real con calles y referencias)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Layer para polígonos de localidades
  const locLayer = L.geoJSON(null, {
    style: defaultStyle,
    onEachFeature: onEachLocalidad,
  }).addTo(map);

  // Layer para marcadores de farmacias
  const markersLayer = L.layerGroup().addTo(map);

  // ----- Estilos por defecto -----
  function defaultStyle(feature) {
    return {
      color: '#FFFFFF',
      weight: 2,
      fillColor: '#DCE7F5',
      fillOpacity: 0.85,
    };
  }
  function styleHasPins() {
    return { fillColor: '#A8C9EC', fillOpacity: 0.9 };
  }

  // ----- Eventos por feature (localidad) -----
  function onEachLocalidad(feature, layer) {
    const name = feature.properties.nombre;

    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 3,
        color: '#FFFFFF',
        fillOpacity: 0.95,
      });
    });
    layer.on('mouseout', () => {
      locLayer.resetStyle(layer);
      applyPinState(layer, name);
    });
    layer.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      openModal(name);
    });

    // Bind tooltip permanente con el nombre
    layer.bindTooltip(name, {
      permanent: true,
      direction: 'center',
      className: 'loc-label',
    });

    applyPinState(layer, name);
  }

  function applyPinState(layer, name) {
    if (pharmacies.some(p => p.localidad === name)) {
      layer.setStyle(styleHasPins());
    }
  }

  // ----- Cargar GeoJSON -----
  fetch('data/localidades.geojson')
    .then(r => {
      if (!r.ok) throw new Error('No se pudo cargar data/localidades.geojson');
      return r.json();
    })
    .then(data => {
      locLayer.addData(data);

      // Remapear nombre oficial (LOCNOMBRE) a nombre amigable para mostrar
      const nameMap = {
        'USAQUEN': 'Usaquén',
        'SUBA': 'Suba',
        'ENGATIVA': 'Engativá',
        'BARRIOS UNIDOS': 'Barrios Unidos',
        'CHAPINERO': 'Chapinero',
        'FONTIBON': 'Fontibón',
        'TEUSAQUILLO': 'Teusaquillo',
        'SANTA FE': 'Santa Fe',
        'LOS MARTIRES': 'Los Mártires',
        'CANDELARIA': 'La Candelaria',
        'ANTONIO NARIÑO': 'Antonio Nariño',
        'PUENTE ARANDA': 'Puente Aranda',
        'SAN CRISTOBAL': 'San Cristóbal',
        'RAFAEL URIBE URIBE': 'Rafael Uribe Uribe',
        'TUNJUELITO': 'Tunjuelito',
        'USME': 'Usme',
        'KENNEDY': 'Kennedy',
        'BOSA': 'Bosa',
        'CIUDAD BOLIVAR': 'Ciudad Bolívar',
        'SUMAPAZ': 'Sumapaz',
      };
      data.features.forEach(f => {
        const raw = String(f.properties.LOCNOMBRE || '').trim();
        f.properties.nombre = nameMap[raw] || raw;
      });

      // Ajustar vista al bbox de la zona urbana (excluyendo Sumapaz, que es enorme y aplastaría el zoom)
      const urbanBounds = [];
      locLayer.eachLayer(l => {
        if (l.feature && l.feature.properties.nombre !== 'Sumapaz') {
          urbanBounds.push(l.getBounds());
        }
      });
      if (urbanBounds.length) {
        // Combinar todos los bounds urbanos
        let combined = urbanBounds[0];
        for (let i = 1; i < urbanBounds.length; i++) combined.extend(urbanBounds[i]);
        map.fitBounds(combined, { padding: [30, 30] });
      }
      // Poblar filtro de localidades (en orden del GeoJSON)
      const nombres = data.features.map(f => f.properties.nombre);
      filterLoc.innerHTML = '<option value="">Todas las localidades</option>' +
        nombres.map(n => `<option value="${n}">${n}</option>`).join('');
      if (currentFilter) filterLoc.value = currentFilter;
    })
    .catch(err => {
      console.error(err);
      showToast('Error cargando el mapa');
    });

  // ----- Marcadores -----
  function renderMarkers() {
    markersLayer.clearLayers();
    const grouped = {};
    pharmacies.forEach(p => {
      (grouped[p.localidad] = grouped[p.localidad] || []).push(p);
    });
    Object.entries(grouped).forEach(([loc, items]) => {
      // Coger centroide de la localidad desde el polígono
      const feature = locLayer.getLayers().find(l =>
        l.feature && l.feature.properties.nombre === loc
      );
      if (!feature) return;
      const center = feature.getBounds().getCenter();
      items.forEach((p, i) => {
        // Pequeño offset en cascada
        const offsetLat = i * 0.0008;
        const offsetLng = i * 0.0010;
        const icon = L.divIcon({
          className: 'ph-marker',
          html: `<div class="ph-marker-bubble">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const m = L.marker([center.lat + offsetLat, center.lng + offsetLng], { icon })
          .bindPopup(buildPopup(p, i + 1, items.length));
        m.addTo(markersLayer);
      });
    });
  }

  function buildPopup(p, num, total) {
    return `
      <div style="min-width:200px">
        <div style="font-size:10.5px;font-weight:700;color:#0054A6;letter-spacing:0.02em;margin-bottom:4px">
          ${p.localidad} · #${num} de ${total}
        </div>
        <b style="display:block;font-size:13px;color:#1A2332;margin-bottom:4px">${escapeHtml(p.nombre)}</b>
        <div style="font-size:12px;color:#5B6878;margin-bottom:6px">${escapeHtml(p.direccion)}</div>
        <div style="font-size:11px;color:#5B6878;margin-bottom:4px">
          <b>${p.anios}</b> ${p.anios === 1 ? 'año' : 'años'} de constitución
        </div>
        <div style="font-size:11.5px;color:#1A2332;margin-bottom:8px;line-height:1.4">
          ${escapeHtml(p.proposito)}
        </div>
        <a href="#" data-del-popup="${p.id}" style="font-size:11px;color:#C92A2A;text-decoration:underline">
          Eliminar
        </a>
      </div>
    `;
  }

  // ----- Listado -----
  function renderList() {
    const items = currentFilter
      ? pharmacies.filter(p => p.localidad === currentFilter)
      : pharmacies;

    if (!items.length) {
      listEl.innerHTML = `
        <div class="empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p>${currentFilter ? `No hay farmacias en ${currentFilter}.` : 'Aún no hay farmacias registradas.<br>Haz click en una localidad del mapa para comenzar.'}</p>
        </div>`;
      return;
    }

    listEl.innerHTML = items
      .slice()
      .sort((a, b) => a.localidad.localeCompare(b.localidad) || a.nombre.localeCompare(b.nombre))
      .map(p => {
        const allInLoc = pharmacies.filter(x => x.localidad === p.localidad);
        const num = allInLoc.findIndex(x => x.id === p.id) + 1;
        return `
          <div class="ph-card" data-id="${p.id}">
            <span class="badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              ${p.localidad} · #${num || 1}
            </span>
            <h3>${escapeHtml(p.nombre)}</h3>
            <div class="addr">${escapeHtml(p.direccion)}</div>
            <div class="meta">
              <span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${p.anios} ${p.anios === 1 ? 'año' : 'años'}
              </span>
              <span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                ${escapeHtml(truncate(p.proposito, 40))}
              </span>
            </div>
            <button class="del" data-del="${p.id}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
              Eliminar
            </button>
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deletePharmacy(+btn.getAttribute('data-del'));
      });
    });
  }

  function refreshPolygonStyles() {
    locLayer.eachLayer(layer => {
      const name = layer.feature?.properties?.nombre;
      if (name) applyPinState(layer, name);
    });
  }

  function renderStats() {
    countPins.textContent = pharmacies.length;
    const locs = new Set(pharmacies.map(p => p.localidad));
    countLoc.textContent = locs.size;
  }

  function renderAll() {
    renderMarkers();
    refreshPolygonStyles();
    renderStats();
    renderList();
  }

  // ----- Modal -----
  function openModal(loc) {
    currentLoc = loc;
    locName.textContent = loc;
    const n = pharmacies.filter(p => p.localidad === loc).length;
    locCount.textContent = n === 0 ? 'Sin registros' : `${n} ${n === 1 ? 'farmacia' : 'farmacias'}`;
    form.reset();
    setTimeout(() => $('#f-nombre').focus(), 50);
    modalBackdrop.classList.add('open');
  }
  function closeModal() {
    modalBackdrop.classList.remove('open');
    currentLoc = null;
  }

  // ----- CRUD -----
  function addPharmacy(data) {
    counter += 1;
    const rec = { id: counter, ...data, createdAt: new Date().toISOString() };
    pharmacies.push(rec);
    save(pharmacies);
    renderAll();
    showToast(`Farmacia agregada en ${data.localidad}`);
  }
  function deletePharmacy(id) {
    pharmacies = pharmacies.filter(p => p.id !== id);
    save(pharmacies);
    renderAll();
    showToast('Farmacia eliminada');
  }

  // ----- Toast -----
  let toastTimer;
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ----- Helpers -----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  // ----- View toggle -----
  $('#btn-map').addEventListener('click', () => {
    document.body.classList.remove('view-list');
    document.body.classList.add('view-map');
    $('#btn-map').classList.add('active');
    $('#btn-list').classList.remove('active');
    // Forzar recálculo de Leaflet tras display change
    setTimeout(() => map.invalidateSize(), 50);
  });
  $('#btn-list').addEventListener('click', () => {
    document.body.classList.remove('view-map');
    document.body.classList.add('view-list');
    $('#btn-list').classList.add('active');
    $('#btn-map').classList.remove('active');
  });

  // ----- Modal events -----
  modalClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentLoc) return;
    const data = {
      nombre: $('#f-nombre').value.trim(),
      direccion: $('#f-direccion').value.trim(),
      anios: parseInt($('#f-anios').value, 10),
      proposito: $('#f-proposito').value.trim(),
      localidad: currentLoc,
    };
    if (!data.nombre || !data.direccion || !data.proposito || isNaN(data.anios)) return;
    addPharmacy(data);
    closeModal();
  });

  // ----- Filtro -----
  filterLoc.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderList();
  });

  // ----- Popup "Eliminar" -----
  map.on('popupopen', (e) => {
    const link = e.popup.getElement().querySelector('[data-del-popup]');
    if (link) {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        deletePharmacy(+link.getAttribute('data-del-popup'));
      });
    }
  });

  // ----- Init -----
  renderAll();
})();
