"use client";

import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce';
import LanguageToggle from '@/components/LanguageToggle';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const debouncedInputText = useDebounce(inputText, 500); // Debounce input by 500ms
  const [translatedText, setTranslatedText] = useState('');
  const [idioms, setIdioms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isItalianToSpanish, setIsItalianToSpanish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedInputText) {
      handleTranslate();
    } else {
      setTranslatedText('');
      setIdioms([]);
      setDescription('');
      setError(null);
    }
  }, [debouncedInputText, isItalianToSpanish]); // Re-translate when debounced text or language direction changes

  const handleTranslate = async () => {
    if (!debouncedInputText.trim()) return;

    setLoading(true);
    setError(null);
    setTranslatedText('');
    setIdioms([]);
    setDescription('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: debouncedInputText,
          sourceLang: isItalianToSpanish ? 'it' : 'es',
          targetLang: isItalianToSpanish ? 'es' : 'it',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranslatedText(data.translation);
      setIdioms(data.idioms || []);
      setDescription(data.description || '');
    } catch (err: any) {
      console.error('Error during translation:', err);
      setError(err.message || 'Si è verificato un errore durante la traduzione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-700 backdrop-blur-sm bg-opacity-80">
        <h1 className="text-4xl font-extrabold text-center text-white tracking-tight">
          AI Traduttore
        </h1>

        <div className="flex justify-center">
          <LanguageToggle
            isItalianToSpanish={isItalianToSpanish}
            onToggle={() => setIsItalianToSpanish(!isItalianToSpanish)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <textarea
            className="w-full h-48 p-5 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-lg placeholder-gray-500 transition-all duration-200"
            placeholder={isItalianToSpanish ? "Scrivi qui il testo da tradurre in spagnolo..." : "Escribe aquí el texto a traducir al italiano..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          <div className="w-full h-48 p-5 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 overflow-y-auto text-lg leading-relaxed">
            {loading && (
              <p className="text-blue-400 animate-pulse">Traduzione in corso...</p>
            )}
            {error && (
              <p className="text-red-400">Errore: {error}</p>
            )}
            {!loading && !error && (
              <>
                {translatedText && (
                  <p className="text-white font-semibold mb-3">{translatedText}</p>
                )}
                {idioms.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-1">Modi di dire simili:</p>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      {idioms.map((idiom, index) => (
                        <li key={index}>{idiom}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {description && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-1">Descrizione:</p>
                    <p className="text-gray-300 text-sm">{description}</p>
                  </div>
                )}
                {!translatedText && !idioms.length && !description && (
                  <p className="text-gray-500">La traduzione apparirà qui.</p>
                )}
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
        >
          {loading ? 'Traduzione...' : 'Traduci'}
        </button>
      </div>
    </div>
  );
}
