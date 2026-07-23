import { useState, useEffect, useRef } from "react";

/**
 * React hook wrapping native browser Speech Recognition API.
 * Safely handles browser stubs and triggers callbacks on final transcripts.
 */
export default function useSpeechRecognition({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (onResult) {
          onResult(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (onError) {
          onError(event.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onResult, onError]);

  const startListening = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Speech recognition already started:", e);
    }
  };

  const stopListening = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      console.warn("Speech recognition already stopped:", e);
    }
  };

  return {
    supported,
    isListening,
    startListening,
    stopListening,
  };
}
