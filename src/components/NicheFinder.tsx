import { useState } from 'react';
import { Sparkles, Search, ChevronRight, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { findNicheIdeas, NicheIdea } from '../services/nicheService';
import { firestoreService } from '../services/firestoreService';

export const NicheFinder = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NicheIdea[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    type: 'Baskı duvar sanatı',
    audience: 'Ev sahipleri',
    style: 'Modern Minimalist',
    season: 'Bahar'
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const ideas = await findNicheIdeas(formData);
      setResults(ideas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (idea: NicheIdea, index: number) => {
    try {
      await firestoreService.saveNiche(idea);
      setSavedIds(prev => new Set(prev).add(index.toString()));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="glass-card p-8 border-brand-border">
        <h2 className="text-3xl font-serif font-bold text-brand-primary mb-6">Niş Laboratuvarı Bulucu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{key === 'type' ? 'Ürün Tipi' : key === 'audience' ? 'Hedef Kitle' : key === 'style' ? 'Tarz' : 'Sezon'}</label>
              <input 
                type="text" 
                value={value}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full p-4 rounded-xl bg-white border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none"
              />
            </div>
          ))}
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="mt-6 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4a4a30] transition-colors"
        >
          {loading ? 'Laboratuvar aranıyor...' : 'Nişleri Keşfet 🚀'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((idea, i) => (
            <motion.div 
              key={idea.nicheIdea} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-l-4 border-brand-accent flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-primary mb-2">{idea.nicheIdea}</h3>
                <p className="text-sm text-brand-text mb-4 italic">{idea.reasoning}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-brand-sidebar text-brand-primary text-[10px] font-bold rounded-full">{idea.productType}</span>
                  <span className="px-2 py-1 bg-brand-sidebar text-brand-primary text-[10px] font-bold rounded-full">{idea.season}</span>
                </div>
              </div>
              <button 
                onClick={() => handleSave(idea, i)}
                disabled={savedIds.has(i.toString())}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ${
                  savedIds.has(i.toString()) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-brand-primary text-white hover:bg-brand-accent'
                }`}
              >
                <Bookmark size={14} />
                {savedIds.has(i.toString()) ? 'Kaydedildi' : 'Nişi Kaydet'}
              </button>            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
