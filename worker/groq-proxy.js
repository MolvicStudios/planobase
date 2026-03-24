// worker/groq-proxy.js
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_TEXT   = 'llama-3.3-70b-versatile'
const MODEL_VISION = 'meta-llama/llama-4-scout-17b-16e-instruct'
const ALLOWED_ORIGINS = ['https://planobase.pro', 'https://www.planobase.pro']

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin)
        ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 })

    try {
      const body = await request.json()
      const { messages, system, vision } = body

      if (!messages || !Array.isArray(messages) || !system) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const model = vision ? MODEL_VISION : MODEL_TEXT

      const groqRes = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            ...messages
          ],
          temperature: 0.4,
          max_tokens: 4096
        })
      })

      const data = await groqRes.json()
      return new Response(JSON.stringify(data), {
        status: groqRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
