import WebSocket from 'ws';

const GEMINI_WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;

export function createGeminiLiveSession(clientSocket, sessionContext) {
  const { question, topic, difficulty, candidateName } = sessionContext;
  
  const systemPrompt = `You are DevMeet AI, a professional technical interviewer conducting a mock coding interview.

CANDIDATE: ${candidateName}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}
QUESTION: ${question?.title || 'General coding question'}

Your behavior:
- Start by greeting the candidate warmly and introducing the question
- Ask clarifying questions naturally as a real interviewer would
- Give encouraging feedback without revealing solutions
- If candidate is stuck for >60s, offer a gentle hint
- Evaluate approach, communication, and problem-solving process
- Keep a professional but friendly tone
- Speak naturally and concisely (2-3 sentences per response max)
- React to what the candidate says verbally
- When appropriate, ask follow-up questions about time/space complexity`;

  let geminiWs = null;
  let isSetupComplete = false;
  const audioQueue = [];

  const connectToGemini = () => {
    geminiWs = new WebSocket(GEMINI_WS_URL);

    geminiWs.on('open', () => {
      // MUST send setup as FIRST message
      geminiWs.send(JSON.stringify({
        setup: {
          model: 'models/gemini-2.5-flash-native-audio-latest',
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
            }
          },
          systemInstruction: { parts: [{ text: systemPrompt }] }
        }
      }));
    });

    geminiWs.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      
      if (msg.setupComplete) {
        isSetupComplete = true;
        // Send any queued audio
        audioQueue.forEach(chunk => geminiWs.send(chunk));
        audioQueue.length = 0;
        // Trigger AI to start the interview
        geminiWs.send(JSON.stringify({
          clientContent: {
            turns: [{ role: 'user', parts: [{ text: 'Please start the interview now.' }] }],
            turnComplete: true
          }
        }));
      }

      // AI audio response — forward PCM bytes to candidate's browser
      if (msg.serverContent?.modelTurn?.parts) {
        msg.serverContent.modelTurn.parts.forEach(part => {
          if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
            const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
            clientSocket.emit('ai:audio-chunk', { 
              audio: audioBuffer.toString('base64'),
              sampleRate: 24000
            });
          }
          if (part.text) {
            // Also send text transcript for display
            clientSocket.emit('ai:transcript', { text: part.text, role: 'ai' });
          }
        });
      }

      if (msg.serverContent?.turnComplete) {
        clientSocket.emit('ai:speaking-end');
      }
    });

    geminiWs.on('error', (err) => {
      console.error('Gemini Live WS error:', err.message);
      clientSocket.emit('ai:error', { message: 'AI voice connection error' });
    });

    geminiWs.on('close', () => {
      console.log('Gemini Live WS closed');
    });
  };

  const sendAudioChunk = (base64Audio) => {
    const msg = JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Audio }]
      }
    });
    if (isSetupComplete && geminiWs?.readyState === WebSocket.OPEN) {
      geminiWs.send(msg);
    } else {
      audioQueue.push(msg);
    }
  };

  const sendTextMessage = (text) => {
    if (!isSetupComplete || geminiWs?.readyState !== WebSocket.OPEN) return;
    geminiWs.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true
      }
    }));
  };

  const disconnect = () => {
    if (geminiWs) geminiWs.close();
  };

  connectToGemini();
  return { sendAudioChunk, sendTextMessage, disconnect };
}
