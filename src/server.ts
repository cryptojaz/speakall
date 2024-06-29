import express from 'express';
import dotenv from 'dotenv';
import { translateText } from './claude';
import path from 'path';

dotenv.config();

console.log('All environment variables:', process.env);
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.post('/translate', async (req, res) => {
    const { text, targetLanguage } = req.body;
    try {
      const translatedText = await translateText(text, targetLanguage);
      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ error: 'Translation failed' });
    }
  });


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});