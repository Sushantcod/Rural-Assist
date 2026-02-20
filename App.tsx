
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { CropPlanner } from './components/CropPlanner';
import { ProfitSimulator } from './components/ProfitSimulator';
import { Weather } from './components/Weather';
import { Schemes } from './components/Schemes';
import { Profile } from './components/Profile';
import { FertilizerAdvisor } from './components/FertilizerAdvisor';
import { IrrigationAdvisor } from './components/IrrigationAdvisor';
import { GrowthTracker } from './components/GrowthTracker';
import { MarketVisibility } from './components/MarketVisibility';
import { Auth } from './components/Auth';
import { FarmProfile } from './types';

interface UserContextType {
  user: FarmProfile | null;
  updateUser: (userData: FarmProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ruralassist_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const updateUser = (userData: FarmProfile | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('ruralassist_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('ruralassist_user');
    }
  };

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <HashRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={<Auth onAuth={updateUser} />} />
          ) : (
            <Route path="/" element={<Layout onLogout={() => updateUser(null)} />}>
              <Route index element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="planner" element={<CropPlanner />} />
              <Route path="profit" element={<ProfitSimulator />} />
              <Route path="weather" element={<Weather />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="profile" element={<Profile />} />
              <Route path="fertilizer" element={<FertilizerAdvisor />} />
              <Route path="irrigation" element={<IrrigationAdvisor />} />
              <Route path="growth" element={<GrowthTracker />} />
              <Route path="market" element={<MarketVisibility />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </HashRouter>
    </UserContext.Provider>
  );
};

export default App;
