import { AnthropicMessage } from '../types';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Send messages to Claude API and get response
 * @param messages - Array of messages in the conversation
 * @param systemPrompt - System prompt defining bot personality
 * @returns Bot's response text
 */
export const sendMessageToBot = async (
  messages: AnthropicMessage[],
  systemPrompt: string
): Promise<string> => {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract the text content from the response
    if (data.content && data.content.length > 0 && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error('Invalid response format from API');
  } catch (error) {
    console.error('Error sending message to bot:', error);
    return "I'm having trouble responding right now. Please try again.";
  }
};
