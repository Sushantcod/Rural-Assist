
import React, { useState, useEffect } from 'react';
import { UserCircle, MapPin, Sprout, Droplets, Save, Loader2, LandPlot, Languages } from 'lucide-react';
import { FarmProfile } from '../types';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<FarmProfile>({
    name: 'Harman Singh',
    location: 'Amritsar, Punjab',
    size: '10 Acres',
    soilType: 'Alluvial',
    primaryCrops: ['Wheat', 'Rice'],
    waterResources: 'Tubewell',
    language: 'en'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_user');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('ruralassist_user', JSON.stringify(profile));
    setTimeout(() => {
      setIsSaving(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Farm Profile</h1>
          <p className="text-gray-500 font-medium">Customize your Digital Farmer companion.</p>
        </div>
        {message && <div className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4 shadow-lg shadow-green-50">{message}</div>}
      </header>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Farmer Name</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Language</label>
            <div className="relative">
              <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <select 
                value={profile.language}
                onChange={(e) => setProfile({...profile, language: e.target.value as any})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold appearance-none"
              >
                <option value="en">English (Global)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input 
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Farm Size</label>
            <div className="relative">
              <LandPlot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input 
                value={profile.size}
                onChange={(e) => setProfile({...profile, size: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-green-600 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
          Update Farmer Profile
        </button>
      </div>
    </div>
  );
};
