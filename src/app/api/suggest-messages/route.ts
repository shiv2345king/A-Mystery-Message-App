// src/app/api/suggest-messages/route.ts
import { NextResponse } from 'next/server';

export const maxDuration = 30;

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: Request) {
  try {
    console.log('POST /api/suggest-messages called');
    console.log('GOOGLE_GENERATIVE_AI_API_KEY exists:', !!API_KEY);

    if (!API_KEY) {
      console.error('Google API key is missing');
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create exactly 3 open-ended and engaging questions separated by '||'. No numbering, no extra text, just the 3 questions separated by ||. Example format: question1||question2||question3`,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: `You are a helpful assistant that creates engaging questions. Always respond with exactly 3 questions separated by '||' with no other text or formatting.`,
            },
          ],
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    // Extract text from the response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No text generated from Gemini API');
    }

    console.log('Generated text:', generatedText);

    // Return as plain text response
    return new Response(generatedText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Suggest messages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);

    // Fallback to mock data if API fails
    console.log('Using mock data as fallback');
    const mockMessages =
      "What's your favorite hobby?||If you could travel anywhere, where would you go?||What's the best advice you've ever received?";

    return new Response(mockMessages, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}