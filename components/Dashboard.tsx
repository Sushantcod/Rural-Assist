
import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Droplets, Thermometer, TrendingUp, AlertCircle, ArrowRight, Sparkles, Loader2, FlaskConical, Sprout, Camera, Waves, Landmark, LineChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { useUser } from '../App';
import { getTranslation } from '../translations';
import { FarmProfile } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [realStats, setRealStats] = useState({
    temp: '...',
    humidity: '...',
    moisture: '42%',
    growth: '+12%'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchAlerts(user);
      fetchLiveWeatherForStats(user);
    }
  }, [user?.language, user?.location]);

  const fetchLiveWeatherForStats = async (prof: FarmProfile) => {
    try {
      const queryLocation = prof.location && prof.location !== 'Not Set' ? prof.location : 'Punjab, India';
      const weather = await geminiService.getRealTimeWeather(queryLocation, prof.language);
      if (weather.current) {
        setRealStats(prev => ({
          ...prev,
          temp: `${weather.current.temp}°C`,
          humidity: `${weather.current.humidity}%`
        }));
      }
    } catch (e: any) {
      console.error("Stats fetch failed", e);
    }
  };

  const fetchAlerts = async (prof: FarmProfile) => {
    setIsLoadingAlerts(true);
    try {
      const alerts = await geminiService.getProactiveAlerts(prof);
      setAiAlerts(alerts);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsScanning(true);
        try {
          const result = await geminiService.analyzeDisease(base64, user.language);
          navigate('/chat', { state: { initialImage: base64, initialPrompt: `I scanned my crop and found: ${result.diseaseName}. Severity is ${result.severity}. Tell me more about how to treat it.` } });
        } catch (error: any) {
          console.error(error);
          alert("Could not analyze image. Try again.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const t = getTranslation(user?.language || 'en');

  const stats = [
    { label: t.soilMoisture, value: realStats.moisture, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.airTemp, value: realStats.temp, icon: Thermometer, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t.humidity, value: realStats.humidity, icon: Cloud, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t.growthIndex, value: realStats.growth, icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center border-2 border-white shadow-xl">
            <Sprout className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{t.welcome}, {user?.name || 'Farmer'}!</h1>
            <p className="text-gray-500 font-medium">{t.kisanBhaiAnalyzing} in {user?.location || 'your area'}.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} onChange={handleScan} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center gap-2 text-sm font-bold text-white bg-green-600 px-6 py-3 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {t.scanCropHealth}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-xl shadow-gray-100 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-yellow-300 fill-current" /> {t.aiFarmerInsights}
              </h2>
              {isLoadingAlerts ? (
                <div className="flex items-center gap-3 py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-green-200" />
                  <span className="font-bold text-green-100 tracking-wide">{t.observingSkies}</span>
                </div>
              ) : aiAlerts.length > 0 ? (
                <div className="space-y-4 mt-6">
                  {aiAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 animate-in slide-in-from-left duration-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${alert.urgency === 'High' ? 'bg-red-500/20 text-red-100 border-red-400/30' : 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'}`}>
                          {alert.type} • {alert.urgency}
                        </span>
                      </div>
                      <p className="font-black text-xl mb-1">{alert.title}</p>
                      <p className="text-sm text-green-50 font-medium opacity-90">{alert.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 py-10 px-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                  <p className="text-green-50 font-bold">{t.fieldsPeaceful}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-10">
                <Link to="/chat" className="inline-flex items-center gap-3 bg-white text-green-800 px-8 py-4 rounded-2xl font-black hover:bg-green-50 transition-all shadow-2xl active:scale-95">
                  {t.talkToKisanBhai} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/irrigation" className="inline-flex items-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-2xl active:scale-95">
                  {t.irrigationAdvisor} <Waves className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl text-gray-900">{t.growthProgress}</h3>
              <Link to="/growth" className="text-green-600 text-sm font-black uppercase tracking-widest hover:underline">{t.viewFullHistory}</Link>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Sprout className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-black text-gray-900">{t.wheatPlotA}</p>
                  <p className="text-sm text-gray-500 font-medium">{t.nextStageBooting}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-black text-green-600">82%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.healthy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100">
            <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" /> {t.riskMonitor}
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-red-50 rounded-3xl border border-red-100 shadow-sm shadow-red-50">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{t.localPestWarning}</p>
                <p className="text-sm text-red-900 font-bold leading-tight">{t.locustDesc}</p>
              </div>
              <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100 shadow-sm shadow-orange-50">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{t.irrigationSchedule}</p>
                <p className="text-sm text-orange-900 font-bold leading-tight">{t.soilMoistureLowDesc}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100">
            <h3 className="font-black text-xl text-gray-900 mb-6">{t.quickActions}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/fertilizer" className="p-6 bg-indigo-50/50 rounded-3xl text-center hover:bg-indigo-100/50 transition-all border border-indigo-100/50 group">
                <FlaskConical className="w-8 h-8 text-indigo-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{t.fertilizerAdvisor || 'Fertilizer'}</span>
              </Link>
              <Link to="/irrigation" className="p-6 bg-blue-50/50 rounded-3xl text-center hover:bg-blue-100/50 transition-all border border-blue-100/50 group">
                <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{t.irrigationAdvisor || 'Irrigation'}</span>
              </Link>
              <Link to="/schemes" className="p-6 bg-emerald-50/50 rounded-3xl text-center hover:bg-emerald-100/50 transition-all border border-emerald-100/50 group">
                <Landmark className="w-8 h-8 text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{t.schemes || 'Schemes'}</span>
              </Link>
              <Link to="/market" className="p-6 bg-rose-50/50 rounded-3xl text-center hover:bg-rose-100/50 transition-all border border-rose-100/50 group">
                <LineChart className="w-8 h-8 text-rose-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{t.marketIntelligence || 'Market Info'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
