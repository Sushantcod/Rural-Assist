
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Sprout, MessageCircle, Calendar, Cloud, FileText, Menu, X, BarChart3, FlaskConical, TrendingUp, UserCircle, LogOut, ChevronRight, Droplets, Store } from 'lucide-react';
import { getTranslation, Language } from '../translations';
import { useUser } from '../App';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const { user, updateUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    if (user) {
      updateUser({ ...user, language: newLang });
    }
  };

  const lang = user?.language || 'en';
  const t = getTranslation(lang);

  const navigation = [
    { name: t.dashboard, path: '/', icon: Sprout },
    { name: t.aiAssistant, path: '/chat', icon: MessageCircle },
    { name: t.irrigationAdvisor, path: '/irrigation', icon: Droplets },
    { name: t.cropPlanner, path: '/planner', icon: Calendar },
    { name: t.fertilizerAdvisor, path: '/fertilizer', icon: FlaskConical },
    { name: t.growthTracker, path: '/growth', icon: TrendingUp },
    { name: t.weather, path: '/weather', icon: Cloud },
    { name: t.financials, path: '/profit', icon: BarChart3 },
    { name: (t as any).marketIntelligence || "Market Info", path: '/market', icon: Store },
    { name: t.schemes, path: '/schemes', icon: FileText },
    { name: t.myProfile, path: '/profile', icon: UserCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active
                ? 'bg-green-600 text-white font-bold shadow-lg shadow-green-100'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
            <span className="text-sm">{item.name}</span>
            {active && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-green-100">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-900 leading-none">RuralAssist</h1>
              <p className="text-[10px] font-bold text-green-600 tracking-widest mt-1 uppercase">{t.smartFarming}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-3xl p-5 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-sm font-bold text-green-900 truncate">{user?.name || t.guest}</p>
            </div>
            <p className="text-[10px] text-green-700 font-bold uppercase tracking-tight opacity-70 mb-4">{user?.location}</p>
            <button
              onClick={onLogout}
              className="w-full bg-white text-gray-700 text-xs font-bold py-2.5 rounded-xl border border-green-100 flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between lg:px-10">
          <div className="flex items-center gap-2 lg:hidden">
            <Sprout className="w-6 h-6 text-green-600" />
            <h1 className="font-bold text-gray-900">RuralAssist</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Village Connect</h2>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle currentLang={lang} onLanguageChange={handleLanguageChange} />
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-gray-50 rounded-xl">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-black text-2xl text-gray-900">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
            <div className="p-6">
              <button onClick={onLogout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" /> Log Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
