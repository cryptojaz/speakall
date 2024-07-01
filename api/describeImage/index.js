import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image, mimeType } = req.body;

    if (!image || !mimeType) {
        console.error('No image data or mime type provided');
        return res.status(400).json({ error: 'No image data or mime type provided' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        console.log('Calling Anthropic API...');
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
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
                                text: "Describe this image in detail."
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

        console.log('Image description successful');
        res.status(200).json({ englishDescription: response.data.content[0].text });
    } catch (error) {
        console.error('Error in image description:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            error: 'Image description failed', 
            details: error.response ? error.response.data : error.message 
        });
    }
}