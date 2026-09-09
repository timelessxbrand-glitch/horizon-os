export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Método no permitido' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ text: 'Error: GEMINI_API_KEY no está configurada en Vercel.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ text: `Error de API: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta del modelo.';
    return res.status(200).json({ text: reply });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ text: 'Error interno en el servidor.' });
  }
}
