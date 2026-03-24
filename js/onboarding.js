// js/onboarding.js
const ONBOARDING_KEY = 'planobase_onboarding_done'

// Pasos del onboarding adaptados a PlanoBase
const STEPS = [
  {
    target: '.input-panel',
    title: 'Empieza aquí',
    text: 'Sube una foto, PDF o describe tu plano y la IA te lo explica al instante.',
    position: 'bottom'
  },
  {
    target: '#btn-explain',
    title: 'Analiza con IA',
    text: 'Pulsa aquí para que la IA explique tu plano o calcule materiales en segundos.',
    position: 'top'
  },
  {
    target: '#explainer-result',
    title: 'Tu resultado',
    text: 'La explicación aparece aquí. Puedes copiarla, exportarla a PDF o compartirla.',
    position: 'top'
  }
]

let currentStep = 0

function createOnboardingOverlay() {
  const overlay = document.createElement('div')
  overlay.id = 'onboarding-overlay'
  overlay.innerHTML = `
    <div class="onboarding-backdrop"></div>
    <div class="onboarding-tooltip" id="onboarding-tooltip">
      <button class="onboarding-skip" onclick="skipOnboarding()">Saltar ✕</button>
      <div class="onboarding-step-indicator" id="onboarding-steps"></div>
      <h4 id="onboarding-title"></h4>
      <p id="onboarding-text"></p>
      <div class="onboarding-actions">
        <button id="onboarding-next" onclick="nextOnboardingStep()">Siguiente →</button>
      </div>
    </div>
  `
  document.body.appendChild(overlay)
}

function showStep(index) {
  const step = STEPS[index]
  const target = document.querySelector(step.target)
  const tooltip = document.getElementById('onboarding-tooltip')
  const stepsEl = document.getElementById('onboarding-steps')
  const nextBtn = document.getElementById('onboarding-next')

  document.getElementById('onboarding-title').textContent = step.title
  document.getElementById('onboarding-text').textContent = step.text

  // Indicadores de paso
  stepsEl.innerHTML = STEPS.map((_, i) =>
    `<span class="onboarding-dot ${i === index ? 'active' : ''}"></span>`
  ).join('')

  // Último paso
  nextBtn.textContent = index === STEPS.length - 1 ? 'Empezar →' : 'Siguiente →'

  // Posicionar tooltip junto al elemento target
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('onboarding-highlight')
    setTimeout(() => {
      const rect = target.getBoundingClientRect()
      const tooltipH = 160
      let top = rect.bottom + 12 + window.scrollY
      if (step.position === 'top') top = rect.top - tooltipH - 12 + window.scrollY
      tooltip.style.top = `${Math.max(12, top)}px`
      tooltip.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 320))}px`
    }, 300)
  }
}

function nextOnboardingStep() {
  const prev = document.querySelector(STEPS[currentStep]?.target)
  if (prev) prev.classList.remove('onboarding-highlight')

  currentStep++
  if (currentStep >= STEPS.length) {
    finishOnboarding()
  } else {
    showStep(currentStep)
  }
}

function skipOnboarding() { finishOnboarding() }

function finishOnboarding() {
  document.getElementById('onboarding-overlay')?.remove()
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

function initOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY)) return
  createOnboardingOverlay()
  setTimeout(() => showStep(0), 800)
}

document.addEventListener('DOMContentLoaded', initOnboarding)
window.nextOnboardingStep = nextOnboardingStep
window.skipOnboarding = skipOnboarding
