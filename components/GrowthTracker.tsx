
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, TrendingUp, Calendar, AlertCircle, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { GrowthRecord } from '../types';

export const GrowthTracker: React.FC = () => {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cropType, setCropType] = useState('Wheat');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_growth');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIsAnalyzing(true);
        try {
          const analysis = await geminiService.analyzeGrowth(base64, cropType);
          const newRecord: GrowthRecord = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            image: base64,
            cropType,
            stage: analysis.stage,
            analysis: `${analysis.health}. ${analysis.analysis}. Next steps: ${analysis.nextSteps}`
          };
          const updated = [newRecord, ...records];
          setRecords(updated);
          localStorage.setItem('ruralassist_growth', JSON.stringify(updated));
        } catch (error) {
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Growth Tracking</h1>
          </div>
          <p className="text-gray-500 font-medium">Document crop development and detect abnormalities early.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="relative">
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-2xl pl-5 pr-12 py-3.5 outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all shadow-sm cursor-pointer"
            >
              <option>Wheat</option>
              <option>Rice</option>
              <option>Tomato</option>
              <option>Corn</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-600/20 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                New Scan
              </>
            )}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
        </div>
      </header>

      {isAnalyzing && (
        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl text-center flex flex-col items-center animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-indigo-900">AI Growth Analysis in Progress</h3>
          <p className="text-indigo-700">Identifying growth stage and detecting anomalies...</p>
        </div>
      )}

      {records.length === 0 && !isAnalyzing ? (
        <div className="bg-white border-2 border-dashed border-gray-200 p-12 md:p-24 rounded-[2rem] text-center relative overflow-hidden group hover:border-green-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:bg-green-100 transition-all relative z-10">
            <Upload className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2 relative z-10">No Growth Scans Yet</h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto relative z-10">
            Take a picture of your crops to start tracking their daily growth, detect early signs of disease, and get AI-powered recommendations.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col md:flex-row hover:border-green-200 hover:shadow-2xl hover:shadow-green-900/5 transition-all animate-in slide-in-from-bottom-4 duration-500 group">
              <div className="md:w-80 h-64 md:h-auto overflow-hidden relative">
                <img src={record.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Growth Stage" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20">
                    {record.cropType}
                  </span>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4" />
                    {record.date}
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-black uppercase tracking-wider">
                    Stage: {record.stage}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-3">AI Analysis Report</h3>
                <p className="text-gray-600 font-medium leading-relaxed mb-6 text-lg">{record.analysis}</p>

                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Growth Trajectory</p>
                      <p className="text-xs font-medium text-green-600">On Schedule</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 hover:underline">
                    View Full Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
