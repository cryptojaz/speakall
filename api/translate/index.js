import { translateText } from '../../src/claude.js';

export default async function handler(req, res) {
  console.log('API route hit:', req.method, req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  if (req.method === 'POST') {
    const { text, targetLanguage } = req.body;
    try {
      console.log('Attempting translation:', { text, targetLanguage });
      const translatedText = await translateText(text, targetLanguage);
      console.log('Translation successful:', translatedText);
      res.status(200).json({ result: translatedText });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({ message: 'API is working' });
  } else {
    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}