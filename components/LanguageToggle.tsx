
import React from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { Language } from '../translations';

interface LanguageToggleProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onLanguageChange }) => {
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group">
        <Languages className="w-4 h-4 text-green-600" />
        <span className="text-sm font-bold text-gray-700">{current.native}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-colors flex items-center justify-between ${
              currentLang === lang.code 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{lang.native}</span>
            <span className="text-[10px] opacity-40">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
