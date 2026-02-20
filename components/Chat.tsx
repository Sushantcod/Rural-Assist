
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Bot, Cloud, Image as ImageIcon, Landmark, Loader2, Mic, MicOff, MousePointer2, Send, Sparkles, Sprout, Square, Thermometer, User, Volume2, Waves, Wheat, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { getTranslation } from '../translations';
import { useUser } from '../App';
import { ChatMessage, FarmProfile } from '../types';

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const Chat: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Live Mode Refs
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const welcomes: Record<string, string> = {
      'en': "Namaste! I am Kisan-Bhai, your Digital Farmer Advisor. How can I help your fields flourish today?",
      'hi': "नमस्ते! मैं किसान-भाई हूँ, आपका डिजिटल किसान सलाहकार। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
      'pa': "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ-ਭਾਈ ਹਾਂ, ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਕਿਸਾਨ ਸਲਾਹਕਾਰ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'mr': "नमस्कार! मी किसान-भाई आहे, तुमचा डिजिटल शेतकरी सल्लागार. आज मी तुमच्या शेतीमध्ये कशी मदत करू शकतो?"
    };
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomes[user.language] || welcomes.en }]);
    }
  }, [user?.language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isLiveMode]);

  const speakText = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      audioSourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const isDevanagari = /[\u0900-\u097F]/.test(text);
      const isGurmukhi = /[\u0A00-\u0A7F]/.test(text);

      let targetLang = 'en-IN';
      if (isDevanagari) targetLang = user?.language === 'mr' ? 'mr-IN' : 'hi-IN';
      else if (isGurmukhi || user?.language === 'pa') targetLang = 'pa-IN';
      else if (user?.language === 'hi') targetLang = 'hi-IN';
      else if (user?.language === 'mr') targetLang = 'mr-IN';

      // Check for native voice
      let hasNativeVoice = false;
      let targetVoice: SpeechSynthesisVoice | null = null;
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = targetLang.split('-')[0];
        targetVoice = voices.find(v => v.lang.toLowerCase().includes(langPrefix)) || null;
        if (targetVoice) hasNativeVoice = true;
      }

      // If no native voice for the specific Indian language, we fallback to Gemini TTS for better quality.
      // E.g. Windows might not have hi-IN installed by default.
      let useNative = false;
      if ('speechSynthesis' in window) {
        if (targetLang === 'en-IN' || hasNativeVoice) {
          useNative = true;
        }
      }

      if (useNative) {
        window.speechSynthesis.cancel(); // clear any previous
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        if (targetVoice) utterance.voice = targetVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          console.error("Speech Synthesis Error", e);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        const geminiLang = targetLang.split('-')[0];
        const audioData = await geminiService.generateSpeech(text, geminiLang);
        if (audioData) {
          if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          const pcmData = decode(audioData);
          const buffer = await decodeAudioData(pcmData, audioContextRef.current, 24000, 1);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => setIsSpeaking(false);
          audioSourceRef.current = source;
          source.start();
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const speakSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      speakText(selection);
    }
  };

  const startLiveChat = async () => {
    try {
      setIsLiveMode(true);
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'models/gemini-2.0-flash-exp',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
            liveSessionRef.current = { stream, scriptProcessor };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              source.onended = () => liveSourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              liveSourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => setIsLiveMode(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: user?.language === 'hi' ? 'Kore' : 'Zephyr' } } },
          systemInstruction: `You are Kisan-Bhai, the friendly AI Farmer advisor. Talking in ${user?.language}.`,
        },
      });
    } catch (err) {
      console.error(err);
      setIsLiveMode(false);
    }
  };

  const stopLiveChat = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      liveSessionRef.current.scriptProcessor.disconnect();
    }
    setIsLiveMode(false);
    nextStartTimeRef.current = 0;
  };

  const getOfflineResponse = (query: string, lang: string) => {
    const q = query.toLowerCase();

    if (q === 'hi' || q === 'hello' || q === 'namaste' || q.includes('namaste') || q.includes('hello')) {
      if (lang === 'hi') return "नमस्ते! मैं किसान-भाई हूँ। मैं आज आपकी खेती में कैसे मदद कर सकता हूँ?";
      if (lang === 'pa') return "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ-ਭਾਈ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?";
      if (lang === 'mr') return "नमस्कार! मी किसान-भाई आहे. आज मी तुमच्या शेतीमध्ये कशी मदत करू शकतो?";
      return "Hello! I am Kisan-Bhai. How can I assist you with your farming today?";
    }

    if (q.includes('thank') || q.includes('dhanyawad') || q.includes('shukriya')) {
      if (lang === 'hi') return "आपका स्वागत है! यदि आपके कोई और प्रश्न हैं, तो बेझिझक पूछें।";
      if (lang === 'pa') return "ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ! ਜੇ ਤੁਹਾਡੇ ਕੋਈ ਹੋਰ ਸਵਾਲ ਹਨ, ਤਾਂ ਬੇਝਿਜਕ ਪੁੱਛੋ।";
      if (lang === 'mr') return "तुमचे स्वागत आहे! जर तुमचे आणखी काही प्रश्न असतील तर नक्की विचारा.";
      return "You're welcome! Feel free to ask if you have any more questions.";
    }

    if (q.includes('who are you') || q.includes('tum kaun ho') || q.includes('kisan-bhai') || q.includes('kisan bhai')) {
      if (lang === 'hi') return "मैं किसान-भाई हूँ, आपका व्यक्तिगत एआई (AI) कृषि सलाहकार। मैं आपको फसल की बीमारियों, मौसम, और बाजार के बारे में जानकारी दे सकता हूँ।";
      if (lang === 'pa') return "ਮੈਂ ਕਿਸਾਨ-ਭਾਈ ਹਾਂ, ਤੁਹਾਡਾ ਨਿੱਜੀ ਏਅਾਈ (AI) ਖੇਤੀ ਸਲਾਹਕਾਰ। ਮੈਂ ਤੁਹਾਨੂੰ ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ, ਮੌਸਮ ਅਤੇ ਬਾਜ਼ਾਰ ਬਾਰੇ ਜਾਣਕਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ।";
      if (lang === 'mr') return "मी किसान-भाई आहे, तुमचा वैयक्तिक एआय (AI) कृषी सल्लागार. मी तुम्हाला पिकांचे आजार, हवामान आणि बाजारपेठेबद्दल माहिती देऊ शकतो.";
      return "I am Kisan-Bhai, your personal AI farming advisor. I can help you with crop diseases, weather forecasts, and market prices.";
    }

    if (q.includes('crop') && (q.includes('season') || q.includes('plant'))) {
      if (lang === 'hi') return "रबी के मौसम के लिए, मैं उच्च उपज के लिए गेहूं (HD 2967) या सरसों (Pusa Bold) लगाने की सलाह देता हूं।";
      if (lang === 'pa') return "ਹਾੜੀ ਦੇ ਮੌਸਮ ਲਈ, ਮੈਂ ਵੱਧ ਝਾੜ ਲਈ ਕਣਕ (HD 2967) ਜਾਂ ਸਰ੍ਹੋਂ (Pusa Bold) ਬੀਜਣ ਦੀ ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ।";
      if (lang === 'mr') return "रब्बी हंगामासाठी, मी जास्त उत्पादनासाठी गहू (HD 2967) किंवा मोहरी (Pusa Bold) लावण्याची शिफारस करतो.";
      return "For the current Rabi season, I recommend planting Wheat (HD 2967 variety) or Mustard (Pusa Bold) for optimal yields based on your soil type.";
    }

    if (q.includes('tomato') && q.includes('yellow')) {
      if (lang === 'hi') return "टमाटर के पीले पत्ते नाइट्रोजन की कमी या शुरुआती ब्लाइट का संकेत हो सकते हैं। कृपया फफूंदनाशक का छिड़काव करें या यूरिया डालें।";
      return "Yellowing tomato leaves often indicate Nitrogen deficiency or early blight. I recommend applying a balanced NPK fertilizer or a basic copper fungicide spray if spots appear.";
    }

    if (q.includes('water') || q.includes('irrigate') || q.includes('irrigation')) {
      if (lang === 'hi') return "मिट्टी की नमी वर्तमान में 42% है। अपनी गेहूं की फसल को अगले 3 दिनों तक पानी न दें क्योंकि बारिश की संभावना है।";
      return "Soil moisture is currently at 42%. Based on weather forecasts, hold off on watering your wheat crop for the next 3 days as scattered rain is expected.";
    }

    if (q.includes('scheme') || q.includes('government')) {
      if (lang === 'hi') return "आप 'पीएम किसान सम्मान निधि' (6,000 रुपये प्रति वर्ष) और 'पीएम फसल बीमा योजना' (फसल बीमा) के लिए पात्र हैं।";
      return "Based on your profile, you are eligible for the 'PM Kisan Samman Nidhi' (₹6,000/year) and the 'PM Fasal Bima Yojana' for crop insurance. Check the Schemes tab for details.";
    }

    if (q.includes('rice') || q.includes('price') || q.includes('mandi') || q.includes('rate') || q.includes('bhav')) {
      if (lang === 'hi') return "आज धान (चावल) का मंडी भाव ₹2,040/क्विंटल है, लेकिन FPO ₹2,100/क्विंटल दे रहे हैं। मैं FPO को बेचने की सलाह देता हूं।";
      if (lang === 'pa') return "ਅੱਜ ਝੋਨੇ (ਚੌਲ) ਦਾ ਮੰਡੀ ਭਾਅ ₹2,040/ਕੁਇੰਟਲ ਹੈ, ਪਰ FPO ₹2,100/ਕੁਇੰਟਲ ਦੇ ਰਹੇ ਹਨ। ਮੈਂ FPO ਨੂੰ ਵੇਚਣ ਦੀ ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ।";
      if (lang === 'mr') return "आज धान (तांदूळ) चा बाजार भाव ₹2,040/क्विंटल आहे, परंतु FPO ₹2,100/क्विंटल देत आहेत. मी FPO ला विकण्याची शिफारस करतो.";
      return "Today, the APMC Mandi price for Rice (Paddy) is ₹2,040/qtl, but Direct FPOs are offering ₹2,100/qtl. I strongly recommend selling to the FPO today.";
    }

    if (q.includes('weather') || q.includes('forecast') || q.includes('rain') || q.includes('baarish') || q.includes('mausam') || q.includes('temperature')) {
      if (lang === 'hi') return "आज 65% नमी के साथ 32°C तापमान है। अगले दो दिनों में हल्की बारिश की संभावना है।";
      if (lang === 'pa') return "ਅੱਜ 65% ਨਮੀ ਦੇ ਨਾਲ 32°C ਤਾਪਮਾਨ ਹੈ। ਅਗਲੇ ਦੋ ਦਿਨਾਂ ਵਿੱਚ ਹਲਕੀ ਬਾਰਿਸ਼ ਹੋਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।";
      if (lang === 'mr') return "आज 65% आर्द्रतेसह 32°C तापमान आहे. पुढील दोन दिवसांत हलक्या पावसाची शक्यता आहे.";
      return "Currently, it is 32°C with 65% humidity. Expect partly cloudy skies today with a 40% chance of light showers tomorrow evening.";
    }

    return null; // Signals to try real API
  };

  const handleSend = async (overrideText?: string, overrideImage?: string) => {
    const messageText = overrideText || input;
    if ((!messageText.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: messageText || "Analyze this.", image: (overrideImage || selectedImage) || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = overrideImage || selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const language = user?.language || 'en';
      const offlineReply = getOfflineResponse(messageText, language);

      if (offlineReply && !currentImage) {
        // If we have a hardcoded answer and no image (image implies analysis needed)
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { role: 'assistant', content: offlineReply }]);
        speakText(offlineReply);
      } else {
        try {
          const response = await geminiService.chat(messages, messageText, currentImage || undefined, language);
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          speakText(response);
        } catch (apiError) {
          console.error("API Error, falling back:", apiError);
          const fallbackMsg = language === 'hi'
            ? "मैं अभी ऑफ़लाइन मोड में हूँ या नेटवर्क त्रुटि है। लेकिन मैं मौसम, आज के बाज़ार भाव (जैसे- चावल), या फसल बोने की सलाह के बारे में सवालों के जवाब दे सकता हूँ।"
            : "I am currently operating in offline mode due to an API quota error. However, you can still ask me about today's market prices (like Rice), crop planting seasons, or weather forecasts!";
          setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
          speakText(fallbackMsg);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const t = getTranslation(user?.language || 'en');
  const suggestions = [
    { text: t.sugCrop, icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
    { text: t.sugTomato, icon: Wheat, color: 'text-green-600', bg: 'bg-green-50' },
    { text: t.sugWater, icon: Thermometer, color: 'text-blue-600', bg: 'bg-blue-50' },
    { text: t.sugSchemes, icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden relative">
      {isLiveMode && (
        <div className="absolute inset-0 z-50 bg-green-900/95 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
          <button onClick={stopLiveChat} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <X className="w-8 h-8" />
          </button>
          <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
            <Bot className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Talking to Kisan-Bhai</h2>
          <p className="text-green-200 font-medium mb-12">I'm listening...</p>
          <button onClick={stopLiveChat} className="bg-red-500 text-white px-10 py-4 rounded-full font-black shadow-2xl flex items-center gap-2 hover:bg-red-600 transition-all">
            <Square className="w-5 h-5 fill-current" /> End Conversation
          </button>
        </div>
      )}

      <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 lg:w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center border-2 border-white shadow-lg ${isSpeaking ? 'animate-bounce' : ''}`}>
              <Bot className="w-8 h-8 lg:w-10 h-10 text-orange-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-black text-lg lg:text-xl text-gray-900 leading-none">Kisan-Bhai</h2>
            <p className="text-[10px] lg:text-xs text-green-600 font-bold tracking-tight mt-1 uppercase">
              {isSpeaking ? 'Speaking...' : 'Digital Advisor'}
            </p>
          </div>
        </div>
        <button onClick={startLiveChat} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-100">
          <Waves className="w-4 h-4" /> Start Live Voice
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-white custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-green-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`group relative p-4 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'}`}>
                {msg.image && <img src={msg.image} alt="Scan" className="max-w-xs rounded-2xl mb-4 border-2 border-white shadow-md" />}
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => speakText(msg.content)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50">
                      <Volume2 className="w-3.5 h-3.5" /> {isSpeaking ? t.stop : t.listen}
                    </button>
                    <button onClick={speakSelection} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 border-l border-gray-200 pl-3 p-1 rounded hover:bg-blue-50">
                      <MousePointer2 className="w-3.5 h-3.5" /> {t.readSelection}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {messages.length === 1 && !isLoading && (
          <div className="space-y-6 pt-10 pb-10">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{t.tryAsking}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {suggestions.map((sug, i) => (
                <button key={i} onClick={() => handleSend(sug.text)} className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] text-left hover:border-green-300 hover:shadow-xl transition-all group">
                  <div className={`w-12 h-12 ${sug.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <sug.icon className={`w-5 h-5 ${sug.color}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 leading-snug">{sug.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-8 border-t border-gray-100 bg-white">
        {selectedImage && (
          <div className="relative inline-block mb-4 animate-in zoom-in duration-300">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-2xl border-4 border-white shadow-xl" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setSelectedImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-4 text-gray-400 hover:text-green-600 bg-gray-50 border border-gray-100 rounded-2xl transition-all">
            <ImageIcon className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.askAnything} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-green-100 focus:border-green-600 outline-none transition-all font-medium text-gray-700" />
          </div>
          <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !selectedImage)} className="p-4 bg-green-600 text-white rounded-2xl shadow-xl hover:bg-green-700 disabled:opacity-50 transition-all">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
