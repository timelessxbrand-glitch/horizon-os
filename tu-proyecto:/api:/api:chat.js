// Ruta: api/chat.js

export default async function handler(req, res) {
  // Configuración de permisos CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { prompt, systemInstruction } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el campo prompt.' });
    }

    // Lee la API Key guardada de forma segura en las variables de entorno de Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la variable GEMINI_API_KEY en Vercel.' });
    }

    // Petición a la API de Google Gemini 1.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error en Gemini' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta.';

    return res.status(200).json({ text: reply });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
