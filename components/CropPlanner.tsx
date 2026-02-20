
import React, { useState } from 'react';
// Added missing TrendingUp import to resolve the "Cannot find name 'TrendingUp'" error
import { Calendar, Search, MapPin, Wind, Sprout, Loader2, Sparkles, Droplets, Target, TrendingUp } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const CropPlanner: React.FC = () => {
  const [formData, setFormData] = useState({
    location: 'Punjab, India',
    season: 'Kharif',
    soil: 'Alluvial'
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.getCropRecommendations(formData.location, formData.season, formData.soil);
      setRecommendations(result.crops);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Crop Planning Engine</h1>
        <p className="text-gray-500">Find the most profitable and suitable crops for your specific conditions.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" /> Location
            </label>
            <input 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Enter your region"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" /> Season
            </label>
            <select 
              value={formData.season}
              onChange={(e) => setFormData({...formData, season: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              <option>Kharif (June-Oct)</option>
              <option>Rabi (Oct-March)</option>
              <option>Zaid (March-June)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-500" /> Soil Type
            </label>
            <select 
              value={formData.soil}
              onChange={(e) => setFormData({...formData, soil: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              <option>Alluvial</option>
              <option>Black (Regur)</option>
              <option>Red & Yellow</option>
              <option>Laterite</option>
              <option>Desert/Sandy</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Search className="w-6 h-6" /> Generate Smart Recommendations
            </>
          )}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold">Top Recommendations for You</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((crop, i) => (
              <div key={i} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 p-6 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                    <Sprout className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{crop.name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Target className="w-4 h-4" /> Risk Level
                      </span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${crop.risk === 'Low' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {crop.risk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Profit Potential
                      </span>
                      <span className="text-sm font-bold text-green-600 uppercase tracking-wider">{crop.profitPotential}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Droplets className="w-4 h-4" /> Water Need
                      </span>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{crop.waterNeed}</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-colors">
                    View Complete Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
