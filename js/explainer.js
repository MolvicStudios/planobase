import { callGroq } from './groq.js'

const SYSTEM_EXPLAINER = `Eres PlanoBase, un experto en arquitectura y construcción que explica planos y documentos técnicos en lenguaje humano claro.
Tu tarea es analizar el plano o descripción proporcionada y explicar:
1. Qué tipo de plano es y qué representa
2. Las dimensiones y espacios principales
3. Qué significa cada elemento técnico en lenguaje cotidiano
4. Aspectos importantes a tener en cuenta (normativa, restricciones, recomendaciones)
5. Preguntas frecuentes que suele tener alguien que ve este tipo de plano por primera vez

Responde siempre en español. Sé claro, didáctico y usa comparaciones cotidianas.
Formatea la respuesta con secciones claras en Markdown.
Al final incluye: "*Análisis generado por PlanoBase.pro — by MolvicStudios.pro. Orientativo, consulta con un profesional.*"`

export async function explainFromText(text, planType, question) {
  const userMsg = `Analiza y explica este plano/descripción:

${text}

${planType ? `Tipo de plano: ${planType}` : ''}
${question ? `Pregunta específica: ${question}` : ''}`

  return await callGroq(
    [{ role: 'user', content: userMsg }],
    SYSTEM_EXPLAINER,
    false
  )
}

export async function explainFromImage(base64Image, mimeType, planType, question) {
  const userContent = [
    {
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64Image}` }
    },
    {
      type: 'text',
      text: `Analiza y explica este plano de construcción en detalle.
${planType ? `Tipo de plano: ${planType}` : ''}
${question ? `Pregunta específica: ${question}` : ''}
Explica qué representa, las dimensiones que puedas identificar, qué significa cada elemento y qué debe saber alguien sin conocimientos técnicos.`
    }
  ]

  return await callGroq(
    [{ role: 'user', content: userContent }],
    SYSTEM_EXPLAINER,
    true
  )
}

export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
