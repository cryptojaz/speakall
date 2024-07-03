import Anthropic from "@anthropic-ai/sdk";

let anthropic;

function initializeAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  anthropic = new Anthropic({ apiKey });
}

export async function translateText(text, targetLanguage) {
  if (!anthropic) {
    initializeAnthropicClient();
  }
  try {
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
    
    const translatedText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join(' ').trim();
    
    if (!translatedText) {
      throw new Error("Received empty translation response.");
    }
    
    return translatedText;
  } catch (error) {
    throw new Error(`Translation API error: ${error.message}`);
  }
}