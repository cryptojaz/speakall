import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image, mimeType } = req.body;

  if (!image || !mimeType) {
    return res.status(400).json({ error: 'No image data or mime type provided' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: image
                }
              },
              {
                type: "text",
                text: "Describe this image in detail. If it appears to be a well-known meme or template, mention that in your description. Focus on the main elements, colors, and any text or notable features in the image."
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
  
    res.status(200).json({ englishDescription: response.data.content[0].text });
  } catch (error) {
    res.status(500).json({ 
      error: 'Image description failed', 
      details: error.response ? error.response.data : error.message
    });
  }
}