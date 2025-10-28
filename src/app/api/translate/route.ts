import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const GEMINI_MODEL_ID = 'gemini-2.5-flash';
const LANGUAGE_LABELS = {
  it: {
    name: 'Italian',
    code: 'it',
  },
  es: {
    name: 'Spanish',
    code: 'es',
  },
} satisfies Record<string, { name: string; code: string }>;

export async function POST(request: Request) {
  const { text, sourceLang, targetLang } = await request.json();

  if (!text || !sourceLang || !targetLang) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Prefer server-side key without the NEXT_PUBLIC prefix; fall back to legacy env name if present.
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });

  const normalizedSource = typeof sourceLang === 'string' ? sourceLang.toLowerCase() : sourceLang;
  const normalizedTarget = typeof targetLang === 'string' ? targetLang.toLowerCase() : targetLang;

  const resolveLanguageKey = (
    value: unknown,
  ): keyof typeof LANGUAGE_LABELS | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }

    return value in LANGUAGE_LABELS
      ? (value as keyof typeof LANGUAGE_LABELS)
      : undefined;
  };

  const sourceKey = resolveLanguageKey(normalizedSource);
  const targetKey = resolveLanguageKey(normalizedTarget);

  const sourceLanguageName = sourceKey ? LANGUAGE_LABELS[sourceKey].name : sourceLang;
  const targetLanguageCode = targetKey ? LANGUAGE_LABELS[targetKey].code : typeof normalizedTarget === 'string' ? normalizedTarget : '';
  const targetLanguageName = targetKey ? LANGUAGE_LABELS[targetKey].name : targetLang;

  const prompt = `You are an expert translator. Translate the provided text from ${sourceLanguageName} to ${targetLanguageName}.

Return your answer as valid JSON only (no markdown, explanations, or code fences) with exactly the following structure:
{
  "translation": "Main translated text as a single string.",
  "idioms": ["Up to two idioms or phrases conveying a similar meaning in ${targetLanguageName}. Empty array if none."],
  "description": "One short sentence describing the context or nuances of the translation written in ${targetLanguageName}."
}

Text to translate (delimited by triple quotes):
"""
${text}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    const textResponse = rawText.replace(/```json|```/gi, '').trim();

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonPayload = jsonMatch ? jsonMatch[0] : textResponse;

    const parsedResponse: {
      translation: string;
      idioms: string[];
      description: string;
    } = JSON.parse(jsonPayload);

    parsedResponse.translation =
      typeof parsedResponse.translation === 'string' && parsedResponse.translation.trim()
        ? parsedResponse.translation.trim()
        : textResponse.split('\n')[0] || textResponse;

    parsedResponse.idioms = Array.isArray(parsedResponse.idioms)
      ? parsedResponse.idioms.filter((entry): entry is string => Boolean(entry && entry.trim()))
      : [];

    const rawDescription =
      typeof parsedResponse.description === 'string' ? parsedResponse.description.trim() : '';

    if (rawDescription) {
      try {
        const descriptionPrompt = `You are a localization assistant. Rewrite the following description so it is in ${targetLanguageName} (${targetLanguageCode}) using natural, idiomatic language. Output plain text only.\n\nDescription:\n"""${rawDescription}"""`;
        const descriptionResult = await model.generateContent(descriptionPrompt);
        const descriptionText = descriptionResult.response.text().trim();
        parsedResponse.description = descriptionText || rawDescription;
      } catch (descriptionError) {
        console.error('Failed to localize description:', descriptionError);
        parsedResponse.description = rawDescription;
      }
    } else {
      parsedResponse.description = '';
    }

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to get translation from AI model' }, { status: 500 });
  }
}
