import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: (timeout?: number) => void;
  stopListening: () => void;
  reset: () => void;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async (timeout: number = 0) => {
    setError(null);
    setTranscript('');

    if (Platform.OS === 'web') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        setError('Reconocimiento de voz no disponible en este navegador');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
        
        if (timeout > 0) {
          setTimeout(() => {
            if (recognition && recognition.stop) {
              recognition.stop();
            }
          }, timeout * 1000);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setError(event.error === 'no-speech' ? 'No se detectó voz' : `Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setError('Reconocimiento de voz no disponible en esta plataforma');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  };
};
