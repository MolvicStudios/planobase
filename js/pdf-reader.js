/* global pdfjsLib */

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    if (pageText.trim()) pages.push(pageText)
  }

  if (!pages.length) {
    throw new Error('No se pudo extraer texto del PDF. Prueba con la opción de imagen o describe el plano en texto.')
  }

  return pages.join('\n\n--- Página siguiente ---\n\n')
}
