import { translateText } from '../../src/claude.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text, targetLanguage } = req.body;
    try {
      const translatedText = await translateText(text, targetLanguage);
      res.status(200).json({ result: translatedText });
    } catch (error) {
      res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({ message: 'API is working' });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}