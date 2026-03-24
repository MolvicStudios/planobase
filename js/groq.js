const WORKER_URL = 'https://api.planobase.pro'

export async function callGroq(messages, system, vision = false) {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system, vision })
  })

  if (!response.ok) throw new Error(`Error ${response.status}`)
  const data = await response.json()

  if (data.error) throw new Error(data.error.message || 'Error en la API')
  if (!data.choices?.[0]?.message?.content) throw new Error('Respuesta vacía de la IA')

  return data.choices[0].message.content
}
