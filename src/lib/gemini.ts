import { getApiUrl } from './httpClient';

export async function generateQuote(topic: string) {
  try {
    const response = await fetch(getApiUrl('/api/ai/generate-quote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: topic })
    });

    if (!response.ok) throw new Error('AI Server Error');
    return await response.json();
  } catch (error) {
    console.error('Gemini Lib Error:', error);
    return {
      text: "L'art de la citation est l'art de la survie.",
      author: "Quoto Connect",
      category: topic,
      tags: ["inspiration"]
    };
  }
}
