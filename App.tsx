
import React, { useState, useEffect, useMemo, useRef } from 'react';
// Added X to the import list below
import { Menu, Moon, Sun, Search, Plus, Heart, ChevronDown, Check, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Info, Loader2, ArrowUpDown, Clapperboard, Sparkles, X } from 'lucide-react';
import { Category, Entry, RATING_STYLES, RATING_WEIGHTS, Rating, CATEGORY_STYLES } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const App: React.FC = () => {
  // --- State Management ---
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
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // --- Theme ---
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) {
        setIsRatingDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Filter & Sort Logic ---
  const processedEntries = useMemo(() => {
    let result = entries.filter(entry => {
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      const matchesRating = selectedRating === 'ALL' || entry.rating === selectedRating;
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      
      return matchesCategory && matchesRating && matchesSearch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.createdAt - a.createdAt;
      if (sortBy === 'date-asc') return a.createdAt - b.createdAt;
      if (sortBy === 'rating-desc') return RATING_WEIGHTS[b.rating] - RATING_WEIGHTS[a.rating];
      if (sortBy === 'rating-asc') return RATING_WEIGHTS[a.rating] - RATING_WEIGHTS[b.rating];
      return 0;
    });

    return result;
  }, [entries, selectedCategory, selectedRating, searchTerm, sortBy]);

  // --- Stats Calculation ---
  const stats = useMemo(() => ({
    total: entries.length,
    manga: entries.filter(e => e.category === Category.MANGA).length,
    novel: entries.filter(e => e.category === Category.NOVEL).length,
    movie: entries.filter(e => e.category === Category.MOVIE).length
  }), [entries]);

  // Updated Order: Removed '甲片 ver.' from standard toolbar per request
  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
    { id: Category.OTHER, label: '其他', icon: Info }, // 2. 這裡新增了「其他」分類
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
    { id: 'rating-desc', label: '心中地位 (高至低)' },
    { id: 'rating-asc', label: '心中地位 (低至高)' },
  ];

  const ratingOptions = [
    { id: 'ALL', label: '所有等級', icon: '' },
    { id: Rating.BIBLE, label: '聖經', icon: '👑' },
    { id: Rating.TOP_TIER, label: '極品', icon: '🌹' },
    { id: Rating.DESTINY, label: '頂級', icon: '✨' },
    { id: Rating.ORDINARY, label: '普通', icon: '☕' },
    { id: Rating.MYSTERIOUS, label: '神秘', icon: '🔮' },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      
      <Sidebar 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
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
            
            <section className="text-center mb-16 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 dark:text-stone-400 font-bold uppercase mb-6">
                <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-earth-800 dark:text-earth-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星の破片を墓標に置いて下さい</p>
              
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

            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-4 mb-8 border-b border-earth-200 dark:border-stone-800">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar max-w-full">
                    {categoriesList.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      
                      return (
                        <button 
                          key={cat.id} onClick={() => setSelectedCategory(cat.id as Category | 'ALL')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border 
                            ${isSelected 
                              ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm font-medium'
                              : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }
                          `}
                        >
                          <Icon size={16} strokeWidth={isSelected ? 2 : 1.5} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                    {/* Special Active state for GL_VER if selected via Sidebar */}
                    {selectedCategory === Category.GL_VER && (
                      <button 
                        onClick={() => setSelectedCategory('ALL')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border bg-[#ebe3d5] dark:bg-stone-700 border-[#d4c5a8] dark:border-stone-600 text-[#8c7b6d] dark:text-earth-200 shadow-sm font-medium"
                      >
                        <Sparkles size={16} />
                        <span>甲片 ver.</span>
                        <X size={12} className="ml-1" />
                      </button>
                    )}
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>
                  
                  {/* Rating Dropdown */}
                  <div className="relative" ref={ratingDropdownRef}>
                    <button onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${isRatingDropdownOpen || selectedRating !== 'ALL' ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm' : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                      <span>{ratingOptions.find(o => o.id === selectedRating)?.label || '所有等級'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isRatingDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRatingDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                         {ratingOptions.map((option) => (
                           <button key={option.id} onClick={() => { setSelectedRating(option.id as Rating | 'ALL'); setIsRatingDropdownOpen(false); }}
                             className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${selectedRating === option.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                           >
                             <span className="w-5 text-center text-base">{option.icon}</span>
                             <span className="flex-1 font-medium">{option.label}</span>
                             {selectedRating === option.id && <Check size={14} />}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Group: Search -> Add -> Sort */}
                <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0 flex-nowrap">
                  <div className="flex-1 xl:w-48 relative group min-w-[120px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={14} />
                    <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-sm outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors placeholder:text-stone-300" />
                  </div>
                  
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5e5045] dark:bg-stone-700 text-white rounded text-sm hover:bg-[#4a403a] dark:hover:bg-stone-600 transition-colors whitespace-nowrap shadow-sm shrink-0">
                    <Plus size={16} /> <span>新增</span>
                  </button>

                  <div className="relative shrink-0" ref={sortDropdownRef}>
                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${isSortDropdownOpen ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm' : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                      <ArrowUpDown size={14} />
                      <span className="hidden sm:inline">{sortOptions.find(o => o.id === sortBy)?.label || '排序'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                         {sortOptions.map((option) => (
                           <button key={option.id} onClick={() => { setSortBy(option.id as SortOption); setIsSortDropdownOpen(false); }}
                             className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${sortBy === option.id ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white font-medium' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                           >
                             <span className="flex-1">{option.label}</span>
                             {sortBy === option.id && <Check size={14} />}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p>正在從資料庫同步...</p>
              </div>
            ) : processedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400">
                <Search size={32} className="mb-4 opacity-50" />
                <p>目前還沒有任何登記作品...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedEntries.map((entry) => (
                  <div key={entry.id} className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-shadow group h-48 relative">
                    <div className="w-32 bg-stone-100 dark:bg-stone-900 flex-shrink-0 relative overflow-hidden">
                       <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.DEFAULT}`}>
                            {entry.category}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight">{entry.title}</h3>
                        <p className="text-xs text-stone-500 mb-3">by {entry.author}</p>
                        {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2 leading-relaxed">"{entry.note}"</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags?.map(tag => <span key={tag} className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded">#{tag}</span>)}
                      </div>
                    </div>
                    
                    {/* Plurk Link */}
                    {entry.plurkUrl && (
                      <a 
                        href={entry.plurkUrl} target="_blank" rel="noopener noreferrer" 
                        className="absolute bottom-2 right-2 text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="查看噗文"
                      >
                        🍖
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer Stats - Updated to Chestnut color #8b5e3c */}
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-xl p-8 md:p-12 text-center text-[#fbf7f3] dark:text-stone-300 relative overflow-hidden shadow-lg transition-all duration-500">
                <div className="relative z-10 flex flex-col items-center">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-white tracking-wide">撒下的百合花</h3>
                  <p className="text-sm opacity-90 leading-7 max-w-lg mx-auto mb-10 text-stone-100">
                    儘量記錄看過的作品，留存當下的情緒
                  </p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                     {[
                       { v: stats.total, l: '總收藏' },
                       { v: stats.manga, l: '漫畫' },
                       { v: stats.novel, l: '小說' },
                       { v: stats.movie, l: '電影' }
                     ].map(s => (
                       <div key={s.l} className="bg-white/10 dark:bg-stone-900/20 rounded-lg p-4 backdrop-blur-sm flex flex-col items-center justify-center h-24 border border-white/10 hover:bg-white/20 transition-colors group/stat">
                          <span className="text-3xl font-bold text-white mb-1 group-hover/stat:scale-110 transition-transform">{s.v}</span>
                          <span className="text-xs text-stone-100 tracking-wider font-medium opacity-80">
                            {s.l}
                          </span>
                       </div>
                     ))}
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchEntries} />
    </div>
  );
};

export default App;
