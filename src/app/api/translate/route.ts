import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { text, sourceLang, targetLang } = await request.json();

  if (!text || !sourceLang || !targetLang) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Access the API key

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use the appropriate model, checking for 'flash' or similar if '2.5 flash' is a specific variant.
  // For now, using 'gemini-pro' as a general powerful model. Will adjust if 'flash' is a distinct model ID.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.\n\nAlso, provide up to two similar idioms or common phrases in the ${targetLang} language that convey a similar meaning or context, if applicable. If no direct idioms are suitable, state "No similar idioms found.".\n\nFinally, provide a brief description (1-2 sentences) of the meaning or context of the translated text/phrase in the ${targetLang} language.\n\nFormat your response as a JSON object with the following keys:\n- \"translation\": The main translated text.\n- \"idioms\": An array of up to two similar idioms (strings), or an empty array if none.\n- \"description\": A brief description of the translated text.\n\nExample for Italian to Spanish:\nInput: \"Ciao mondo!\"
Output: {\"translation\": \"Hola mundo!\", \"idioms\": [], \"description\": \"A common greeting in Spanish.\"}\n\nInput: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Attempt to parse the JSON response from the model
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (jsonError) {
      console.error("Failed to parse Gemini response as JSON:", textResponse, jsonError);
      // If parsing fails, try to extract just the translation as a fallback
      return NextResponse.json({
        translation: textResponse.split('\n')[0] || textResponse, // Take the first line as translation
        idioms: [],
        description: "Could not parse full response, showing raw translation."
      }, { status: 200 });
    }

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to get translation from AI model' }, { status: 500 });
  }
}
