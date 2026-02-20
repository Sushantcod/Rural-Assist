import React, { useState } from 'react';
import { useUser } from '../App';
import { getTranslation } from '../translations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Store, Building2, UserCircle, Bell, CalendarClock, IndianRupee } from 'lucide-react';

const mockCropData = [
    { name: 'Wheat', mandi: 2125, fpo: 2200, private: 1950, trend: '+2.5%' },
    { name: 'Rice (Paddy)', mandi: 2040, fpo: 2100, private: 1850, trend: '+1.2%' },
    { name: 'Mustard', mandi: 5450, fpo: 5600, private: 5200, trend: '-0.8%' },
    { name: 'Soybean', mandi: 4600, fpo: 4750, private: 4300, trend: '+4.1%' },
];

const mockTrendData = [
    { day: 'Mon', Mandi: 2100, FPO: 2150, Private: 1900 },
    { day: 'Tue', Mandi: 2110, FPO: 2160, Private: 1920 },
    { day: 'Wed', Mandi: 2115, FPO: 2180, Private: 1910 },
    { day: 'Thu', Mandi: 2120, FPO: 2190, Private: 1940 },
    { day: 'Fri', Mandi: 2125, FPO: 2200, Private: 1950 },
];

export const MarketVisibility: React.FC = () => {
    const { user } = useUser();
    const lang = user?.language || 'en';
    const t = getTranslation(lang);
    const [selectedCrop, setSelectedCrop] = useState('Wheat');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Farmer Price Intelligence</h2>
                    <p className="text-gray-500 font-medium">Real-time crop prices and market trends</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="bg-gray-50 border border-gray-100 text-gray-700 font-bold rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-100 transition-all cursor-pointer"
                    >
                        {mockCropData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recommendation Card */}
                <div className="lg:col-span-1 border-2 border-green-500 rounded-[2rem] p-6 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-60 group-hover:scale-125 transition-transform duration-700" />
                    <div className="flex items-center gap-3 mb-6 relative">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                            <CalendarClock className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-black text-xl text-green-900">Best Selling Window</h3>
                    </div>

                    <div className="relative">
                        <h4 className="text-3xl font-black text-gray-900 mb-2">Next 3 to 5 Days</h4>
                        <p className="text-sm font-medium text-green-800 mb-6 leading-relaxed">
                            <span className="font-bold">{selectedCrop}</span> prices are projected to peak due to high FPO demand and low local mandi arrivals.
                        </p>
                        <div className="bg-white/80 p-5 rounded-2xl border border-green-200 backdrop-blur-sm shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Recommendation</span>
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-lg">Hold & Sell Later</span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">Wait for FPO price to cross ₹2,200/qtl for maximum profit.</p>
                        </div>
                    </div>
                </div>

                {/* Price Comparison Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { title: "Mandi (APMC)", price: mockCropData.find(c => c.name === selectedCrop)?.mandi, icon: Store, color: 'blue', desc: 'Regulated Market' },
                        { title: "FPO Rates", price: mockCropData.find(c => c.name === selectedCrop)?.fpo, icon: Building2, color: 'green', desc: 'Direct Buyer' },
                        { title: "Local Buyer", price: mockCropData.find(c => c.name === selectedCrop)?.private, icon: UserCircle, color: 'red', desc: 'Middleman' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-sm">{item.title}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.desc}</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <IndianRupee className="w-5 h-5 text-gray-900 font-bold" />
                                    <span className="text-4xl font-black text-gray-900 tracking-tight">{item.price}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase block mb-3">per quintal</span>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${item.color === 'green' || item.color === 'blue' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {item.color === 'red' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                                    <span>{item.color === 'red' ? 'Below Fair Price' : 'Fair Price'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="font-black text-xl text-gray-900">Price Trends & Forecasting</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Compare historical and predicted prices</p>
                    </div>
                    <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button className="px-4 py-2 bg-white text-green-600 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">7 Days</button>
                        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">30 Days</button>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockTrendData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={15} />
                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px 16px' }}
                                itemStyle={{ fontWeight: '900', fontSize: '14px' }}
                                labelStyle={{ fontWeight: '900', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}
                                cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                            <Line name="FPO Direct" type="monotone" dataKey="FPO" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} />
                            <Line name="APMC Mandi" type="monotone" dataKey="Mandi" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
                            <Line name="Local Middlemen" type="monotone" dataKey="Private" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 6" dot={false} activeDot={{ r: 6, fill: '#ef4444' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Real-time Alerts */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-blue-900 mb-1">Mandi Alert: Low Arrivals</p>
                            <p className="text-xs text-blue-800/80 font-bold leading-relaxed">Arrivals at local Apni Mandi are low today. Prices expected to rise by 2-3% by evening auction.</p>
                        </div>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 flex gap-4 items-start hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-green-900 mb-1">FPO Direct Buy Bonus</p>
                            <p className="text-xs text-green-800/80 font-bold leading-relaxed">Kisan FPO is offering a ₹50/qtl bonus for quality produce with moisture content below 12% today.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
