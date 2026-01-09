import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, Moon, Sun, Search, Plus, Heart, ChevronDown, Check, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Info, Loader2, ArrowUpDown, Clapperboard, X, Edit2, Trash2 } from 'lucide-react';
import { Category, Entry, RATING_STYLES, RATING_WEIGHTS, Rating, CATEGORY_STYLES, CATEGORY_DISPLAY_MAP } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

const PlurkPIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 21V5h6a5 5 0 0 1 0 10H8" />
  </svg>
);

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const App: React.FC = () => {
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
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  // 分類清單：新增了「其他」
  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
    { id: Category.OTHER, label: '其他', icon: Info },
  ];

  const ratingOptions = [
    { id: 'ALL', label: '所有等級' },
    { id: Rating.BIBLE, label: '聖經' },
    { id: Rating.TOP_TIER, label: '極品' },
    { id: Rating.DESTINY, label: '頂級' },
    { id: Rating.ORDINARY, label: '普通' },
    { id: Rating.MYSTERIOUS, label: '神秘' },
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      
      {/* 側邊欄：抽屜式 */}
      <Sidebar 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header 按鈕 */}
        <div className="flex justify-between items-center px-6 py-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-stone-500 rounded-full hover:bg-stone-100">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            
            {/* 標題區 */}
            <section className="text-center mb-12 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 font-bold uppercase mb-6">
                <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-800 dark:text-stone-100 mb-4">百合圖書與電影</h1>
              <p className="text-stone-500 italic font-serif">天から落ちて来る星の破片を墓標に置いて下さい</p>
              
              <div className="max-w-3xl mx-auto mt-8 bg-stone-100/50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700 text-sm">
                <div className="font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">使用指南🗡️</div>
                <p className="text-stone-500 mb-4">純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] border-t border-stone-200 pt-4">
                  <span><b>聖經</b>：某種神的旨意</span>
                  <span><b>極品</b>：印象深刻且強勁或全方位優質</span>
                  <span><b>頂級</b>：難能可貴</span>
                  <span><b>普通</b>：普通</span>
                  <span><b>神秘</b>：沒有緣分</span>
                </div>
              </div>
            </section>

            {/* --- 搜尋吧精確還原區 --- */}
            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-6 mb-8 border-b border-stone-200 dark:border-stone-800">
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 分類按鈕 */}
                <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                  {categoriesList.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border 
                        ${selectedCategory === cat.id ? 'bg-white border-stone-300 text-stone-800 shadow-sm' : 'border-transparent text-stone-500 hover:bg-stone-100'}`}
                    >
                      <cat.icon size={16} /> <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* 分隔線 */}
                <div className="h-6 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>

                {/* 等級下拉 */}
                <div className="relative" ref={ratingDropdownRef}>
                  <button 
                    onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-800"
                  >
                    <span>{ratingOptions.find(o => o.id === selectedRating)?.label}</span>
                    <ChevronDown size={14} />
                  </button>
                  {isRatingDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-stone-200 shadow-xl rounded-md z-50">
                      {ratingOptions.map(o => (
                        <button key={o.id} onClick={() => { setSelectedRating(o.id as any); setIsRatingDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50">{o.label}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 搜尋框 (復原為圖片中的方潤圓角外型) */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input 
                    type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-sm outline-none"
                  />
                </div>

                {/* 新增按鈕 (精確配色) */}
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#5e5045] text-white rounded text-sm font-bold shadow-sm hover:bg-[#4a403a]"
                >
                  <Plus size={18} /> <span>新增</span>
                </button>

                {/* 排序按鈕 */}
                <div className="relative" ref={sortDropdownRef}>
                  <button 
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-800 text-stone-800 rounded text-sm font-medium"
                  >
                    <ArrowUpDown size={14} /> <span>{sortOptions.find(o => o.id === sortBy)?.label}</span>
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-stone-200 shadow-xl rounded-md z-50">
                      {sortOptions.map(o => (
                        <button key={o.id} onClick={() => { setSortBy(o.id as any); setIsSortDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50">{o.label}</button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 作品卡片 Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center py-20 text-stone-400"><Loader2 className="animate-spin mb-2" /><span>載入中...</span></div>
            ) : processedEntries.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-stone-400"><Search size={40} className="mb-4 opacity-20" /><span>目前還沒有任何登記作品...</span></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedEntries.map((entry) => (
                  <div key={entry.id} onClick={() => setExpandedEntry(entry)}
                    className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative"
                  >
                    <div className="w-32 bg-stone-100 flex-shrink-0 relative overflow-hidden">
                       <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{CATEGORY_DISPLAY_MAP[entry.category]}</div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight line-clamp-1">{entry.title}</h3>
                        <p className="text-xs text-stone-500 mb-3">by {entry.author}</p>
                        {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2 leading-relaxed">"{entry.note}"</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags?.slice(0, 3).map(tag => <span key={tag} className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded">#{tag}</span>)}
                      </div>
                    </div>
                    {entry.plurkUrl && (
                      <div className="absolute bottom-2 right-2 text-stone-300"><PlurkPIcon size={16} /></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 頁尾統計：修正數字字體 */}
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-white">撒下的百合花</h3>
                  <p className="text-sm opacity-80 mb-10 text-stone-100">儘量記錄看過的作品，留存當下的情緒</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { v: stats.total, l: '總收藏' },
                      { v: stats.manga, l: '漫畫' },
                      { v: stats.novel, l: '小說' },
                      { v: stats.movie, l: '電影' }
                    ].map(s => (
                      <div key={s.l} className="bg-white/10 rounded-xl p-6 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center h-32">
                        <div className="text-4xl font-bold font-sans text-white mb-1 leading-none">{s.v}</div>
                        <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchEntries} entry={editingEntry} />
      
      {/* 展開視圖 (復原大卡片) */}
      {expandedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExpandedEntry(null)} />
          <div className="relative bg-[#fbf7f3] dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[900px] w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto animate-in zoom-in-95 border border-stone-200">
             <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-2 bg-white/90 dark:bg-stone-800 rounded-full z-10 shadow-md"><X size={20} /></button>
             <div className="md:w-1/2 bg-stone-100"><img src={expandedEntry.coverUrl} className="w-full h-full object-cover" /></div>
             <div className="flex-1 p-8 md:p-12">
                <h2 className="text-4xl font-serif font-bold mb-2 text-stone-800">{expandedEntry.title}</h2>
                <p className="text-xl text-stone-500 italic mb-8">by {expandedEntry.author}</p>
                <div className="text-lg text-stone-600 dark:text-stone-400 italic mb-10 border-l-4 border-stone-200 pl-6 font-serif">"{expandedEntry.note}"</div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {expandedEntry.tags?.map(t => <span key={t} className="px-4 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-xs text-stone-500 font-bold">#{t}</span>)}
                </div>
                <div className="flex gap-4">
                   {expandedEntry.plurkUrl && (
                     <a href={expandedEntry.plurkUrl} target="_blank" className="p-3 bg-stone-800 text-white rounded-xl hover:bg-black"><PlurkPIcon size={20}/></a>
                   )}
                   <button onClick={() => setExpandedEntry(null)} className="flex-1 py-3 border border-stone-200 rounded-xl font-bold text-stone-500">返回列表</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
