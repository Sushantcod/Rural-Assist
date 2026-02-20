
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, FarmProfile, FertilizerAdvice } from "../types";

const CACHE_PREFIX = 'ruralassist_cache_';
const WEATHER_CACHE_TIME = 15 * 60 * 1000; // 15 mins
const ALERTS_CACHE_TIME = 30 * 60 * 1000; // 30 mins

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });
  }

  private getCached<T>(key: string): T | null {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp, expiry } = JSON.parse(cached);
    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  }

  private setCache(key: string, data: any, expiry: number) {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
      expiry
    }));
  }

  private getLanguageContext(lang: string) {
    const maps: Record<string, string> = {
      'hi': "Hindi (हिन्दी)",
      'pa': "Punjabi (ਪੰਜਾਬੀ)",
      'mr': "Marathi (मराठी)",
      'en': "English"
    };
    return `The user's preferred language is ${maps[lang] || 'English'}. Please respond in that language.`;
  }

  async generateSpeech(text: string, lang: string = 'en') {
    const ai = this.getAI();
    const voiceName = lang === 'hi' || lang === 'pa' || lang === 'mr' ? 'Kore' : 'Puck';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: `Say in ${lang}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  async chat(history: ChatMessage[], message: string, imageBase64?: string, lang: 'en' | 'hi' | 'pa' | 'mr' = 'en') {
    const contents: any[] = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [];
    if (message.trim()) currentParts.push({ text: message });
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{
              text: `You are Kisan-Bhai, the friendly AI Farmer advisor. ${this.getLanguageContext(lang)} 
            Help with diseases, irrigation, and crop planning.` }]
          }
        })
      });

      if (!response.ok) {
        console.error("Gemini API Error:", await response.text());
        throw new Error("API Request Failed");
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
      console.error(error);
      return "I'm sorry, I'm resting my voice right now. (Connection failed)";
    }
  }

  async analyzeDisease(imageBase64: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: `Analyze crop disease in ${lang}.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            severity: { type: Type.STRING },
            organicSteps: { type: Type.STRING },
            chemicalSteps: { type: Type.STRING }
          },
          required: ["diseaseName", "severity"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async getRealTimeWeather(location: string, lang: string = 'en') {
    // ---------------------------------------------------------
    // DEMO DATA MOCK IMPLEMENTATION AS REQUIRED
    // ---------------------------------------------------------
    return {
      current: {
        temp: 15,
        humidity: 45,
        condition: lang === 'hi' ? "साफ" : "Clear",
        wind: 8,
        uv: "Low"
      },
      forecast: [
        {
          day: lang === 'hi' ? "आज" : "Today",
          high: 34,
          low: 22,
          condition: lang === 'hi' ? "धूप" : "Sunny"
        },
        {
          day: lang === 'hi' ? "कल" : "Tomorrow",
          high: 33,
          low: 21,
          condition: lang === 'hi' ? "बादल" : "Cloudy"
        },
        {
          day: lang === 'hi' ? "बुधवार" : "Wed",
          high: 31,
          low: 20,
          condition: lang === 'hi' ? "बारिश" : "Rain"
        },
        {
          day: lang === 'hi' ? "गुरुवार" : "Thu",
          high: 32,
          low: 19,
          condition: lang === 'hi' ? "साफ" : "Clear"
        },
        {
          day: lang === 'hi' ? "शुक्रवार" : "Fri",
          high: 35,
          low: 23,
          condition: lang === 'hi' ? "धूप" : "Sunny"
        }
      ]
    };

    /* -- Real API Code Commented Out for Demo --
    const cacheKey = `weather_${location}_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current weather and 5-day forecast for ${location} in ${lang}. JSON format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.NUMBER },
                humidity: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                wind: { type: Type.NUMBER },
                uv: { type: Type.STRING }
              }
            },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  high: { type: Type.NUMBER },
                  low: { type: Type.NUMBER },
                  condition: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const text = (response.text || '{}').trim();
    const jsonStr = text.startsWith('```') ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '') : text;
    const data = JSON.parse(jsonStr);
    this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
    return data;
    */
  }

  async getProactiveAlerts(profile: FarmProfile) {
    const cacheKey = `alerts_${profile.location}_${profile.language}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 2 proactive alerts for ${profile.location} in ${profile.language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  urgency: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || '{"alerts": []}').alerts;
    this.setCache(cacheKey, data, ALERTS_CACHE_TIME);
    return data;
  }

  async getFertilizerAdvice(crop: string, soil: string, stage: string, lang: string = 'en'): Promise<FertilizerAdvice> {
    // ---------------------------------------------------------
    // DEMO DATA MOCK IMPLEMENTATION AS REQUIRED
    // ---------------------------------------------------------
    return {
      type: lang === 'hi' ? "यूरिया और डीएपी (DAP) मिश्रण" : "Urea & DAP Mixture",
      quantity: lang === 'hi' ? "50 किलो प्रति एकड़" : "50 kg per acre",
      timing: lang === 'hi' ? "सुबह या शाम के समय, मिट्टी में नमी होने पर" : "Morning or evening, when soil has proper moisture",
      applicationMethod: lang === 'hi' ? "छिड़काव विधि (Broadcasting) या जड़ के पास देना (Band Placement)" : "Broadcasting or Band Placement near roots",
      precautions: lang === 'hi' ? "समान रूप से छिड़काव करें, तेज धूप में प्रयोग से बचें, और दस्ताने पहनें।" : "Apply evenly, avoid application in strong sunlight, and wear gloves."
    };

    /* -- Real API Code Commented Out for Demo --
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Fertilizer advice for ${crop} at ${stage} in ${soil} soil in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            quantity: { type: Type.STRING },
            timing: { type: Type.STRING },
            applicationMethod: { type: Type.STRING },
            precautions: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
    */
  }

  async getIrrigationAdvice(crop: string, moisture: number, rain: number, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Irrigation for ${crop}, ${moisture}% moisture, ${rain}mm rain in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            waterAmount: { type: Type.STRING },
            duration: { type: Type.STRING },
            urgency: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async checkUpcomingRain(location: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Is heavy rain predicted in ${location} next 24h? Respond JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRainExpected: { type: Type.BOOLEAN },
            intensity: { type: Type.STRING },
            timing: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["isRainExpected"]
        }
      }
    });
    const text = (response.text || '{"isRainExpected": false}').trim();
    const jsonStr = text.startsWith('```') ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '') : text;
    return JSON.parse(jsonStr);
  }

  async getWeatherAlerts(location: string, lang: string = 'en') {
    const cacheKey = `weather_alerts_${location}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Critical weather alerts for farmers in ${location} in ${lang}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  action: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const text = (response.text || '{"alerts": []}').trim();
    const jsonStr = text.startsWith('```') ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '') : text;
    const data = JSON.parse(jsonStr).alerts;
    this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
    return data;
  }

  async analyzeGrowth(imageBase64: string, cropType: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: `Growth analysis for ${cropType} in ${lang}.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stage: { type: Type.STRING },
            health: { type: Type.STRING },
            analysis: { type: Type.STRING },
            nextSteps: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async getSchemes(lang: string = 'en') {
    // ---------------------------------------------------------
    // DEMO DATA MOCK IMPLEMENTATION AS REQUIRED
    // ---------------------------------------------------------
    return [
      {
        name: lang === 'hi' ? "पीएम किसान सम्मान निधि" : "PM Kisan Samman Nidhi",
        category: "Financial Support",
        description: lang === 'hi' ? "किसानों को प्रति वर्ष ₹6000 की वित्तीय सहायता।" : "Financial assistance of ₹6000 per year to farmers.",
        eligibility: lang === 'hi' ? "सभी छोटे और सीमांत किसान परिवार" : "All small and marginal farming families",
        benefits: "₹6000 / year"
      },
      {
        name: lang === 'hi' ? "पीएम फसल बीमा योजना" : "PM Fasal Bima Yojana",
        category: "Insurance",
        description: lang === 'hi' ? "प्राकृतिक आपदाओं से फसल के नुकसान के लिए बीमा कवर।" : "Insurance cover for crop loss due to natural calamities.",
        eligibility: lang === 'hi' ? "अधिसूचित क्षेत्र में फसल उगाने वाले किसान" : "Farmers growing crops in notified areas",
        benefits: "Crop Loss Coverage"
      },
      {
        name: lang === 'hi' ? "कृषि अवसंरचना कोष" : "Agriculture Infrastructure Fund",
        category: "Infrastructure",
        description: lang === 'hi' ? "फसल कटाई के बाद के प्रबंधन के लिए मध्यम लंबी अवधि के ऋण।" : "Medium-long term debt financing facility for post-harvest management.",
        eligibility: lang === 'hi' ? "प्राथमिक कृषि ऋण समितियां (PACS), विपणन सहकारी समितियां" : "PACS, Marketing Cooperative Societies",
        benefits: "3% Interest Subvention"
      },
      {
        name: lang === 'hi' ? "मृदा स्वास्थ्य कार्ड योजना" : "Soil Health Card Scheme",
        category: "Soil Health",
        description: lang === 'hi' ? "मिट्टी की पोषक स्थिति का आकलन करने के लिए।" : "To assess the nutrient status of the soil.",
        eligibility: lang === 'hi' ? "सभी किसान" : "All Farmers",
        benefits: "Free Soil Testing"
      }
    ];

    /* -- Real API Code Commented Out for Demo --
    const cacheKey = `schemes_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Indian agri schemes in ${lang}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  eligibility: { type: Type.STRING },
                  benefits: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const text = (response.text || '{"schemes": []}').trim();
    const jsonStr = text.startsWith('```') ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '') : text;
    const data = JSON.parse(jsonStr).schemes;
    this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 1 day
    return data;
    */
  }

  async getCropRecommendations(location: string, season: string, soil: string, lang: string = 'en') {
    // ---------------------------------------------------------
    // DEMO DATA MOCK IMPLEMENTATION AS REQUIRED
    // ---------------------------------------------------------
    return {
      crops: [
        {
          name: lang === 'hi' ? "गेहूं (एचडी 2967)" : "Wheat (HD 2967)",
          risk: lang === 'hi' ? "मध्यम" : "Medium",
          profitPotential: lang === 'hi' ? "उच्च" : "High",
          waterNeed: lang === 'hi' ? "मध्यम (3-4 सिंचाई)" : "Med (3-4 irrigations)"
        },
        {
          name: lang === 'hi' ? "चना (देसी)" : "Chickpea (Desi)",
          risk: lang === 'hi' ? "कम" : "Low",
          profitPotential: lang === 'hi' ? "मध्यम" : "Medium",
          waterNeed: lang === 'hi' ? "बहुत कम (1-2 सिंचाई)" : "Low (1-2 irrigations)"
        },
        {
          name: lang === 'hi' ? "सरसों (पूसा बोल्ड)" : "Mustard (Pusa Bold)",
          risk: lang === 'hi' ? "कम" : "Low",
          profitPotential: lang === 'hi' ? "उच्च" : "High",
          waterNeed: lang === 'hi' ? "कम (2 सिंचाई)" : "Low (2 irrigations)"
        },
        {
          name: lang === 'hi' ? "लहसुन" : "Garlic",
          risk: lang === 'hi' ? "उच्च (बाजार जोखिम)" : "High (Market Volatile)",
          profitPotential: lang === 'hi' ? "बहुत उच्च" : "Very High",
          waterNeed: lang === 'hi' ? "उच्च" : "High"
        }
      ]
    };

    /* -- Real API Code Commented Out for Demo --
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Recommend crops for ${location}, ${season}, ${soil} in ${lang}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  risk: { type: Type.STRING },
                  profitPotential: { type: Type.STRING },
                  waterNeed: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const text = (response.text || '{"crops": []}').trim();
    const jsonStr = text.startsWith('```') ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '') : text;
    return JSON.parse(jsonStr);
    */
  }

  async getWeatherAdvice(temp: number, humidity: number, condition: string, lang: string = 'en') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tips for ${temp}C, ${humidity}%, ${condition} in ${lang}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || '{"tips": []}').tips;
  }
}

export const geminiService = new GeminiService();
