import { explainFromText, explainFromImage, imageToBase64 } from './explainer.js'
import { calculateMaterials, renderCalcResult } from './calculator.js'
import { loadDirectory, filterDirectory, renderDirectory } from './directory.js'
import { extractTextFromPDF } from './pdf-reader.js'
import { exportExplainerPDF, exportCalcPDF } from './export.js'

// ─── Navegación entre secciones ───
function switchSection(name) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'))
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'))
  document.getElementById(`section-${name}`)?.classList.add('active')
  document.querySelector(`[data-section="${name}"]`)?.classList.add('active')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchSection(tab.dataset.section))
})
window.switchSection = switchSection

// ─── Drag & drop helpers ───
function setupDropzone(dropzoneId, inputId) {
  const dropzone = document.getElementById(dropzoneId)
  const input = document.getElementById(inputId)
  if (!dropzone || !input) return

  ;['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault()
      dropzone.classList.add('drag-over')
    })
  })
  ;['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, () => {
      dropzone.classList.remove('drag-over')
    })
  })

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(files[0])
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

// ─── EXPLICADOR — imagen ───
document.getElementById('image-input')?.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return
  const preview = document.getElementById('image-preview')
  if (preview) {
    preview.src = URL.createObjectURL(file)
    preview.style.display = 'block'
  }
})

// ─── EXPLICADOR — PDF ───
document.getElementById('pdf-input')?.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return
  const preview = document.getElementById('pdf-preview')
  if (preview) {
    preview.style.display = 'block'
    preview.textContent = `PDF cargado: ${file.name}`
  }
})

// ─── Tabs de entrada ───
document.querySelectorAll('.input-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.input-area').forEach(a => a.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById(`input-${tab.dataset.input}`)?.classList.add('active')
  })
})

// ─── Markdown básico → HTML ───
function renderMarkdown(text) {
  return text
    .replace(/^### (.*)/gm, '<h4>$1</h4>')
    .replace(/^## (.*)/gm, '<h3>$1</h3>')
    .replace(/^# (.*)/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

// ─── BOTÓN EXPLICAR ───
document.getElementById('btn-explain')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-explain')
  const result = document.getElementById('explainer-result')
  const content = document.getElementById('explainer-content')
  const planType = document.getElementById('plan-type')?.value
  const question = document.getElementById('extra-question')?.value
  const activeTab = document.querySelector('.input-tab.active')?.dataset.input

  btn.disabled = true
  btn.innerHTML = '<span class="loading-spinner"></span>Analizando...'

  try {
    let response = ''

    if (activeTab === 'image') {
      const imageInput = document.getElementById('image-input')
      const file = imageInput?.files[0]
      if (!file) throw new Error('Selecciona una imagen primero')
      const { base64, mimeType } = await imageToBase64(file)
      response = await explainFromImage(base64, mimeType, planType, question)
    } else if (activeTab === 'pdf') {
      const pdfInput = document.getElementById('pdf-input')
      const file = pdfInput?.files[0]
      if (!file) throw new Error('Selecciona un PDF primero')
      const text = await extractTextFromPDF(file)
      response = await explainFromText(text, planType, question)
    } else {
      const text = document.getElementById('text-input')?.value
      if (!text?.trim()) throw new Error('Escribe una descripción primero')
      response = await explainFromText(text, planType, question)
    }

    content.innerHTML = renderMarkdown(response)
    result.style.display = 'block'
    result.scrollIntoView({ behavior: 'smooth' })
  } catch (err) {
    content.innerHTML = `<div class="error-msg">Error: ${err.message}</div>`
    result.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.textContent = 'Explicar con IA →'
  }
})

// ─── BOTÓN CALCULAR ───
document.getElementById('btn-calculate')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-calculate')
  const desc = document.getElementById('calc-description')?.value
  if (!desc?.trim()) { alert('Describe tu reforma primero'); return }

  const ccaa = document.getElementById('calc-ccaa')?.value
  const quality = document.getElementById('calc-quality')?.value
  const result = document.getElementById('calc-result')
  const content = document.getElementById('calc-content')

  btn.disabled = true
  btn.innerHTML = '<span class="loading-spinner"></span>Calculando...'

  try {
    const data = await calculateMaterials(desc, ccaa, quality)
    renderCalcResult(data, content)
    result.style.display = 'block'
    result.scrollIntoView({ behavior: 'smooth' })
  } catch (err) {
    content.innerHTML = `<div class="error-msg">Error: ${err.message}</div>`
    result.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.textContent = 'Calcular materiales →'
  }
})

// ─── EXPORT BUTTONS ───
document.getElementById('btn-export-explainer')?.addEventListener('click', () => exportExplainerPDF())
document.getElementById('btn-export-calc')?.addEventListener('click', () => exportCalcPDF())

// ─── DIRECTORIO ───
async function initDirectory() {
  const container = document.getElementById('directory-grid')
  if (!container) return

  try {
    const items = await loadDirectory()
    renderDirectory(items, container)
  } catch {
    container.innerHTML = '<div class="empty-state">Error al cargar el directorio.</div>'
    return
  }

  const doFilter = () => {
    const search = document.getElementById('dir-search')?.value
    const ccaa   = document.getElementById('dir-ccaa')?.value
    const tipo   = document.getElementById('dir-tipo')?.value
    const container = document.getElementById('directory-grid')
    renderDirectory(filterDirectory(search, ccaa, tipo), container)
  }

  document.getElementById('dir-search')?.addEventListener('input', doFilter)
  document.getElementById('dir-ccaa')?.addEventListener('change', doFilter)
  document.getElementById('dir-tipo')?.addEventListener('change', doFilter)
}

// ─── Copiar resultado ───
window.copyResult = function(id) {
  const el = document.getElementById(id)
  if (!el) return
  navigator.clipboard.writeText(el.innerText)
    .then(() => alert('¡Copiado!'))
    .catch(() => {
      // Fallback for older browsers
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      document.execCommand('copy')
      sel.removeAllRanges()
      alert('¡Copiado!')
    })
}

// ─── Compartir resultado ───
function getShareText() {
  return encodeURIComponent('He calculado los materiales de mi reforma con IA en PlanoBase.pro')
}

function getShareURL() {
  return encodeURIComponent(window.location.href)
}

window.shareWhatsApp = function() {
  window.open(`https://wa.me/?text=${getShareText()}%20${getShareURL()}`, '_blank')
}

window.shareTwitter = function() {
  window.open(`https://twitter.com/intent/tweet?text=${getShareText()}&url=${getShareURL()}`, '_blank')
}

window.shareURL = function() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('¡Enlace copiado!'))
}

function showToast(msg) {
  const toast = document.createElement('div')
  toast.className = 'toast-msg'
  toast.textContent = msg
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2500)
}

// ─── Feedback rápido ───
window.sendFeedback = function(type, blockId) {
  const key = 'planobase_feedback'
  const data = { type, url: window.location.href, ts: Date.now() }
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push(data)
  localStorage.setItem(key, JSON.stringify(existing.slice(-20)))

  const block = document.getElementById(blockId)
  if (type === 'negative') {
    const comment = block?.querySelector('.feedback-comment')
    if (comment) comment.style.display = 'flex'
  } else {
    if (block) block.innerHTML = '<span class="feedback-thanks">¡Gracias por tu opinión! 🙏</span>'
  }
}

window.submitFeedback = function(blockId) {
  const block = document.getElementById(blockId)
  if (block) block.innerHTML = '<span class="feedback-thanks">¡Gracias! Tu opinión nos ayuda a mejorar 🙏</span>'
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  initDirectory()
  setupDropzone('image-dropzone', 'image-input')
  setupDropzone('pdf-dropzone', 'pdf-input')
})
