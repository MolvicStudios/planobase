import { callGroq } from './groq.js'

const SYSTEM_CALCULATOR = `Eres PlanoBase, un experto en construcción y reformas en España.
Tu tarea es calcular los materiales necesarios para una obra o reforma descrita por el usuario.

Responde SIEMPRE en este formato JSON exacto:
{
  "resumen": "descripción breve de la obra en 1-2 frases",
  "area_total_m2": 0,
  "coste_estimado_min": 0,
  "coste_estimado_max": 0,
  "categorias": [
    {
      "nombre": "Alicatado / Suelo",
      "materiales": [
        {
          "nombre": "Azulejo 30x60cm",
          "cantidad": "15 m²",
          "unidad": "m²",
          "precio_unitario_aprox": "15-25€/m²",
          "total_aprox": "225-375€",
          "notas": "Añadir 10% de desperdicio"
        }
      ]
    }
  ],
  "mano_obra_estimada": "800-1200€",
  "total_con_mano_obra_min": 0,
  "total_con_mano_obra_max": 0,
  "consejos": ["Consejo 1", "Consejo 2"],
  "advertencias": ["Advertencia 1 si aplica"]
}

Precios orientativos para España según calidad: económica (low cost), media (gama media), alta (premium).
No escribas nada fuera del JSON. Sin markdown, sin backticks.`

export async function calculateMaterials(description, ccaa, quality) {
  const userMsg = `Calcula los materiales necesarios para esta obra:

${description}

Comunidad Autónoma: ${ccaa || 'España (media nacional)'}
Calidad de materiales: ${quality || 'media'}

Incluye todos los materiales necesarios agrupados por categoría con precios orientativos actualizados para 2025-2026.`

  const response = await callGroq(
    [{ role: 'user', content: userMsg }],
    SYSTEM_CALCULATOR,
    false
  )

  try {
    const clean = response.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Error al procesar el cálculo. Inténtalo de nuevo.')
  }
}

export function renderCalcResult(data, container) {
  const escapeHtml = (str) => {
    const div = document.createElement('div')
    div.textContent = String(str)
    return div.innerHTML
  }

  container.innerHTML = `
    <div class="calc-summary">
      <div class="calc-stat">
        <span class="calc-stat-label">Coste materiales</span>
        <span class="calc-stat-value">${escapeHtml(data.coste_estimado_min)}€ — ${escapeHtml(data.coste_estimado_max)}€</span>
      </div>
      <div class="calc-stat">
        <span class="calc-stat-label">Con mano de obra</span>
        <span class="calc-stat-value">${escapeHtml(data.total_con_mano_obra_min)}€ — ${escapeHtml(data.total_con_mano_obra_max)}€</span>
      </div>
      ${data.area_total_m2 ? `<div class="calc-stat">
        <span class="calc-stat-label">Área total</span>
        <span class="calc-stat-value">${escapeHtml(data.area_total_m2)} m²</span>
      </div>` : ''}
    </div>

    ${(data.categorias || []).map(cat => `
      <div class="calc-category">
        <h3>${escapeHtml(cat.nombre)}</h3>
        <table class="calc-table">
          <thead>
            <tr><th>Material</th><th>Cantidad</th><th>Precio unit.</th><th>Total aprox.</th></tr>
          </thead>
          <tbody>
            ${(cat.materiales || []).map(m => `
              <tr>
                <td>${escapeHtml(m.nombre)}${m.notas ? `<br><small>${escapeHtml(m.notas)}</small>` : ''}</td>
                <td>${escapeHtml(m.cantidad)}</td>
                <td>${escapeHtml(m.precio_unitario_aprox)}</td>
                <td>${escapeHtml(m.total_aprox)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}

    ${data.consejos?.length ? `
      <div class="calc-tips">
        <h3>Consejos</h3>
        <ul>${data.consejos.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${data.advertencias?.length ? `
      <div class="calc-warnings">
        <h3>⚠️ A tener en cuenta</h3>
        <ul>${data.advertencias.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
      </div>
    ` : ''}

    <p class="calc-disclaimer">Precios orientativos para España 2025-2026. Pueden variar según zona y proveedor. Generado por PlanoBase.pro — by MolvicStudios.pro</p>
  `
}
