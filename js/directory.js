let profesionales = []

export async function loadDirectory() {
  const res = await fetch('/data/directorio.json')
  const data = await res.json()
  profesionales = data.profesionales
  return profesionales
}

export function filterDirectory(search, ccaa, tipo) {
  return profesionales.filter(p => {
    const q = (search || '').toLowerCase()
    const matchSearch = !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.ciudad.toLowerCase().includes(q) ||
      p.especialidad.some(e => e.toLowerCase().includes(q))
    const matchCCAA = !ccaa || p.ccaa === ccaa
    const matchTipo = !tipo || p.tipo === tipo
    return matchSearch && matchCCAA && matchTipo
  })
}

export function renderDirectory(items, container) {
  const escapeHtml = (str) => {
    const div = document.createElement('div')
    div.textContent = String(str)
    return div.innerHTML
  }

  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No se encontraron profesionales con esos filtros.</div>'
    return
  }

  container.innerHTML = items.map(p => `
    <div class="dir-card ${p.destacado ? 'dir-card--featured' : ''}">
      ${p.destacado ? '<span class="dir-badge-featured">Destacado</span>' : ''}
      <div class="dir-card-header">
        <div class="dir-avatar">${escapeHtml(p.nombre.charAt(0))}</div>
        <div>
          <h3 class="dir-name">${escapeHtml(p.nombre)}</h3>
          <span class="dir-tipo">${escapeHtml(p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1))}</span>
          <span class="dir-ciudad">📍 ${escapeHtml(p.ciudad)}, ${escapeHtml(p.ccaa)}</span>
        </div>
      </div>
      <p class="dir-desc">${escapeHtml(p.descripcion)}</p>
      <div class="dir-tags">
        ${p.especialidad.map(e => `<span class="dir-tag">${escapeHtml(e)}</span>`).join('')}
      </div>
      <div class="dir-actions">
        ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" class="btn-dir">Email</a>` : ''}
        ${p.web ? `<a href="${escapeHtml(p.web)}" target="_blank" rel="noopener" class="btn-dir">Web →</a>` : ''}
        ${p.telefono ? `<a href="tel:${escapeHtml(p.telefono)}" class="btn-dir">Llamar</a>` : ''}
      </div>
    </div>
  `).join('')
}
