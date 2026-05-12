import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  LayoutDashboard, 
  Package, 
  Sparkles, 
  Settings, 
  ChevronRight,
  LogOut,
  User as UserIcon,
  Palette,
  Target,
  ExternalLink,
  History,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { generateProductIdeas } from './services/geminiService';
import { firestoreService } from './services/firestoreService';
import { ProductPackage } from './types';
import { NicheFinder } from './components/NicheFinder';
import { HowItWorksModal } from './components/HelpModal';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
      : 'text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : ''} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const CreateWizard = ({ onComplete, onCancel }: { onComplete: (data: any) => void, onCancel: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Printable wall art',
    style: 'Minimalist Japandi',
    theme: 'Botanical Nature',
    audience: 'Home decor enthusiasts',
    title: ''
  });

  const categories = [
    'Printable wall art',
    'Wedding invitation set',
    'Digital planner',
    'Affirmation cards',
    'Nursery / kids wall art'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const ideas = await generateProductIdeas(formData);
      const productPackage: ProductPackage = {
        userId: auth.currentUser?.uid || '',
        title: formData.title || `${formData.type} - ${formData.theme}`,
        category: formData.type,
        style: formData.style,
        theme: formData.theme,
        audience: formData.audience,
        ideas: ideas,
        status: 'draft',
        createdAt: null, // set by service
        updatedAt: null  // set by service
      };
      await firestoreService.saveProduct(productPackage);
      onComplete(productPackage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Yeni Ürün Paketi Oluştur</h2>
              <p className="text-brand-muted text-sm">Adım {step} / 3</p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <LogOut size={20} className="rotate-45" />
            </button>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <label className="block text-sm font-semibold uppercase tracking-wider text-neutral-400">Ne üretiyoruz?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, type: cat })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formData.type === cat ? 'border-brand-primary bg-brand-primary text-white' : 'border-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      <span className="font-medium">{cat}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Palette size={16} /> Görsel Tarz
                  </label>
                  <input 
                    type="text" 
                    value={formData.style}
                    onChange={e => setFormData({ ...formData, style: e.target.value })}
                    className="w-full p-4 rounded-xl bg-neutral-50 border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="e.g. Minimalist Japandi, Vintage Moody"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Sparkles size={16} /> Tema / Konu
                  </label>
                  <input 
                    type="text" 
                    value={formData.theme}
                    onChange={e => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full p-4 rounded-xl bg-neutral-50 border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="e.g. Celestial, Desert Landscape"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Target size={16} /> Hedef Kitle
                  </label>
                  <input 
                    type="text" 
                    value={formData.audience}
                    onChange={e => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full p-4 rounded-xl bg-neutral-50 border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="e.g. Çevre bilincine sahip ev sahipleri"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    Paket İsmi (Opsiyonel)
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 rounded-xl bg-neutral-50 border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="e.g. Zen Garden Collection"
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-neutral-100">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-xl font-semibold text-brand-primary hover:bg-neutral-50 transition-colors"
                disabled={loading}
              >
                Geri
              </button>
            )}
            <div className="ml-auto flex gap-3">
              {step < 3 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="px-8 py-3 rounded-xl bg-brand-primary text-white font-semibold flex items-center gap-2 hover:bg-[#4A4A30] transition-all"
                >
                  Devam Et <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-brand-accent text-white font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-brand-accent/20 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Hazırlanıyor...' : 'Üretimi Başlat 🚀'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) loadProducts();
    });
    return unsubscribe;
  }, []);

  const loadProducts = async () => {
    const prods = await firestoreService.getUserProducts();
    setProducts(prods || []);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-brand-paper"><Sparkles size={40} className="animate-pulse text-brand-primary" /></div>;

  if (!user) {
    return (
      <div className="h-screen studio-grid flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-primary text-white rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Design Your Empire
          </div>
          <h1 className="text-6xl font-black tracking-tighter">PrintForge AI</h1>
          <p className="text-brand-muted text-lg">
            Turn your digital product ideas into complete Etsy-ready listings with AI.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
          >
            Start Foraging <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-paper">
      {/* Sidebar */}
      <aside className="w-72 bg-brand-sidebar border-r border-brand-border flex flex-col p-6 space-y-8">
        <div className="flex flex-col gap-1 px-2 mb-4">
          <h1 className="text-2xl font-serif font-bold text-brand-primary leading-none">PrintForge AI</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Production Assistant</p>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Panel" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Search} 
            label="Niş Bulucu" 
            active={activeTab === 'nicheFinder'} 
            onClick={() => setActiveTab('nicheFinder')} 
          />
          <SidebarItem 
            icon={Package} 
            label="Ürünlerim" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={History} 
            label="Son Laboratuvarlar" 
            active={activeTab === 'labs'} 
            onClick={() => setActiveTab('labs')} 
          />
        </nav>

        <div className="space-y-4 pt-6 border-t border-brand-border">
          <div className="flex items-center gap-3 px-2">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
            <div className="flex-1 truncate">
              <p className="font-bold text-sm truncate text-brand-primary">{user.displayName}</p>
              <p className="text-[10px] font-bold text-brand-muted uppercase truncate leading-tight tracking-tight">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-brand-muted hover:text-brand-primary transition-colors"
          >
            <HelpCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Nasıl Çalışır?</span>
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-brand-muted hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto studio-grid">
        <header className="h-20 bg-white/40 backdrop-blur-sm border-b border-brand-border px-8 lg:px-12 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold font-serif leading-none">Forge Studio</h2>
            <p className="text-xs text-brand-muted mt-1 uppercase font-bold tracking-widest">Active Workshop • {user.displayName?.split(' ')[0]}</p>
          </div>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-brand-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={20} /> Yeni Paket
          </button>
        </header>

        <div className="p-8 lg:p-12">
        {activeTab === 'nicheFinder' && <NicheFinder />}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Tüm Ürün Paketlerim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.length === 0 ? (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-border rounded-3xl bg-white/50">
                  <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                  </div>
                  <p className="text-brand-muted font-medium">Henüz ürün oluşturulmadı.</p>
                  <button onClick={() => setIsWizardOpen(true)} className="mt-4 text-brand-primary font-bold hover:underline">İlk paketinizi oluşturun →</button>
                </div>
              ) : (
                products.map(prod => (
                  <motion.div 
                    key={prod.id}
                    whileHover={{ y: -6, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    onClick={() => setSelectedProduct(prod)}
                    className="glass-card p-8 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-black uppercase tracking-wider">
                        {prod.category?.split(' ')[0]}
                      </div>
                      <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{new Date(prod.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-brand-accent transition-colors leading-tight">{prod.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-brand-muted italic">
                      <Palette size={14} className="text-brand-accent" /> {prod.style}
                    </div>
                    <div className="mt-8 pt-6 border-t border-brand-border flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">{prod.ideas?.length || 0} Varyasyon</span>
                      <ChevronRight size={18} className="text-brand-border group-hover:text-brand-primary transition-colors" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Projects', value: products.length, icon: Package },
                { label: 'AI Prints Generated', value: products.reduce((acc, p) => acc + (p.ideas?.length || 0), 0), icon: Sparkles },
                { label: 'Etsy Listings Ready', value: 0, icon: ExternalLink },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex items-center gap-4 border-brand-border">
                  <div className="p-3 bg-brand-primary/5 rounded-xl">
                    <stat.icon size={24} className="text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{stat.label}</p>
                    <p className="text-3xl font-black text-brand-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recents */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight mb-8">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.length === 0 ? (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-border rounded-3xl bg-white/50">
                    <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-brand-muted font-medium">No products forged in your lab yet.</p>
                    <button onClick={() => setIsWizardOpen(true)} className="mt-4 text-brand-primary font-bold hover:underline">Start your first lab →</button>
                  </div>
                ) : (
                  products.slice(0, 3).map(prod => (
                    <motion.div 
                      key={prod.id}
                      whileHover={{ y: -6, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      onClick={() => setSelectedProduct(prod)}
                      className="glass-card p-8 cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-black uppercase tracking-wider">
                          {prod.category?.split(' ')[0]}
                        </div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{new Date(prod.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-brand-accent transition-colors leading-tight">{prod.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-brand-muted italic">
                        <Palette size={14} className="text-brand-accent" /> {prod.style}
                      </div>
                      <div className="mt-8 pt-6 border-t border-brand-border flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">{prod.ideas?.length || 0} Variations</span>
                        <ChevronRight size={18} className="text-brand-border group-hover:text-brand-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Product Detail View */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-5xl bg-brand-paper shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-8 lg:p-12 space-y-12">
              <header className="flex justify-between items-start bg-brand-primary text-white -m-8 lg:-m-12 p-8 lg:p-12 mb-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedProduct(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/20">
                      <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <h2 className="text-4xl font-serif font-black tracking-tight">{selectedProduct.title}</h2>
                  </div>
                  <div className="flex gap-6 text-brand-accent text-xs font-black uppercase tracking-[0.2em] pl-16">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-accent rounded-full"></div> {selectedProduct.category}</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-accent rounded-full"></div> {selectedProduct.style}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2 border border-white/30 rounded-full text-[10px] font-bold hover:bg-white/10 transition-colors uppercase tracking-widest">Save Draft</button>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-2 bg-white text-brand-primary rounded-full text-[10px] font-bold hover:bg-brand-accent transition-all uppercase tracking-widest"
                  >
                    Close Lab
                  </button>
                </div>
              </header>

              <div className="space-y-20 mt-12 bg-white/20 p-8 rounded-[40px] border border-brand-border/30">
                {selectedProduct.ideas.map((idea: any, idx: number) => (
                  <section key={idea.name} className="space-y-10 animate-in fade-in slide-in-from-bottom-10">
                    <div className="flex items-baseline gap-4 border-b border-brand-border pb-4">
                      <span className="text-6xl font-serif italic text-brand-accent opacity-30">0{idx + 1}</span>
                      <h3 className="text-3xl font-serif font-bold text-brand-primary">{idea.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left Wall: Creation Specs */}
                      <div className="space-y-8">
                        <div className="glass-card p-8 bg-[#FAF9F6] border-brand-border/40">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Product Generation Prompt</label>
                            <span className="px-2 py-0.5 bg-brand-primary/5 text-brand-primary text-[8px] font-black rounded uppercase">Quality Optimized</span>
                          </div>
                          <p className="text-sm font-mono leading-relaxed text-brand-text bg-white p-6 rounded-2xl border border-brand-border/30 shadow-inner">{idea.prompt}</p>
                          
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mt-8 mb-3">Negative Safety Guard</label>
                          <p className="text-xs font-mono text-brand-muted bg-brand-sidebar/50 p-4 rounded-xl border border-brand-border/20 italic">{idea.negativePrompt}</p>
                        </div>

                        <div className="glass-card p-8">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-6">Canva Production Kit</label>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-brand-sidebar/30 rounded-2xl border border-brand-border/20">
                              <p className="text-[10px] font-bold text-brand-muted uppercase mb-1">Canvas Ratio</p>
                              <p className="font-serif font-bold text-lg text-brand-primary">{idea.canvaSpecs.dimensions}</p>
                            </div>
                            <div className="p-4 bg-brand-sidebar/30 rounded-2xl border border-brand-border/20">
                              <p className="text-[10px] font-bold text-brand-muted uppercase mb-1">Layout Strategy</p>
                              <p className="font-serif font-bold text-lg text-brand-primary">{idea.canvaSpecs.layout}</p>
                            </div>
                          </div>
                          <div className="mt-6 p-4 border-2 border-dashed border-brand-border rounded-2xl">
                            <p className="text-[10px] font-bold text-brand-muted uppercase mb-3">Curated Typography</p>
                            <div className="flex flex-wrap gap-3">
                              {idea.canvaSpecs.fonts.map((f: string, i: number) => (
                                <span key={`${idea.name}-${f}-${i}`} className="px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold uppercase rounded-lg shadow-sm">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Wall: SEO & Etsy Kit */}
                      <div className="space-y-8">
                        <div className="glass-card p-8 bg-brand-accent/5 border-brand-accent/20">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary block mb-3">Etsy SEO Headline</label>
                          <p className="font-serif font-bold text-2xl text-brand-primary leading-tight mb-8 underline decoration-brand-accent/30 underline-offset-8 decoration-4">{idea.etsyTitle}</p>
                          
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary block mb-4">Discovery Tags (13 SEO Seeds)</label>
                          <div className="flex flex-wrap gap-2">
                            {idea.tags.map((tag: string, i: number) => (
                              <span key={`${idea.name}-${i}`} className="px-3 py-1.5 bg-brand-sidebar text-brand-primary text-[10px] font-black uppercase rounded-full border border-brand-border/40">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="glass-card p-8">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-4">Etsy Narrative Description</label>
                          <div className="text-sm text-brand-text/80 space-y-4 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-4 font-medium scrollbar-thin scrollbar-thumb-brand-border">
                            {idea.description}
                          </div>
                        </div>

                        <div className="p-6 bg-brand-accent text-white rounded-[32px] flex gap-4 shadow-xl shadow-brand-accent/20 relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                          <Sparkles className="shrink-0 mt-1" size={24} />
                          <div className="space-y-2 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest">Mockup Studio Insight</p>
                            <p className="text-sm font-serif leading-relaxed italic">{idea.mockupSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Divider with small leaf or icon */}
                    <div className="flex items-center gap-4 py-4">
                      <div className="h-px bg-brand-border/30 flex-1" />
                      <div className="w-2 h-2 bg-brand-accent rounded-full" />
                      <div className="h-px bg-brand-border/30 flex-1" />
                    </div>
                  </section>
                ))}
              </div>

              <footer className="pt-20 text-center">
                <div className="inline-flex items-center gap-2 text-brand-muted text-[10px] font-black uppercase tracking-[0.4em]">
                  Forged in the Natural Tones Lab <div className="w-1 h-1 bg-brand-accent rounded-full"></div> Build V1.1
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard */}
      {isWizardOpen && (
        <CreateWizard 
          onCancel={() => setIsWizardOpen(false)}
          onComplete={(prod) => {
            setIsWizardOpen(false);
            setProducts([prod, ...products]);
            setSelectedProduct(prod);
          }}
        />
      )}
      {isHelpModalOpen && <HowItWorksModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
}
