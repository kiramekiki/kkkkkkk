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
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || entry.author.toLowerCase().includes(searchTerm.toLowerCase());
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
    { id: 'ALL', label: '所有等級', emoji: '' },
    { id: Rating.BIBLE, label: '聖經', emoji: '👑' },
    { id: Rating.TOP_TIER, label: '極品', emoji: '🌹' },
    { id: Rating.DESTINY, label: '頂級', emoji: '✨' },
    { id: Rating.ORDINARY, label: '普通', emoji: '☕' },
    { id: Rating.MYSTERIOUS, label: '神秘', emoji: '🔮' },
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
    { id: 'rating-desc', label: '由高到低' },
    { id: 'rating-asc', label: '由低到高' },
  ];

  const handleEdit = (entry: Entry) => { setEditingEntry(entry); setIsModalOpen(true); };

  const handleDelete = async (entryId: string) => {
    const password = prompt('請輸入管理員密碼：');
    if (!password) return;
    if (!confirm('確定刪除嗎？')) return;
    try {
      const response = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entryId, password }) });
      if (response.ok) { fetchEntries(); setExpandedEntry(null); }
    } catch (err) { alert('失敗'); }
  };

  const stats = useMemo(() => ({
    total: entries.length,
    manga: entries.filter(e => e.category === Category.MANGA).length,
    novel: entries.filter(e => e.category === Category.NOVEL).length,
    movie: entries.filter(e => e.category === Category.MOVIE).length
  }), [entries]);

  return (
    <div className="flex min-h-screen w-full bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex justify-between items-center px-6 py-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><Menu size={20} /></button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-stone-500 rounded-full hover:bg-stone-100">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            
            <section className="text-center mb-16 mt-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 dark:text-stone-400 font-bold uppercase mb-6">
               <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-earth-800 dark:text-stone-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星の破片を墓標に置いて下さい</p>
              
              <div className="max-w-3xl mx-auto bg-stone-100/30 dark:bg-stone-800/30 p-8 rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-sm">
                <div className="font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">使用指南 🗡️</div>
                <p className="text-stone-500 text-sm mb-6 text-center">純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] border-t border-stone-200/60 pt-5">
                  <span><b>聖經</b>：某種神的旨意</span>
                  <span><b>極品</b>：印象深刻且強勁或全方位優質</span>
                  <span><b>頂級</b>：難能可貴</span>
                  <span><b>普通</b>：普通</span>
                  <span><b>神秘</b>：沒有緣分</span>
                </div>
              </div>
            </section>

            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-5 mb-8 border-b border-stone-200/60">
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto hide-scrollbar">
                
                <div className="flex items-center gap-1">
                  {categoriesList.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border 
                          ${isSelected 
                            ? (isDarkMode 
                                ? 'bg-stone-800 border-stone-200 text-white shadow-sm font-medium'
                                : 'bg-white border-stone-300 text-stone-800 shadow-sm font-medium') 
                            : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                      >
                        <cat.icon size={15} /> <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="h-6 w-px bg-stone-200 mx-2 flex-shrink-0" />

                {/* --- 更改處 1：等級下拉按鈕 --- */}
                <div className="relative flex-shrink-0" ref={ratingDropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsRatingDropdownOpen(!isRatingDropdownOpen); }} 
                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-stone-500 hover:text-stone-800"
                  >
                    <span>{ratingOptions.find(o => o.id === selectedRating)?.label}</span>
                    <ChevronDown size={14} className={isRatingDropdownOpen ? 'rotate-180 transition-transform' : ''} />
                  </button>
                  {isRatingDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-stone-100 shadow-xl rounded-lg z-50 overflow-hidden">
                      {ratingOptions.map(o => (
                        <button 
                          key={o.id} 
                          onClick={() => { setSelectedRating(o.id as any); setIsRatingDropdownOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selectedRating === o.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-stone-50 text-stone-600'}`}
                        >
                          <span className="text-base">{o.emoji}</span><span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 relative min-w-[150px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200/60 rounded-md text-sm outline-none focus:border-stone-400 transition-all" />
                </div>

                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#5e5045] text-white rounded-md text-sm font-bold shadow-sm hover:bg-[#4a403a] flex-shrink-0 whitespace-nowrap">
                  <Plus size={18} /><span>新增</span>
                </button>

                {/* --- 更改處 2：排序按鈕 --- */}
                <div className="relative flex-shrink-0" ref={sortDropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsSortDropdownOpen(!isSortDropdownOpen); }} 
                    className="flex items-center gap-1.5 px-2 py-2 text-stone-500 hover:text-stone-800 text-sm"
                  >
                    <ArrowUpDown size={15} />
                    <span className="font-medium">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                    <ChevronDown size={14} className={isSortDropdownOpen ? 'rotate-180 transition-transform' : ''} />
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-stone-100 shadow-xl rounded-lg z-50 overflow-hidden">
                      {sortOptions.map(o => (
                        <button 
                          key={o.id} 
                          onClick={() => { setSortBy(o.id as any); setIsSortDropdownOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center ${sortBy === o.id ? 'bg-stone-50 text-stone-900 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
                        >
                          <span>{o.label}</span>
                          {sortBy === o.id && <Check size={14} className="text-stone-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processedEntries.map((entry) => (
                <div key={entry.id} onClick={() => setExpandedEntry(entry)} className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative">
                  <div className="w-32 bg-stone-100 flex-shrink-0"><img src={entry.coverUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" alt={entry.title} /></div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{CATEGORY_DISPLAY_MAP[entry.category]}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight line-clamp-1">{entry.title}</h3>
                      <p className="text-xs text-stone-500 mb-2">by {entry.author}</p>
                      {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2">"{entry.note}"</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">{entry.tags?.slice(0, 3).map(tag => <span key={tag} className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded">#{tag}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-2xl font-serif font-medium mb-4">撒下的百合花</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[ { v: entries.length, l: '總收藏' }, { v: entries.filter(e => e.category === Category.MANGA).length, l: '漫畫' }, { v: entries.filter(e => e.category === Category.NOVEL).length, l: '小說' }, { v: entries.filter(e => e.category === Category.MOVIE).length, l: '電影' } ].map(s => (
                      <div key={s.l} className="bg-white/10 rounded-xl p-6 border border-white/10 backdrop-blur-sm"><div className="text-4xl font-bold font-sans mb-1 leading-none">{s.v}</div><div className="text-[11px] uppercase tracking-widest opacity-70">{s.l}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingEntry(null);}} onRefresh={fetchEntries} entry={editingEntry} />
      
      {expandedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setExpandedEntry(null)} />
          <div className="relative bg-[#fbf7f3] dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[950px] w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 border border-stone-200">
             <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-2 bg-white/90 dark:bg-stone-800 rounded-full z-10 shadow-md hover:scale-110 transition-transform"><X size={20} /></button>
             <div className="md:w-[45%] bg-stone-100 flex-shrink-0">
                <img src={expandedEntry.coverUrl} className="w-full h-full object-cover" alt={expandedEntry.title} />
             </div>
             <div className="flex-1 p-8 md:p-14 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div>
                  <div className="flex gap-3 mb-8">
                    <span className="px-4 py-1 rounded-full border border-stone-200 text-[11px] font-bold text-stone-400 bg-white dark:bg-stone-800 tracking-wider">
                      {expandedEntry.category.toUpperCase()}
                    </span>
                    <span className={`px-4 py-1 rounded-full border text-[11px] font-bold tracking-wider ${RATING_STYLES[expandedEntry.rating]}`}>
                      {expandedEntry.rating}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-3 tracking-tight">{expandedEntry.title}</h2>
                  <p className="text-xl text-stone-400 italic font-serif mb-12">by <span className="text-stone-500">{expandedEntry.author}</span></p>
                  {expandedEntry.note && (
                    <div className="relative pl-10 mb-12 border-l border-stone-200">
                      <p className="text-lg text-stone-600 dark:text-stone-400 font-serif italic leading-relaxed">"{expandedEntry.note}"</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                  <div className="flex flex-wrap gap-2">
                    {expandedEntry.tags?.map(t => <span key={t} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded text-[10px] text-stone-500 font-bold">#{t}</span>)}
                  </div>
                  <div className="flex items-center gap-5 text-stone-300">
                    {expandedEntry.plurkUrl && <a href={expandedEntry.plurkUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-800 transition-colors">
                      <PlurkPIcon size={20} />
                    </a>}
                    <button onClick={() => handleEdit(expandedEntry)} className="hover:text-stone-800 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(expandedEntry.id)} className="hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
