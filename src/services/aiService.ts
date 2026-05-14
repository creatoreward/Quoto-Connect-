import { getApiUrl } from '../lib/httpClient';

export async function processAIOperations(text: string, operation: 'analyze' | 'translate' | 'caption') {
  try {
    const response = await fetch(getApiUrl('/api/ai/process'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, operation })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'AI Server Error');
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Client AI Error:', error);
    return null;
  }
}

export async function generateThemedQuote(theme: string) {
  try {
    const response = await fetch(getApiUrl('/api/ai/generate-quote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'AI Server Error');
    }
    return await response.json();
  } catch (error) {
    console.error('Client AI Error:', error);
    return {
      text: "La technologie est mieux servie quand elle est invisible.",
      author: "Quoto AI",
      tags: ["tech", "fallback"],
      category: theme
    };
  }
}
