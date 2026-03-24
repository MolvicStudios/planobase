# PlanoBase.pro

Entiende planos de construcción con IA. Calcula materiales para tu reforma. Encuentra arquitectos en España. **Gratis.**

## Herramientas

- **Explicador de planos** — Sube una imagen, PDF o describe tu plano y la IA te lo explica en lenguaje humano
- **Calculadora de materiales** — Describe tu obra y la IA calcula materiales, cantidades y coste estimado
- **Directorio de profesionales** — Encuentra arquitectos y aparejadores en tu zona

## Stack

- Vanilla HTML5 + CSS3 + JavaScript ES Modules (sin frameworks, sin bundlers)
- Cloudflare Pages (frontend estático)
- Cloudflare Worker en `api.planobase.pro` (proxy Groq API)
- Groq API — `llama-3.3-70b-versatile` (texto) + `meta-llama/llama-4-scout-17b-16e-instruct` (visión)

## Deploy

1. Worker: `cd worker && wrangler secret put GROQ_API_KEY && wrangler deploy`
2. Frontend: Push a GitHub → conectar con Cloudflare Pages
3. Dominio: `planobase.pro`

## Autor

**MolvicStudios** · [molvicstudios.pro](https://molvicstudios.pro) · molvicstudios@outlook.com

---

© 2026 MolvicStudios · Hecho con IA en España 🇪🇸
