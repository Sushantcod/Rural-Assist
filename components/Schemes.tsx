
import React, { useState, useEffect } from 'react';
import { FileText, Search, Tag, Users, CheckCircle, ExternalLink, Loader2, Landmark } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const Schemes: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await geminiService.getSchemes();
        setSchemes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Government Schemes</h1>
          <p className="text-gray-500">Match your profile with active subsidies and benefits.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search schemes..."
            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-500" />
          <p className="text-lg font-medium">Updating scheme database...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    scheme.category === 'Subsidy' ? 'bg-blue-100 text-blue-700' :
                    scheme.category === 'Insurance' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {scheme.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{scheme.name}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{scheme.description}</p>
                
                <div className="space-y-4 border-t border-gray-50 pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Eligibility
                    </h4>
                    <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Benefits
                    </h4>
                    <p className="text-sm text-gray-700">{scheme.benefits}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex gap-3">
                <button className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  Apply Now <ExternalLink className="w-4 h-4" />
                </button>
                <button className="px-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredSchemes.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500">No schemes found</h3>
          <p className="text-gray-400">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};
