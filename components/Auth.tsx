
import React, { useState } from 'react';
import { Sprout, LogIn, UserPlus, ArrowRight, Loader2, Landmark } from 'lucide-react';
import { FarmProfile } from '../types';

interface AuthProps {
  onAuth: (user: FarmProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating authentication
    setTimeout(() => {
      const newUser: FarmProfile = {
        name: formData.name || 'Farmer',
        location: 'Punjab, India',
        size: '5 Acres',
        soilType: 'Alluvial',
        primaryCrops: ['Wheat'],
        waterResources: 'Tubewell',
        language: 'en'
      };
      onAuth(newUser);
      setLoading(false);
    }, 1500);
  };

  const handleGuest = () => {
    setLoading(true);
    setTimeout(() => {
      onAuth({
        name: 'Guest Farmer',
        location: 'Not Set',
        size: 'Not Set',
        soilType: 'Not Set',
        primaryCrops: [],
        waterResources: 'Not Set',
        language: 'en',
        isGuest: true
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Sprout className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight text-center">RuralAssist AI</h1>
          <p className="text-gray-500 text-sm font-medium">Your Digital Village Companion</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="farmer@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
            <input 
              required
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {isLogin ? 'Enter Your Farm' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">OR</span></div>
        </div>

        <button 
          onClick={handleGuest}
          className="w-full bg-white border-2 border-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          <Landmark className="w-5 h-5" /> Continue as Guest
        </button>

        <p className="mt-8 text-center text-xs text-gray-400 px-4">
          By continuing, you agree to RuralAssist's <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
