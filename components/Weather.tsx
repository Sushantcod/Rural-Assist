
import React, { useState, useEffect, useMemo } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, ShieldCheck, Info, Loader2, AlertTriangle, AlertCircle, Search, MapPin, Zap, ChevronRight, Sprout, TrendingUp, Activity } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { getTranslation } from '../translations';
import { useUser } from '../App';
import { FarmProfile } from '../types';

export const Weather: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cropRecs, setCropRecs] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWeatherIntelligence(user);
    }
  }, [user?.location, user?.language]);

  const displayLocation = user?.location && user.location !== 'Not Set' ? user.location : 'Punjab, India';

  const fetchWeatherIntelligence = async (prof: FarmProfile) => {
    setLoading(true);
    setLoadingAlerts(true);
    try {
      const queryLocation = prof.location && prof.location !== 'Not Set' ? prof.location : 'Punjab, India';
      const [weatherData, weatherAlerts] = await Promise.all([
        geminiService.getRealTimeWeather(queryLocation, prof.language),
        geminiService.getWeatherAlerts(queryLocation, prof.language)
      ]);

      setCurrentWeather(weatherData.current);
      setForecastData(weatherData.forecast || []);
      setAlerts(weatherAlerts || []);

      if (weatherData.current) {
        const tips = await geminiService.getWeatherAdvice(
          weatherData.current.temp,
          weatherData.current.humidity,
          weatherData.current.condition,
          prof.language
        );
        setAdvice(tips);
      } else {
        console.log("No weatherData.current in weatherData:", weatherData);
      }
    } catch (e) {
      console.error("fetchWeatherIntelligence Error:", e);
      // Fallback to basic weather data if alerts/advice API fails (e.g. 403 Forbidden on leaked key)
      try {
        const queryLocation = prof.location && prof.location !== 'Not Set' ? prof.location : 'Punjab, India';
        const fallbackWeather = await geminiService.getRealTimeWeather(queryLocation, prof.language);
        setCurrentWeather(fallbackWeather.current);
        setForecastData(fallbackWeather.forecast || []);
      } catch (fallbackError) {
        console.error("Fallback weather fetch also failed:", fallbackError);
      }
    }

    try {
      const queryLocation = prof.location && prof.location !== 'Not Set' ? prof.location : 'Punjab, India';
      const recs = await geminiService.getCropRecommendations(queryLocation, 'Current Season', prof.soilType || 'Alluvial', prof.language);
      if (recs && recs.crops) {
        setCropRecs(recs.crops);
      }
    } catch (e) {
      console.error("Crop rec error:", e);
    } finally {
      setLoading(false);
      setLoadingAlerts(false);
    }
  };

  const t = getTranslation(user?.language || 'en');

  const getWeatherIcon = (condition: string) => {
    const cond = (condition || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('shower')) return CloudRain;
    if (cond.includes('cloud')) return Cloud;
    if (cond.includes('wind')) return Wind;
    return Sun;
  };

  const severityStyles = {
    'High': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      accent: 'bg-red-500',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    },
    'Medium': {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      accent: 'bg-orange-500',
      icon: AlertCircle,
      iconColor: 'text-orange-600'
    },
    'Low': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'bg-blue-500',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const groupedAlerts = useMemo(() => {
    return alerts.reduce((acc: any, alert: any) => {
      const severity = alert.severity || 'Low';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(alert);
      return acc;
    }, {});
  }, [alerts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Weather Intelligence</h1>
          <p className="text-gray-500 font-medium">Hyper-local live insights for {displayLocation}.</p>
        </div>
        <button onClick={() => user && fetchWeatherIntelligence(user)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95">
          <Zap className="w-4 h-4 text-orange-500" /> Refresh Live Data
        </button>
      </header>

      {/* Enhanced Weather Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> {t.weatherAlerts} ({alerts.length})
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(severityStyles).reverse().map(([severity, style]: [any, any]) => {
              const severityAlerts = groupedAlerts[severity];
              if (!severityAlerts) return null;

              const Icon = style.icon;

              return (
                <div key={severity} className="space-y-3">
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${style.iconColor} ml-1`}>
                    {severity} Priority Alerts
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {severityAlerts.map((alert: any, i: number) => (
                      <div key={i} className={`${style.bg} border-2 ${style.border} p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 ${style.accent} rounded-2xl shadow-lg shadow-black/5`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/50 border ${style.border} ${style.iconColor}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <h4 className={`text-xl font-black ${style.text} mb-2`}>{alert.title}</h4>
                        <p className={`text-sm ${style.text} font-medium mb-6 opacity-80 leading-relaxed`}>{alert.description}</p>

                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40 flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full ${style.accent}`}>
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Recommended Action</p>
                            <p className={`text-sm font-black ${style.text}`}>{alert.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
          <p className="text-lg font-black">Fetching Real-Time Weather...</p>
          <p className="text-sm">Connecting to global meteorological systems via AI</p>
        </div>
      ) : currentWeather ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Current Weather */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-blue-100 font-black uppercase tracking-widest text-[10px] mb-2">
                    <MapPin className="w-3 h-3" /> {displayLocation}
                  </div>
                  <h2 className="text-7xl font-black mt-2 tracking-tighter">{currentWeather.temp}°</h2>
                  <p className="text-xl text-blue-100 font-bold mt-1">{currentWeather.condition}</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full" />
                  {React.createElement(getWeatherIcon(currentWeather.condition), { className: "w-24 h-24 text-yellow-300 drop-shadow-2xl relative z-10" })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12 border-t border-white/20 pt-8">
                <div className="flex flex-col items-center">
                  <Droplets className="w-6 h-6 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-100 opacity-80 uppercase font-black tracking-widest">{t.humidity}</span>
                  <span className="text-lg font-black">{currentWeather.humidity}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <Wind className="w-6 h-6 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-100 opacity-80 uppercase font-black tracking-widest">Wind</span>
                  <span className="text-lg font-black">{currentWeather.wind} km/h</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-6 h-6 mb-2 text-blue-200" />
                  <span className="text-[10px] text-blue-100 opacity-80 uppercase font-black tracking-widest">UV Index</span>
                  <span className="text-lg font-black">{currentWeather.uv}</span>
                </div>
              </div>
            </div>
            <Cloud className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10" />
          </div>

          {/* 5-Day Forecast */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="font-black text-xl text-gray-900 mb-8">Weekly View</h3>
            <div className="space-y-6">
              {forecastData.map((f, i) => (
                <div key={i} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-2xl transition-all cursor-default">
                  <span className="w-12 font-black text-gray-400 text-sm uppercase">{f.day}</span>
                  <div className="flex-1 flex justify-center">
                    {React.createElement(getWeatherIcon(f.condition || ''), {
                      className: `w-7 h-7 ${f.condition?.toLowerCase().includes('rain') ? 'text-blue-400' : 'text-orange-400'}`
                    })}
                  </div>
                  <div className="flex gap-4 w-24 justify-end">
                    <span className="font-black text-gray-900">{f.high}°</span>
                    <span className="font-bold text-gray-300">{f.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold">No weather data found for this location. Please check your profile.</p>
        </div>
      )}

      {/* AI Advisory Section */}
      {!loading && advice.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">AI Agricultural Advisory</h3>
                <p className="text-xs text-indigo-100 font-medium">Kisan-Bhai's real-time protection strategy</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {advice.map((tip, i) => (
                <div key={i} className="group relative p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black text-sm mb-4 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 text-sm font-bold leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crop Recommendations Section */}
      {!loading && cropRecs.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mt-8">
          <div className="bg-green-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Recommended Crops</h3>
                <p className="text-xs text-green-100 font-medium">Based on current weather and your soil profile</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {cropRecs.map((crop, i) => (
                <div key={i} className="group relative p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-black text-gray-900">{crop.name}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap ${(crop.risk || '').includes('Low') || (crop.risk || '').includes('कम') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      Risk: {crop.risk}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="p-2 bg-green-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profit Potential</p>
                        <p className="text-sm font-bold text-gray-900">{crop.profitPotential}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Droplets className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Water Need</p>
                        <p className="text-sm font-bold text-gray-900">{crop.waterNeed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
