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
  // --- 邏輯保持不變 ---
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) setIsRatingDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setIsSortDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processedEntries = useMemo(() => {
    let result = [...entries].filter(entry => {
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      const matchesRating = selectedRating === 'ALL' || entry.rating === selectedRating;
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRating && matchesSearch;
    });
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'date-asc') return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === 'rating-desc') return RATING_WEIGHTS[b.rating] - RATING_WEIGHTS[a.rating];
      if (sortBy === 'rating-asc') return RATING_WEIGHTS[a.rating] - RATING_WEIGHTS[b.rating];
      return 0;
    });
    return result;
  }, [entries, selectedCategory, selectedRating, searchTerm, sortBy]);

  const handleEdit = (entry: Entry) => { setEditingEntry(entry); setIsModalOpen(true); };

  const handleDelete = async (entryId: string) => {
    const password = prompt('請輸入密碼：');
    if (!password) return;
    if (!confirm('確定刪除嗎？')) return;
    try {
      const response = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entryId, password }) });
      if (response.ok) { fetchEntries(); setExpandedEntry(null); }
    } catch (err) { alert('失敗'); }
  };

  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  const ratingOptions = [
    { id: 'ALL', label: '所有等級', icon: '' },
    { id: Rating.BIBLE, label: '聖經', icon: '👑' },
    { id: Rating.TOP_TIER, label: '極品', icon: '🌹' },
    { id: Rating.DESTINY, label: '頂級', icon: '✨' },
    { id: Rating.ORDINARY, label: '普通', icon: '☕' },
    { id: Rating.MYSTERIOUS, label: '神秘', icon: '🔮' },
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
    { id: 'rating-desc', label: '心中地位 (高至低)' },
    { id: 'rating-asc', label: '心中地位 (低至高)' },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      
      {/* 側邊欄改回 Drawer 模式 */}
      <Sidebar 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - 只有按鈕 */}
        <div className="flex justify-between items-center px-6 py-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-earth-200 dark:hover:bg-stone-800 text-earth-600 dark:text-earth-300 transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            
            {/* 復原：標題區塊 */}
            <section className="text-center mb-16 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 dark:text-stone-400 font-bold uppercase mb-6">
                <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-earth-800 dark:text-earth-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星的破片を墓標に置いて下さい</p>
              
              {/* 復原：使用指南 */}
              <div className="max-w-3xl mx-auto bg-stone-100 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700 text-sm text-earth-600 dark:text-stone-400 leading-relaxed shadow-sm">
                <div className="flex items-center justify-center gap-2 font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">
                   <span>使用指南🗡️</span>
                </div>
                <p className="mb-4 text-center">純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] border-t border-stone-200 dark:border-stone-700 pt-4">
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">聖經</b>: 某種神的旨意</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">極品</b>: 印象深刻且強勁或全方位優質</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">頂級</b>: 難能可貴</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">普通</b>: 普通</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">神秘</b>: 沒有緣分</span>
                </div>
              </div>
            </section>

            {/* 復原：水平工具欄 */}
            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-4 mb-8 border-b border-earth-200 dark:border-stone-800">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar max-w-full">
                    {categoriesList.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 shadow-sm font-medium' : 'border-transparent text-stone-500 hover:bg-stone-100'}`}>
                        <cat.icon size={16} /> <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>
                  <div className="relative" ref={ratingDropdownRef}>
                    <button onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all border ${isRatingDropdownOpen || selectedRating !== 'ALL' ? 'bg-white dark:bg-stone-800 border-stone-300 text-earth-800' : 'border-transparent text-stone-500'}`}>
                      <span>{ratingOptions.find(o => o.id === selectedRating)?.label || '所有等級'}</span>
                      <ChevronDown size={14} className={isRatingDropdownOpen ? 'rotate-180' : ''} />
                    </button>
                    {isRatingDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 py-1 z-50">
                         {ratingOptions.map((o) => (
                           <button key={o.id} onClick={() => { setSelectedRating(o.id as any); setIsRatingDropdownOpen(false); }}
                             className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${selectedRating === o.id ? 'bg-blue-50 text-blue-600' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50'}`}>
                             <span className="w-5">{o.icon}</span><span>{o.label}</span>
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                  <div className="flex-1 xl:w-48 relative group min-w-[120px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 rounded text-sm outline-none" />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5e5045] dark:bg-stone-700 text-white rounded text-sm hover:bg-[#4a403a] shadow-sm">
                    <Plus size={16} /> <span>新增</span>
                  </button>
                  <div className="relative shrink-0" ref={sortDropdownRef}>
                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-transparent text-stone-500 hover:bg-stone-100">
                      <ArrowUpDown size={14} /> <span className="hidden sm:inline">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 py-1 z-50">
                         {sortOptions.map(o => (
                           <button key={o.id} onClick={() => { setSortBy(o.id as any); setIsSortDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 text-stone-700 dark:text-stone-300">{o.label}</button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 卡片顯示區域 */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400"><Loader2 size={32} className="animate-spin mb-4" /><p>同步中...</p></div>
            ) : processedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400"><Search size={32} className="mb-4 opacity-50" /><p>目前還沒有任何登記作品...</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedEntries.map((entry) => (
                  <div key={entry.id} onClick={() => setExpandedEntry(entry)}
                    className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative"
                  >
                    <div className="w-32 bg-stone-100 dark:bg-stone-900 flex-shrink-0 relative overflow-hidden">
                       <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.DEFAULT}`}>
                            {CATEGORY_DISPLAY_MAP[entry.category]}
                          </div>
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
                      <a href={entry.plurkUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="absolute bottom-2 right-2 text-earth-300 dark:text-stone-500 p-1 hover:text-earth-500 transition-colors"><PlurkPIcon size={16} /></a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 大卡片展開視圖 */}
            {expandedEntry && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setExpandedEntry(null)} />
                <div className="relative bg-[#fbf7f3] dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[1000px] w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-stone-200 dark:border-stone-800">
                  <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-3 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-800 dark:text-white shadow-lg z-30"><X size={24} /></button>
                  <div className="md:w-1/2 aspect-[3/4] md:aspect-auto bg-stone-100 dark:bg-stone-900">
                     <img src={expandedEntry.coverUrl} alt={expandedEntry.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white dark:bg-[#1c1c1a]">
                    <div className="mb-10">
                      <div className="flex gap-4 items-center mb-8">
                        <span className={`text-[11px] font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border ${CATEGORY_STYLES[expandedEntry.category] || CATEGORY_STYLES.DEFAULT}`}>
                          {CATEGORY_DISPLAY_MAP[expandedEntry.category]}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${RATING_STYLES[expandedEntry.rating]}`}>
                          {expandedEntry.rating}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-4 leading-tight">{expandedEntry.title}</h2>
                      <p className="text-xl md:text-2xl text-stone-500 mb-10 font-serif italic">by {expandedEntry.author}</p>
                      <div className="h-px w-24 bg-stone-200 dark:bg-stone-800 mb-10" />
                      {expandedEntry.note && (
                        <div className="text-stone-600 dark:text-stone-400 italic text-xl leading-relaxed mb-10 font-serif border-l-4 border-stone-200 dark:border-stone-800 pl-8">"{expandedEntry.note}"</div>
                      )}
                      <div className="flex flex-wrap gap-3 mb-12">
                        {expandedEntry.tags?.map(tag => <span key={tag} className="text-base bg-stone-100 dark:bg-stone-800/50 text-stone-500 px-5 py-2 rounded-full border border-stone-200 dark:border-stone-700">#{tag}</span>)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {expandedEntry.plurkUrl && (
                          <a href={expandedEntry.plurkUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-3 py-5 bg-stone-800 dark:bg-stone-700 text-white rounded-2xl font-bold transition-all shadow-xl text-lg hover:bg-black"><PlurkPIcon size={20} /><span>前往噗文</span></a>
                        )}
                        <button onClick={() => setExpandedEntry(null)} className="px-10 py-5 border-2 border-stone-200 rounded-2xl hover:bg-stone-50 text-stone-600 font-bold text-lg transition-colors">返回列表</button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em]">管理者工具</span>
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(expandedEntry)} className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-bold transition-all hover:bg-stone-200"><Edit2 size={16} /> 編輯</button>
                          <button onClick={() => handleDelete(expandedEntry.id)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl text-sm font-bold transition-all hover:bg-rose-100"><Trash2 size={16} /> 刪除</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 復原：頁尾設計 */}
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-xl p-8 md:p-12 text-center text-[#fbf7f3] dark:text-stone-300 relative overflow-hidden shadow-lg transition-all duration-500">
                <div className="relative z-10 flex flex-col items-center">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-white tracking-wide">撒下的百合花</h3>
                  <p className="text-sm opacity-90 leading-7 max-w-lg mx-auto mb-10 text-stone-100">儘量記錄看過的作品，留存當下的情緒</p>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingEntry(null);}} onRefresh={fetchEntries} entry={editingEntry} />
    </div>
  );
};

export default App;
