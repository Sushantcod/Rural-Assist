
import React, { useState } from 'react';
import { FlaskConical, Search, Loader2, Sparkles, CheckCircle, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { FertilizerAdvice } from '../types';

export const FertilizerAdvisor: React.FC = () => {
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    soil: 'Alluvial',
    stage: 'Vegetative'
  });
  const [advice, setAdvice] = useState<FertilizerAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.getFertilizerAdvice(formData.crop, formData.soil, formData.stage);
      setAdvice(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Fertilizer Advisor</h1>
        <p className="text-gray-500">Get precise fertilizer dosages and schedules for your crops.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Crop Type</label>
            <input 
              value={formData.crop}
              onChange={(e) => setFormData({...formData, crop: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Soil Type</label>
            <select 
              value={formData.soil}
              onChange={(e) => setFormData({...formData, soil: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Alluvial</option>
              <option>Black</option>
              <option>Red</option>
              <option>Clay</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Growth Stage</label>
            <select 
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Seedling</option>
              <option>Vegetative</option>
              <option>Flowering</option>
              <option>Fruit/Grain formation</option>
              <option>Harvest Prep</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleConsult}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FlaskConical className="w-6 h-6" />}
          Get Fertilizer Plan
        </button>
      </div>

      {advice && (
        <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended Plan
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-2xl">
                <p className="text-xs font-bold text-green-600 uppercase mb-1">Fertilizer Type</p>
                <p className="font-bold text-gray-900">{advice.type}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Quantity</p>
                <p className="font-bold text-gray-900">{advice.quantity}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl">
                <p className="text-xs font-bold text-purple-600 uppercase mb-1">Timing</p>
                <p className="font-bold text-gray-900">{advice.timing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Instructions
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">Application Method</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{advice.applicationMethod}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">Safety Precautions</h4>
                <div className="flex gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <Info className="w-5 h-5 text-orange-600 shrink-0" />
                  <p className="text-sm text-orange-900 font-medium">{advice.precautions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
