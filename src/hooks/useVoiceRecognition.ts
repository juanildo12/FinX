import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

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

  // Register event listeners at top level
  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results[0];
    if (result) {
      if (event.isFinal) {
        setTranscript(result.transcript);
        setIsListening(false);
      } else {
        setTranscript(result.transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech') {
      setError('No se detectó voz');
    } else {
      setError(event.message || 'Error de reconocimiento de voz');
    }
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

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
      try {
        const permission = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        
        if (!permission.granted) {
          const requestResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          if (!requestResult.granted) {
            setError('Permisos de micrófono denegados');
            return;
          }
        }

        ExpoSpeechRecognitionModule.start({
          lang: 'es-ES',
          maxAlternatives: 1,
          continuous: false,
          interimResults: true,
        });
        setIsListening(true);
      } catch (err: any) {
        setError(err.message || 'Error al iniciar reconocimiento de voz');
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (Platform.OS === 'web') {
      // Web Speech API se detiene solo
    } else {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {
        // Ignorar errores al detener
      }
    }
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
