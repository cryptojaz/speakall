import Anthropic from "@anthropic-ai/sdk";

let anthropic: Anthropic;

function initializeAnthropicClient() {
  const apiKey = process.env.CLAUDE_API_KEY;
  console.log('Initializing Anthropic client with API key:', apiKey);
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not set in environment variables');
  }
  anthropic = new Anthropic({ apiKey });
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!anthropic) {
    initializeAnthropicClient();
  }

  try {
    console.log('Sending request to Anthropic API...');
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      temperature: 0,
      system: "You are a professional translator. Translate the given text accurately to the specified language.",
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${targetLanguage}: "${text}"`
        }
      ]
    });

    console.log('Received response from Anthropic API:', response);

    const translatedText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { text: string }).text)
      .join(' ');

    return translatedText;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}