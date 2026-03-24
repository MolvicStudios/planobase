/* global jspdf */

export function exportExplainerPDF() {
  const content = document.getElementById('explainer-content')
  if (!content) return

  const { jsPDF } = jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
  const pageHeight = doc.internal.pageSize.getHeight() - margin * 2

  // Header
  doc.setFontSize(18)
  doc.setTextColor(26, 58, 42) // --color-primary
  doc.text('PlanoBase.pro', margin, margin)

  doc.setFontSize(10)
  doc.setTextColor(87, 83, 78) // --text-secondary
  doc.text('Explicación de plano generada con IA', margin, margin + 8)

  doc.setDrawColor(231, 229, 228) // --border
  doc.line(margin, margin + 12, margin + pageWidth, margin + 12)

  // Body text
  const text = content.innerText
  doc.setFontSize(11)
  doc.setTextColor(28, 25, 23) // --text-primary
  const lines = doc.splitTextToSize(text, pageWidth)

  let y = margin + 20
  for (const line of lines) {
    if (y > pageHeight + margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += 5.5
  }

  // Footer on last page
  y += 10
  if (y > pageHeight + margin) {
    doc.addPage()
    y = margin
  }
  doc.setFontSize(8)
  doc.setTextColor(168, 162, 158)
  doc.text('Generado por PlanoBase.pro — by MolvicStudios.pro · Orientativo, consulta con un profesional.', margin, y)

  doc.save('planobase-explicacion.pdf')
}

export function exportCalcPDF() {
  const content = document.getElementById('calc-content')
  if (!content) return

  const { jsPDF } = jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
  const pageHeight = doc.internal.pageSize.getHeight() - margin * 2

  // Header
  doc.setFontSize(18)
  doc.setTextColor(26, 58, 42)
  doc.text('PlanoBase.pro', margin, margin)

  doc.setFontSize(10)
  doc.setTextColor(87, 83, 78)
  doc.text('Lista de materiales generada con IA', margin, margin + 8)

  doc.setDrawColor(231, 229, 228)
  doc.line(margin, margin + 12, margin + pageWidth, margin + 12)

  // Body text
  const text = content.innerText
  doc.setFontSize(10)
  doc.setTextColor(28, 25, 23)
  const lines = doc.splitTextToSize(text, pageWidth)

  let y = margin + 20
  for (const line of lines) {
    if (y > pageHeight + margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += 5
  }

  // Footer
  y += 10
  if (y > pageHeight + margin) {
    doc.addPage()
    y = margin
  }
  doc.setFontSize(8)
  doc.setTextColor(168, 162, 158)
  doc.text('Generado por PlanoBase.pro — by MolvicStudios.pro · Precios orientativos 2025-2026.', margin, y)

  doc.save('planobase-materiales.pdf')
}
