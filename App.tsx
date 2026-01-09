import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, Moon, Sun, Search, Plus, Heart, ChevronDown, Check, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Info, Loader2, ArrowUpDown, Clapperboard, Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import { Category, Entry, RATING_STYLES, RATING_WEIGHTS, Rating, CATEGORY_STYLES, CATEGORY_DISPLAY_MAP } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

// Custom Monochromatic "P" Icon for Plurk
const PlurkPIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 21V5h6a5 5 0 0 1 0 10H8" />
  </svg>
);

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const App: React.FC = () => {
  // --- 狀態管理 ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') === 'dark' ||
             (!window.localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedRating, setSelectedRating] = useState<Rating | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<Entry | null>(null);
  
  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // --- 資料獲取 ---
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) { html.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { html.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  // --- 統計數據邏輯 ---
  const stats = useMemo(() => ({
    total: entries.length,
    manga: entries.filter(e => e.category === Category.MANGA).length,
    novel: entries.filter(e => e.category === Category.NOVEL).length,
    movie: entries.filter(e => e.category === Category.MOVIE).length
  }), [entries]);

  const processedEntries = useMemo(() => {
    let result = [...entries].filter(entry => {
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      const matchesRating = selectedRating === 'ALL' || entry.rating === selectedRating;
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || entry.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRating && matchesSearch;
    });
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'date-asc') return (a.createdAt || 0) - (b.createdAt || 0);
      return RATING_WEIGHTS[b.rating] - RATING_WEIGHTS[a.rating];
    });
    return result;
  }, [entries, selectedCategory, selectedRating, searchTerm, sortBy]);

  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  return (
    <div className="flex min-h-screen w-full bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans overflow-x-hidden">
      
      {/* 1. 按鈕式側邊欄 (Sidebar) - 恢復為 Drawer 模式 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header 按鈕 */}
        <div className="flex justify-between items-center px-6 py-4 z-20">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-stone-800 rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-earth-200 dark:hover:bg-stone-800 text-earth-600 dark:text-earth-300 transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            
            {/* 標題與使用指南 */}
            <section className="text-center mb-16 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 font-bold uppercase mb-6">
                <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-earth-800 dark:text-earth-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星的破片を墓標に置いて下さい</p>
              
              <div className="max-w-3xl mx-auto bg-stone-100/60 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700 text-sm text-earth-600 dark:text-stone-400 leading-relaxed shadow-sm">
                <div className="flex items-center justify-center gap-2 font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">
                   <span>使用指南🗡️</span>
                </div>
                <p className="mb-4 text-center">純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] border-t border-stone-200 dark:border-stone-700 pt-4">
                  <span><b className="text-stone-800 dark:text-stone-300">聖經</b>：某種神的旨意</span>
                  <span><b className="text-stone-800 dark:text-stone-300">極品</b>：印象深刻且強勁或全方位優質</span>
                  <span><b className="text-stone-800 dark:text-stone-300">頂級</b>：難能可貴</span>
                  <span><b className="text-stone-800 dark:text-stone-300">普通</b>：普通</span>
                  <span><b className="text-stone-800 dark:text-stone-300">神秘</b>：沒有緣分</span>
                </div>
              </div>
            </section>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-4 mb-8 border-b border-earth-200 dark:border-stone-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                  {categoriesList.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 shadow-sm font-medium' : 'border-transparent text-stone-500 hover:bg-stone-100'}`}>
                      <cat.icon size={16} /> <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex-1 md:w-48 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-sm outline-none" />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5e5045] text-white rounded text-sm hover:bg-[#4a403a] shadow-sm shrink-0">
                    <Plus size={16} /> <span>新增</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 卡片 Grid 區域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processedEntries.map((entry) => (
                <div key={entry.id} onClick={() => setExpandedEntry(entry)}
                  className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative"
                >
                  <div className="w-32 bg-stone-100 flex-shrink-0 relative">
                     <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{entry.category}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight line-clamp-1">{entry.title}</h3>
                      <p className="text-xs text-stone-500 mb-2">by {entry.author}</p>
                      {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2">"{entry.note}"</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.tags?.slice(0, 3).map(tag => <span key={tag} className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded">#{tag}</span>)}
                    </div>
                  </div>
                  {entry.plurkUrl && (
                    <div className="absolute bottom-2 right-2 text-stone-300 opacity-50"><PlurkPIcon size={16} /></div>
                  )}
                </div>
              ))}
            </div>

            {/* 2. 頁尾統計區域 - 修正數字字體與佈局 */}
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-white">撒下的百合花</h3>
                  <p className="text-sm opacity-80 mb-10 text-stone-100">儘量記錄看過的作品，留存當下的情緒</p>
                  
                  {/* 統計方塊：精確復原字體樣式 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { v: stats.total, l: '總收藏' },
                      { v: stats.manga, l: '漫畫' },
                      { v: stats.novel, l: '小說' },
                      { v: stats.movie, l: '電影' }
                    ].map(s => (
                      <div key={s.l} className="bg-white/10 rounded-xl p-6 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center h-32">
                        {/* 數字：使用粗體 Sans 字體，確保字形正確 */}
                        <div className="text-4xl font-bold font-sans text-white mb-1 leading-none">{s.v}</div>
                        <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 裝飾背景 */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchEntries} entry={editingEntry} />
      
      {/* 展開作品視窗 */}
      {expandedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setExpandedEntry(null)} />
          <div className="relative bg-white dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[900px] w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
             <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-2 bg-white/90 dark:bg-stone-800 rounded-full z-10 shadow-md"><X size={20} /></button>
             <div className="md:w-1/2 bg-stone-100"><img src={expandedEntry.coverUrl} className="w-full h-full object-cover" /></div>
             <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <h2 className="text-4xl font-serif font-bold mb-2 text-stone-800 dark:text-stone-100">{expandedEntry.title}</h2>
                <p className="text-xl text-stone-500 italic mb-8 font-serif">by {expandedEntry.author}</p>
                <div className="text-lg text-stone-600 dark:text-stone-400 italic mb-10 border-l-4 border-stone-200 pl-6 font-serif">"{expandedEntry.note}"</div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {expandedEntry.tags?.map(t => <span key={t} className="px-4 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-xs text-stone-500 font-bold">#{t}</span>)}
                </div>
                <div className="flex gap-4">
                   {expandedEntry.plurkUrl && (
                     <a href={expandedEntry.plurkUrl} target="_blank" className="p-3 bg-stone-800 text-white rounded-xl hover:bg-black"><PlurkPIcon size={20}/></a>
                   )}
                   <button onClick={() => setExpandedEntry(null)} className="flex-1 py-3 border border-stone-200 rounded-xl font-bold text-stone-500">返回</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
