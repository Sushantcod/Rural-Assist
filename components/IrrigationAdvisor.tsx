
import React, { useState, useEffect } from 'react';
import { Droplets, Calculator, Loader2, Sparkles, CheckCircle, Info, Waves, Thermometer, CloudRain, AlertTriangle, X } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { getTranslation } from '../translations';
import { FarmProfile } from '../types';

export const IrrigationAdvisor: React.FC = () => {
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    moisture: 40,
    rain: 0
  });
  const [advice, setAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rainForecast, setRainForecast] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [showRainWarning, setShowRainWarning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed);
      setFormData(prev => ({ ...prev, crop: parsed.primaryCrops[0] || 'Wheat' }));
      fetchWeatherWarning(parsed);
    }
  }, []);

  const fetchWeatherWarning = async (prof: FarmProfile) => {
    setIsLoadingWeather(true);
    try {
      const forecast = await geminiService.checkUpcomingRain(prof.location, prof.language);
      setRainForecast(forecast);
      if (forecast.isRainExpected) {
        setShowRainWarning(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const t = getTranslation(profile?.language || 'en');

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.getIrrigationAdvice(
        formData.crop, 
        formData.moisture, 
        formData.rain,
        profile?.language || 'en'
      );
      setAdvice(result);
    } catch (e) {
      console.error(e);
      alert(t.quotaExceeded);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900">{t.irrigationAdvisor}</h1>
        <p className="text-gray-500 font-medium">Precision watering plans to save resources and boost yield.</p>
      </header>

      {/* Prominent Rain Warning Alert */}
      {showRainWarning && rainForecast && (
        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-orange-200 rounded-3xl flex items-center justify-center shrink-0">
              <CloudRain className="w-10 h-10 text-orange-600 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-black text-orange-900">{t.rainWarningTitle}</h3>
              </div>
              <p className="text-orange-800 font-bold leading-relaxed">{rainForecast.timing}: {rainForecast.recommendation || t.rainWarningDesc}</p>
            </div>
            <button 
              onClick={() => setShowRainWarning(false)}
              className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              {t.postponeAction}
            </button>
          </div>
          <button 
            onClick={() => setShowRainWarning(false)}
            className="absolute top-4 right-4 p-2 text-orange-300 hover:text-orange-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <Waves className="absolute -bottom-10 -right-10 w-48 h-48 text-orange-100 opacity-50" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.sugCrop}</label>
              <input 
                value={formData.crop}
                onChange={(e) => setFormData({...formData, crop: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.currentMoisture}</label>
                <span className="text-sm font-black text-blue-600">{formData.moisture}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={formData.moisture}
                onChange={(e) => setFormData({...formData, moisture: Number(e.target.value)})}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.recentRain}</label>
              <div className="relative">
                <CloudRain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input 
                  type="number"
                  value={formData.rain}
                  onChange={(e) => setFormData({...formData, rain: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Waves className="w-6 h-6" />}
            {t.calculateWater}
          </button>

          {isLoadingWeather && (
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> {t.checkingWeather}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {advice ? (
            <>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-300 fill-current" /> AI Water Prediction
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{t.waterNeeded}</p>
                      <p className="text-2xl font-black">{advice.waterAmount}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{t.irrigationDuration}</p>
                      <p className="text-2xl font-black">{advice.duration}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-yellow-400/20 rounded-2xl border border-yellow-400/30 flex items-center gap-3">
                    <Info className="w-5 h-5 text-yellow-300" />
                    <p className="text-sm font-bold">Urgency: {advice.urgency}</p>
                  </div>
                </div>
                <Waves className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                <h3 className="font-black text-xl text-gray-900 mb-6">{t.tipsForIrrigation}</h3>
                <div className="space-y-4">
                  {advice.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-black text-xs">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-center opacity-50">
              <Droplets className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-black text-gray-400">Waiting for Inputs</h3>
              <p className="text-sm text-gray-400">Fill the form to calculate your field's exact thirst level.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
